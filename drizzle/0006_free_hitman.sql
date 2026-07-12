CREATE TABLE `shipping_quotes` (
	`id` text PRIMARY KEY NOT NULL,
	`product_link_id` text NOT NULL,
	`postal_code` text NOT NULL,
	`method` text NOT NULL,
	`shipping_cost` real,
	`minimum_order` real,
	`free_shipping_threshold` real,
	`delivery_min_days` integer,
	`delivery_max_days` integer,
	`membership_required` integer DEFAULT false NOT NULL,
	`seller` text,
	`seller_type` text DEFAULT 'retailer' NOT NULL,
	`available` integer DEFAULT true NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`product_link_id`) REFERENCES `product_links`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `shipping_product_postal_idx` ON `shipping_quotes` (`product_link_id`,`postal_code`);--> statement-breakpoint
CREATE INDEX `shipping_expiry_idx` ON `shipping_quotes` (`expires_at`);