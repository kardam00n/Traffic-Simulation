import { TrafficQueue } from '../../../src/domain/models/TrafficQueue';
import { Direction, TurnDirection } from '../../../src/domain/models/Direction';
import { Vehicle } from '../../../src/domain/models/Vehicle';

describe('TrafficQueue', () => {
    let queue: TrafficQueue;
    const direction = Direction.NORTH;

    beforeEach(() => {
        queue = new TrafficQueue(direction);
    });

    describe('initialization', () => {
        it('should initialize with empty queue', () => {
            expect(queue.isEmpty()).toBe(true);
            expect(queue.getDirection()).toBe(direction);
        });
    });

    describe('queue operations', () => {
        let vehicle: Vehicle;

        beforeEach(() => {
            vehicle = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
        });

        it('should add vehicle to queue', () => {
            queue.addVehicle(vehicle);
            expect(queue.isEmpty()).toBe(false);
        });

        it('should not add duplicate vehicles', () => {
            queue.addVehicle(vehicle);
            queue.addVehicle(vehicle);
            expect(queue.getMetrics().queueLength).toBe(1);
        });

        it('should remove vehicle from queue', () => {
            queue.addVehicle(vehicle);
            queue.removeVehicle(vehicle);
            expect(queue.isEmpty()).toBe(true);
        });

        it('should clear all vehicles from queue', () => {
            queue.addVehicle(vehicle);
            queue.addVehicle(new Vehicle('2', Direction.NORTH, Direction.SOUTH, 0));
            queue.clear();
            expect(queue.isEmpty()).toBe(true);
        });
    });

    describe('metrics calculation', () => {
        it('should calculate correct initial metrics', () => {
            const metrics = queue.getMetrics();
            expect(metrics).toEqual({
                queueLength: 0,
                waitingTime: 0,
                oldestVehicleWaitTime: 0,
                turningVehicles: {
                    straight: 0,
                    left: 0,
                    right: 0
                }
            });
        });

        it('should calculate correct metrics with vehicles', () => {
            const vehicle1 = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0); // STRAIGHT
            const vehicle2 = new Vehicle('2', Direction.NORTH, Direction.EAST, 0);  // LEFT
            const vehicle3 = new Vehicle('3', Direction.NORTH, Direction.WEST, 0);  // RIGHT

            queue.addVehicle(vehicle1);
            queue.addVehicle(vehicle2);
            queue.addVehicle(vehicle3);
            queue.updateTick(5); // Advance time by 5 ticks

            const metrics = queue.getMetrics();
            expect(metrics).toEqual({
                queueLength: 3,
                waitingTime: 15, // 5 ticks * 3 vehicles
                oldestVehicleWaitTime: 5, // First vehicle waited 5 ticks
                turningVehicles: {
                    straight: 1,
                    left: 1,
                    right: 1
                }
            });
        });

        it('should update waiting times with tick updates', () => {
            const vehicle = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
            queue.addVehicle(vehicle);

            queue.updateTick(5);
            expect(queue.getMetrics().waitingTime).toBe(5);

            queue.updateTick(10);
            expect(queue.getMetrics().waitingTime).toBe(10);
        });
    });

    describe('direction handling', () => {
        it('should track vehicles by turn direction', () => {
            // Add vehicles with different turn directions
            const straightVehicle = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
            const leftVehicle = new Vehicle('2', Direction.NORTH, Direction.EAST, 0);
            const rightVehicle = new Vehicle('3', Direction.NORTH, Direction.WEST, 0);

            queue.addVehicle(straightVehicle);
            queue.addVehicle(leftVehicle);
            queue.addVehicle(rightVehicle);

            const metrics = queue.getMetrics();
            expect(metrics.turningVehicles).toEqual({
                straight: 1,
                left: 1,
                right: 1
            });
        });
    });

    describe('edge cases', () => {
        it('should handle removing non-existent vehicle', () => {
            const vehicle = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
            queue.removeVehicle(vehicle); // Should not throw
            expect(queue.isEmpty()).toBe(true);
        });

        it('should handle metrics with empty queue after removing all vehicles', () => {
            const vehicle = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
            queue.addVehicle(vehicle);
            queue.removeVehicle(vehicle);

            const metrics = queue.getMetrics();
            expect(metrics).toEqual({
                queueLength: 0,
                waitingTime: 0,
                oldestVehicleWaitTime: 0,
                turningVehicles: {
                    straight: 0,
                    left: 0,
                    right: 0
                }
            });
        });
    });
});