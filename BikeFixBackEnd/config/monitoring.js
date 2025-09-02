/**
 * Configuração de Monitoramento e Logs para Produção
 * 
 * Este arquivo configura:
 * - Sistema de logs estruturados
 * - Métricas de performance
 * - Health checks avançados
 * - Alertas de erro
 */

const fs = require('fs');
const path = require('path');

// Configuração de Logs
class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'info';
    this.logFile = process.env.LOG_FILE || './logs/app.log';
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      meta,
      pid: process.pid,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    }) + '\n';
  }

  writeLog(level, message, meta = {}) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    // Console output
    console.log(formattedMessage.trim());
    
    // File output (apenas em produção)
    if (process.env.NODE_ENV === 'production') {
      fs.appendFileSync(this.logFile, formattedMessage);
    }
  }

  info(message, meta = {}) {
    this.writeLog('info', message, meta);
  }

  warn(message, meta = {}) {
    this.writeLog('warn', message, meta);
  }

  error(message, meta = {}) {
    this.writeLog('error', message, meta);
  }

  debug(message, meta = {}) {
    if (this.logLevel === 'debug') {
      this.writeLog('debug', message, meta);
    }
  }
}

// Métricas de Performance
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      requests: {
        total: 0,
        success: 0,
        error: 0,
        averageResponseTime: 0
      },
      database: {
        connections: 0,
        queries: 0,
        errors: 0
      },
      memory: {
        usage: 0,
        peak: 0
      }
    };
    
    this.startTime = Date.now();
    this.responseTimes = [];
  }

  recordRequest(success = true, responseTime = 0) {
    this.metrics.requests.total++;
    
    if (success) {
      this.metrics.requests.success++;
    } else {
      this.metrics.requests.error++;
    }
    
    // Calcular tempo médio de resposta
    this.responseTimes.push(responseTime);
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift(); // Manter apenas os últimos 100
    }
    
    this.metrics.requests.averageResponseTime = 
      this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length;
  }

  recordDatabaseQuery(success = true) {
    this.metrics.database.queries++;
    if (!success) {
      this.metrics.database.errors++;
    }
  }

  updateMemoryUsage() {
    const memUsage = process.memoryUsage();
    this.metrics.memory.usage = memUsage.heapUsed;
    
    if (memUsage.heapUsed > this.metrics.memory.peak) {
      this.metrics.memory.peak = memUsage.heapUsed;
    }
  }

  getMetrics() {
    this.updateMemoryUsage();
    
    return {
      ...this.metrics,
      uptime: Date.now() - this.startTime,
      timestamp: new Date().toISOString()
    };
  }

  reset() {
    this.metrics = {
      requests: { total: 0, success: 0, error: 0, averageResponseTime: 0 },
      database: { connections: 0, queries: 0, errors: 0 },
      memory: { usage: 0, peak: 0 }
    };
    this.responseTimes = [];
  }
}

// Health Check Avançado
class HealthChecker {
  constructor(mongoose) {
    this.mongoose = mongoose;
    this.checks = new Map();
    this.setupDefaultChecks();
  }

  setupDefaultChecks() {
    // Check de conexão com MongoDB
    this.addCheck('database', async () => {
      if (this.mongoose.connection.readyState !== 1) {
        throw new Error('MongoDB não conectado');
      }
      
      // Teste de ping
      await this.mongoose.connection.db.admin().ping();
      return { status: 'healthy', latency: Date.now() };
    });

    // Check de memória
    this.addCheck('memory', async () => {
      const memUsage = process.memoryUsage();
      const memoryUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
      
      if (memoryUsagePercent > 90) {
        throw new Error(`Uso de memória crítico: ${memoryUsagePercent.toFixed(2)}%`);
      }
      
      return {
        status: 'healthy',
        usage: memoryUsagePercent.toFixed(2) + '%',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
      };
    });

    // Check de uptime
    this.addCheck('uptime', async () => {
      const uptime = process.uptime();
      return {
        status: 'healthy',
        uptime: Math.floor(uptime) + 's',
        startTime: new Date(Date.now() - uptime * 1000).toISOString()
      };
    });
  }

  addCheck(name, checkFunction) {
    this.checks.set(name, checkFunction);
  }

  async runCheck(name) {
    const checkFunction = this.checks.get(name);
    if (!checkFunction) {
      throw new Error(`Health check '${name}' não encontrado`);
    }

    try {
      const result = await checkFunction();
      return { name, ...result };
    } catch (error) {
      return {
        name,
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runAllChecks() {
    const results = {};
    let overallStatus = 'healthy';

    for (const [name] of this.checks) {
      const result = await this.runCheck(name);
      results[name] = result;
      
      if (result.status === 'unhealthy') {
        overallStatus = 'unhealthy';
      }
    }

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks: results
    };
  }
}

// Middleware de Monitoramento
function createMonitoringMiddleware(logger, performanceMonitor) {
  return (req, res, next) => {
    const startTime = Date.now();
    
    // Log da requisição
    logger.info('Request received', {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Override do res.end para capturar métricas
    const originalEnd = res.end;
    res.end = function(...args) {
      const responseTime = Date.now() - startTime;
      const success = res.statusCode < 400;
      
      // Registrar métricas
      performanceMonitor.recordRequest(success, responseTime);
      
      // Log da resposta
      logger.info('Request completed', {
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: responseTime + 'ms',
        success
      });
      
      originalEnd.apply(this, args);
    };

    next();
  };
}

// Instâncias globais
const logger = new Logger();
const performanceMonitor = new PerformanceMonitor();

module.exports = {
  Logger,
  PerformanceMonitor,
  HealthChecker,
  createMonitoringMiddleware,
  logger,
  performanceMonitor
};