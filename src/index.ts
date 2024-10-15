import {validateConfigurations} from "./configuration";

function main() {
    try {
        validateConfigurations();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error validating configurations: ${error}.message}`);
            process.exit(1);
        }
        throw error; // Rethrow non-Error exceptions
    }
    console.log('All validations passed!');
}

main();
