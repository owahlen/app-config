import * as fs from 'fs';
import * as path from 'path';
import {validateJSON} from "./validation";

// Define the base directory for versions
const VERSIONS_DIR: string = path.join('./', 'versions');

// Function to iterate over all subdirectories and validate the files
export function validateVersions(versionsDir: string = VERSIONS_DIR) {
    if (!fs.existsSync(versionsDir) || !fs.lstatSync(versionsDir).isDirectory()) {
        throw new Error(`Versions directory '${versionsDir}' does not exist or is not a directory`);
    }
    const subdirectories: string[] = fs.readdirSync(versionsDir);

    subdirectories.forEach((subdir: string) => {
        const versionDir = path.join(versionsDir, subdir);
        const configPath = path.join(versionDir, 'app-config.json');
        const schemaPath = path.join(versionDir, 'app-config-schema.json');

        if (!fs.existsSync(configPath) || !fs.lstatSync(configPath).isFile()) {
            throw new Error(`Config file '${configPath}' does not exist or is not a file`);
        }
        if (!fs.existsSync(schemaPath) || !fs.lstatSync(schemaPath).isFile()) {
            throw new Error(`Schema file '${schemaPath}' does not exist or is not a file`);
        }

        try {
            validateJSON(configPath, schemaPath);
        } catch (error) {
            if (error instanceof Error) {
                throw Error(`Error validating '${configPath}': ${error.message}`);
            }
            throw error; // Rethrow non-Error exceptions
        }
    });

}
