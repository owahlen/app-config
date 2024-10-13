import * as fs from 'fs';
import {validateJSON} from '../../src/validation';
import {validateVersions} from "../../src/versions";
import {Dirent} from "node:fs";
import * as path from "node:path";

jest.mock('fs');
jest.mock('../../src/validation'); // Mock the validateJSON function

describe('validateVersions', () => {
    const mockedFs = jest.mocked(fs);
    const mockedValidateJSON = jest.mocked(validateJSON);

    const mockVersionDir = './mockedVersions';

    beforeEach(() => {
        jest.resetAllMocks(); // Reset mocks before each test
    });

    it('should throw an error if versions directory does not exist', () => {
        mockedFs.existsSync.mockImplementation((pathLike: fs.PathLike) => {
            const path = pathLike.toString();
            return path !== mockVersionDir;
        });

        expect(() => validateVersions(mockVersionDir))
            .toThrow(`Versions directory '${mockVersionDir}' does not exist or is not a directory`);
    });

    it('should throw an error if the config file does not exist', () => {
        mockedFs.existsSync.mockImplementation((pathLike: fs.PathLike) => {
            const path = pathLike.toString();
            return !path.includes('app-config.json'); // Simulate missing config file
        });
        mockedFs.lstatSync.mockReturnValue({isDirectory: () => true} as fs.Stats); // Assume it's a directory
        mockedFs.readdirSync.mockReturnValue(['v1'] as unknown as Dirent[]); // One version directory

        expect(() => validateVersions(mockVersionDir))
            .toThrow(/Config file .* does not exist or is not a file/);
    });

    it('should throw an error if the schema file does not exist', () => {
        mockedFs.existsSync.mockImplementation((pathLike: fs.PathLike) => {
            const path = pathLike.toString();
            return !path.endsWith('app-config-schema.json');

        });
        mockedFs.lstatSync.mockReturnValue({isDirectory: () => true, isFile: () => true} as fs.Stats);
        mockedFs.readdirSync.mockReturnValue(['v1'] as unknown as Dirent[]);

        expect(() => validateVersions(mockVersionDir))
            .toThrow(/Schema file .* does not exist or is not a file/);
    });

    it('should call validateJSON for each version subdirectory', () => {
        // Simulate valid directory structure and files
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.lstatSync.mockReturnValue({isDirectory: () => true, isFile: () => true} as fs.Stats);
        mockedFs.readdirSync.mockReturnValue(['v1', 'v2'] as unknown as Dirent[]); // Two version directories

        validateVersions(mockVersionDir);

        expect(mockedValidateJSON).toHaveBeenCalledTimes(2);
        expect(mockedValidateJSON).toHaveBeenCalledWith(
            path.join(mockVersionDir, 'v1', 'app-config.json'),
            path.join(mockVersionDir, 'v1', 'app-config-schema.json')
        );
        expect(mockedValidateJSON).toHaveBeenCalledWith(
            path.join(mockVersionDir, 'v2', 'app-config.json'),
            path.join(mockVersionDir, 'v2', 'app-config-schema.json')
        );
    });

    it('should throw an error if validateJSON throws an error', () => {
        // Simulate valid directory structure and files
        mockedFs.existsSync.mockReturnValue(true);
        mockedFs.lstatSync.mockReturnValue({isDirectory: () => true, isFile: () => true} as fs.Stats);
        mockedFs.readdirSync.mockReturnValue(['v1'] as unknown as Dirent[]);

        // Simulate validateJSON throwing an error
        mockedValidateJSON.mockImplementation(() => {
            throw new Error('Validation failed');
        });

        expect(() => validateVersions(mockVersionDir))
            .toThrow(/Error validating .*: Validation failed/);
    });
});
