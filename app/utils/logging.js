var winston = require('winston');
require('winston-daily-rotate-file');
var configs = require('../../configs');
    

const LOG_MODULES = configs.log_module;
const LOG_PATH = configs.log_root;


exports.get_logger = function(log_module){
    if(LOG_MODULES.indexOf(log_module) === -1){
        log_module = "default";
    }
    console.log(LOG_PATH)
    return winston.createLogger({
        level: 'info',
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.timestamp(),
            // Customize because default JSON format is messy and not support color
            winston.format.printf(info => {
                // add customize field
                info.module = log_module;
                return Object.keys(info).reverse().reduce((acc, key, i) => {
                  if (typeof key === 'string') {
                    if (i > 0) acc += ", "
                    acc += `"${key}": "${info[key]}"`
                  }
          
                  return acc;
                }, '{ ') + ' }';
            })
        ),
        transports: [
            new winston.transports.DailyRotateFile({
                dirname: LOG_PATH, 
                filename: `${log_module}-%DATE%.log`,
                datePattern: 'YYYY-MM-DD',
                zippedArchive: true,
                maxSize: '512m',
                maxFiles: '30d',
            }),
            new winston.transports.Console({
                level: 'debug',

            })
        ],
        exitOnError: false,
    });
}