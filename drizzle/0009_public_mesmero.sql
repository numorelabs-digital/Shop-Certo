ALTER TABLE `users` ADD `role` text DEFAULT 'user' NOT NULL;--> statement-breakpoint
UPDATE `users` SET `role`='admin' WHERE `id`=(SELECT `id` FROM `users` ORDER BY `created_at` ASC LIMIT 1);
