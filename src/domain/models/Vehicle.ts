import { Direction, TurnDirection, determineTurnDirection } from './Direction';

export class Vehicle {
    private readonly id: string;
    private readonly entryTime: number;
    private readonly fromDirection: Direction;
    private readonly toDirection: Direction;
    private readonly turnDirection: TurnDirection;
    private exitTime: number | null = null;

    constructor(
        id: string,
        fromDirection: Direction,
        toDirection: Direction,
        entryTime: number
    ) {
        this.id = id;
        this.fromDirection = fromDirection;
        this.toDirection = toDirection;
        this.entryTime = entryTime;
        this.turnDirection = determineTurnDirection(fromDirection, toDirection);
        console.log("from: ", this.fromDirection)
    }

    public getId(): string {
        return this.id;
    }

    public getFromDirection(): Direction {
        return this.fromDirection;
    }

    public getToDirection(): Direction {
        return this.toDirection;
    }

    public getTurnDirection(): TurnDirection {
        return this.turnDirection;
    }

    public getEntryTime(): number {
        return this.entryTime;
    }

    public getExitTime(): number | null {
        return this.exitTime;
    }

    public setExitTime(time: number): void {
        this.exitTime = time;
    }
}