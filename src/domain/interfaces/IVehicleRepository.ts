import { Vehicle } from '../models/Vehicle';

export interface IVehicleRepository {
    add(vehicle: Vehicle): void;
    remove(vehicleId: string): void;
    getById(vehicleId: string): Vehicle | undefined;
    getAll(): Vehicle[];
    getAllActive(): Vehicle[];  // Vehicles that haven't exited yet
}