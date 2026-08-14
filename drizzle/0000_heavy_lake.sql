CREATE TABLE `newsletter_editions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(140) NOT NULL,
	`title` varchar(240) NOT NULL,
	`standfirst` text NOT NULL,
	`editor_note` text,
	`issue_type` enum('regular','current') NOT NULL DEFAULT 'regular',
	`status` enum('draft','published','rejected','corrected') NOT NULL DEFAULT 'draft',
	`current_relevance` text,
	`current_source_urls` text,
	`quality_gate_passed` boolean NOT NULL DEFAULT false,
	`quality_gate_notes` text,
	`published_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletter_editions_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_editions_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`edition_id` int NOT NULL,
	`position` int NOT NULL,
	`title` varchar(240) NOT NULL,
	`domains` varchar(320) NOT NULL,
	`tier` enum('E','C','F','S') NOT NULL,
	`main_claim` text NOT NULL,
	`so_what` text NOT NULL,
	`evidence_note` text NOT NULL,
	`audit_note` text NOT NULL,
	`denominator_note` text NOT NULL,
	`intent_note` text NOT NULL,
	`falsifier` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_publication_runs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`schedule_id` int,
	`edition_id` int,
	`status` enum('started','published','rejected','failed') NOT NULL,
	`detail` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_publication_runs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`cron_expression` varchar(64) NOT NULL,
	`schedule_cron_task_uid` varchar(65),
	`last_current_signal_at` timestamp,
	`enabled` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `newsletter_schedules_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_schedules_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`insight_id` int NOT NULL,
	`label` varchar(360) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`source_type` varchar(100) NOT NULL,
	`retrieved_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);
--> statement-breakpoint
CREATE INDEX `newsletter_editions_status_published_idx` ON `newsletter_editions` (`status`,`published_at`);--> statement-breakpoint
CREATE INDEX `newsletter_insights_edition_position_idx` ON `newsletter_insights` (`edition_id`,`position`);--> statement-breakpoint
CREATE INDEX `newsletter_publication_runs_schedule_created_idx` ON `newsletter_publication_runs` (`schedule_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `newsletter_schedules_task_uid_idx` ON `newsletter_schedules` (`schedule_cron_task_uid`);--> statement-breakpoint
CREATE INDEX `newsletter_sources_insight_idx` ON `newsletter_sources` (`insight_id`);