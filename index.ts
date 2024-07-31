import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    CRITICAL = 'CRITICAL',
    EMERGENCY = 'EMERGENCY'
}

export default class Log {
    private static webhookUrl: string | undefined = process.env.DISCORD_WEBHOOK_URL;
    private static timestamp: string = new Date().toISOString();
    private static logFolderPath: string = path.join(__dirname, 'logs');
    public static embeds = {
        footer: {
            text: 'Sent by Log',
        }
    };

    private static async writeLogFile(logMessage: string) {
        // Create log folder if it doesn't exist
        if (!fs.existsSync(this.logFolderPath)) {
            fs.mkdirSync(this.logFolderPath);
        }

        // Create log file
        const logFileName = `${this.timestamp.split('T')[0]}.log`;
        const logFilePath = path.join(this.logFolderPath, logFileName);

        // Create log file if it doesn't exist
        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, logMessage + '\n');
        }

        // Append log message to log file
        fs.appendFileSync(logFilePath, logMessage + '\n');
    }

    private static async sendDiscordMessage(title: LogLevel, message: string, context?: any) {
        // Check if webhook url is not set
        if (!this.webhookUrl) {
            return;
        }

        // Set Color and icon
        let color = 0x99aab5;
        let icon = 'ℹ️';
        switch (title) {
            case LogLevel.CRITICAL:
                color = 0x992d22;
                icon = '😈';
                break;
            case LogLevel.EMERGENCY:
                color = 0xf1c40f;
                icon = '🚨';
                break;
            case LogLevel.ERROR:
                color = 0xe74c3c;
                icon = '💩';
                break;
            case LogLevel.INFO:
                color = 0x2ecc71;
                icon = '💡';
                break;
            case LogLevel.DEBUG:
                color = 0x9b59b6;
                icon = '🪲';
                break;
            case LogLevel.WARNING:
                color = 0xe67e22;
                icon = '😳';
                break;
        }

        // currentDate with format YYYY-MM-DD HH:mm:ss
        const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

        // Set Title Embed
        let embeds = [
            {
                title: `${icon} [${currentDate}] ${process.env.APP_ENV || ''} ${title}`,
                description: `> ${message}`,
                color: color,
                // url: this.embeds.url,
                // author: this.embeds.author,
                footer: !context ? this.embeds.footer : null,
            }
        ];

        // Set Content Embed
        const codeBlock = '```';
        if (context) {
            embeds.push({
                title: 'context',
                description: `${codeBlock}json\n${JSON.stringify(context, null, 2)}\n${codeBlock}`,
                footer: this.embeds.footer,
                color: color,
            })
        }

        try {
            await fetch(this.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ embeds: embeds }),
            });
        } catch (error) {
            console.error('Failed to send Discord message:', error);
            this.writeLogFile(`Failed to send Discord message: ${error}`);
        }
    }

    static error(message: string, context?: any) {
        let logMessage = `${this.timestamp}: ${LogLevel.ERROR}: ${context ?? ''}`;
        let newContext = context;
        if (context instanceof Error) {
            newContext = logMessage;
            logMessage = `${this.timestamp}: ${LogLevel.ERROR}: ${context.message}\n${context.stack ?? ''}`;
            this.writeLogFile(logMessage);
        }

        if (this.webhookUrl) {
            this.sendDiscordMessage(LogLevel.ERROR, message, newContext);
        }
    }

    static emergency(message: string, context?: any) {
        let logMessage = `${this.timestamp}: ${LogLevel.EMERGENCY}: ${context ?? ''}`;
        let newContext = context;
        if (context instanceof Error) {
            logMessage = `${this.timestamp}: ${LogLevel.EMERGENCY}: ${context.message}\n${context.stack ?? ''}`;
            newContext = logMessage;
            this.writeLogFile(logMessage);
        }

        if (this.webhookUrl) {
            this.sendDiscordMessage(LogLevel.EMERGENCY, message, newContext);
        }
    }

    static critical(message: string, context?: any) {
        let logMessage = `${this.timestamp}: ${LogLevel.CRITICAL}: ${context ?? ''}`;
        let newContext = context;
        if (context instanceof Error) {
            logMessage = `${this.timestamp}: ${LogLevel.CRITICAL}: ${context.message}\n${context.stack ?? ''}`;
            newContext = logMessage;
            this.writeLogFile(logMessage);
        }

        if (this.webhookUrl) {
            this.sendDiscordMessage(LogLevel.CRITICAL, message, newContext);
        }
    }

    static debug(message: string, context?: any) {
        let logMessage = `${this.timestamp}: ${LogLevel.DEBUG}: ${context ?? ''}`;
        let newContext = context;
        if (context instanceof Error) {
            logMessage = `${this.timestamp}: ${LogLevel.DEBUG}: ${context.message}\n${context.stack ?? ''}`;
            newContext = logMessage;
            this.writeLogFile(logMessage);
        }

        if (this.webhookUrl) {
            this.sendDiscordMessage(LogLevel.DEBUG, message, newContext);
        }
    }

    static info(message: string, context?: any) {
        let logMessage = `${this.timestamp}: ${LogLevel.INFO}: ${context ?? ''}`;
        let newContext = context;
        if (context instanceof Error) {
            logMessage = `${this.timestamp}: ${LogLevel.INFO}: ${context.message}\n${context.stack ?? ''}`;
            newContext = logMessage;
            this.writeLogFile(logMessage);
        }

        if (this.webhookUrl) {
            this.sendDiscordMessage(LogLevel.INFO, message, newContext);
        }
    }

    static warning(message: string, context?: any) {
        let logMessage = `${this.timestamp}: ${LogLevel.WARNING}: ${context ?? ''}`;
        let newContext = context;
        if (context instanceof Error) {
            logMessage = `${this.timestamp}: ${LogLevel.WARNING}: ${context.message}\n${context.stack ?? ''}`;
            newContext = logMessage;
            this.writeLogFile(logMessage);
        }

        if (this.webhookUrl) {
            this.sendDiscordMessage(LogLevel.WARNING, message, newContext);
        }
    }
}