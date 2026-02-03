CREATE TABLE `historico_precos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`material_id` integer,
	`preco_antigo` real,
	`preco_novo` real NOT NULL,
	`data_alteracao` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`material_id`) REFERENCES `materiais`(`id`) ON UPDATE no action ON DELETE cascade
);
