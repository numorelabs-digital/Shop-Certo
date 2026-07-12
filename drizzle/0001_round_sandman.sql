ALTER TABLE `stores` ADD `country_code` text DEFAULT 'BR' NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD `segment` text DEFAULT 'market' NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD `location_mode` text DEFAULT 'postal_code' NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD `coverage` text;--> statement-breakpoint
ALTER TABLE `stores` ADD `priority` integer DEFAULT 2 NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD `enabled` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `stores` ADD `notes` text;--> statement-breakpoint
CREATE INDEX `stores_country_segment_idx` ON `stores` (`country_code`,`segment`);