import { Vehicle } from '../models/Vehicle';
import {Direction} from "../models/Direction";

export interface IVehicleRepository {
    add(vehicle: Vehicle): void;
    remove(vehicleId: string): void;
    getById(vehicleId: string): Vehicle | undefined;
    getAll(): Vehicle[];
    getAllActive(): Vehicle[]; // Vehicles that haven't exited yet
    getVehiclesInDirection(direction: Direction): Vehicle[]
}