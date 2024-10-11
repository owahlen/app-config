const fs = require('fs');
const path = require('path');
const Ajv = require('ajv');
const addKeywords = require('ajv-keywords');

const CONFIG_FILE = 'app-config.json';
const SCHEMA_FILE = 'app-config-schema.json';

// Initialize Ajv instance
const ajv = new Ajv({ allErrors: true });
// Add support for additional non-standard schema keywords
addKeywords(ajv, "uniqueItemProperties");

// Function to validate JSON against schema
function validateConfig(configPath, schemaPath, subdir) {
    let config, schema;

    // Try to read and parse the config file
    try {
        const configData = fs.readFileSync(configPath, 'utf-8');
        config = JSON.parse(configData);
    } catch (error) {
        console.error(`Error reading or parsing config file '${subdir}/${CONFIG_FILE}': ${error.message}`);
        return false;
    }
    // Try to read and parse the schema file
    try {
        const schemaData = fs.readFileSync(schemaPath, 'utf-8');
        schema = JSON.parse(schemaData);
    } catch (error) {
        console.error(`Error reading or parsing schema file '${subdir}/${SCHEMA_FILE}': ${error.message}`);
        return false;
    }

    const validate = ajv.compile(schema);
    const valid = validate(config);

    if (!valid) {
        console.error(`Validation failed for configuration '${subdir}/${CONFIG_FILE}':`);
        console.error(validate.errors);
        return false;
    } else {
        return true;
    }
}

// Function to iterate over all subdirectories
function validateAllVersions(baseDir) {
    const subdirs = fs.readdirSync(baseDir);

    let allValid = true;

    subdirs.forEach((subdir) => {
        const versionDir = path.join(baseDir, subdir);
        const configPath = path.join(versionDir, `${CONFIG_FILE}`);
        const schemaPath = path.join(versionDir, `${SCHEMA_FILE}`);

        // Ensure both files exist
        const configExists = fs.existsSync(configPath);
        const schemaExists = fs.existsSync(schemaPath);
        if(!configExists) {
            console.error(`Missing config file '${versionDir}/${CONFIG_FILE}'`);
            allValid = false;
        }
        if(!schemaExists) {
            console.error(`Missing schema file '${versionDir}/${SCHEMA_FILE}'`);
            allValid = false;
        }
        if (configExists && schemaExists) {
            const isValid = validateConfig(configPath, schemaPath, subdir);
            if (!isValid) {
                allValid = false; // Mark validation as failed
            }
        }
    });

    if (!allValid) {
        process.exit(1); // Exit with failure code if any validation fails
    } else {
        console.log('All validations passed!');
    }
}

// Define the base directory for versions
const baseDir = path.join(__dirname, 'versions');

// Perform validation on all version subdirectories
validateAllVersions(baseDir);
