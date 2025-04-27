import { Direction, TurnDirection } from './Direction';
import { Vehicle } from './Vehicle';

export interface QueueMetrics {
    queueLength: number;
    waitingTime: number;
    oldestVehicleWaitTime: number;
    turningVehicles: {
        straight: number;
        left: number;
        right: number;
    };
}

export class TrafficQueue {
    private queue: Vehicle[] = [];
    private direction: Direction;
    private currentTick: number = 0;

    constructor(direction: Direction) {
        this.direction = direction;
    }

    public clear(): void {
        this.queue = [];
    }

    public addVehicle(vehicle: Vehicle): void {
        if (!this.queue.some(v => v.getId() === vehicle.getId())) {
            this.queue.push(vehicle);
        }
    }

    public removeVehicle(vehicle: Vehicle): void {
        this.queue = this.queue.filter(v => v.getId() !== vehicle.getId());
    }

    public updateTick(currentTick: number): void {
        this.currentTick = currentTick;
    }

    public getMetrics(): QueueMetrics {
        const turningVehicles = {
            straight: 0,
            left: 0,
            right: 0
        };

        this.queue.forEach(vehicle => {
            switch (vehicle.getTurnDirection()) {
                case TurnDirection.STRAIGHT:
                    turningVehicles.straight++;
                    break;
                case TurnDirection.LEFT:
                    turningVehicles.left++;
                    break;
                case TurnDirection.RIGHT:
                    turningVehicles.right++;
                    break;
            }
        });

        const oldestVehicle = this.queue[0];
        const oldestVehicleWaitTime = oldestVehicle
            ? this.currentTick - oldestVehicle.getEntryTime()
            : 0;

        return {
            queueLength: this.queue.length,
            waitingTime: this.getTotalWaitingTime(),
            oldestVehicleWaitTime,
            turningVehicles
        };
    }

    private getTotalWaitingTime(): number {
        return this.queue.reduce((total, vehicle) =>
            total + (this.currentTick - vehicle.getEntryTime()), 0);
    }

    public getDirection(): Direction {
        return this.direction;
    }

    public isEmpty(): boolean {
        return this.queue.length === 0;
    }
}