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
  zippedArchive: true,
  maxSize: '20m',
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
      new winston.transports.Console(),
      new winston.transports.DailyRotateFile({
        filename: logFilePath + '-%DATE%.csv',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '2m',
        maxFiles: '1d',
      })
      // new winston.transports.File({
      //   filename: logFilePath,
      // }),
      // fileRotateTransport,
    ],
  });
}

// const msg = `${currentTimeUnix},${ERROR_NONE},${SOURCE_SERVICE},${API_ENDPOINT},${duration},,Users list fetched successfully from user-service in ${duration} ms`;

function createMessage(currentTimeUnix, errorType, sourceService, apiEndpoint, val1, val2, message, request_ID = '') {
  return `${currentTimeUnix},${errorType},${sourceService},${apiEndpoint},${val1},${val2},${message},${request_ID}`;
}


module.exports = 
{
  createLogger,
  createMessage,
};

