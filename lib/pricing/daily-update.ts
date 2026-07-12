import { priceSources } from "../sources";

type UpdateSummary = { jobId: string; status: "completed" | "partial" | "failed"; sources: number; checked: number; pending: number; failed: number };

export async function runDailyPriceUpdate(db: D1Database, trigger: "scheduled" | "manual" = "scheduled"): Promise<UpdateSummary> {
  const now = Date.now();
  const jobId = crypto.randomUUID();
  await db.prepare("INSERT INTO update_jobs (id, user_id, status, trigger, requested_at, started_at, source_count, checked_count, pending_count, failed_count) VALUES (?, NULL, 'running', ?, ?, ?, ?, 0, 0, 0)")
    .bind(jobId, trigger, now, now, priceSources.length).run();

  let checked = 0, pending = 0, failed = 0;
  for (const source of priceSources) {
    try {
      await db.prepare("INSERT OR IGNORE INTO stores (id, name, domain, country_code, segment, location_mode, coverage, priority, enabled, adapter, integration_status, notes, created_at, updated_at) VALUES (?, ?, ?, 'BR', ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, ?)")
        .bind(source.id, source.name, new URL(source.url).hostname, source.segment === "Mercado" ? "market" : "home", source.locationMode, source.coverage, source.priority === "Inicial" ? 1 : 2, source.enabled ? 1 : 0, source.note, now, now).run();

      if (!source.enabled) {
        pending++;
        await log(db, jobId, source.id, "info", "Fuente en observación; no se consultó.", 0, now);
      } else {
        const state = await db.prepare("SELECT integration_status FROM stores WHERE id = ?").bind(source.id).first<{integration_status:string}>();
        if (!state || state.integration_status !== "active") {
          pending++;
          await log(db, jobId, source.id, "pending", "Conector pendiente. No se creó ningún precio artificial.", 0, now);
        } else {
          checked++;
          await log(db, jobId, source.id, "info", "Fuente preparada para actualización mediante su adaptador.", 1, now);
        }
      }
      await db.prepare("INSERT INTO source_refresh_state (store_id, last_attempt_at, last_success_at, last_status, consecutive_failures, next_retry_at, updated_at) VALUES (?, ?, NULL, ?, 0, NULL, ?) ON CONFLICT(store_id) DO UPDATE SET last_attempt_at=excluded.last_attempt_at,last_status=excluded.last_status,updated_at=excluded.updated_at")
        .bind(source.id, now, source.enabled ? "pending_connector" : "disabled", now).run();
    } catch (error) {
      failed++;
      await log(db, jobId, source.id, "error", error instanceof Error ? error.message.slice(0, 300) : "Error inesperado", 1, now + 15 * 60_000);
    }
  }

  const status = failed ? "partial" : "completed";
  await db.prepare("UPDATE update_jobs SET status=?, completed_at=?, checked_count=?, pending_count=?, failed_count=? WHERE id=?")
    .bind(status, Date.now(), checked, pending, failed, jobId).run();
  return { jobId, status, sources: priceSources.length, checked, pending, failed };
}

async function log(db:D1Database, jobId:string, storeId:string, level:string, message:string, attempt:number, nextRetryAt:number|null){
  await db.prepare("INSERT INTO update_logs (id, job_id, product_link_id, store_id, level, message, attempt, next_retry_at, created_at) VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?)")
    .bind(crypto.randomUUID(), jobId, storeId, level, message, attempt, nextRetryAt, Date.now()).run();
}
