import React from 'react';
import { Direction, TurnDirection } from '../../domain/models/Direction';
import {QueueMetrics} from "../../domain/models/TrafficQueue";

interface TrafficQueueLabelProps {
    direction: Direction;
    queueMetrics: QueueMetrics
}

export const TrafficQueueLabel: React.FC<TrafficQueueLabelProps> = ({ direction, queueMetrics }) => {
    const getPosition = (): React.CSSProperties => {
        const horizontalLabelOffset = -70;
        const verticalLabelOffset = -170;
        switch (direction) {
            case Direction.NORTH:
                return {
                    top: `${horizontalLabelOffset}px`,
                    left: '50%',
                    transform: 'translateX(-50%)'
                };
            case Direction.SOUTH:
                return {
                    bottom: `${horizontalLabelOffset}px`,
                    left: '50%',
                    transform: 'translateX(-50%)'
                };
            case Direction.EAST:
                return {
                    right: `${verticalLabelOffset}px`,
                    top: '50%',
                    transform: 'translateY(-50%)'  // Vertical centering for east
                };
            case Direction.WEST:
                return {
                    left: `${verticalLabelOffset}px`,
                    top: '50%',
                    transform: 'translateY(-50%)'  // Vertical centering for west
                };
            default:
                return {};
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                color: 'black',
                ...getPosition(),
            }}
            title={`Label ${direction}`}
        >
            {direction.toString()}
            <br/>
            Queue length: {queueMetrics.queueLength}
            <br/>
            Total waiting time: {queueMetrics.waitingTime}
        </div>
    );
};