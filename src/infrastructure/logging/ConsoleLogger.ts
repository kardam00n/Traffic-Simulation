import { ILogger } from './Logger';

export class ConsoleLogger implements ILogger {
    debug(message: string, ...args: any[]): void {
        console.debug(message, ...args);
    }

    info(message: string, ...args: any[]): void {
        console.info(message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        console.warn(message, ...args);
    }

    error(message: string, ...args: any[]): void {
        console.error(message, ...args);
    }
}