import { TrafficLight, TrafficLightState } from './TrafficLight';
import { Direction, TurnDirection } from './Direction';
import { TrafficQueue, QueueMetrics } from './TrafficQueue';
import { Vehicle } from './Vehicle';

export class Intersection {
    private trafficLights: Map<Direction, TrafficLight>;
    private trafficQueues: Map<Direction, TrafficQueue>;
    private currentTick: number = 0;

    constructor() {
        this.trafficLights = new Map();
        this.trafficQueues = new Map();
        this.initializeTrafficLights();
        this.initializeQueues();
    }

    private initializeTrafficLights(): void {
        // North-South pair
        this.trafficLights.set(Direction.NORTH, new TrafficLight(TrafficLightState.RED));
        this.trafficLights.set(Direction.SOUTH, new TrafficLight(TrafficLightState.RED));
        // East-West pair
        this.trafficLights.set(Direction.EAST, new TrafficLight(TrafficLightState.GREEN));
        this.trafficLights.set(Direction.WEST, new TrafficLight(TrafficLightState.GREEN));
    }

    private initializeQueues(): void {
        Object.values(Direction).forEach(direction => {
            this.trafficQueues.set(direction, new TrafficQueue(direction));
        });
    }

    public addVehicleToQueue(vehicle: Vehicle): void {
        const queue = this.trafficQueues.get(vehicle.getFromDirection());
        if (queue) {
            queue.addVehicle(vehicle);
        }
    }

    public removeVehicleFromQueue(vehicle: Vehicle): void {
        const queue = this.trafficQueues.get(vehicle.getFromDirection());
        if (queue) {
            queue.removeVehicle(vehicle);
        }
    }

    public tick(): void {
        this.currentTick++;
        this.updateQueues();

        if (this.shouldSwitchLights()) {
            this.switchAllLights();
        }
    }

    private updateQueues(): void {
        this.trafficQueues.forEach(queue => queue.updateTick(this.currentTick));
    }

    public clearAllQueues(): void {
        this.trafficQueues.forEach(queue => queue.clear());
    }

    private shouldSwitchLights(): boolean {
        const metrics = this.calculateTrafficMetrics();
        return this.shouldSwitchBasedOnMetrics(metrics);
    }

    private calculateTrafficMetrics(): Map<Direction, QueueMetrics> {
        const metrics = new Map<Direction, QueueMetrics>();
        this.trafficQueues.forEach((queue, direction) => {
            metrics.set(direction, queue.getMetrics());
        });
        return metrics;
    }

    private shouldSwitchBasedOnMetrics(metrics: Map<Direction, QueueMetrics>): boolean {
        const greenDirections = new Set(
            Array.from(this.trafficLights.entries())
                .filter(([_, light]) => light.getState() === TrafficLightState.GREEN)
                .map(([direction]) => direction)
        );

        const redDirections = new Set(
            Array.from(this.trafficLights.entries())
                .filter(([_, light]) => light.getState() === TrafficLightState.RED)
                .map(([direction]) => direction)
        );

        // If there's no traffic in green directions but traffic in red directions, switch
        const hasGreenTraffic = Array.from(greenDirections)
            .some(direction => !this.trafficQueues.get(direction)?.isEmpty());

        const hasRedTraffic = Array.from(redDirections)
            .some(direction => !this.trafficQueues.get(direction)?.isEmpty());

        if (!hasGreenTraffic && hasRedTraffic) {
            return true;
        }

        // Calculate urgency scores
        let greenUrgency = 0;
        let redUrgency = 0;

        metrics.forEach((metric, direction) => {
            const urgencyScore = this.calculateUrgencyScore(metric);
            if (greenDirections.has(direction)) {
                greenUrgency += urgencyScore;
            } else if (redDirections.has(direction)) {
                redUrgency += urgencyScore;
            }
        });

        // Switch if red direction urgency is higher
        return redUrgency > greenUrgency;
    }

    private calculateUrgencyScore(metrics: QueueMetrics): number {
        return metrics.queueLength + metrics.oldestVehicleWaitTime;
    }

    private switchAllLights(): void {
        this.trafficLights.forEach(light => light.switchState());
    }

    public canVehiclePass(fromDirection: Direction, turnDirection: TurnDirection): boolean {
        const light = this.trafficLights.get(fromDirection);
        return light?.getState() === TrafficLightState.GREEN;
    }

    public getTrafficLightState(direction: Direction): TrafficLightState {
        const light = this.trafficLights.get(direction);
        if (!light) throw new Error(`No traffic light for direction ${direction}`);
        return light.getState();
    }
}