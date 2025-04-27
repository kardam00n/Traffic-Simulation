import { SimulationService } from '../../domain/services/SimulationService';

export class ProcessStepUseCase {
    constructor(private readonly simulationService: SimulationService) {}

    execute(): void {
        this.simulationService.tick();
    }
}