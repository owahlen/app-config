# app-config
## Purpose
This repository is used to manage the configuration of mobile apps.
The apps download this configuration at startup time from a
[public URL](https://owahlen.github.io/app-config-public/v1/app-config.json).

## Changing the configuration
The app configuration is stored in the file
[app-config.json](versions/v1/app-config.json).
Its content is validated against the JSON schema defined in the file
[app-config-schema.json](versions/v1/app-config-schema.json).
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
[https://owahlen.github.io/app-config-public/v1/app-config.json](https://owahlen.github.io/app-config-public/v1/app-config.json).

## Schema versioning
The configuration schema is versioned using an incrementing integer number.
If a modification of the schema introduces a breaking change a new version must be created.
Versions of configurations and schemas are organized in the directory structure as follows:
```
versions
├── v1
│   ├── app-config.json
│   └── app-config-schema.json
├── v2
│   ├── app-config.json
│   └── app-config-schema.json
└── ...
```
The file
[app-config.json](versions/v1/app-config.json) contains the `version` 
as attribute of the root object:
```json
{
  "version": 1,
  ...
}
```
The
[app-config-schema.json](versions/v1/app-config-schema.json)
enforces this version to a specific constant:
```json
{
  "type": "object",
  "properties": {
    "version": {
      "type": "integer",
      "const": 1
    },
    ...
  }
}
```
Thus, in order to create a new version an existing version should be copied
and the two files must be updated accordingly.
