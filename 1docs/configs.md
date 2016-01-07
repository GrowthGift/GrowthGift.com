# Configs

variables (replace accordingly)
APPNAME appName
APPNAMEDEV appNameDev

The `lukemadera:config` packages holds all hardcoded configuration variables, with environment specific api keys pulled from environment variables. Make sure to use `if(Meteor.isServer)` statements for any keys that should NOT be exposed on the client.

Use the `ENV_FILE_PATH` environment variable when running / deploying the Meteor app to set the environment, which will then use the appropriate settings.

## Running

- Put the environment variables BEFORE the `meteor` command
  - `ENV_FILE_PATH=env/prod/.env meteor`
- OR use the Meteor settings, which is the only way to do it for deploying to *.meteor.com:
  - `meteor --settings=env/prod/settings.json`
  - and then in `settings.json` add an `env_file_path` key
