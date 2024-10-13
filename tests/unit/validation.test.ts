import * as fs from 'fs';
import { validateJSON } from '../../src/validation';

jest.mock('fs');
const mockedFs = jest.mocked(fs);

describe('validateJSON', () => {
    const mockConfigPath = 'config.json';
    const mockSchemaPath = 'schema.json';

    beforeEach(() => {
        jest.resetAllMocks(); // Reset mocks before each test
    });

    it('should successfully validate valid JSON config against schema', () => {
        const mockConfig = JSON.stringify({ key: 'value' });
        const mockSchema = JSON.stringify({
            type: 'object',
            properties: {
                key: { type: 'string' }
            },
            required: ['key'],
        });

        // Mock fs.readFileSync to return valid config and schema
        mockedFs.readFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
            if (path === mockConfigPath) return mockConfig;
            if (path === mockSchemaPath) return mockSchema;
            return '';
        });

        // Test validateJSON function with mocked data
        expect(() => validateJSON(mockConfigPath, mockSchemaPath)).not.toThrow();
    });

    it('should throw an error if config file contains invalid JSON', () => {
        const invalidConfig = '{ key: "value" '; // Malformed JSON
        const mockSchema = JSON.stringify({
            type: 'object',
            properties: { key: { type: 'string' } },
            required: ['key'],
        });

        mockedFs.readFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
            if (path === mockConfigPath) return invalidConfig;
            if (path === mockSchemaPath) return mockSchema;
            return '';
        });

        expect(() => validateJSON(mockConfigPath, mockSchemaPath)).toThrow(
            new RegExp(`Error parsing JSON file '${mockConfigPath}': Expected property name or '}' in JSON.*`)
        );
    });

    it('should throw an error if schema file contains invalid JSON', () => {
        const mockConfig = JSON.stringify({ key: 'value' });
        const invalidSchema = '{ type: "object", '; // Malformed JSON schema

        mockedFs.readFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
            if (path === mockConfigPath) return mockConfig;
            if (path === mockSchemaPath) return invalidSchema;
            return '';
        });

        expect(() => validateJSON(mockConfigPath, mockSchemaPath)).toThrow(
            new RegExp(`Error parsing JSON file '${mockSchemaPath}': Expected property name or '}' in JSON.*`)
        );
    });

    it('should throw an error if JSON config does not match schema', () => {
        const mockConfig = JSON.stringify({ key: 123 }); // Invalid config
        const mockSchema = JSON.stringify({
            type: 'object',
            properties: { key: { type: 'string' } }, // `key` must be a string
            required: ['key'],
        });

        mockedFs.readFileSync.mockImplementation((path: fs.PathOrFileDescriptor) => {
            if (path === mockConfigPath) return mockConfig;
            if (path === mockSchemaPath) return mockSchema;
            return '';
        });

        expect(() => validateJSON(mockConfigPath, mockSchemaPath)).toThrow(
            `Error validating JSON file '${mockConfigPath}': data/key must be string`
        );
    });

    it('should throw an error if reading a file fails', () => {
        mockedFs.readFileSync.mockImplementation(() => {
            throw new Error('File not found');
        });

        expect(() => validateJSON(mockConfigPath, mockSchemaPath)).toThrow(
            `Error reading file '${mockConfigPath}': File not found`
        );
    });
});
