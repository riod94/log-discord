import Log from "./index";
import { jest } from "@jest/globals";

describe('Log tests', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    test('test debug message', () => {
        const logMessage = 'Test debug message';
        Log.debug(logMessage, {
            test: 'test',
            test2: 2
        });
    });

    test('test error message', () => {
        const logMessage = 'Test Error message';
        Log.error('error message', Error(logMessage));
    });

    test('test critical message', () => {
        const logMessage = 'Test Critical message';
        Log.critical(logMessage, Error(logMessage));
    })

    test('test info message', () => {
        const logMessage = 'Test Info message';
        Log.info(logMessage);
    });

    test('test warning message', () => {
        const logMessage = 'Test Warning message';
        Log.warning(logMessage);
    });

    test('test emergency message', () => {
        const logMessage = 'Test Emergency message';
        Log.emergency(logMessage);
    });
});