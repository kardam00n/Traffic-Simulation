import { VehicleRepository } from '../../../src/infrastructure/repositories/VehicleRepository';
import { Vehicle } from '../../../src/domain/models/Vehicle';
import { Direction } from '../../../src/domain/models/Direction';

describe('VehicleRepository', () => {
    let repository: VehicleRepository;
    let testVehicle: Vehicle;

    beforeEach(() => {
        repository = new VehicleRepository();
        testVehicle = new Vehicle('test1', Direction.NORTH, Direction.SOUTH, 0);
    });

    it('should add and retrieve a vehicle', () => {
        repository.add(testVehicle);
        expect(repository.getById('test1')).toBe(testVehicle);
    });

    it('should throw error when adding duplicate vehicle', () => {
        repository.add(testVehicle);
        expect(() => repository.add(testVehicle)).toThrow();
    });

    it('should remove vehicle correctly', () => {
        repository.add(testVehicle);
        repository.remove('test1');
        expect(repository.getById('test1')).toBeUndefined();
    });

    it('should get all active vehicles', () => {
        const vehicle1 = new Vehicle('test1', Direction.NORTH, Direction.SOUTH, 0);
        const vehicle2 = new Vehicle('test2', Direction.EAST, Direction.WEST, 0);

        repository.add(vehicle1);
        repository.add(vehicle2);
        vehicle1.setExitTime(10);  // This one has exited

        const activeVehicles = repository.getAllActive();
        expect(activeVehicles.length).toBe(1);
        expect(activeVehicles[0].getId()).toBe('test2');
    });
});