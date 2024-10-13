import * as fs from 'fs';
import Ajv from 'ajv';
import addKeywords from 'ajv-keywords';
import {ErrorObject} from "ajv/dist/types";

// Initialize Ajv instance
const ajv = new Ajv({allErrors: true});
addKeywords(ajv, ['uniqueItemProperties']); // Add support for `uniqueItemProperties`

// Define a function to validate JSON config against a schema
export function validateJSON(configPath: string, schemaPath: string) {
    const config = parseJSONFile(configPath);
    const schema = parseJSONFile(schemaPath);
    const errors = validateSchema(config, schema);
    if (errors) {
        const errorsText = ajv.errorsText(errors);
        throw new Error(`Error validating JSON file '${configPath}': ${errorsText}`);
    }
}

function parseJSONFile(path: string): object {
    const data = readFile(path);
    try {
        return JSON.parse(data);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error parsing JSON file '${path}': ${error.message}`);
        } else {
            throw error; // Rethrow non-Error exceptions
        }
    }
}

function readFile(path: string): string {
    try {
        return fs.readFileSync(path, 'utf-8');
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error reading file '${path}': ${error.message}`);
        } else {
            throw error; // Rethrow non-Error exceptions
        }
    }
}

function validateSchema(config: object, schema: object): null | ErrorObject[] {
    const validate = ajv.compile(schema);
    const result = validate(config);
    if (result || validate.errors === undefined) {
        return null;
    } else {
        return validate.errors;
    }
}
