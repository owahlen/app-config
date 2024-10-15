import * as fs from 'fs';
import * as path from 'path';
import {getValidatedConfiguration} from "./validation";

// Define the base directory for configurations
const CONFIGURATIONS_DIR: string = path.join('./', 'configurations');

// Function to iterate over all subdirectories and validate the files
export function validateConfigurations(configurationsDir: string = CONFIGURATIONS_DIR) {
    checkDirectoryExists(configurationsDir);
    const environmentDirectories: string[] = fs.readdirSync(configurationsDir);
    if(environmentDirectories.length === 0) {
        throw new Error(`No environment directories found in path '${configurationsDir}'`);
    }
    environmentDirectories.forEach((environmentDirectory: string) => {
        checkEnvironmentDirectory(configurationsDir, environmentDirectory);
    });
}

function checkEnvironmentDirectory(configurationsDir: string, environmentDirectory: string) {
    const environmentPath = path.join(configurationsDir, environmentDirectory);
    checkDirectoryExists(environmentPath);
    const versionDirectories: string[] = fs.readdirSync(environmentPath);
    if(versionDirectories.length === 0) {
        throw new Error(`No version directories found in path '${environmentPath}'`);
    }
    versionDirectories.forEach((versionDirectory: string) => {
        checkVersionDirectory(environmentPath, versionDirectory);
    });
}

function checkVersionDirectory(environmentPath: string, versionDirectory: string) {
    // check the version directory itself
    const versionPath = path.join(environmentPath, versionDirectory);
    checkDirectoryExists(versionPath);
    const versionFromPath = getVersionFromPath(versionPath, versionDirectory);

    // check the files in the version directory
    const configPath = path.join(versionPath, 'app-config.json');
    const schemaPath = path.join(versionPath, 'app-config-schema.json');
    checkFileExists(configPath);
    checkFileExists(schemaPath);

    // check the configuration file
    const configuration = getValidatedConfiguration(configPath, schemaPath);
    if(!Object.hasOwn(configuration, 'version')) {
        throw new Error(`Version missing in configuration file '${configPath}'`);
    }
    // check the version in the configuration file matches the version in the path
    const versionedConfiguration = configuration as { version: number };
    if (versionedConfiguration.version !== versionFromPath) {
        throw new Error(`Version mismatch: version from path '${versionPath}' is ${versionFromPath} `+
            `while version in configuration file '${configPath}' is ${versionedConfiguration.version}`);
    }
}

function getVersionFromPath(versionPath: string, versionDirectory: string): number {
    const matchResult = versionDirectory.match(/^v(\d+)$/);
    if (!matchResult) {
        throw new Error(`Format of version directory name '${versionDirectory}' in path '${versionPath}' should be 'vX' where X is a number`);
    }
    return parseInt(matchResult[1]);
}

function checkDirectoryExists(directoryPath: string) {
    if (!fs.existsSync(directoryPath) || !fs.lstatSync(directoryPath).isDirectory()) {
        throw new Error(`Directory '${directoryPath}' does not exist or is not a directory`);
    }
}

function checkFileExists(filePath: string) {
    if (!fs.existsSync(filePath) || !fs.lstatSync(filePath).isFile()) {
        throw new Error(`File '${filePath}' does not exist or is not a file`);
    }
}
