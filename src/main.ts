import * as fs from 'fs';
import { SimulationRunner } from './application/SimulationRunner';
import { ISimulationInput } from './domain/interfaces/ISimulationInput';
import {LoggerService} from "./infrastructure/logging/LoggerService";
import {WebLogger} from "./infrastructure/logging/WebLogger";
import {ConsoleLogger} from "./infrastructure/logging/ConsoleLogger";

function parseArguments(): { inputFile: string; outputFile: string } {
    const args = process.argv.slice(2); // Remove first two elements (node and script path)

    return {
        inputFile: args[0] || 'input.json',
        outputFile: args[1] || 'output.json'
    };
}

function main() {
    try {
        // Parse command line arguments
        const { inputFile, outputFile } = parseArguments();

        // Read input file
        const inputData = fs.readFileSync(inputFile, 'utf8');
        const input: ISimulationInput = JSON.parse(inputData);
        let logger: LoggerService;
        if (typeof window !== 'undefined') {
            LoggerService.getInstance().setLogger(new WebLogger());
        } else {
            LoggerService.getInstance().setLogger(new ConsoleLogger());
        }
        logger = LoggerService.getInstance()

        // Run simulation
        const runner = new SimulationRunner();
        logger.info("Simulation started.")
        const output = runner.run(input);

        // Write output to file
        fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
        logger.info(`Simulation completed successfully.`);
    } catch (error) {
        console.error('Error running simulation:', error);
        process.exit(1);
    }
}

main();