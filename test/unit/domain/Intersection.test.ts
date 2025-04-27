import {Intersection} from '../../../src/domain/models/Intersection';
import {Direction, TurnDirection} from '../../../src/domain/models/Direction';
import {TrafficLightState} from '../../../src/domain/models/TrafficLight';

describe('Intersection', () => {
    let intersection: Intersection;

    beforeEach(() => {
        intersection = new Intersection();
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
                // North and South start with RED
                expect(intersection.canVehiclePass(Direction.NORTH, TurnDirection.STRAIGHT)).toBe(false);
                expect(intersection.canVehiclePass(Direction.NORTH, TurnDirection.LEFT)).toBe(false);
                expect(intersection.canVehiclePass(Direction.NORTH, TurnDirection.RIGHT)).toBe(false);
            });
        });

        describe('RED_AND_YELLOW light', () => {
            it('should not allow vehicles to pass on red and yellow light', () => {
                // Advance to RED_AND_YELLOW state (RED duration is 30)
                for (let i = 0; i < 30; i++) {
                    intersection.tick();
                }

                expect(intersection.getTrafficLightState(Direction.NORTH)).toBe(TrafficLightState.RED_AND_YELLOW);
                expect(intersection.canVehiclePass(Direction.NORTH, TurnDirection.STRAIGHT)).toBe(false);
                expect(intersection.canVehiclePass(Direction.NORTH, TurnDirection.LEFT)).toBe(false);
                expect(intersection.canVehiclePass(Direction.NORTH, TurnDirection.RIGHT)).toBe(false);
            });
        });

        describe('GREEN light', () => {
            it('should allow all turns on green light', () => {
                // East and West start with GREEN
                expect(intersection.canVehiclePass(Direction.EAST, TurnDirection.STRAIGHT)).toBe(true);
                expect(intersection.canVehiclePass(Direction.EAST, TurnDirection.LEFT)).toBe(true);
                expect(intersection.canVehiclePass(Direction.EAST, TurnDirection.RIGHT)).toBe(true);
            });
        });

        describe('YELLOW light', () => {
            it('should only allow straight movement on yellow light', () => {
                // Advance to YELLOW (GREEN duration is 30)
                for (let i = 0; i < 30; i++) {
                    intersection.tick();
                }

                expect(intersection.getTrafficLightState(Direction.EAST)).toBe(TrafficLightState.YELLOW);
                expect(intersection.canVehiclePass(Direction.EAST, TurnDirection.STRAIGHT)).toBe(true);
                expect(intersection.canVehiclePass(Direction.EAST, TurnDirection.LEFT)).toBe(false);
                expect(intersection.canVehiclePass(Direction.EAST, TurnDirection.RIGHT)).toBe(false);
            });
        });
    });

    describe('traffic light cycle', () => {
        it('should properly cycle through all states', () => {
            // Initial state
            expect(intersection.getTrafficLightState(Direction.NORTH)).toBe(TrafficLightState.RED);
            expect(intersection.getTrafficLightState(Direction.EAST)).toBe(TrafficLightState.GREEN);

            for (let i = 0; i < 30; i++) intersection.tick();
            expect(intersection.getTrafficLightState(Direction.NORTH)).toBe(TrafficLightState.RED_AND_YELLOW);
            expect(intersection.getTrafficLightState(Direction.EAST)).toBe(TrafficLightState.YELLOW);

            for (let i = 0; i < 5; i++) intersection.tick();
            expect(intersection.getTrafficLightState(Direction.NORTH)).toBe(TrafficLightState.GREEN);
            expect(intersection.getTrafficLightState(Direction.EAST)).toBe(TrafficLightState.RED);

            for (let i = 0; i < 30; i++) intersection.tick();
            expect(intersection.getTrafficLightState(Direction.NORTH)).toBe(TrafficLightState.YELLOW);
            expect(intersection.getTrafficLightState(Direction.EAST)).toBe(TrafficLightState.RED_AND_YELLOW);
        });

        it('should maintain opposite directions in sync', () => {
            for (let i = 0; i < 100; i++) {
                intersection.tick();

                expect(intersection.getTrafficLightState(Direction.NORTH))
                    .toBe(intersection.getTrafficLightState(Direction.SOUTH));
                expect(intersection.getTrafficLightState(Direction.EAST))
                    .toBe(intersection.getTrafficLightState(Direction.WEST));
            }
        });
    });

    describe('full cycle timing', () => {
        it('should complete a full cycle with correct timing', () => {
            const states: TrafficLightState[] = [];

            // Record states for one full cycle (RED + RED_AND_YELLOW + GREEN + YELLOW = 70 ticks)
            for (let i = 0; i < 70; i++) {
                states.push(intersection.getTrafficLightState(Direction.NORTH));
                intersection.tick();
            }

            // Verify the sequence matches expected durations
            expect(states.filter(state => state === TrafficLightState.RED).length).toBe(30);
            expect(states.filter(state => state === TrafficLightState.RED_AND_YELLOW).length).toBe(5);
            expect(states.filter(state => state === TrafficLightState.GREEN).length).toBe(30);
            expect(states.filter(state => state === TrafficLightState.YELLOW).length).toBe(5);
        });

        it('should follow correct state transition order', () => {
            const stateTransitions: TrafficLightState[] = [];

            // Record state transitions for one full cycle
            for (let i = 0; i < 70; i++) {
                const currentState = intersection.getTrafficLightState(Direction.NORTH);
                if (stateTransitions.length === 0 || stateTransitions[stateTransitions.length - 1] !== currentState) {
                    stateTransitions.push(currentState);
                }
                intersection.tick();
            }

            // Verify correct transition order
            expect(stateTransitions).toEqual([
                TrafficLightState.RED,
                TrafficLightState.RED_AND_YELLOW,
                TrafficLightState.GREEN,
                TrafficLightState.YELLOW
            ]);
        });
    });
});