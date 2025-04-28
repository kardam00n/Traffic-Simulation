import { ILogger } from './Logger';

export class WebLogger implements ILogger {
    private logElement: HTMLElement;

    constructor(containerId: string = 'log') {
        console.log(document.getElementById(containerId));
        this.logElement = document.getElementById(containerId) || this.createLogContainer(containerId);
    }

    private createLogContainer(id: string): HTMLElement {
        const container = document.createElement('div');
        container.id = id;
        // document.body.appendChild(container);
        return container;
    }

    private log(level: string, message: string, ...args: any[]): void {
        const entry = document.createElement('div');
        entry.className = `log-entry log-${level.toLowerCase()}`;

        const formattedMessage = `${level}: ${message}`;

        entry.textContent = args.length > 0
            ? `${formattedMessage} ${JSON.stringify(args)}`
            : formattedMessage;

        this.logElement?.appendChild(entry);
        // Auto-scroll to bottom
        this.logElement?.scrollTo(0, this.logElement.scrollHeight);
    }

    debug(message: string, ...args: any[]): void {
        this.log('DEBUG', message, ...args);
    }

    info(message: string, ...args: any[]): void {
        this.log('INFO', message, ...args);
    }

    warn(message: string, ...args: any[]): void {
        this.log('WARN', message, ...args);
    }

    error(message: string, ...args: any[]): void {
        this.log('ERROR', message, ...args);
    }

}