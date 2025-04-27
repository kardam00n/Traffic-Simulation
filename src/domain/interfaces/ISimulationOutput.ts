export interface StepStatus {
    leftVehicles: string[];  // IDs of vehicles that left during this step
}

export interface ISimulationOutput {
    stepStatuses: StepStatus[];
}