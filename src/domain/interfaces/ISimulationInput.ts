import { Direction } from '../models/Direction';

export type AddVehicleCommand = {
    type: 'addVehicle';
    vehicleId: string;
    startRoad: string;  // 'north' | 'south' | 'east' | 'west'
    endRoad: string;    // 'north' | 'south' | 'east' | 'west'
};

export type StepCommand = {
    type: 'step';
};

export type SimulationCommand = AddVehicleCommand | StepCommand;

export interface ISimulationInput {
    commands: SimulationCommand[];
}

// Helper function to convert string direction to enum
export function parseDirection(direction: string): Direction {
    const directionMap: { [key: string]: Direction } = {
        'north': Direction.NORTH,
        'south': Direction.SOUTH,
        'east': Direction.EAST,
        'west': Direction.WEST
    };

    const enumDirection = directionMap[direction.toLowerCase()];
    if (!enumDirection) {
        throw new Error(`Invalid direction: ${direction}`);
    }

    return enumDirection;
}