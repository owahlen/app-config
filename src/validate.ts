import * as fs from 'fs';
import * as path from 'path';
import Ajv, { ValidateFunction } from 'ajv';
import addKeywords from 'ajv-keywords';

// Initialize Ajv instance
const ajv = new Ajv({ allErrors: true });
addKeywords(ajv, ['uniqueItemProperties']); // Add support for `uniqueItemProperties`

// Define a function to validate JSON config against a schema
function validateConfig(configPath: string, schemaPath: string): boolean {
    let config: object;
    let schema: object;

    // Try to read and parse the config file
    try {
        const configData = fs.readFileSync(configPath, 'utf-8');
        config = JSON.parse(configData);
    } catch (error) {
        console.error(`Error reading or parsing config file at ${configPath}: ${(error as Error).message}`);
        return false;
    }

    // Try to read and parse the schema file
    try {
        const schemaData = fs.readFileSync(schemaPath, 'utf-8');
        schema = JSON.parse(schemaData);
    } catch (error) {
        console.error(`Error reading or parsing schema file at ${schemaPath}: ${(error as Error).message}`);
        return false;
    }

    // Compile and validate the config against the schema
    const validate: ValidateFunction = ajv.compile(schema);
    const valid: boolean = validate(config);

    if (!valid) {
        console.error(`Validation failed for ${configPath}:`);
        console.error(validate.errors);
        return false;
    }

    console.log(`Validation successful for ${configPath}`);
    return true;
}

// Define the base directory for versions
const baseDir: string = path.join('./', 'versions');

// Function to iterate over all subdirectories and validate the files
function validateAllVersions(baseDir: string): void {
    const subdirectories: string[] = fs.readdirSync(baseDir);
    let allValid = true;

    subdirectories.forEach((subdir: string) => {
        const versionDir = path.join(baseDir, subdir);
        const configPath = path.join(versionDir, 'app-config.json');
        const schemaPath = path.join(versionDir, 'app-config-schema.json');

        // Ensure both files exist
        if (fs.existsSync(configPath) && fs.existsSync(schemaPath)) {
            const isValid = validateConfig(configPath, schemaPath);
            if (!isValid) {
                allValid = false; // Mark validation as failed
            }
        } else {
            console.error(`Missing config or schema file in ${versionDir}`);
            allValid = false;
        }
    });

    if (!allValid) {
        process.exit(1); // Exit with failure code if any validation fails
    } else {
        console.log('All validations passed!');
    }
}

// Perform validation on all version subdirectories
validateAllVersions(baseDir);
