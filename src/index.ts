import {validateVersions} from "./versions";

function main() {
    try {
        validateVersions();
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error validating versions: ${error}.message}`);
            process.exit(1);
        }
        throw error; // Rethrow non-Error exceptions
    }
    console.log('All validations passed!');
}

main();
