import React from 'react';
import { TrafficLight } from './TrafficLight';
import { Vehicle } from './Vehicle';
import { Direction, TurnDirection } from '../../domain/models/Direction';
import { TrafficLightState } from '../../domain/models/TrafficLight';
import { Vehicle as VehicleModel } from '../../domain/models/Vehicle';
import {TrafficQueue} from "../../domain/models/TrafficQueue";
import {TrafficQueueLabel} from "./TrafficQueueLabel";

interface IntersectionProps {
    trafficLightStates: Map<Direction, TrafficLightState>;
    vehicles: Map<Direction, VehicleModel[]>;
    trafficQueues: Map<Direction, TrafficQueue>;
}

export const Intersection: React.FC<IntersectionProps> = ({ trafficLightStates, vehicles, trafficQueues }) => {
    return (
        <div style={{
            position: 'relative',
            width: '600px',
            height: '600px',
            margin: '20px auto',
            backgroundColor: '#444', // Road color
        }}>
            {/* Intersection roads */}
            <div style={{
                position: 'absolute',
                top: '260px',
                left: 0,
                width: '100%',
                height: '80px',
                backgroundColor: '#333', // Horizontal road
            }} />
            <div style={{
                position: 'absolute',
                left: '260px',
                top: 0,
                width: '80px',
                height: '100%',
                backgroundColor: '#333', // Vertical road
            }} />

            {/* Direction labels */}
            {Array.from(trafficQueues.entries()).map(([direction, trafficQueue]) => (
                <TrafficQueueLabel
                    key={direction}
                    direction={direction}
                    queueMetrics={trafficQueue.getMetrics()}
                />
            ))}

            {/* Traffic Lights */}
            {Array.from(trafficLightStates.entries()).map(([direction, state]) => (
                <TrafficLight
                    key={direction}
                    direction={direction}
                    state={state}
                />
            ))}

            {/* Vehicles */}
            {Array.from(vehicles.entries()).map(([direction, queueVehicles]) => (
                queueVehicles.map((vehicle, index) => (
                    <Vehicle
                        key={vehicle.getId()}
                        id={vehicle.getId()}
                        fromDirection={vehicle.getFromDirection()}
                        turnDirection={vehicle.getTurnDirection()}
                        position={index}
                    />
                ))
            ))}
        </div>
    );
};