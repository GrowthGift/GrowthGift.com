# Configs

variables (replace accordingly)
APPNAME appName
APPNAMEDEV appNameDev

The `lukemadera:config` packages holds all the hardcoded values and environment specific api keys and configuration variables. There's a server folder for keys that should NOT be exposed on the client.

Use the `ENV` environment variable when running / deploying the Meteor app to set the environment, which will then use the appropriate settings.
Environments:
- [default - the dev environment that will be used if not one of the below]
  - dev: APPNAMEDEV.meteor.com
- prod
  - APPNAME.meteor.com

If needed, use `Config.ENV` (available in both client and server) to determine which environment is being run.

## Running

- Put the environment variables BEFORE the `meteor` command
  - `ENV=prod meteor`
- OR use the Meteor settings, which is the only way to do it for deploying to *.meteor.com:
  - `meteor --settings=settings-prod.json`
  - and then in `settings-prod.json` add an `env` key inside the `public` object
