# Configs

variables (replace accordingly)
APPNAME appName
APPNAMEDEV appNameDev

The `lukemadera:config` packages holds all hardcoded configuration variables, with environment specific api keys pulled from Meteor settings.json variables. Make sure to use `if(Meteor.isServer)` statements for any keys that should NOT be exposed on the client.

Use the `--settings env/prod/settings.json` when running / deploying the Meteor app to set the environment, which will then use the appropriate settings.
