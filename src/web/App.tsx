import React, {useState} from 'react';
import {WebSimulationRunner} from './WebSimulationRunner';
import {ISimulationOutput} from '../domain/interfaces/ISimulationOutput';
import {SimulationCommand} from '../domain/interfaces/ISimulationInput';
import {Intersection} from './components/Intersection';
import {Direction} from '../domain/models/Direction';
import {TrafficLightState} from '../domain/models/TrafficLight';
import {Vehicle} from '../domain/models/Vehicle';
import {TrafficQueue} from "../domain/models/TrafficQueue";
import {LoggerService} from "../infrastructure/logging/LoggerService";

export const App: React.FC = () => {
    const [runner] = useState(() => new WebSimulationRunner());
    const [output, setOutput] = useState<ISimulationOutput | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [currentCommand, setCurrentCommand] = useState<SimulationCommand | null>(null);
    const [trafficLightStates, setTrafficLightStates] = useState<Map<Direction, TrafficLightState>>(
        new Map([
            [Direction.NORTH, TrafficLightState.RED],
            [Direction.SOUTH, TrafficLightState.RED],
            [Direction.EAST, TrafficLightState.GREEN],
            [Direction.WEST, TrafficLightState.GREEN],
        ])
    );
    const [vehicles, setVehicles] = useState<Map<Direction, Vehicle[]>>(new Map());
    const [trafficQueues, setTrafficQueues] = useState<Map<Direction, TrafficQueue>>(new Map([
        [Direction.NORTH, new TrafficQueue(Direction.NORTH)],
        [Direction.SOUTH, new TrafficQueue(Direction.SOUTH)],
        [Direction.EAST, new TrafficQueue(Direction.EAST)],
        [Direction.WEST, new TrafficQueue(Direction.WEST)],
    ]));

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                try {
                    const input = JSON.parse(content);
                    runner.initialize(input);
                    setIsInitialized(true);
                    setOutput(null);
                    setCurrentCommand(runner.getCurrentCommand());
                    updateVisualState();
                } catch (error) {
                    console.error('Error parsing input file:', error);
                    alert('Error parsing input file');
                }
            };
            reader.readAsText(file);
        }
    };

    const updateVisualState = () => {
        // Update traffic light states
        const newTrafficLightStates = new Map<Direction, TrafficLightState>();
        Object.values(Direction).forEach(direction => {
            const state = runner.getIntersectionState().getTrafficLightState(direction);
            newTrafficLightStates.set(direction, state);
        });
        setTrafficLightStates(newTrafficLightStates);

        // Update vehicle positions
        const newVehicles = new Map<Direction, Vehicle[]>();
        const vehicleRepository = runner.getVehicleRepository();
        Object.values(Direction).forEach(direction => {
            const directionVehicles = vehicleRepository.getVehiclesInDirection(direction);
            if (directionVehicles.length > 0) {
                newVehicles.set(direction, directionVehicles);
            }
        });
        setVehicles(newVehicles);

        const newTrafficQueues = new Map<Direction, TrafficQueue>();
        Object.values(Direction).forEach(direction => {
            const queue = runner.getIntersectionState().getTrafficQueue(direction);
            newTrafficQueues.set(direction, queue);
        });
        setTrafficQueues(newTrafficQueues)
    };

    const handleNextCommand = () => {
        try {
            const newOutput = runner.processNextCommand();
            setOutput(newOutput);
            setCurrentCommand(runner.getCurrentCommand());
            updateVisualState();
        } catch (error) {
            console.error('Error processing command:', error);
            alert('Error processing command');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Traffic Simulation</h1>
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                />
            </div>

            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={handleNextCommand}
                    disabled={!isInitialized || runner.isComplete()}
                >
                    Process Next Command
                </button>
                {currentCommand && (
                    <div style={{ marginTop: '10px' }}>
                        Next command: {currentCommand.type}
                        {currentCommand.type === 'addVehicle' &&
                            ` (Vehicle ${currentCommand.vehicleId}: ${currentCommand.startRoad} → ${currentCommand.endRoad})`
                        }
                    </div>
                )}
            </div>

            <Intersection
                trafficLightStates={trafficLightStates}
                vehicles={vehicles}
                trafficQueues={trafficQueues}
            />

            <div id="log" style={{ marginTop: '100px' }}>
            <h2>Logger</h2>
            </div>

            {output && (
                <div>
                    <h2>Current output</h2>
                    <h3>Command Index: {runner.getCurrentCommandIndex()}</h3>
                    <pre style={{
                        backgroundColor: '#f5f5f5',
                        padding: '10px',
                        borderRadius: '5px'
                    }}>
                        {JSON.stringify(output, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
};