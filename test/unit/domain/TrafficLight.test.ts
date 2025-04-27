import { TrafficLight, TrafficLightState } from '../../../src/domain/models/TrafficLight';

describe('TrafficLight', () => {
    let trafficLight: TrafficLight;

    beforeEach(() => {
        trafficLight = new TrafficLight();
    });

    it('should initialize with RED state by default', () => {
        expect(trafficLight.getState()).toBe(TrafficLightState.RED);
    });

    it('should change from RED to GREEN after RED_DURATION ticks', () => {
        // Simulate 30 ticks (RED_DURATION)
        for (let i = 0; i < 30; i++) {
            trafficLight.tick();
        }
        expect(trafficLight.getState()).toBe(TrafficLightState.RED_AND_YELLOW);
    });

    it('should complete full cycle correctly', () => {
        // RED -> GREEN (after 30 ticks)
        for (let i = 0; i < 30; i++) trafficLight.tick();
        expect(trafficLight.getState()).toBe(TrafficLightState.RED_AND_YELLOW);

        // YELLOW -> RED (after 5 more ticks)
        for (let i = 0; i < 5; i++) trafficLight.tick();
        expect(trafficLight.getState()).toBe(TrafficLightState.GREEN);

        // GREEN -> YELLOW (after 30 more ticks)
        for (let i = 0; i < 30; i++) trafficLight.tick();
        expect(trafficLight.getState()).toBe(TrafficLightState.YELLOW);

        // YELLOW -> RED (after 5 more ticks)
        for (let i = 0; i < 5; i++) trafficLight.tick();
        expect(trafficLight.getState()).toBe(TrafficLightState.RED);
    });
});