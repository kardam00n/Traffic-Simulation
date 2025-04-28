import { SimulationService } from '../../src/domain/services/SimulationService';
import { VehicleRepository } from '../../src/infrastructure/repositories/VehicleRepository';
import { Intersection } from '../../src/domain/models/Intersection';
import { Direction } from '../../src/domain/models/Direction';
import { AddVehicleUseCase } from '../../src/application/useCases/AddVehicleUseCase';
import { ProcessStepUseCase } from '../../src/application/useCases/ProcessStepUseCase';
import { RunSimulationUseCase } from '../../src/application/useCases/RunSimulationUseCase';
import { ISimulationInput } from '../../src/domain/interfaces/ISimulationInput';
import { TrafficLightState } from '../../src/domain/models/TrafficLight';

describe('FullSimulation', () => {
    let vehicleRepository: VehicleRepository;
    let intersection: Intersection;
    let simulationService: SimulationService;
    let runSimulationUseCase: RunSimulationUseCase;

    const didLeaveBeforeOrInSameStep = (stepStatuses: Array<{ leftVehicles: string[] }>) =>
        (vehicle1: string, vehicle2: string): boolean => {
            const step1 = stepStatuses.findIndex(status =>
                status.leftVehicles.includes(vehicle1));
            const step2 = stepStatuses.findIndex(status =>
                status.leftVehicles.includes(vehicle2));

            // Return true if both vehicles are found and vehicle1 left before or in same step as vehicle2
            return step1 !== -1 && step2 !== -1 && step1 <= step2;
        };


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
    });

    it('should correctly simulate a complex traffic scenario', () => {
        // Complex traffic scenario with multiple vehicles and different patterns
        const input: ISimulationInput = {
            commands: [
                // Initial batch of vehicles
                { type: 'addVehicle', vehicleId: 'E1', startRoad: 'EAST', endRoad: 'WEST' },
                { type: 'addVehicle', vehicleId: 'W1', startRoad: 'WEST', endRoad: 'EAST' },
                { type: 'step' },

                // Add more vehicles while first batch is being processed
                { type: 'addVehicle', vehicleId: 'N1', startRoad: 'NORTH', endRoad: 'SOUTH' },
                { type: 'addVehicle', vehicleId: 'S1', startRoad: 'SOUTH', endRoad: 'NORTH' },
                { type: 'step' },

                // Add vehicles to create queue in each direction
                { type: 'addVehicle', vehicleId: 'E2', startRoad: 'EAST', endRoad: 'WEST' },
                { type: 'addVehicle', vehicleId: 'W2', startRoad: 'WEST', endRoad: 'EAST' },
                { type: 'addVehicle', vehicleId: 'N2', startRoad: 'NORTH', endRoad: 'SOUTH' },
                { type: 'step' },
                { type: 'step' },
                { type: 'step' }
            ]
        };

        const output = runSimulationUseCase.execute(input);
        const checkOrder = didLeaveBeforeOrInSameStep(output.stepStatuses);


        // Helper function to get vehicles that left in a specific step
        const getVehiclesInStep = (step: number) =>
            output.stepStatuses[step]?.leftVehicles || [];

        // 1. Verify initial light states allow EAST-WEST traffic
        const initialEastState = intersection.getTrafficLightState(Direction.EAST);
        expect(initialEastState).toBe(TrafficLightState.GREEN);

        // 2. Verify EAST-WEST vehicles are processed first
        expect(getVehiclesInStep(0)).toContain('E1');
        expect(getVehiclesInStep(0)).toContain('W1');

        // 3. Verify next steps
        expect(getVehiclesInStep(1)).toContain('N1');
        expect(getVehiclesInStep(1)).toContain('S1');

        expect(getVehiclesInStep(2)).toContain('N2');

        expect(getVehiclesInStep(3)).toContain('W2');
        expect(getVehiclesInStep(3)).toContain('E2');


        // 4. Verify all vehicles eventually pass through
        const allProcessedVehicles = output.stepStatuses.flatMap(status => status.leftVehicles);
        const expectedVehicles = ['E1', 'W1', 'N1', 'S1', 'E2', 'W2', 'N2'];
        expectedVehicles.forEach(vehicleId => {
            expect(allProcessedVehicles).toContain(vehicleId);
        });

        // 5. Verify vehicles from same direction maintain order
        expect(checkOrder('E1', 'E2')).toBe(true);
        expect(checkOrder('W1', 'W2')).toBe(true);
        expect(checkOrder('N1', 'N2')).toBe(true);

        // 6. Verify no vehicle is processed more than once
        const vehicleCounts = allProcessedVehicles.reduce((acc, vehicleId) => {
            acc[vehicleId] = (acc[vehicleId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        Object.entries(vehicleCounts).forEach(([vehicleId, count]) => {
            expect(count).toBe(1);
        });

        // 7. Verify traffic light cycle behavior
        output.stepStatuses.forEach((status, index) => {
            const currentVehicles = status.leftVehicles;
            if (currentVehicles.length > 0) {
                const direction = currentVehicles[0][0]; // First letter indicates direction
                currentVehicles.forEach(vehicleId => {
                    // All vehicles processed in the same step should be from compatible directions
                    if (direction === 'N' || direction === 'S') {
                        expect(vehicleId[0]).toMatch(/[NS]/);
                    } else {
                        expect(vehicleId[0]).toMatch(/[EW]/);
                    }
                });
            }
        });
    });

    it('should handle high traffic load scenario', () => {
        // Create a scenario with many vehicles in each direction
        const input: ISimulationInput = {
            commands: [
                // Add multiple vehicles in each direction
                ...Array(5).fill(null).map((_, i) => ({
                    type: 'addVehicle' as const,
                    vehicleId: `N${i}`,
                    startRoad: 'NORTH',
                    endRoad: 'SOUTH'
                })),
                ...Array(5).fill(null).map((_, i) => ({
                    type: 'addVehicle' as const,
                    vehicleId: `E${i}`,
                    startRoad: 'EAST',
                    endRoad: 'WEST'
                })),
                // Add multiple steps to process all vehicles
                ...Array(15).fill({ type: 'step' as const })
            ]
        };

        const output = runSimulationUseCase.execute(input);
        const checkOrder = didLeaveBeforeOrInSameStep(output.stepStatuses);


        // Verify all vehicles are processed
        const allProcessedVehicles = output.stepStatuses.flatMap(status => status.leftVehicles);
        expect(allProcessedVehicles.length).toBe(10); // Total number of vehicles

        // Verify fair processing between directions
        const northVehicles = allProcessedVehicles.filter(id => id.startsWith('N'));
        const eastVehicles = allProcessedVehicles.filter(id => id.startsWith('E'));

        expect(northVehicles.length).toBe(5);
        expect(eastVehicles.length).toBe(5);

        // Check that vehicles from the same direction maintain their order
        for (let i = 0; i < 4; i++) {
            expect(checkOrder(`N${i}`, `N${i+1}`)).toBe(true);
            expect(checkOrder(`E${i}`, `E${i+1}`)).toBe(true);
        }

    });
});