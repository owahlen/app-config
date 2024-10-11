const Ajv = require('ajv');
const fs = require('fs');

// Load JSON and Schema
const data = JSON.parse(fs.readFileSync('app-config.json', 'utf-8'));
const schema = JSON.parse(fs.readFileSync('app-config-schema.json', 'utf-8'));

// Initialize AJV
const ajv = new Ajv();
const validate = ajv.compile(schema);
const valid = validate(data);

// Perform validation
if (!valid) {
  console.log("Error: Invalid JSON:");
  console.log(validate.errors); // Log detailed validation errors
  process.exit(1); // Failure exit code
}
