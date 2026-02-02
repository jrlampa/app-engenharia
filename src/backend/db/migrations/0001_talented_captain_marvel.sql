PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_historico_calculos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` integer,
	`tipo` text NOT NULL,
	`data_execucao` text DEFAULT CURRENT_TIMESTAMP,
	`inputs` text NOT NULL,
	`resultados` text NOT NULL,
	FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_historico_calculos`("id", "project_id", "tipo", "data_execucao", "inputs", "resultados") SELECT "id", "project_id", "tipo", "data_execucao", "inputs", "resultados" FROM `historico_calculos`;--> statement-breakpoint
DROP TABLE `historico_calculos`;--> statement-breakpoint
ALTER TABLE `__new_historico_calculos` RENAME TO `historico_calculos`;--> statement-breakpoint
PRAGMA foreign_keys=ON;