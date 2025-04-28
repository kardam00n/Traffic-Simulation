// src/infrastructure/logging/LoggerService.ts
import { ILogger } from './Logger';

export class LoggerService {
    private static instance: LoggerService;
    private currentLogger!: ILogger;

    private constructor() {
        // Private constructor to prevent direct construction calls with 'new'
    }

    public static getInstance(): LoggerService {
        if (!LoggerService.instance) {
            LoggerService.instance = new LoggerService();
        }
        return LoggerService.instance;
    }


    public setLogger(logger: ILogger): void {
        this.currentLogger = logger;
    }

    public debug(message: string, ...args: any[]): void {
        this.ensureLogger();
        this.currentLogger.debug(message, ...args);
    }

    public info(message: string, ...args: any[]): void {
        this.ensureLogger();
        this.currentLogger.info(message, ...args);
    }

    public warn(message: string, ...args: any[]): void {
        this.ensureLogger();
        this.currentLogger.warn(message, ...args);
    }

    public error(message: string, ...args: any[]): void {
        this.ensureLogger();
        this.currentLogger.error(message, ...args);
    }

    private ensureLogger(): void {
        if (!this.currentLogger) {
            throw new Error('Logger not initialized. Call setLogger first.');
        }
    }
}