import { SimulationService } from '../../domain/services/SimulationService';
import { AddVehicleUseCase } from './AddVehicleUseCase';
import { ProcessStepUseCase } from './ProcessStepUseCase';
import { ISimulationInput, parseDirection } from '../../domain/interfaces/ISimulationInput';
import { ISimulationOutput, StepStatus } from '../../domain/interfaces/ISimulationOutput';
import { IVehicleRepository } from '../../domain/interfaces/IVehicleRepository';

export class RunSimulationUseCase {
    constructor(
        private readonly simulationService: SimulationService,
        private readonly addVehicleUseCase: AddVehicleUseCase,
        private readonly processStepUseCase: ProcessStepUseCase,
        private readonly vehicleRepository: IVehicleRepository
    ) {}

    public execute(input: ISimulationInput): ISimulationOutput {
        const output: ISimulationOutput = {
            stepStatuses: []
        };

        let vehiclesBeforeStep: Set<string>;

        for (const command of input.commands) {
            if (command.type === 'addVehicle') {
                const fromDirection = parseDirection(command.startRoad);
                const toDirection = parseDirection(command.endRoad);

                this.addVehicleUseCase.execute(
                    command.vehicleId,
                    fromDirection,
                    toDirection,
                    this.simulationService.getCurrentTick()
                );
            }
            else if (command.type === 'step') {
                // Record vehicle IDs before the step
                vehiclesBeforeStep = new Set(
                    this.vehicleRepository.getAllActive().map(v => v.getId())
                );

                // Process the step
                this.processStepUseCase.execute();

                // Find vehicles that left during this step
                const currentVehicles = new Set(
                    this.vehicleRepository.getAllActive().map(v => v.getId())
                );

                const leftVehicles = Array.from(vehiclesBeforeStep)
                    .filter(id => !currentVehicles.has(id));

                output.stepStatuses.push({
                    leftVehicles
                });
            }
        }

        return output;
    }
}