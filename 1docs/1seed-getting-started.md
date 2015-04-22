## Seeding a new app

This placeholder project has been made to quickly build new Meteor apps with some common functionality built in from the start. The list below is the custom stuff you'll still need to do (mostly app specific configuration stuff). Eventually we could turn this into a Yeoman generator with prompts that do this for you.

GIT_CLONE_URL   git@github.com:notorii/meteor-seed.git
* note can also use HTTPS clone url

APP_NAME todoseed

- clone repo
    - `git clone GIT_CLONE_URL --origin seed APP_NAME`
- search for and update all `todoseed` items in code (should be self explanatory)
- [OPTIONAL] add custom fonts in `public/font` and reference them in `client/less/fonts.import.less`
- [LATER - only needed for mobile iOS push notifications] add .pem files for iOS push notifications in `private` folder and then reference them in `config.push.json` file
- [LATER - only needed for mobile Cordova app builds] change mobile app assets in `public/app-assets` folder