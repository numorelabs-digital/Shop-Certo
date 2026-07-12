CREATE TABLE `alerts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`type` text NOT NULL,
	`threshold` real,
	`active` integer DEFAULT true,
	`triggered_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `alerts_user_idx` ON `alerts` (`user_id`);--> statement-breakpoint
CREATE TABLE `categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `price_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`product_link_id` text NOT NULL,
	`price` real NOT NULL,
	`original_price` real,
	`shipping` real DEFAULT 0 NOT NULL,
	`total_price` real NOT NULL,
	`currency` text DEFAULT 'BRL' NOT NULL,
	`source` text NOT NULL,
	`captured_at` integer NOT NULL,
	FOREIGN KEY (`product_link_id`) REFERENCES `product_links`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `snapshots_link_date_idx` ON `price_snapshots` (`product_link_id`,`captured_at`);--> statement-breakpoint
CREATE TABLE `product_links` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`store_id` text NOT NULL,
	`url` text NOT NULL,
	`seller` text,
	`availability` text DEFAULT 'unknown' NOT NULL,
	`status` text DEFAULT 'manual' NOT NULL,
	`last_updated` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `links_product_idx` ON `product_links` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`category_id` integer,
	`name` text NOT NULL,
	`brand` text,
	`model` text,
	`description` text,
	`image_url` text,
	`barcode` text,
	`weight` real,
	`volume` real,
	`units` integer DEFAULT 1,
	`unit` text,
	`target_price` real,
	`notes` text,
	`favorite` integer DEFAULT false,
	`frequency` text,
	`attributes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `products_user_idx` ON `products` (`user_id`);--> statement-breakpoint
CREATE INDEX `products_barcode_idx` ON `products` (`barcode`);--> statement-breakpoint
CREATE TABLE `shopping_list_items` (
	`id` text PRIMARY KEY NOT NULL,
	`list_id` text NOT NULL,
	`product_id` text NOT NULL,
	`quantity` real DEFAULT 1 NOT NULL,
	`purchased` integer DEFAULT false,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`list_id`) REFERENCES `shopping_lists`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shopping_lists` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `lists_user_idx` ON `shopping_lists` (`user_id`);--> statement-breakpoint
CREATE TABLE `stores` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`domain` text NOT NULL,
	`adapter` text NOT NULL,
	`integration_status` text DEFAULT 'manual' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `stores_domain_uq` ON `stores` (`domain`);--> statement-breakpoint
CREATE TABLE `update_jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text NOT NULL,
	`requested_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `update_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`job_id` text NOT NULL,
	`product_link_id` text,
	`level` text NOT NULL,
	`message` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`job_id`) REFERENCES `update_jobs`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_link_id`) REFERENCES `product_links`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_uq` ON `users` (`email`);