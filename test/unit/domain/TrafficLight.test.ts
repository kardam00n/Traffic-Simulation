import { TrafficLight, TrafficLightState } from '../../../src/domain/models/TrafficLight';

describe('TrafficLight', () => {
    let trafficLight: TrafficLight;

    beforeEach(() => {
        trafficLight = new TrafficLight();
    });

    describe('initialization', () => {
        it('should initialize with RED state by default', () => {
            expect(trafficLight.getState()).toBe(TrafficLightState.RED);
            expect(trafficLight.getPreviousState()).toBe(TrafficLightState.RED);
            expect(trafficLight.isTransitioning()).toBe(false);
        });

        it('should initialize with specified state', () => {
            const greenLight = new TrafficLight(TrafficLightState.GREEN);
            expect(greenLight.getState()).toBe(TrafficLightState.GREEN);
            expect(greenLight.getPreviousState()).toBe(TrafficLightState.GREEN);
            expect(greenLight.isTransitioning()).toBe(false);
        });
    });

    describe('state transitions', () => {
        describe('from RED state', () => {
            it('should not switch state before minimum ticks', () => {
                trafficLight.switchState();
                expect(trafficLight.getState()).toBe(TrafficLightState.RED);
                expect(trafficLight.isTransitioning()).toBe(false);
            });

            it('should transition to YELLOW (towards GREEN) after minimum ticks', () => {
                trafficLight.tick();
                trafficLight.switchState();
                expect(trafficLight.getState()).toBe(TrafficLightState.YELLOW);
                expect(trafficLight.getPreviousState()).toBe(TrafficLightState.RED);
                expect(trafficLight.isTransitioning()).toBe(true);
                expect(trafficLight.isTransitioningToGreen()).toBe(true);
                expect(trafficLight.isTransitioningToRed()).toBe(false);
            });
        });

        describe('from GREEN state', () => {
            beforeEach(() => {
                trafficLight = new TrafficLight(TrafficLightState.GREEN);
            });

            it('should not switch state before minimum ticks', () => {
                trafficLight.switchState();
                expect(trafficLight.getState()).toBe(TrafficLightState.GREEN);
                expect(trafficLight.isTransitioning()).toBe(false);
            });

            it('should transition to YELLOW (towards RED) after minimum ticks', () => {
                trafficLight.tick();
                trafficLight.switchState();
                expect(trafficLight.getState()).toBe(TrafficLightState.YELLOW);
                expect(trafficLight.getPreviousState()).toBe(TrafficLightState.GREEN);
                expect(trafficLight.isTransitioning()).toBe(true);
                expect(trafficLight.isTransitioningToRed()).toBe(true);
                expect(trafficLight.isTransitioningToGreen()).toBe(false);
            });
        });

        describe('from YELLOW state', () => {
            it('should complete transition to GREEN when coming from RED', () => {
                // Setup: RED -> YELLOW transition
                trafficLight.tick();
                trafficLight.switchState();
                expect(trafficLight.getState()).toBe(TrafficLightState.YELLOW);
                expect(trafficLight.isTransitioningToGreen()).toBe(true);

                // Complete transition: YELLOW -> GREEN
                trafficLight.switchState();
                expect(trafficLight.getState()).toBe(TrafficLightState.GREEN);
                expect(trafficLight.getPreviousState()).toBe(TrafficLightState.YELLOW);
                expect(trafficLight.isTransitioning()).toBe(false);
            });

            it('should complete transition to RED when coming from GREEN', () => {
                // Setup: Start with GREEN
                trafficLight = new TrafficLight(TrafficLightState.GREEN);
                trafficLight.tick();
                trafficLight.switchState(); // GREEN -> YELLOW
                expect(trafficLight.getState()).toBe(TrafficLightState.YELLOW);
                expect(trafficLight.isTransitioningToRed()).toBe(true);

                // Complete transition: YELLOW -> RED
                trafficLight.switchState();
                expect(trafficLight.getState()).toBe(TrafficLightState.RED);
                expect(trafficLight.getPreviousState()).toBe(TrafficLightState.YELLOW);
                expect(trafficLight.isTransitioning()).toBe(false);
            });

            it('should allow immediate switch from YELLOW without additional ticks', () => {
                trafficLight.tick();
                trafficLight.switchState(); // RED -> YELLOW
                expect(trafficLight.canSwitch()).toBe(true);
                trafficLight.switchState(); // YELLOW -> GREEN (immediate)
                expect(trafficLight.getState()).toBe(TrafficLightState.GREEN);
            });
        });
    });

    describe('tick behavior', () => {
        it('should accumulate ticks until state change', () => {
            trafficLight.tick();
            expect(trafficLight.canSwitch()).toBe(true);
            trafficLight.switchState();
            expect(trafficLight.canSwitch()).toBe(true); // YELLOW can always switch
        });

        it('should reset ticks after state change', () => {
            trafficLight.tick();
            trafficLight.switchState(); // RED -> YELLOW
            trafficLight.switchState(); // YELLOW -> GREEN
            expect(trafficLight.canSwitch()).toBe(false); // Needs new ticks in GREEN
        });
    });

    describe('full cycle behavior', () => {
        it('should complete full RED->GREEN->RED cycle with minimum ticks', () => {
            // Start: RED
            expect(trafficLight.getState()).toBe(TrafficLightState.RED);

            // RED -> YELLOW (towards GREEN)
            trafficLight.tick();
            trafficLight.switchState();
            expect(trafficLight.getState()).toBe(TrafficLightState.YELLOW);
            expect(trafficLight.isTransitioningToGreen()).toBe(true);

            // YELLOW -> GREEN
            trafficLight.switchState();
            expect(trafficLight.getState()).toBe(TrafficLightState.GREEN);
            expect(trafficLight.isTransitioning()).toBe(false);

            // GREEN -> YELLOW (towards RED)
            trafficLight.tick();
            trafficLight.switchState();
            expect(trafficLight.getState()).toBe(TrafficLightState.YELLOW);
            expect(trafficLight.isTransitioningToRed()).toBe(true);

            // YELLOW -> RED
            trafficLight.switchState();
            expect(trafficLight.getState()).toBe(TrafficLightState.RED);
            expect(trafficLight.isTransitioning()).toBe(false);
        });
    });
});