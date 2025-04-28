import { RunSimulationUseCase } from '../../../src/application/useCases/RunSimulationUseCase';
import { SimulationService } from '../../../src/domain/services/SimulationService';
import { AddVehicleUseCase } from '../../../src/application/useCases/AddVehicleUseCase';
import { ProcessStepUseCase } from '../../../src/application/useCases/ProcessStepUseCase';
import { VehicleRepository } from '../../../src/infrastructure/repositories/VehicleRepository';
import { Intersection } from '../../../src/domain/models/Intersection';
import { ISimulationInput } from '../../../src/domain/interfaces/ISimulationInput';
import {LoggerService} from "../../../src/infrastructure/logging/LoggerService";
import {ConsoleLogger} from "../../../src/infrastructure/logging/ConsoleLogger";

describe('RunSimulationUseCase', () => {
    let runSimulationUseCase: RunSimulationUseCase;
    let vehicleRepository: VehicleRepository;
    let intersection: Intersection;
    let simulationService: SimulationService;
    let logger: LoggerService;

    beforeEach(() => {
        vehicleRepository = new VehicleRepository();
        intersection = new Intersection();
        simulationService = new SimulationService(vehicleRepository, intersection);
        const addVehicleUseCase = new AddVehicleUseCase(vehicleRepository);
        const processStepUseCase = new ProcessStepUseCase(simulationService);

        runSimulationUseCase = new RunSimulationUseCase(
            simulationService,
            addVehicleUseCase,
            processStepUseCase,
            vehicleRepository
        );
        LoggerService.getInstance().setLogger(new ConsoleLogger());
        logger = LoggerService.getInstance();
    });

    it('should process simulation commands and generate correct output', () => {
        const input: ISimulationInput = {
            commands: [
                {
                    type: 'addVehicle',
                    vehicleId: 'vehicle1',
                    startRoad: 'north',
                    endRoad: 'south'
                },
                { type: 'step' },
                {
                    type: 'addVehicle',
                    vehicleId: 'vehicle2',
                    startRoad: 'west',
                    endRoad: 'east'
                },
                { type: 'step' }
            ]
        };

        const output = runSimulationUseCase.execute(input);

        expect(output.stepStatuses).toHaveLength(2);
        // Additional assertions based on expected behavior
    });
});