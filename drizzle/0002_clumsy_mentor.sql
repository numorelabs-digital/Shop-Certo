CREATE TABLE `catalog_products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`brand` text NOT NULL,
	`segment` text NOT NULL,
	`presentation` text,
	`model` text,
	`barcode` text,
	`attributes` text,
	`status` text DEFAULT 'verified' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `catalog_barcode_uq` ON `catalog_products` (`barcode`);--> statement-breakpoint
CREATE INDEX `catalog_name_brand_idx` ON `catalog_products` (`name`,`brand`);--> statement-breakpoint
CREATE INDEX `catalog_model_idx` ON `catalog_products` (`model`);--> statement-breakpoint
CREATE TABLE `product_identities` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`catalog_product_id` text,
	`match_method` text NOT NULL,
	`confidence` real DEFAULT 0 NOT NULL,
	`confirmed_by_user` integer DEFAULT false NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`catalog_product_id`) REFERENCES `catalog_products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `product_identity_product_uq` ON `product_identities` (`product_id`);--> statement-breakpoint
CREATE INDEX `product_identity_catalog_idx` ON `product_identities` (`catalog_product_id`);--> statement-breakpoint
CREATE TABLE `store_product_matches` (
	`id` text PRIMARY KEY NOT NULL,
	`catalog_product_id` text NOT NULL,
	`store_id` text NOT NULL,
	`external_id` text,
	`external_name` text NOT NULL,
	`url` text NOT NULL,
	`barcode` text,
	`status` text DEFAULT 'candidate' NOT NULL,
	`confidence` real DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`catalog_product_id`) REFERENCES `catalog_products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `store_matches_catalog_idx` ON `store_product_matches` (`catalog_product_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `store_matches_store_external_uq` ON `store_product_matches` (`store_id`,`external_id`);