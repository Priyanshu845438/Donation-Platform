const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const LOG_LEVEL_NAMES = ['ERROR', 'WARN', 'INFO', 'DEBUG'];

class Logger {
    constructor() {
        this.logLevel = this.getLogLevel();
        this.logFile = process.env.LOG_FILE || path.join(logsDir, 'app.log');
        this.errorLogFile = path.join(logsDir, 'error.log');
    }

    getLogLevel() {
        const envLevel = process.env.LOG_LEVEL;
        if (envLevel && LOG_LEVELS.hasOwnProperty(envLevel.toUpperCase())) {
            return LOG_LEVELS[envLevel.toUpperCase()];
        }
        return process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
    }

    formatMessage(level, message, meta = null) {
        const timestamp = new Date().toISOString();
        const levelName = LOG_LEVEL_NAMES[level];
        
        let logMessage = `[${timestamp}] [${levelName}] ${message}`;
        
        if (meta) {
            if (meta instanceof Error) {
                logMessage += `\nError: ${meta.message}\nStack: ${meta.stack}`;
            } else if (typeof meta === 'object') {
                try {
                    logMessage += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
                } catch (err) {
                    logMessage += `\nMeta: [Circular or non-serializable object]`;
                }
            } else {
                logMessage += `\nMeta: ${meta}`;
            }
        }
        
        return logMessage;
    }

    writeToFile(logMessage, isError = false) {
        try {
            const logFile = isError ? this.errorLogFile : this.logFile;
            const logEntry = logMessage + '\n';
            
            fs.appendFile(logFile, logEntry, (err) => {
                if (err) {
                    console.error('Failed to write to log file:', err);
                }
            });

            // Rotate logs if file gets too large (10MB)
            this.rotateLogs(logFile);
        } catch (error) {
            console.error('Logger write error:', error);
        }
    }

    rotateLogs(logFile) {
        try {
            fs.stat(logFile, (err, stats) => {
                if (err) return;
                
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (stats.size > maxSize) {
                    const timestamp = new Date().toISOString().replace(/:/g, '-');
                    const rotatedFile = logFile.replace('.log', `_${timestamp}.log`);
                    
                    fs.rename(logFile, rotatedFile, (renameErr) => {
                        if (renameErr) {
                            console.error('Failed to rotate log file:', renameErr);
                        }
                    });
                }
            });
        } catch (error) {
            console.error('Log rotation error:', error);
        }
    }

    log(level, message, meta = null) {
        if (level > this.logLevel) {
            return;
        }

        const formattedMessage = this.formatMessage(level, message, meta);
        
        // Always write to console in development
        if (process.env.NODE_ENV !== 'production') {
            const consoleMethod = level === LOG_LEVELS.ERROR ? 'error' : 
                                 level === LOG_LEVELS.WARN ? 'warn' : 'log';
            console[consoleMethod](formattedMessage);
        }

        // Write to file
        this.writeToFile(formattedMessage, level === LOG_LEVELS.ERROR);
    }

    error(message, meta = null) {
        this.log(LOG_LEVELS.ERROR, message, meta);
    }

    warn(message, meta = null) {
        this.log(LOG_LEVELS.WARN, message, meta);
    }

    info(message, meta = null) {
        this.log(LOG_LEVELS.INFO, message, meta);
    }

    debug(message, meta = null) {
        this.log(LOG_LEVELS.DEBUG, message, meta);
    }

    // HTTP request logger
    logRequest(req, res) {
        const start = Date.now();
        const { method, url, ip, headers } = req;
        const userAgent = headers['user-agent'] || 'Unknown';
        
        this.info(`${method} ${url}`, {
            ip,
            userAgent,
            timestamp: new Date().toISOString()
        });

        // Log response when finished
        const originalSend = res.send;
        res.send = function(body) {
            const duration = Date.now() - start;
            const statusCode = res.statusCode;
            
            logger.info(`${method} ${url} - ${statusCode} - ${duration}ms`, {
                statusCode,
                duration,
                responseSize: body ? body.length : 0
            });
            
            return originalSend.call(this, body);
        };
    }

    // Database operation logger
    logDBOperation(operation, collection, data = null) {
        this.debug(`DB Operation: ${operation} on ${collection}`, data);
    }

    // Security event logger
    logSecurityEvent(event, details = null) {
        this.warn(`Security Event: ${event}`, details);
    }

    // Performance logger
    logPerformance(operation, duration, details = null) {
        const level = duration > 1000 ? LOG_LEVELS.WARN : LOG_LEVELS.DEBUG;
        this.log(level, `Performance: ${operation} took ${duration}ms`, details);
    }

    // Business logic logger
    logBusinessEvent(event, userId = null, details = null) {
        this.info(`Business Event: ${event}`, {
            userId,
            ...details,
            timestamp: new Date().toISOString()
        });
    }

    // API rate limit logger
    logRateLimit(ip, endpoint, limit) {
        this.warn(`Rate limit exceeded for IP: ${ip} on endpoint: ${endpoint}`, {
            ip,
            endpoint,
            limit,
            timestamp: new Date().toISOString()
        });
    }

    // File operation logger
    logFileOperation(operation, filename, success = true, error = null) {
        if (success) {
            this.info(`File Operation: ${operation} - ${filename}`);
        } else {
            this.error(`File Operation Failed: ${operation} - ${filename}`, error);
        }
    }

    // Payment logger
    logPayment(operation, amount, currency, orderId, status, details = null) {
        this.info(`Payment: ${operation}`, {
            amount,
            currency,
            orderId,
            status,
            ...details,
            timestamp: new Date().toISOString()
        });
    }

    // Email logger
    logEmail(to, subject, success = true, error = null) {
        if (success) {
            this.info(`Email sent to: ${to}`, { subject });
        } else {
            this.error(`Email failed to: ${to}`, { subject, error });
        }
    }

    // System health logger
    logSystemHealth(metrics) {
        this.info('System Health Check', {
            ...metrics,
            timestamp: new Date().toISOString()
        });
    }

    // Cleanup old log files
    cleanup(daysToKeep = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

            fs.readdir(logsDir, (err, files) => {
                if (err) return;

                files.forEach(file => {
                    const filePath = path.join(logsDir, file);
                    
                    fs.stat(filePath, (statErr, stats) => {
                        if (statErr) return;
                        
                        if (stats.mtime < cutoffDate) {
                            fs.unlink(filePath, (unlinkErr) => {
                                if (!unlinkErr) {
                                    this.info(`Cleaned up old log file: ${file}`);
                                }
                            });
                        }
                    });
                });
            });
        } catch (error) {
            this.error('Log cleanup error:', error);
        }
    }
}

// Create singleton instance
const logger = new Logger();

// Schedule daily cleanup
setInterval(() => {
    logger.cleanup();
}, 24 * 60 * 60 * 1000); // 24 hours

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', { promise, reason });
});

module.exports = logger;
