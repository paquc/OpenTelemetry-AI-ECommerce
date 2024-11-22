const winston = require('winston');
require('winston-daily-rotate-file');
const { format } = winston;
const { combine, timestamp, printf, colorize, align } = winston.format;


// Define a custom format for CSV output
const csvFormat = format.printf(({ level, message, timestamp }) => {
  // Structure the log message as CSV, e.g., "timestamp, level, message"
  return `${timestamp},${level},${message}`;
});

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '1d',
});

function createLogger(logFilePath) {
  return winston.createLogger({
    level: 'debug',
    format: format.combine(
      timestamp({
        format: 'YYYY-MM-DD hh:mm:ss.SSS',
      }),
      csvFormat
    ),
    transports: [
      new winston.transports.File({
        filename: logFilePath,
      }),
      fileRotateTransport,
    ],
  });
}

module.exports = 
{
  createLogger
};

