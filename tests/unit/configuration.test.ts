import * as fs from 'fs';
import {getValidatedConfiguration} from '../../src/validation';
import {validateConfigurations} from "../../src/configuration";
import {Dirent} from "node:fs";
import * as path from "node:path";

jest.mock('fs');
jest.mock('../../src/validation'); // Mock the validateJSON function

describe('validateConfigurations', () => {
    const mockedFs = jest.mocked(fs);
    const mockedGetValidatedConfiguration = jest.mocked(getValidatedConfiguration);

    const mockConfigurationsDir = './mockedConfigurations';
    const mockEnvironmentDir = 'dev';
    const mockVersionDir = 'v1';

    beforeEach(() => {
        jest.resetAllMocks(); // Reset mocks before each test
    });

    it('should throw an error if configurations directory does not exist', () => {
        mockedFs.existsSync.mockImplementation((dirPath) => dirPath !== mockConfigurationsDir);

        expect(() => validateConfigurations(mockConfigurationsDir))
            .toThrow(`Directory '${mockConfigurationsDir}' does not exist or is not a directory`);
    });

    it('should throw an error if there are no environment directories in the configurations directory', () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.lstatSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
        mockedFs.readdirSync.mockReturnValue([]); // Simulate no directories inside when calling readdirSync

        expect(() => validateConfigurations(mockConfigurationsDir)).toThrow(
            `No environment directories found in path '${mockConfigurationsDir}'`
        );
    });

    it('should throw an error if an environment directory does not exist', () => {
        mockedFs.existsSync.mockImplementation((filePath) =>
            filePath !== path.join(mockConfigurationsDir, mockEnvironmentDir));
        mockedFs.lstatSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
        mockedFs.readdirSync.mockReturnValue([mockEnvironmentDir] as unknown as Dirent[]); // Simulate one environment directory


        expect(() => validateConfigurations(mockConfigurationsDir)).toThrow(
            `Directory '${path.join(mockConfigurationsDir, mockEnvironmentDir)}' does not exist or is not a directory`
        );
    });

    it('should throw an error if there are no version directories in the environment directory', () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.lstatSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
        mockedFs.readdirSync.mockImplementation((dirPath) => {
            if (dirPath === mockConfigurationsDir) {
                return [mockEnvironmentDir] as unknown as Dirent[]; // Simulate one environment directory
            }
            return []; // Simulate no version directories inside the environment
        });

        expect(() => validateConfigurations(mockConfigurationsDir)).toThrow(
            `No version directories found in path '${path.join(mockConfigurationsDir, mockEnvironmentDir)}'`
        );
    });

    it('should throw an error if a version directory name is not in the correct format', () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.lstatSync.mockReturnValue({ isDirectory: () => true } as fs.Stats);
        mockedFs.readdirSync.mockImplementation((dirPath) => {
            if (dirPath === mockConfigurationsDir)
                return [mockEnvironmentDir] as unknown as Dirent[];
            if (dirPath === path.join(mockConfigurationsDir, mockEnvironmentDir))
                return ['invalid_version'] as unknown as Dirent[];
            return [];
        });

        expect(() => validateConfigurations(mockConfigurationsDir)).toThrow(
            `Format of version directory name 'invalid_version' in path '${path.join(mockConfigurationsDir, mockEnvironmentDir, 'invalid_version')}' should be 'vX' where X is a number`
        );
    });

    it('should throw an error if app-config.json or app-config-schema.json is missing', () => {
        const versionPath = path.join(mockConfigurationsDir, mockEnvironmentDir, mockVersionDir);
        const configPath = path.join(versionPath, 'app-config.json');
        const schemaPath = path.join(versionPath, 'app-config-schema.json');

        // Simulate missing config file
        mockedFs.existsSync.mockImplementation((filePath) => filePath !== configPath);
        mockedFs.lstatSync.mockReturnValue({ isDirectory: () => true, isFile: () => true } as fs.Stats);
        mockedFs.readdirSync.mockImplementation((dirPath) => {
            if (dirPath === mockConfigurationsDir)
                return [mockEnvironmentDir] as unknown as Dirent[];
            if (dirPath === path.join(mockConfigurationsDir, mockEnvironmentDir))
                return [mockVersionDir] as unknown as Dirent[];
            return [];
        });

        expect(() => validateConfigurations(mockConfigurationsDir)).toThrow(
            `File '${configPath}' does not exist or is not a file`
        );

        // Simulate missing schema file
        mockedFs.existsSync.mockImplementation((filePath) => filePath !== schemaPath);

        expect(() => validateConfigurations(mockConfigurationsDir)).toThrow(
            `File '${schemaPath}' does not exist or is not a file`
        );

    });

    it('should throw an error if the configuration file is missing a version field', () => {
        const versionPath = path.join(mockConfigurationsDir, mockEnvironmentDir, mockVersionDir);
        const configPath = path.join(versionPath, 'app-config.json');

        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.lstatSync.mockReturnValue({ isDirectory: () => true, isFile: () => true } as fs.Stats);
        mockedFs.readdirSync.mockImplementation((filePath) => {
            if (filePath === mockConfigurationsDir)
                return [mockEnvironmentDir] as unknown as Dirent[];
            if (filePath === path.join(mockConfigurationsDir, mockEnvironmentDir))
                return [mockVersionDir] as unknown as Dirent[];
            return [];
        });

        mockedGetValidatedConfiguration.mockReturnValueOnce({}); // Simulate config missing version

        expect(() => validateConfigurations(mockConfigurationsDir)).toThrow(
            `Version missing in configuration file '${configPath}'`
        );
    });

    it('should throw an error if the version in the configuration file does not match the version in the directory', () => {
        const versionPath = path.join(mockConfigurationsDir, mockEnvironmentDir, mockVersionDir);
        const configPath = path.join(versionPath, 'app-config.json');

        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.lstatSync.mockReturnValue({ isDirectory: () => true, isFile: () => true } as fs.Stats);
        mockedFs.readdirSync.mockImplementation((filePath) => {
            if (filePath === mockConfigurationsDir)
                return [mockEnvironmentDir] as unknown as Dirent[];
            if (filePath === path.join(mockConfigurationsDir, mockEnvironmentDir))
                return [mockVersionDir] as unknown as Dirent[];
            return [];
        });

        mockedGetValidatedConfiguration.mockReturnValueOnce({ version: 2 }); // Simulate version mismatch

        expect(() => validateConfigurations(mockConfigurationsDir)).toThrow(
            `Version mismatch: version from path '${versionPath}' is 1 `+
            `while version in configuration file '${configPath}' is 2`
        );
    });

    it('should pass if all configurations are valid', () => {
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.lstatSync.mockReturnValue({ isDirectory: () => true, isFile: () => true } as fs.Stats);
        mockedFs.readdirSync.mockImplementation((filePath) => {
            if (filePath === mockConfigurationsDir)
                return [mockEnvironmentDir] as unknown as Dirent[];
            if (filePath === path.join(mockConfigurationsDir, mockEnvironmentDir))
                return [mockVersionDir] as unknown as Dirent[];
            return [];
        });

        mockedGetValidatedConfiguration.mockReturnValueOnce({ version: 1 }); // Simulate correct configuration

        expect(() => validateConfigurations(mockConfigurationsDir)).not.toThrow();
    });

    it('should throw an error if validateJSON throws an error', () => {
        // Simulate valid directory structure and files
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.lstatSync.mockReturnValue({isDirectory: () => true, isFile: () => true} as fs.Stats);
        mockedFs.readdirSync.mockImplementation((filePath) => {
            if (filePath === mockConfigurationsDir)
                return [mockEnvironmentDir] as unknown as Dirent[];
            if (filePath === path.join(mockConfigurationsDir, mockEnvironmentDir))
                return [mockVersionDir] as unknown as Dirent[];
            return [];
        });

        // Simulate validateJSON throwing an error
        mockedGetValidatedConfiguration.mockImplementation(() => {
            throw new Error('Validation failed');
        });

        expect(() => validateConfigurations(mockConfigurationsDir))
            .toThrow("Validation failed");
    });
});
