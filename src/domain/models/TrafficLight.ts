export enum TrafficLightState {
    RED = 'RED',
    GREEN = 'GREEN'
}

export class TrafficLight {
    private state: TrafficLightState;

    constructor(initialState: TrafficLightState = TrafficLightState.RED) {
        this.state = initialState;
    }

    public getState(): TrafficLightState {
        return this.state;
    }

    public switchState(): void {
        this.state = this.state === TrafficLightState.RED
            ? TrafficLightState.GREEN
            : TrafficLightState.RED;
    }
}