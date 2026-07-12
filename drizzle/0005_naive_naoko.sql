CREATE TABLE `geocode_cache` (
	`key` text PRIMARY KEY NOT NULL,
	`query` text NOT NULL,
	`label` text NOT NULL,
	`city` text,
	`region` text,
	`postal_code` text,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`source` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `store_branches` (
	`id` text PRIMARY KEY NOT NULL,
	`store_id` text NOT NULL,
	`external_id` text,
	`name` text NOT NULL,
	`address` text NOT NULL,
	`city` text NOT NULL,
	`region` text NOT NULL,
	`postal_code` text,
	`latitude` real NOT NULL,
	`longitude` real NOT NULL,
	`pickup` integer DEFAULT false NOT NULL,
	`delivery` integer DEFAULT false NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`last_verified_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `branches_store_idx` ON `store_branches` (`store_id`);--> statement-breakpoint
CREATE INDEX `branches_region_city_idx` ON `store_branches` (`region`,`city`);--> statement-breakpoint
CREATE UNIQUE INDEX `branches_store_external_uq` ON `store_branches` (`store_id`,`external_id`);