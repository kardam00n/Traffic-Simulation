import { Vehicle } from '../../../src/domain/models/Vehicle';
import { Direction, TurnDirection } from '../../../src/domain/models/Direction';

describe('Vehicle', () => {
    it('should create a vehicle with correct properties', () => {
        const vehicle = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
        
        expect(vehicle.getId()).toBe('1');
        expect(vehicle.getFromDirection()).toBe(Direction.NORTH);
        expect(vehicle.getToDirection()).toBe(Direction.SOUTH);
        expect(vehicle.getTurnDirection()).toBe(TurnDirection.STRAIGHT);
    });

    it('should determine correct turn directions', () => {
        const straightVehicle = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
        const rightTurnVehicle = new Vehicle('2', Direction.NORTH, Direction.WEST, 0);
        const leftTurnVehicle = new Vehicle('3', Direction.NORTH, Direction.EAST, 0);

        expect(straightVehicle.getTurnDirection()).toBe(TurnDirection.STRAIGHT);
        expect(leftTurnVehicle.getTurnDirection()).toBe(TurnDirection.LEFT);
        expect(rightTurnVehicle.getTurnDirection()).toBe(TurnDirection.RIGHT);
    });

    it('should set and get exit time correctly', () => {
        const vehicle = new Vehicle('1', Direction.NORTH, Direction.SOUTH, 0);
        expect(vehicle.getExitTime()).toBeNull();
        
        vehicle.setExitTime(10);
        expect(vehicle.getExitTime()).toBe(10);
    });

    it('should throw error for invalid direction combination', () => {
        expect(() => {
            new Vehicle('1', Direction.NORTH, Direction.NORTH, 0);
        }).toThrow('Invalid direction: Vehicle cannot go in the same direction it came from');
    });
});