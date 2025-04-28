import { Direction, TurnDirection, determineTurnDirection } from '../../../src/domain/models/Direction';

describe('Direction', () => {
    describe('determineTurnDirection', () => {
        describe('from NORTH', () => {
            it('should determine correct turns', () => {
                expect(determineTurnDirection(Direction.NORTH, Direction.EAST)).toBe(TurnDirection.LEFT);
                expect(determineTurnDirection(Direction.NORTH, Direction.WEST)).toBe(TurnDirection.RIGHT);
                expect(determineTurnDirection(Direction.NORTH, Direction.SOUTH)).toBe(TurnDirection.STRAIGHT);
            });

            it('should throw error for invalid direction', () => {
                expect(() => determineTurnDirection(Direction.NORTH, Direction.NORTH))
                    .toThrow('Invalid direction: Vehicle cannot go in the same direction it came from');
            });
        });

        describe('from SOUTH', () => {
            it('should determine correct turns', () => {
                expect(determineTurnDirection(Direction.SOUTH, Direction.EAST)).toBe(TurnDirection.RIGHT);
                expect(determineTurnDirection(Direction.SOUTH, Direction.WEST)).toBe(TurnDirection.LEFT);
                expect(determineTurnDirection(Direction.SOUTH, Direction.NORTH)).toBe(TurnDirection.STRAIGHT);
            });
        });

        describe('from EAST', () => {
            it('should determine correct turns', () => {
                expect(determineTurnDirection(Direction.EAST, Direction.NORTH)).toBe(TurnDirection.RIGHT);
                expect(determineTurnDirection(Direction.EAST, Direction.SOUTH)).toBe(TurnDirection.LEFT);
                expect(determineTurnDirection(Direction.EAST, Direction.WEST)).toBe(TurnDirection.STRAIGHT);
            });
        });

        describe('from WEST', () => {
            it('should determine correct turns', () => {
                expect(determineTurnDirection(Direction.WEST, Direction.NORTH)).toBe(TurnDirection.LEFT);
                expect(determineTurnDirection(Direction.WEST, Direction.SOUTH)).toBe(TurnDirection.RIGHT);
                expect(determineTurnDirection(Direction.WEST, Direction.EAST)).toBe(TurnDirection.STRAIGHT);
            });
        });

        it('should throw error for invalid direction combinations', () => {
            // @ts-ignore - Testing invalid input
            expect(() => determineTurnDirection('INVALID', Direction.NORTH))
                .toThrow('Invalid direction combination');
        });
    });
});