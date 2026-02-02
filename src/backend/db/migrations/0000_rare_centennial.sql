CREATE TABLE IF NOT EXISTS `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`client` text,
	`location` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `calculos_tracao` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`vao` real NOT NULL,
	`peso_cabo` real NOT NULL,
	`tracao_inicial` real NOT NULL,
	`flecha` real NOT NULL,
	`sugestao` text NOT NULL,
	`materiais` text,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `calculos_tensao` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`tensao_nominal` real NOT NULL,
	`corrente` real NOT NULL,
	`comprimento` real NOT NULL,
	`resistencia_km` real NOT NULL,
	`queda_volts` real NOT NULL,
	`queda_percentual` real NOT NULL,
	`status` text NOT NULL,
	`timestamp` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `materiais` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`kit_nome` text NOT NULL,
	`codigo` text NOT NULL,
	`item` text NOT NULL,
	`quantidade` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `metadados_sync` (
	`chave` text PRIMARY KEY NOT NULL,
	`valor` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `historico_calculos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`tipo` text NOT NULL,
	`data_execucao` text DEFAULT CURRENT_TIMESTAMP,
	`inputs` text NOT NULL,
	`resultados` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE no action
);