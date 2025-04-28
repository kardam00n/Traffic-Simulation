import {TrafficLight, TrafficLightState} from './TrafficLight';
import {Direction, TurnDirection} from './Direction';
import {QueueMetrics, TrafficQueue} from './TrafficQueue';
import {Vehicle} from './Vehicle';
import {LoggerService} from "../../infrastructure/logging/LoggerService";

export class Intersection {
    private trafficLights: Map<Direction, TrafficLight>;
    private trafficQueues: Map<Direction, TrafficQueue>;
    private readonly logger: LoggerService = LoggerService.getInstance();
    private currentTick: number = 0;

    constructor() {
        this.trafficLights = new Map();
        this.trafficQueues = new Map();
        this.initializeTrafficLights();
        this.initializeQueues();
    }

    private initializeTrafficLights(): void {
        // North-South pair
        this.trafficLights.set(Direction.NORTH, new TrafficLight(TrafficLightState.RED, Direction.NORTH));
        this.trafficLights.set(Direction.SOUTH, new TrafficLight(TrafficLightState.RED, Direction.SOUTH));
        // East-West pair
        this.trafficLights.set(Direction.EAST, new TrafficLight(TrafficLightState.GREEN, Direction.EAST));
        this.trafficLights.set(Direction.WEST, new TrafficLight(TrafficLightState.GREEN, Direction.WEST));
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

        // Update ticks in all traffic lights
        this.trafficLights.forEach(light => light.tick());

        // Check if any lights are transitioning (should use isTransitioning instead of checking YELLOW state)
        const hasTransitioningLights = Array.from(this.trafficLights.values())
            .some(light => light.isTransitioning());  // Change this line

        // If any lights are transitioning, complete the transition regardless of metrics
        if (hasTransitioningLights) {
            this.switchAllLights();
        } else if (this.shouldSwitchLights()) {
            // Only check traffic conditions when not transitioning
            this.logger.info("Initiated traffic light switch based on traffic queues.")
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
        // Get directions where vehicles can pass (GREEN or YELLOW transitioning to GREEN)
        const passingDirections = new Set(
            Array.from(this.trafficLights.entries())
                .filter(([_, light]) => {
                    const state = light.getState();
                    return state === TrafficLightState.GREEN || 
                           (state === TrafficLightState.YELLOW && light.isTransitioningToGreen());
                })
                .map(([direction]) => direction)
        );

        // Get directions where vehicles must stop (RED or YELLOW transitioning to RED)
        const stoppingDirections = new Set(
            Array.from(this.trafficLights.entries())
                .filter(([_, light]) => {
                    const state = light.getState();
                    return state === TrafficLightState.RED || 
                           (state === TrafficLightState.YELLOW && light.isTransitioningToRed());
                })
                .map(([direction]) => direction)
        );

        // Check traffic presence
        const hasPassingTraffic = Array.from(passingDirections)
            .some(direction => !this.trafficQueues.get(direction)?.isEmpty());

        const hasStoppingTraffic = Array.from(stoppingDirections)
            .some(direction => !this.trafficQueues.get(direction)?.isEmpty());

        if (!hasPassingTraffic && hasStoppingTraffic) {
            return true;
        }

        // Calculate urgency scores
        let passingUrgency = 0;
        let stoppingUrgency = 0;

        metrics.forEach((metric, direction) => {
            const urgencyScore = this.calculateUrgencyScore(metric);
            if (passingDirections.has(direction)) {
                passingUrgency += urgencyScore;
            } else if (stoppingDirections.has(direction)) {
                stoppingUrgency += urgencyScore;
            }
        });

        return stoppingUrgency > passingUrgency;
    }

    private calculateUrgencyScore(metrics: QueueMetrics): number {
        return metrics.queueLength + metrics.oldestVehicleWaitTime;
    }

    private switchAllLights(): void {
        this.trafficLights.forEach(light => light.switchState());
    }



    public canVehiclePass(fromDirection: Direction, turnDirection: TurnDirection): boolean {
        const light = this.trafficLights.get(fromDirection);
        if (!light) return false;

        switch (light.getState()) {
            case TrafficLightState.GREEN:
                return true;
            case TrafficLightState.YELLOW:
                return true;
            case TrafficLightState.RED:
                return false;
            default:
                return false;
        }
    }


    public getTrafficLightState(direction: Direction): TrafficLightState {
        const light = this.trafficLights.get(direction);
        if (!light) throw new Error(`No traffic light for direction ${direction}`);
        return light.getState();
    }

    public getTrafficQueue(direction: Direction): TrafficQueue{
        const trafficQueue = this.trafficQueues.get(direction);
        if(!trafficQueue) throw new Error(`No traffic queue for direction ${direction}`);
        return trafficQueue;
    }

    public getTrafficLight(direction: Direction): TrafficLight {
        const light = this.trafficLights.get(direction);
        if (!light) throw new Error(`No traffic light for direction ${direction}`);
        return light;
    }

}