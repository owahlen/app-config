# app-config
## Purpose
This repository is used to manage the configuration of mobile apps.
The apps download this configuration at startup time from a
[public URL](https://owahlen.github.io/app-config-public/app-config.json).

## Changing the configuration
The app configuration is stored in the file
[app-config.json](app-config.json).
Its content is validated against the JSON schema defined in the file
[app-config.schema.json](app-config-schema.json).
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
[https://owahlen.github.io/app-config-public/app-config.json](https://owahlen.github.io/app-config-public/app-config.json).
