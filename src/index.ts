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
    private static timestamp: string = new Date().toISOString();
    private static webhookUrl: string | undefined = process.env.DISCORD_WEBHOOK_URL;
    private static logFolderPath: string = process.env.LOG_FOLDER_PATH || './logs';
    private static daysToKeep: number = parseInt(process.env.LOG_DAYS_TO_KEEP || '7');
    public static embeds = {
        footer: {
            text: process.env.DISCORD_FOOTER_TEXT || 'Sent by Log',
        }
    };

    private static async writeLogFile(logMessage: string) {
        // Create log folder if it doesn't exist
        if (!fs.existsSync(this.logFolderPath)) {
            fs.mkdirSync(this.logFolderPath, { recursive: true });
        }

        // Create log file
        const logFileName = `${this.timestamp.split('T')[0]}.log`;
        const logFilePath = path.join(this.logFolderPath, logFileName);

        // Create log file if it doesn't exist
        if (!fs.existsSync(logFilePath)) {
            fs.writeFileSync(logFilePath, logMessage + '\n');
        } else {
            // Append log message to log file
            fs.appendFileSync(logFilePath, logMessage + '\n');
        }

        // Remove old log files if needed
        const logFiles = fs.readdirSync(this.logFolderPath);
        if (this.daysToKeep > 0 && logFiles.length > this.daysToKeep) {
            const oldestLogFileName = logFiles[0];
            fs.unlinkSync(path.join(this.logFolderPath, oldestLogFileName));
        }
    }

    private static async sendDiscordMessage(title: LogLevel, message: string, context?: any) {
        // Check if webhook url is not set
        if (!this.webhookUrl) {
            return;
        }
        try {
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
            const charLimit = 4040;
            const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
            const codeBlock = '```';
            let headers: any = {
                'Content-Type': 'application/json',
            };
            let contextDescription = '';

            // Set Title Embed
            let embeds: any = [
                {
                    title: `${icon} [${currentDate}] ${process.env.APP_ENV || ''} ${title}`,
                    description: `> ${message.length > charLimit ? message.slice(0, charLimit) + '...' : message}`,
                    color: color,
                    footer: !context ? this.embeds.footer : null,
                }
            ];

            // Set Content Embed
            if (context) {
                contextDescription = `${codeBlock}json\n${JSON.stringify(context, null, 2)}\n${codeBlock}`;
                if (contextDescription.length <= charLimit) {
                    embeds.push({
                        title: 'context',
                        description: contextDescription,
                        footer: this.embeds.footer,
                        color: color,
                    })
                }
            }

            // Set File Embed
            let body: string | FormData = JSON.stringify({ embeds: embeds });
            if (contextDescription.length > charLimit) {
                // Create file with name stacktrace-timestamp.txt
                const fileName = `stacktrace-${new Date().toISOString().slice(0, 19).replace('T', ' ')}.txt`;
                const filePath = path.join(this.logFolderPath, fileName);
                fs.writeFileSync(filePath, JSON.stringify(context));

                // Read file contents
                const fileContents = fs.readFileSync(filePath, 'utf8');

                let formData = new FormData();
                // Add the payload_json field
                embeds.push({
                    title: 'context',
                    description: `> Message exceeds ${charLimit} characters. The context has been saved to ${fileName}.`,
                    footer: this.embeds.footer,
                    color: color
                })
                formData.append('payload_json', JSON.stringify({
                    embeds: embeds,
                }));

                // Add the files field
                formData.append('files[0]', new Blob([fileContents], { type: 'text/plain' }), fileName);

                // Remove file after reading contents
                fs.unlinkSync(filePath);

                // Set the headers and request body
                headers = {};
                body = formData;

            }

            // Send Discord message
            const response = await fetch(this.webhookUrl, {
                method: 'POST',
                headers: headers,
                body: body,
            });

            // Check the response status
            if (!response.ok) {
                console.error('Failed to send Discord message:', response.body);
                this.writeLogFile(`[${new Date().toISOString()}]: Failed to send Discord message: ${response.body}`);
            }
        } catch (error) {
            console.error('Failed to send Discord message:', error);
            this.writeLogFile(`Failed to send Discord message: ${error}`);
        }
    }

    static error(message: string, context?: any) {
        let logMessage = `[${this.timestamp}] ${LogLevel.ERROR}: ${context ?? ''}`;
        let newContext = context;
        if (context instanceof Error) {
            logMessage = `[${this.timestamp}] ${LogLevel.ERROR}: ${context.message}\n${context.stack ?? ''}`;
            newContext = logMessage;
        }
        this.writeLogFile(logMessage);

        if (this.webhookUrl) {
            this.sendDiscordMessage(LogLevel.ERROR, message, newContext);
        }
    }

    static emergency(message: string, context?: any) {
        let logMessage = `[${this.timestamp}] ${LogLevel.EMERGENCY}: ${context ?? ''}`;
        let newContext = context;
        if (context instanceof Error) {
            logMessage = `[${this.timestamp}] ${LogLevel.EMERGENCY}: ${context.message}\n${context.stack ?? ''}`;
            newContext = logMessage;
        }
        this.writeLogFile(logMessage);

        if (this.webhookUrl) {
            this.sendDiscordMessage(LogLevel.EMERGENCY, message, newContext);
        }
    }

    static critical(message: string, context?: any) {
        let logMessage = `[${this.timestamp}] ${LogLevel.CRITICAL}: ${context ?? ''}`;
        let newContext = context;
        if (context instanceof Error) {
            logMessage = `[${this.timestamp}] ${LogLevel.CRITICAL}: ${context.message}\n${context.stack ?? ''}`;
            newContext = logMessage;
        }
        this.writeLogFile(logMessage);

        if (this.webhookUrl) {
            this.sendDiscordMessage(LogLevel.CRITICAL, message, newContext);
        }
    }

    static debug(message: string, context?: any) {
        let logMessage = `[${this.timestamp}] ${LogLevel.DEBUG}: ${context ?? ''}`;
        let newContext = context;
        if (context instanceof Error) {
            logMessage = `[${this.timestamp}] ${LogLevel.DEBUG}: ${context.message}\n${context.stack ?? ''}`;
            newContext = logMessage;
        }
        this.writeLogFile(logMessage);

        if (this.webhookUrl) {
            this.sendDiscordMessage(LogLevel.DEBUG, message, newContext);
        }
    }

    static info(message: string, context?: any) {
        let logMessage = `[${this.timestamp}] ${LogLevel.INFO}: ${context ?? ''}`;
        let newContext = context;
        if (context instanceof Error) {
            logMessage = `[${this.timestamp}] ${LogLevel.INFO}: ${context.message}\n${context.stack ?? ''}`;
            newContext = logMessage;
            this.writeLogFile(logMessage);
        }

        if (this.webhookUrl) {
            this.sendDiscordMessage(LogLevel.INFO, message, newContext);
        }
    }

    static warning(message: string, context?: any) {
        let logMessage = `[${this.timestamp}] ${LogLevel.WARNING}: ${context ?? ''}`;
        let newContext = context;
        if (context instanceof Error) {
            logMessage = `[${this.timestamp}] ${LogLevel.WARNING}: ${context.message}\n${context.stack ?? ''}`;
            newContext = logMessage;
            this.writeLogFile(logMessage);
        }

        if (this.webhookUrl) {
            this.sendDiscordMessage(LogLevel.WARNING, message, newContext);
        }
    }
}