import { SimulationRunner } from '../application/SimulationRunner';
import { ISimulationInput, SimulationCommand } from '../domain/interfaces/ISimulationInput';
import { ISimulationOutput } from '../domain/interfaces/ISimulationOutput';
import {LoggerService} from "../infrastructure/logging/LoggerService";

export class WebSimulationRunner {
    private simulationRunner: SimulationRunner;
    private currentCommandIndex: number = 0;
    private input: ISimulationInput | null = null;
    private output: ISimulationOutput | null = null;
    private readonly logger: LoggerService = LoggerService.getInstance()

    constructor() {
        this.simulationRunner = new SimulationRunner();
    }

    public initialize(input: ISimulationInput): void {
        this.input = input;
        this.currentCommandIndex = 0;
        this.output = {
            stepStatuses: []
        };
        this.logger.info("Simulation started")
        this.simulationRunner = new SimulationRunner();
    }

    public processNextCommand(): ISimulationOutput | null {
        if (!this.input) {
            throw new Error('Simulation not initialized');
        }

        if (this.currentCommandIndex >= this.input.commands.length) {
            return this.output;
        }

        // Create a partial input with just the current command
        const partialInput: ISimulationInput = {
            commands: [this.input.commands[this.currentCommandIndex]]
        };

        // Run the simulation for this command using the standard SimulationRunner
        const commandOutput = this.simulationRunner.run(partialInput);

        // Append the results to our output
        if (commandOutput.stepStatuses.length > 0) {
            this.output?.stepStatuses.push(...commandOutput.stepStatuses);
        }

        this.currentCommandIndex++;
        return this.output;
    }

    public getCurrentCommandIndex(): number {
        return this.currentCommandIndex;
    }

    public isComplete(): boolean {
        return this.input !== null &&
            this.currentCommandIndex >= this.input.commands.length;
    }

    public getCurrentCommand(): SimulationCommand | null {
        if (!this.input || this.isComplete()) {
            this.logger.info("Simulation Complete")
            return null;
        }
        return this.input.commands[this.currentCommandIndex];
    }

    // Delegate state access to the underlying SimulationRunner
    public getIntersectionState() {
        return (this.simulationRunner as any).intersection;
    }

    public getVehicleRepository() {
        return (this.simulationRunner as any).vehicleRepository;
    }
}