# Traffic Simulation

Simulation of smart traffic lights at a four-way intersection.

## Simulation Assumptions

- Traffic lights are synchronized in pairs by direction (North with South, West with East)
- Traffic lights have three possible states: Red, Yellow, and Green
- Traffic lights **DO NOT** have constant light duration; they dynamically adapt to the situation on connected roads
- After changing from Green to Red (or vice versa), the traffic light must remain in its new state for at least 1 simulation step to prevent locking the simulation in an *"all time yellow light"* scenario
- Cars can pass through the intersection on yellow lights (because to be fair, that's how it is in real life)
- In a given simulation step, only one car can exit a road for each direction
- Within one simulation step, traffic lights change first, then vehicles respond accordingly

## Functionality

- Adaptive traffic light simulation with intelligent switching algorithm
- Input/output file support for simulation data
- Web application with graphical interface for improved visualization
- Event logging system for detailed monitoring and analysis

## Traffic Light Switching Algorithm
### Queue Metrics
Each direction at an intersection (North, South, East, West) has an associated traffic queue that tracks vehicles waiting to pass through. The `TrafficQueue` class collects the following metrics for each direction:

- **Queue Length**: The number of vehicles waiting in the queue
- **Total Waiting Time**: The combined waiting time of all vehicles in the queue
- **Oldest Vehicle Wait Time**: The waiting time of the vehicle that has been in the queue the longest

- **Turning Distribution**: The number of vehicles planning to go straight, turn left, or turn right

These metrics are compiled into a `QueueMetrics` interface that provides a comprehensive snapshot of the current traffic situation in each direction.

### Direction Classification

The algorithm first classifies all directions into two categories:

- **Passing Directions**: Directions with GREEN lights or YELLOW
- **Stopping Directions**: Directions with RED lights

### Traffic Presence Check

The algorithm checks for the presence of traffic in both categories:

- **Passing Traffic**: Vehicles in queues that currently have permission to move
- **Stopping Traffic**: Vehicles in queues that currently must wait

If there is no traffic in passing directions but traffic exists in stopping directions, the algorithm immediately recommends switching the lights. This optimizes for the case where vehicles are unnecessarily waiting while no traffic is flowing.

### 3. Urgency Score Calculation

When both passing and stopping directions have traffic, the algorithm calculates an "urgency score" for each direction based on the queue metrics. This score in this version is a sum of:
- Queue length
- Oldest vehicle wait time


### 4. Traffic Flow Direction Decision

The algorithm adds up the urgency scores for:
- All passing directions (directions that currently have green lights)
- All stopping directions (directions that currently have red lights)

If the combined urgency of stopping directions exceeds the urgency of passing directions, the algorithm recommends switching the lights. This ensures that traffic flow is prioritized where the need is greatest.

## Usage

The simulation is available in two versions:

### Console Version

To run the simulation in console mode:
```bash
  npm install
  npm run start input.json output.json
```
Where `input.json` contains the simulation parameters and `output.json` is where results will be written.

The simulation processes all steps at once, with event logs displayed in the console and written to the output file.

### Web Version

To run the simulation in web mode:
```bash
  npm install
  npm run start:web
```

In the web interface:
1. Upload your input file
2. Process commands step by step using the "Process Next Command" button
3. View the graphical representation update after each step
4. Access the event log and current simulation state

## File Formats

### Input File Structure

The input file must be a JSON file with the following structure:

```json
{
  "commands": [
    {
      "type": "addVehicle",
      "vehicleId": "vehicle1",
      "startRoad": "south",
      "endRoad": "north"
    },
    {
      "type": "step"
    }
    // Additional commands...
  ]
}
```

The simulation supports two types of commands:

1. **addVehicle**: Adds a new vehicle to the simulation
    - `vehicleId`: Unique identifier for the vehicle
    - `startRoad`: Direction from which the vehicle enters (north, south, east, west)
    - `endRoad`: Direction to which the vehicle exits (north, south, east, west)

2. **step**: Advances the simulation by one time step
    - The traffic lights adjust based on the current traffic conditions
    - Vehicles move according to traffic light states

### Output File Structure

The simulation output is also a JSON file with the following structure:

```json
{
  "stepStatuses": [
    {
      "leftVehicles": ["vehicle1", "vehicle2"]
    },
    {
      "leftVehicles": []
    }
    // Results for additional steps...
  ]
}
```

Each entry in `stepStatuses` corresponds to a `step` command from the input file:
- `leftVehicles`: Array of vehicle IDs that successfully exited the intersection during that step
