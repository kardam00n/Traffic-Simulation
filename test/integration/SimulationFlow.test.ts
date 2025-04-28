import { SimulationService } from '../../src/domain/services/SimulationService';
import { VehicleRepository } from '../../src/infrastructure/repositories/VehicleRepository';
import { Intersection } from '../../src/domain/models/Intersection';
import { Direction } from '../../src/domain/models/Direction';
import { AddVehicleUseCase } from '../../src/application/useCases/AddVehicleUseCase';
import { ProcessStepUseCase } from '../../src/application/useCases/ProcessStepUseCase';
import { RunSimulationUseCase } from '../../src/application/useCases/RunSimulationUseCase';
import { ISimulationInput } from '../../src/domain/interfaces/ISimulationInput';
import {LoggerService} from "../../src/infrastructure/logging/LoggerService";
import {ConsoleLogger} from "../../src/infrastructure/logging/ConsoleLogger";

describe('SimulationFlow', () => {
    let vehicleRepository: VehicleRepository;
    let intersection: Intersection;
    let simulationService: SimulationService;
    let addVehicleUseCase: AddVehicleUseCase;
    let processStepUseCase: ProcessStepUseCase;
    let runSimulationUseCase: RunSimulationUseCase;
    let logger: LoggerService;

    beforeEach(() => {
        vehicleRepository = new VehicleRepository();
        intersection = new Intersection();
        simulationService = new SimulationService(vehicleRepository, intersection);
        addVehicleUseCase = new AddVehicleUseCase(vehicleRepository);
        processStepUseCase = new ProcessStepUseCase(simulationService);
        runSimulationUseCase = new RunSimulationUseCase(
            simulationService,
            addVehicleUseCase,
            processStepUseCase,
            vehicleRepository
        );
        LoggerService.getInstance().setLogger(new ConsoleLogger());
        logger = LoggerService.getInstance();
    });

    it('should process a complete simulation flow', () => {
        const input: ISimulationInput = {
            commands: [
                {
                    type: 'addVehicle',
                    vehicleId: 'vehicle1',
                    startRoad: 'NORTH',
                    endRoad: 'SOUTH'
                },
                {
                    type: 'addVehicle',
                    vehicleId: 'vehicle2',
                    startRoad: 'EAST',
                    endRoad: 'WEST'
                },
                { type: 'step' },
                {
                    type: 'addVehicle',
                    vehicleId: 'vehicle3',
                    startRoad: 'WEST',
                    endRoad: 'EAST'
                },
                { type: 'step' },
                { type: 'step' },
                { type: 'step' },  // Add extra steps to allow for light changes
                { type: 'step' }
            ]
        };

        const output = runSimulationUseCase.execute(input);

        // Verify the output structure
        expect(output.stepStatuses).toHaveLength(5);  // Now checking for 5 steps

        // Vehicle2 should pass first (EAST-WEST has initial green light)
        expect(output.stepStatuses[0].leftVehicles).toContain('vehicle2');

        // Get all processed vehicles across all steps
        const allProcessedVehicles = output.stepStatuses.flatMap(status => status.leftVehicles);

        // Log the actual output for debugging
        console.log('Processed vehicles by step:', output.stepStatuses.map(s => s.leftVehicles));

        // Verify all vehicles eventually pass
        expect(new Set(allProcessedVehicles)).toEqual(new Set(['vehicle1', 'vehicle2', 'vehicle3']));

        // Verify each vehicle appears exactly once
        const vehicleCounts = allProcessedVehicles.reduce((acc, vehicleId) => {
            acc[vehicleId] = (acc[vehicleId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        Object.entries(vehicleCounts).forEach(([vehicleId, count]) => {
            expect(count).toBe(1);
        });
    });


    it('should handle vehicles from all directions', () => {
        const input: ISimulationInput = {
            commands: [
                // Add vehicles from all directions
                {
                    type: 'addVehicle',
                    vehicleId: 'north1',
                    startRoad: 'NORTH',
                    endRoad: 'SOUTH'
                },
                {
                    type: 'addVehicle',
                    vehicleId: 'south1',
                    startRoad: 'SOUTH',
                    endRoad: 'NORTH'
                },
                {
                    type: 'addVehicle',
                    vehicleId: 'east1',
                    startRoad: 'EAST',
                    endRoad: 'WEST'
                },
                {
                    type: 'addVehicle',
                    vehicleId: 'west1',
                    startRoad: 'WEST',
                    endRoad: 'EAST'
                },
                { type: 'step' },
                { type: 'step' },
                { type: 'step' },
                { type: 'step' }
            ]
        };

        const output = runSimulationUseCase.execute(input);

        // Verify all vehicles eventually pass through
        const allProcessedVehicles = output.stepStatuses.flatMap(status => status.leftVehicles);
        expect(allProcessedVehicles).toContain('north1');
        expect(allProcessedVehicles).toContain('south1');
        expect(allProcessedVehicles).toContain('east1');
        expect(allProcessedVehicles).toContain('west1');

        // Each vehicle should appear exactly once in the output
        const vehicleCounts = allProcessedVehicles.reduce((acc, vehicleId) => {
            acc[vehicleId] = (acc[vehicleId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        Object.values(vehicleCounts).forEach(count => {
            expect(count).toBe(1);
        });
    });

    it('should maintain traffic light patterns', () => {
        const input: ISimulationInput = {
            commands: Array(10).fill({ type: 'step' })
        };

        runSimulationUseCase.execute(input);

        // Verify final traffic light states are valid
        const northState = intersection.getTrafficLightState(Direction.NORTH);
        const southState = intersection.getTrafficLightState(Direction.SOUTH);
        const eastState = intersection.getTrafficLightState(Direction.EAST);
        const westState = intersection.getTrafficLightState(Direction.WEST);

        // North-South lights should be in sync
        expect(northState).toBe(southState);
        // East-West lights should be in sync
        expect(eastState).toBe(westState);
        // Opposing pairs should be different
        expect(northState).not.toBe(eastState);
    });
});