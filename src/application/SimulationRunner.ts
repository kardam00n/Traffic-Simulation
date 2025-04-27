import { RunSimulationUseCase } from './useCases/RunSimulationUseCase';
import { AddVehicleUseCase } from './useCases/AddVehicleUseCase';
import { ProcessStepUseCase } from './useCases/ProcessStepUseCase';
import { SimulationService } from '../domain/services/SimulationService';
import { VehicleRepository } from '../infrastructure/repositories/VehicleRepository';
import { Intersection } from '../domain/models/Intersection';
import { ISimulationInput } from '../domain/interfaces/ISimulationInput';
import { ISimulationOutput } from '../domain/interfaces/ISimulationOutput';

export class SimulationRunner {
    private readonly runSimulationUseCase: RunSimulationUseCase;

    constructor() {
        const vehicleRepository = new VehicleRepository();
        const intersection = new Intersection();
        const simulationService = new SimulationService(vehicleRepository, intersection);
        const addVehicleUseCase = new AddVehicleUseCase(vehicleRepository);
        const processStepUseCase = new ProcessStepUseCase(simulationService);

        this.runSimulationUseCase = new RunSimulationUseCase(
            simulationService,
            addVehicleUseCase,
            processStepUseCase,
            vehicleRepository
        );
    }

    public run(input: ISimulationInput): ISimulationOutput {
        return this.runSimulationUseCase.execute(input);
    }
}