# Logs

Logs is a TypeScript library that makes it easy to write logs on local files and sending messages to Discord.

## Installation

You can install the Log library using npm or yarn:

```bash
npm install @riod94/logs

or

yarn add @riod94/logs

or

bun add @riod94/logs
```

## Usage

Here's an example of how to use the Log library:

```typescript
import { Log, LogLevel } from "@riod94/logs";

// Set the webhook URL
Log.webhookUrl = "https://discord.com/api/webhooks/1234567890/abcdefghijklmnopqrstuvwxyz";

// Write a log message
Log.info("This is an info log message");
Log.error("This is an error log message");
Log.warning("This is a warning log message");
Log.debug("This is a debug log message");
Log.emergency("This is an emergency log message");
Log.critical("This is a critical log message");

// Write a log message with context
const context = {
	userId: "1234567890",
	userName: "Riode Prabowo",
	ipAddress: "192.168.1.1",
};
Log.info("This is an info log message with context", context);
```

## Functions

The Log library provides various functions for writing logs at different levels of severity:

-  `Log.info(message: string, context?: any)`: Write an info log message
-  `Log.error(message: string, context?: any)`: Write an error log message
-  `Log.warning(message: string, context?: any)`: Write a warning log message
-  `Log.debug(message: string, context?: any)`: Write a debug log message
-  `Log.emergency(message: string, context?: any)`: Write an emergency log message
-  `Log.critical(message: string, context?: any)`: Write a critical log message

You can send log messages with additional context by passing it as a parameter to the functions.

## Configuration

You can configure the Log library by setting the following properties:

set from the environment

```env
DISCORD_WEBHOOK_URL=
```

or by setting the following properties:

-  `Log.webhookUrl`: The webhook URL to send logs to. Set this to `undefined` to disable sending logs to Discord.

## What does it look like?

You can get a preview of what it looks like using each of the provided converters.
![Example Image](/assets/example.png)

## Tests

```bash
npm test
```

## License

This library is licensed under the MIT license.

Feel free to modify the content as needed. Let me know if you need any further assistance!
