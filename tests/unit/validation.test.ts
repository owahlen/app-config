import * as fs from 'fs';
import {getValidatedConfiguration} from '../../src/validation';

jest.mock('fs');
const mockedFs = jest.mocked(fs);

describe('getValidatedConfiguration', () => {
    const mockConfigPath = 'config.json';
    const mockSchemaPath = 'schema.json';

    beforeEach(() => {
        jest.resetAllMocks(); // Reset mocks before each test
    });

    it('should return valid config after validating it against schema', () => {
        const mockConfig = JSON.stringify({version: 1});
        const mockSchema = JSON.stringify({
            type: 'object',
            properties: {
                version: {type: 'number'}
            },
            required: ['version'],
        });

        // Mock fs.readFileSync to return valid config and schema
        mockedFs.readFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
            if (path === mockConfigPath) return mockConfig;
            if (path === mockSchemaPath) return mockSchema;
            return '';
        });

        // Test validateJSON function with mocked data
        expect(() => getValidatedConfiguration(mockConfigPath, mockSchemaPath)).not.toThrow();
    });

    it('should throw an error if config file contains invalid JSON', () => {
        const invalidConfig = '{ version: 1 '; // Malformed JSON (missing closing bracket)
        const mockSchema = JSON.stringify({
            type: 'object',
            properties: {version: {type: 'number'}},
            required: ['version'],
        });

        mockedFs.readFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
            if (path === mockConfigPath) return invalidConfig;
            if (path === mockSchemaPath) return mockSchema;
            return '';
        });

        expect(() => getValidatedConfiguration(mockConfigPath, mockSchemaPath)).toThrow(
            new RegExp(`Unable to parse JSON file '${mockConfigPath}': Expected property name or '}' in JSON.*`)
        );
    });

    it('should throw an error if schema file contains invalid JSON', () => {
        const mockConfig = JSON.stringify({version: 1});
        const invalidSchema = '{ type: "object", '; // Malformed JSON schema

        mockedFs.readFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
            if (path === mockConfigPath) return mockConfig;
            if (path === mockSchemaPath) return invalidSchema;
            return '';
        });

        expect(() => getValidatedConfiguration(mockConfigPath, mockSchemaPath)).toThrow(
            new RegExp(`Unable to parse JSON file '${mockSchemaPath}': Expected property name or '}' in JSON.*`)
        );
    });

    it('should throw an error if JSON config does not match schema', () => {
        const mockConfig = JSON.stringify({version: "1"}); // Invalid config (version must be a number)
        const mockSchema = JSON.stringify({
            type: 'object',
            properties: {version: {type: 'number'}}, // `version` must be a number
            required: ['version'],
        });

        mockedFs.readFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
            if (path === mockConfigPath) return mockConfig;
            if (path === mockSchemaPath) return mockSchema;
            return '';
        });

        expect(() => getValidatedConfiguration(mockConfigPath, mockSchemaPath)).toThrow(
            `Validation failed for JSON file '${mockConfigPath}': data/version must be number`
        );
    });

    it('should throw an error if reading a file fails', () => {
        mockedFs.readFileSync.mockImplementation(() => {
            throw new Error('File not found');
        });

        expect(() => getValidatedConfiguration(mockConfigPath, mockSchemaPath)).toThrow(
            `Unable to read file '${mockConfigPath}': File not found`
        );
    });
});
