export enum TrafficLightState {
    RED = 'RED',
    YELLOW = 'YELLOW',
    GREEN = 'GREEN'
}

export class TrafficLight {
    private state: TrafficLightState;
    private transitioning: boolean = false;
    private previousState: TrafficLightState;
    private ticksInCurrentState: number = 0;
    private readonly MIN_TICKS_IN_FULL_STATE = 1;

    constructor(initialState: TrafficLightState = TrafficLightState.RED) {
        this.state = initialState;
        this.previousState = initialState;
    }

    public tick(): void {
        this.ticksInCurrentState++;
    }

    public canSwitch(): boolean {
        // Allow switching from YELLOW state always
        if (this.state === TrafficLightState.YELLOW) {
            return true;
        }
        // For RED and GREEN states, ensure minimum time has passed
        return this.ticksInCurrentState >= this.MIN_TICKS_IN_FULL_STATE;
    }

    public switchState(): void {
        if (!this.canSwitch()) {
            return;
        }

        if (this.transitioning) {
            // Complete the transition
            this.state = this.isTransitioningToRed()
                ? TrafficLightState.RED
                : TrafficLightState.GREEN;
            this.previousState = TrafficLightState.YELLOW;
            this.transitioning = false;
        } else {
            // Start the transition
            if (this.state === TrafficLightState.GREEN || this.state === TrafficLightState.RED) {
                this.previousState = this.state;
                this.state = TrafficLightState.YELLOW;
                this.transitioning = true;
            }
        }

        // Reset ticks counter when state changes
        this.ticksInCurrentState = 0;
    }


    public getState(): TrafficLightState {
        return this.state;
    }

    public isTransitioningToRed(): boolean {
        return this.state === TrafficLightState.YELLOW && this.previousState === TrafficLightState.GREEN;
    }

    public isTransitioningToGreen(): boolean {
        return this.state === TrafficLightState.YELLOW && this.previousState === TrafficLightState.RED;
    }

    public isTransitioning(): boolean {
        return this.transitioning;
    }

    public getPreviousState(): TrafficLightState {
        return this.previousState;
    }
}