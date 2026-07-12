CREATE TABLE `source_refresh_state` (
	`store_id` text PRIMARY KEY NOT NULL,
	`last_attempt_at` integer,
	`last_success_at` integer,
	`last_status` text DEFAULT 'never' NOT NULL,
	`consecutive_failures` integer DEFAULT 0 NOT NULL,
	`next_retry_at` integer,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_update_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`status` text NOT NULL,
	`trigger` text DEFAULT 'scheduled' NOT NULL,
	`requested_at` integer NOT NULL,
	`started_at` integer,
	`completed_at` integer,
	`source_count` integer DEFAULT 0 NOT NULL,
	`checked_count` integer DEFAULT 0 NOT NULL,
	`pending_count` integer DEFAULT 0 NOT NULL,
	`failed_count` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_update_jobs`("id", "user_id", "status", "trigger", "requested_at", "started_at", "completed_at", "source_count", "checked_count", "pending_count", "failed_count") SELECT "id", "user_id", "status", 'scheduled', "requested_at", NULL, "completed_at", 0, 0, 0, 0 FROM `update_jobs`;--> statement-breakpoint
DROP TABLE `update_jobs`;--> statement-breakpoint
ALTER TABLE `__new_update_jobs` RENAME TO `update_jobs`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `update_jobs_date_idx` ON `update_jobs` (`requested_at`);--> statement-breakpoint
ALTER TABLE `update_logs` ADD `store_id` text REFERENCES stores(id);--> statement-breakpoint
ALTER TABLE `update_logs` ADD `attempt` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `update_logs` ADD `next_retry_at` integer;--> statement-breakpoint
CREATE INDEX `update_logs_job_idx` ON `update_logs` (`job_id`);--> statement-breakpoint
CREATE INDEX `update_logs_store_idx` ON `update_logs` (`store_id`);
