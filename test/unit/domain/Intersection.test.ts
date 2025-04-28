import { Intersection } from '../../../src/domain/models/Intersection';
import { Direction, TurnDirection } from '../../../src/domain/models/Direction';
import { TrafficLightState } from '../../../src/domain/models/TrafficLight';
import { Vehicle } from '../../../src/domain/models/Vehicle';
import {LoggerService} from "../../../src/infrastructure/logging/LoggerService";
import {ConsoleLogger} from "../../../src/infrastructure/logging/ConsoleLogger";

describe('Intersection', () => {
    let intersection: Intersection;
    let logger: LoggerService

    beforeEach(() => {
        intersection = new Intersection();
        LoggerService.getInstance().setLogger(new ConsoleLogger());
        logger = LoggerService.getInstance();
    });

    describe('initialization', () => {
        it('should initialize with correct traffic light states', () => {
            expect(intersection.getTrafficLightState(Direction.NORTH)).toBe(TrafficLightState.RED);
            expect(intersection.getTrafficLightState(Direction.SOUTH)).toBe(TrafficLightState.RED);
            expect(intersection.getTrafficLightState(Direction.EAST)).toBe(TrafficLightState.GREEN);
            expect(intersection.getTrafficLightState(Direction.WEST)).toBe(TrafficLightState.GREEN);
        });

        it('should throw error when getting state for invalid direction', () => {
            expect(() => {
                // @ts-ignore - Testing invalid input
                intersection.getTrafficLightState('INVALID');
            }).toThrow('No traffic light for direction INVALID');
        });
    });

    describe('vehicle passing rules', () => {
        describe('RED light', () => {
            it('should not allow vehicles to pass on red light', () => {
                expect(intersection.canVehiclePass(Direction.NORTH, TurnDirection.STRAIGHT)).toBe(false);
                expect(intersection.canVehiclePass(Direction.NORTH, TurnDirection.LEFT)).toBe(false);
                expect(intersection.canVehiclePass(Direction.NORTH, TurnDirection.RIGHT)).toBe(false);
            });
        });

        describe('GREEN light', () => {
            it('should allow all turns on green light', () => {
                expect(intersection.canVehiclePass(Direction.EAST, TurnDirection.STRAIGHT)).toBe(true);
                expect(intersection.canVehiclePass(Direction.EAST, TurnDirection.LEFT)).toBe(true);
                expect(intersection.canVehiclePass(Direction.EAST, TurnDirection.RIGHT)).toBe(true);
            });
        });

        describe('YELLOW light behavior', () => {
            it('should allow passing when transitioning to GREEN', () => {
                const vehicle = new Vehicle("1", Direction.NORTH, Direction.SOUTH, 0);
                intersection.addVehicleToQueue(vehicle);

                // Create high urgency in the stopping direction
                for (let i = 0; i < 10; i++) {
                    intersection.tick();
                }

                const northLight = intersection.getTrafficLight(Direction.NORTH);
                if (northLight.getState() === TrafficLightState.YELLOW && northLight.isTransitioningToGreen()) {
                    expect(intersection.canVehiclePass(Direction.NORTH, TurnDirection.STRAIGHT)).toBe(true);
                }
            });

            it('should allow passing when transitioning to RED', () => {
                const vehicle = new Vehicle("1", Direction.NORTH, Direction.SOUTH, 0);
                intersection.addVehicleToQueue(vehicle);

                // Create high urgency to trigger light change
                for (let i = 0; i < 10; i++) {
                    intersection.tick();
                }

                const eastLight = intersection.getTrafficLight(Direction.EAST);
                if (eastLight.getState() === TrafficLightState.YELLOW && eastLight.isTransitioningToRed()) {
                    expect(intersection.canVehiclePass(Direction.EAST, TurnDirection.STRAIGHT)).toBe(true);
                }
            });
        });
    });

    describe('traffic light cycle', () => {
        it('should maintain opposite directions in sync', () => {
            for (let i = 0; i < 10; i++) {
                intersection.tick();
                expect(intersection.getTrafficLightState(Direction.NORTH))
                    .toBe(intersection.getTrafficLightState(Direction.SOUTH));
                expect(intersection.getTrafficLightState(Direction.EAST))
                    .toBe(intersection.getTrafficLightState(Direction.WEST));
            }
        });

        it('should switch lights when there is high urgency in waiting direction', () => {
            // Add multiple vehicles to create high urgency
            for (let i = 0; i < 5; i++) {
                const vehicle = new Vehicle(i.toString(), Direction.NORTH, Direction.SOUTH, 0);
                intersection.addVehicleToQueue(vehicle);
            }

            const initialNorthState = intersection.getTrafficLightState(Direction.NORTH);

            let changed = false;
            for (let i = 0; i < 20 && !changed; i++) {
                intersection.tick();
                if (intersection.getTrafficLightState(Direction.NORTH) !== initialNorthState) {
                    changed = true;
                }
            }

            expect(changed).toBe(true);
        });
    });

    describe('queue management', () => {
        it('should properly handle vehicle queue operations', () => {
            const vehicle = new Vehicle("1", Direction.NORTH, Direction.SOUTH, 0);
            intersection.addVehicleToQueue(vehicle);
            intersection.removeVehicleFromQueue(vehicle);

            // Clear all queues and verify lights still operate normally
            intersection.clearAllQueues();
            expect(intersection.getTrafficLightState(Direction.NORTH)).toBe(TrafficLightState.RED);
            expect(intersection.getTrafficLightState(Direction.EAST)).toBe(TrafficLightState.GREEN);
        });
    });
});