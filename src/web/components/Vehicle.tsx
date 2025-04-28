import React from 'react';
import { Direction, TurnDirection } from '../../domain/models/Direction';

interface VehicleProps {
    id: string;
    fromDirection: Direction;
    turnDirection: TurnDirection;
    position: number;
}

export const Vehicle: React.FC<VehicleProps> = ({ id, fromDirection, turnDirection, position }) => {
    const getRotation = () => {
        switch (fromDirection) {
            case Direction.NORTH: return 180;
            case Direction.SOUTH: return 0;
            case Direction.EAST: return 270;
            case Direction.WEST: return 90;
            default: return 0;
        }
    };

    const getPosition = (): React.CSSProperties => {
        // position 0 should be right at the intersection entry
        // each subsequent position moves away from the intersection
        const offset = position * 40; // reduced spacing between vehicles
        const intersectionOffset = 75; // distance from intersection center to traffic light
        const intersectionMiddle = 300
        const roadWidth = 80

        const vehiclePos = intersectionMiddle - (roadWidth/2 + intersectionOffset + offset)

        switch (fromDirection) {
            case Direction.NORTH:
                return { top: `${vehiclePos}px`, left: '45%' };
            case Direction.SOUTH:
                return { bottom: `${vehiclePos}px`, left: '50%' };
            case Direction.EAST:
                return { right: `${vehiclePos}px`, top: '45%' };
            case Direction.WEST:
                return { left: `${vehiclePos}px`, top: '50%' };
            default:
                return {};
        }
    };

    const getTurnIcon = () => {
        switch (turnDirection) {
            case TurnDirection.LEFT:
                return '↰';
            case TurnDirection.RIGHT:
                return '↱';
            case TurnDirection.STRAIGHT:
                return '↑';
            default:
                return '•';
        }
    };

    return (
        <div
            style={{
                position: 'absolute',
                width: '30px',
                height: '30px',
                backgroundColor: '#4a90e2',
                border: '1px solid #2171c7',
                borderRadius: '3px',
                transform: `rotate(${getRotation()}deg)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '20px',
                zIndex: 1,
                ...getPosition(),
            }}
            title={`Vehicle ${id} (${turnDirection})`}
        >
            {getTurnIcon()}
        </div>
    );
};