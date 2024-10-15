# app-config
## Purpose
This repository is used to manage the configuration of mobile apps.
The apps download this configuration at startup time from a
[public URL](https://owahlen.github.io/app-config-public/production/v1/app-config.json).

## Changing the configuration
The app configuration is stored in the file
[app-config.json](configurations/production/v1/app-config.json).
Its content is validated against the JSON schema defined in the file
[app-config-schema.json](configurations/production/v1/app-config-schema.json).
In order to update the configuration create a pull request with the changes to any of these files.
The [json-validation.yml](.github/workflows/json-validation.yml)
GitHub action will validate the configuration against the schema when the pull request is submitted.

## Deployment of the changed configuration
Merging the pull request to the _main_ branch is only possible if the validation completes successfully.
After successfully merging to the _main_ branch the
[deploy.yml](.github/workflows/deploy.yml)
GitHub action gets triggered and will copy and push the configuration to the repository
[app-config-public](http://github.com/owahlen/app-config-public).
Here it gets exposed to the public via the URL
[https://owahlen.github.io/app-config-public/v1/app-config.json](https://owahlen.github.io/app-config-public/production/v1/app-config.json).

## Configuration directory structure
The configuration files are organized in the following directory structure:
```
configurations
├── development
│   ├── v1
│   │   ├── app-config.json
│   │   └── app-config-schema.json
│   ├── v2
│   │   ├── app-config.json
│   │   └── app-config-schema.json
│   └── ...
├── staging
│   ├── v1
│   │   ├── app-config.json
│   │   └── app-config-schema.json
│   ├── v2
│   │   ├── app-config.json
│   │   └── app-config-schema.json
│   └── ...
└── production
    ├── v1
    │   ├── app-config.json
    │   └── app-config-schema.json
    ├── v2
    │   ├── app-config.json
    │   └── app-config-schema.json
    └── ...
```
Underneath the top-level directory `configurations` there are 
three subdirectories `development`, `staging`, and `production` that represent the different environments.
Depending on the environment the app is running in, the configuration is loaded from the corresponding directory.

Each of these environment directories contains a configuration schema
that is versioned by an incrementing integer number.
The directories `vX` represent these versions with `X` being the version number.
If a modification of the schema introduces a breaking change a new version must be created.

The file
[app-config.json](configurations/production/v1/app-config.json) contains the `version` 
as attribute of the root object:
```JSON
{
  "version": 1
}
```
This version number must match the one of the configuration's parent directory name.
The
[app-config-schema.json](configurations/production/v1/app-config-schema.json)
enforces the version to a specific constant and hereby ensures that it matches with the configuration file:
```JSON
{
  "type": "object",
  "properties": {
    "version": {
      "type": "integer",
      "const": 1
    }
  }
}
```
Thus, in order to create a new version an existing version directory should be copied
and the two files must be updated accordingly.

## Local testing
In order to test the configurations locally, make sure to have a recent LTS version of Node.js installed (^20.9.0).
Then run the following commands:
```bash
npm install   # only needed once to install all dependencies
npm run build # to build the application and to run internal tests
npm start     # to validate all configuration files against their respective schemas
```
