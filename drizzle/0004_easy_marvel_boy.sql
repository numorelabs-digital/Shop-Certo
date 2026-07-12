CREATE TABLE `user_preferences` (
	`user_id` text PRIMARY KEY NOT NULL,
	`country_code` text DEFAULT 'BR' NOT NULL,
	`region` text DEFAULT 'SP' NOT NULL,
	`city` text DEFAULT 'São Paulo' NOT NULL,
	`postal_code` text,
	`latitude` real,
	`longitude` real,
	`radius_km` integer DEFAULT 10 NOT NULL,
	`daily_update_hour` integer DEFAULT 8 NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
