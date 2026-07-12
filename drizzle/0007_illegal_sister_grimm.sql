CREATE TABLE `alert_events` (
	`id` text PRIMARY KEY NOT NULL,
	`alert_id` text NOT NULL,
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`dedupe_key` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`price` real,
	`store_name` text,
	`read_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`alert_id`) REFERENCES `alerts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `alert_events_dedupe_uq` ON `alert_events` (`dedupe_key`);--> statement-breakpoint
CREATE INDEX `alert_events_user_date_idx` ON `alert_events` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `notification_outbox` (
	`id` text PRIMARY KEY NOT NULL,
	`event_id` text NOT NULL,
	`channel` text NOT NULL,
	`status` text DEFAULT 'pending_provider' NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`last_error` text,
	`next_attempt_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`event_id`) REFERENCES `alert_events`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `outbox_status_idx` ON `notification_outbox` (`status`,`next_attempt_at`);--> statement-breakpoint
ALTER TABLE `alerts` ADD `channel_in_app` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `alerts` ADD `channel_email` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `alerts` ADD `channel_push` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `alerts` ADD `cooldown_hours` integer DEFAULT 24 NOT NULL;--> statement-breakpoint
CREATE INDEX `alerts_product_idx` ON `alerts` (`product_id`);