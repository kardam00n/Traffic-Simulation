import { IVehicleRepository } from '../../domain/interfaces/IVehicleRepository';
import { Vehicle } from '../../domain/models/Vehicle';

export class VehicleRepository implements IVehicleRepository {
    private vehicles: Map<string, Vehicle> = new Map();

    public add(vehicle: Vehicle): void {
        if (this.vehicles.has(vehicle.getId())) {
            throw new Error(`Vehicle with id ${vehicle.getId()} already exists`);
        }
        this.vehicles.set(vehicle.getId(), vehicle);
    }

    public remove(vehicleId: string): void {
        if (!this.vehicles.delete(vehicleId)) {
            throw new Error(`Vehicle with id ${vehicleId} not found`);
        }
    }

    public getById(vehicleId: string): Vehicle | undefined {
        return this.vehicles.get(vehicleId);
    }

    public getAll(): Vehicle[] {
        return Array.from(this.vehicles.values());
    }

    public getAllActive(): Vehicle[] {
        return this.getAll().filter(vehicle => vehicle.getExitTime() === null);
    }
}