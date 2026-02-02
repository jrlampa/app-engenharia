CREATE TABLE `settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`empresa_nome` text DEFAULT 'Minha Empresa de Engenharia',
	`empresa_logo` text,
	`cor_primaria` text DEFAULT '#007bff',
	`engenheiro_responsavel` text DEFAULT 'Engenheiro Chefe',
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
