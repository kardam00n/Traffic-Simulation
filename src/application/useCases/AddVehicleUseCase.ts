import { Vehicle } from '../../domain/models/Vehicle';
import { IVehicleRepository } from '../../domain/interfaces/IVehicleRepository';
import { Direction } from '../../domain/models/Direction';

export class AddVehicleUseCase {
    constructor(private readonly vehicleRepository: IVehicleRepository) {}

    execute(id: string, fromDirection: Direction, toDirection: Direction, entryTime: number): Vehicle {
        const vehicle = new Vehicle(id, fromDirection, toDirection, entryTime);
        this.vehicleRepository.add(vehicle);
        return vehicle;
    }
}