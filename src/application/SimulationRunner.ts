import { RunSimulationUseCase } from './useCases/RunSimulationUseCase';
import { AddVehicleUseCase } from './useCases/AddVehicleUseCase';
import { ProcessStepUseCase } from './useCases/ProcessStepUseCase';
import { SimulationService } from '../domain/services/SimulationService';
import { VehicleRepository } from '../infrastructure/repositories/VehicleRepository';
import { Intersection } from '../domain/models/Intersection';
import { ISimulationInput } from '../domain/interfaces/ISimulationInput';
import { ISimulationOutput } from '../domain/interfaces/ISimulationOutput';

export class SimulationRunner {
    public readonly vehicleRepository: VehicleRepository;
    public readonly intersection: Intersection;
    private readonly simulationService: SimulationService;
    private readonly runSimulationUseCase: RunSimulationUseCase;

    constructor() {
        this.vehicleRepository = new VehicleRepository();
        this.intersection = new Intersection();
        this.simulationService = new SimulationService(this.vehicleRepository, this.intersection);
        const addVehicleUseCase = new AddVehicleUseCase(this.vehicleRepository);
        const processStepUseCase = new ProcessStepUseCase(this.simulationService);

        this.runSimulationUseCase = new RunSimulationUseCase(
            this.simulationService,
            addVehicleUseCase,
            processStepUseCase,
            this.vehicleRepository
        );
    }

    public run(input: ISimulationInput): ISimulationOutput {
        return this.runSimulationUseCase.execute(input);
    }
}