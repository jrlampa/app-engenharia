const winston = require('winston');
const path = require('path');
const fs = require('fs');
const os = require('os');

// --- CONFIGURAÇÃO DE DIRETÓRIOS ---
// Em produção (Electron), não podemos gravar na pasta do app. 
// Usamos o diretório de dados do usuário (%APPDATA% no Windows).
const isProduction = process.env.NODE_ENV === 'production' || process.env.ELECTRON_RUN_AS_NODE === 'true';
const APP_NAME = 'app-engenharia';

let logDir;
if (isProduction) {
  // No Windows: C:\Users\<USER>\AppData\Roaming\app-engenharia\logs
  logDir = path.join(os.homedir(), 'AppData', 'Roaming', APP_NAME, 'logs');
} else {
  // Em desenvolvimento, mantém local para facilidade
  logDir = path.join(__dirname, '../../logs');
}

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// --- PADRÕES DE SEGURANÇA (MASKING) ---
// Mascara dados sensíveis que possam aparecer nos logs acidentalmente
const maskFormat = winston.format((info) => {
  const sensitiveKeys = ['password', 'token', 'key', 'apiKey', 'secret'];
  if (info.body) {
    sensitiveKeys.forEach(key => {
      if (typeof info.body === 'object' && info.body[key]) {
        info.body[key] = '********';
      }
    });
  }
  // Adiciona informações de recurso em caso de erro para Auditoria (v0.2.6)
  if (info.level === 'error') {
    info.system = {
      freeMem: `${(os.freemem() / 1024 / 1024).toFixed(2)} MB`,
      totalMem: `${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`,
      uptime: `${(os.uptime() / 3600).toFixed(2)} hours`
    };
  }
  return info;
});


// --- LOGGER PRINCIPAL ---
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    maskFormat(),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'app-engenharia-backend',
    env: isProduction ? 'production' : 'development',
    version: 'v0.2.6',
    platform: os.platform(),
    arch: os.arch()
  },

  transports: [
    // Registro de erros críticos
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    }),
    // Histórico completo de transações
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 10,
    })
  ]
});

// Log para console em desenvolvimento
if (!isProduction) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

module.exports = logger;

