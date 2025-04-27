export enum Direction {
    NORTH = 'NORTH',
    SOUTH = 'SOUTH',
    EAST = 'EAST',
    WEST = 'WEST'
}

export enum TurnDirection {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    STRAIGHT = 'STRAIGHT'
}

export interface VehicleDirection {
    from: Direction;
    to: Direction;
    turn: TurnDirection;
}

// Helper function to determine turn direction based on from/to directions
export function determineTurnDirection(from: Direction, to: Direction): TurnDirection {
    if (from === to) {
        throw new Error('Invalid direction: Vehicle cannot go in the same direction it came from');
    }

    // Calculate turn direction based on compass directions
    switch (from) {
        case Direction.NORTH:
            switch (to) {
                case Direction.EAST: return TurnDirection.LEFT;
                case Direction.WEST: return TurnDirection.RIGHT;
                case Direction.SOUTH: return TurnDirection.STRAIGHT;
            }
            break;
        case Direction.SOUTH:
            switch (to) {
                case Direction.EAST: return TurnDirection.RIGHT;
                case Direction.WEST: return TurnDirection.LEFT;
                case Direction.NORTH: return TurnDirection.STRAIGHT;
            }
            break;
        case Direction.EAST:
            switch (to) {
                case Direction.NORTH: return TurnDirection.RIGHT;
                case Direction.SOUTH: return TurnDirection.LEFT;
                case Direction.WEST: return TurnDirection.STRAIGHT;
            }
            break;
        case Direction.WEST:
            switch (to) {
                case Direction.NORTH: return TurnDirection.LEFT;
                case Direction.SOUTH: return TurnDirection.RIGHT;
                case Direction.EAST: return TurnDirection.STRAIGHT;
            }
            break;
    }

    throw new Error('Invalid direction combination');
}