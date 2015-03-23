## Seeding a new app

This placeholder project has been made to quickly build new Meteor apps with some common functionality built in from the start. The list below is the custom stuff you'll still need to do (mostly app specific configuration stuff). Eventually we could turn this into a Yeoman generator with prompts that do this for you.

- file / folder setup
  - remove default Meteor created files/folders from `meteor create APPNAME`
    - APPNAME.css, APPNAME.js, APPNAME.html
  - copy & paste all the files & folders from this seed repo/project into your project EXCEPT:
    - `.git` folder
- update packages:
  - uninstall (either manually edit/delete from `.meteor/packages` or use `meteor remove` from command line)
    autopublish
    insecure
  - install (either manually add to `.meteor/packages` then run `meteor update` or use `meteor add` from command line)
    less
    mquandalle:bower
    reactive-var
    iron:router
    accounts-password
    aldeed:autoform
    aldeed:collection2
    momentjs:moment
    wylio:mandrill
    raix:push

    nrane9:array1
    lukemadera:config
    lukemadera:auth
    lukemadera:notify
    lukemadera:mocks

    http
    percolate:synced-cron

    notorii:autoform-datetimepicker
- search for and update all `todoseed` items in code (should be self explanatory)
- `git init .`
- [OPTIONAL] add custom fonts in `public/font` and reference them in `client/less/fonts.import.less`
- [LATER - only needed for mobile iOS push notifications] add .pem files for iOS push notifications in `private` folder and then reference them in `config.push.json` file
- [LATER - only needed for mobile Cordova app builds] change mobile app assets in `public/app-assets` folder