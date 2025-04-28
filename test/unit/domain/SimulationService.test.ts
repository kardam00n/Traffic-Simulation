import { SimulationService } from '../../../src/domain/services/SimulationService';
import { IVehicleRepository } from '../../../src/domain/interfaces/IVehicleRepository';
import { Intersection } from '../../../src/domain/models/Intersection';
import { Vehicle } from '../../../src/domain/models/Vehicle';
import { Direction, TurnDirection } from '../../../src/domain/models/Direction';
import {LoggerService} from "../../../src/infrastructure/logging/LoggerService";
import {ConsoleLogger} from "../../../src/infrastructure/logging/ConsoleLogger";

describe('SimulationService', () => {
    let simulationService: SimulationService;
    let vehicleRepository: jest.Mocked<IVehicleRepository>;
    let intersection: jest.Mocked<Intersection>;
    let logger: LoggerService

    beforeEach(() => {
        vehicleRepository = {
            getAllActive: jest.fn().mockReturnValue([]),
        } as unknown as jest.Mocked<IVehicleRepository>;

        intersection = {
            tick: jest.fn(),
            clearAllQueues: jest.fn(),
            addVehicleToQueue: jest.fn(),
            removeVehicleFromQueue: jest.fn(),
            canVehiclePass: jest.fn(),
            getTrafficLightState: jest.fn(),
            getTrafficLight: jest.fn(),
        } as unknown as jest.Mocked<Intersection>;

        simulationService = new SimulationService(vehicleRepository, intersection);
        LoggerService.getInstance().setLogger(new ConsoleLogger());
        logger = LoggerService.getInstance();
    });


    describe('initialization', () => {
        it('should initialize with tick count 0', () => {
            expect(simulationService.getCurrentTick()).toBe(0);
        });
    });

    describe('tick processing', () => {
        it('should increment tick counter', () => {
            simulationService.tick();
            expect(simulationService.getCurrentTick()).toBe(1);
        });

        it('should call intersection tick', () => {
            simulationService.tick();
            expect(intersection.tick).toHaveBeenCalled();
        });

        it('should clear and update intersection queues', () => {
            const vehicle = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
            vehicleRepository.getAllActive.mockReturnValue([vehicle]);

            simulationService.tick();

            expect(intersection.clearAllQueues).toHaveBeenCalled();
            expect(intersection.addVehicleToQueue).toHaveBeenCalledWith(vehicle);
        });
    });

    describe('vehicle processing', () => {
        it('should process vehicles in order of entry time', () => {
            const vehicle1 = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
            const vehicle2 = new Vehicle('2', Direction.NORTH, Direction.SOUTH, 1);
            vehicleRepository.getAllActive.mockReturnValue([vehicle2, vehicle1]);
            intersection.canVehiclePass.mockReturnValue(true);

            simulationService.tick();

            // Verify vehicle1 was processed first
            expect(intersection.removeVehicleFromQueue.mock.calls[0][0]).toBe(vehicle1);
        });

        it('should only process one vehicle per direction per tick', () => {
            const vehicle1 = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
            const vehicle2 = new Vehicle('2', Direction.NORTH, Direction.SOUTH, 1);
            vehicleRepository.getAllActive.mockReturnValue([vehicle1, vehicle2]);
            intersection.canVehiclePass.mockReturnValue(true);

            simulationService.tick();

            expect(intersection.removeVehicleFromQueue).toHaveBeenCalledTimes(1);
            expect(intersection.removeVehicleFromQueue).toHaveBeenCalledWith(vehicle1);
        });

        it('should allow vehicles from different directions to pass in same tick', () => {
            const vehicle1 = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
            const vehicle2 = new Vehicle('2', Direction.EAST, Direction.WEST, 0);
            vehicleRepository.getAllActive.mockReturnValue([vehicle1, vehicle2]);
            intersection.canVehiclePass.mockReturnValue(true);

            simulationService.tick();

            expect(intersection.removeVehicleFromQueue).toHaveBeenCalledTimes(2);
            expect(intersection.removeVehicleFromQueue).toHaveBeenCalledWith(vehicle1);
            expect(intersection.removeVehicleFromQueue).toHaveBeenCalledWith(vehicle2);
        });

        it('should not process vehicles that cannot pass', () => {
            const vehicle = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
            vehicleRepository.getAllActive.mockReturnValue([vehicle]);
            intersection.canVehiclePass.mockReturnValue(false);

            simulationService.tick();

            expect(intersection.removeVehicleFromQueue).not.toHaveBeenCalled();
            expect(vehicle.getExitTime()).toBeFalsy();
        });


        it('should set exit time when vehicle passes', () => {
            const vehicle = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
            vehicleRepository.getAllActive.mockReturnValue([vehicle]);
            intersection.canVehiclePass.mockReturnValue(true);

            simulationService.tick();

            expect(vehicle.getExitTime()).toBe(1);
        });
    });

    describe('queue management', () => {
        it('should clear queues at start of each tick', () => {
            vehicleRepository.getAllActive.mockReturnValue([]);

            simulationService.tick();

            expect(intersection.clearAllQueues).toHaveBeenCalled();
        });

        it('should add all active vehicles to queues', () => {
            const vehicles = [
                new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0),
                new Vehicle('2', Direction.EAST, Direction.WEST, 0)
            ];
            vehicleRepository.getAllActive.mockReturnValue(vehicles);

            simulationService.tick();

            vehicles.forEach(vehicle => {
                expect(intersection.addVehicleToQueue).toHaveBeenCalledWith(vehicle);
            });
        });
    });

    describe('multiple tick scenarios', () => {
        it('should maintain correct tick count over multiple ticks', () => {
            vehicleRepository.getAllActive.mockReturnValue([]);

            for (let i = 0; i < 5; i++) {
                simulationService.tick();
            }

            expect(simulationService.getCurrentTick()).toBe(5);
        });

        it('should process vehicles over multiple ticks', () => {
            const vehicle = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
            vehicleRepository.getAllActive.mockReturnValue([vehicle]);
            intersection.canVehiclePass.mockReturnValue(false);

            // First tick - vehicle cannot pass
            simulationService.tick();
            expect(vehicle.getExitTime()).toBeFalsy();

            // Second tick - vehicle can pass
            intersection.canVehiclePass.mockReturnValue(true);
            simulationService.tick();
            expect(vehicle.getExitTime()).toBe(2);
        });
    });

    describe('edge cases', () => {
        it('should handle empty vehicle list', () => {
            vehicleRepository.getAllActive.mockReturnValue([]);

            expect(() => simulationService.tick()).not.toThrow();
        });

        it('should handle undefined vehicle list', () => {
            vehicleRepository.getAllActive.mockReturnValue(undefined as any);
            simulationService.tick();
            // Should still clear queues even if no vehicles are present
            expect(intersection.clearAllQueues).toHaveBeenCalled();
            // Should not try to add any vehicles to queues
            expect(intersection.addVehicleToQueue).not.toHaveBeenCalled();
        });



        it('should handle vehicles with same entry time', () => {
            const vehicle1 = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
            const vehicle2 = new Vehicle('2', Direction.NORTH, Direction.SOUTH, 0);
            vehicleRepository.getAllActive.mockReturnValue([vehicle1, vehicle2]);
            intersection.canVehiclePass.mockReturnValue(true);

            simulationService.tick();

            expect(intersection.removeVehicleFromQueue).toHaveBeenCalledTimes(1);
        });
    });
});