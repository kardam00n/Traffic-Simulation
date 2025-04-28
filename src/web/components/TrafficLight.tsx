import React from 'react';
import { TrafficLightState } from '../../domain/models/TrafficLight';

interface TrafficLightProps {
    state: TrafficLightState;
    direction: string;
}

export const TrafficLight: React.FC<TrafficLightProps> = ({ state, direction }) => {
    const getColor = () => {
        switch (state) {
            case TrafficLightState.RED:
                return '#ff0000';
            case TrafficLightState.YELLOW:
                return '#ffff00';
            case TrafficLightState.GREEN:
                return '#00ff00';
            default:
                return '#gray';
        }
    };

    return (
        <div style={{
            position: 'absolute',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            backgroundColor: getColor(),
            border: '2px solid #333',
            boxShadow: `0 0 10px ${getColor()}`,
            ...getPositionStyle(direction)
        }} />
    );
};

const getPositionStyle = (direction: string): React.CSSProperties => {
    switch (direction) {
        case 'NORTH':
            return { top: '215px', left: '40%', transform: 'translateX(-50%)' };
        case 'SOUTH':
            return { bottom: '215px', left: '60%', transform: 'translateX(-50%)' };
        case 'EAST':
            return { right: '215px', top: '40%', transform: 'translateY(-50%)' };
        case 'WEST':
            return { left: '215px', top: '60%', transform: 'translateY(-50%)' };
        default:
            return {};
    }
};