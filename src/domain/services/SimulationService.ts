import { IVehicleRepository } from '../interfaces/IVehicleRepository';
import { Intersection } from '../models/Intersection';
import { Vehicle } from '../models/Vehicle';
import { Direction } from '../models/Direction';
import {LoggerService} from "../../infrastructure/logging/LoggerService";

export class SimulationService {
    private currentTick: number = 0;

    constructor(
        private readonly vehicleRepository: IVehicleRepository,
        private readonly intersection: Intersection,
        private readonly logger: LoggerService = LoggerService.getInstance(),
    ) {}

    public tick(): void {
        this.currentTick++;
        this.logger.info("Next simulation step: step " + this.currentTick);
        this.updateIntersectionQueues();
        this.intersection.tick();
        this.processVehicles();
    }

    private processVehicles(): void {
        const processedDirections = new Set<Direction>();
        const activeVehicles = this.vehicleRepository.getAllActive() || [];

        if (!Array.isArray(activeVehicles) || activeVehicles.length === 0) {
            return;
        }

        const sortedVehicles = [...activeVehicles].sort((a, b) =>
            a.getEntryTime() - b.getEntryTime()
        );

        for (const vehicle of sortedVehicles) {
            const direction = vehicle.getFromDirection();

            if (processedDirections.has(direction)) {
                continue;
            }

            if (this.canVehiclePass(vehicle)) {
                this.completeVehicleJourney(vehicle);
                this.intersection.removeVehicleFromQueue(vehicle);
                processedDirections.add(direction);
            }
        }
    }


    private updateIntersectionQueues(): void {
        this.intersection.clearAllQueues();

        const activeVehicles = this.vehicleRepository.getAllActive() || [];
        activeVehicles.forEach(vehicle => {
            this.intersection.addVehicleToQueue(vehicle);
        });
    }



    private canVehiclePass(vehicle: Vehicle): boolean {
        return this.intersection.canVehiclePass(
            vehicle.getFromDirection(),
            vehicle.getTurnDirection()
        );
    }

    private completeVehicleJourney(vehicle: Vehicle): void {
        vehicle.setExitTime(this.currentTick);
        this.logger.info("Vehicle " + vehicle.getId() + " drove " + vehicle.getTurnDirection() + " to " + vehicle.getToDirection() + " on step " + vehicle.getExitTime());

    }

    public getCurrentTick(): number {
        return this.currentTick;
    }
}