# Meteor

## Getting Started
- read / learn
  - tutorial: https://www.meteor.com/install
  - discover meteor book, especially:
    - routing chapter: https://book.discovermeteor.com/chapter/routing
  - meteor docs: https://docs.meteor.com/
    - key reading:
      - templates / Blaze / Spacebars: http://docs.meteor.com/#/full/livehtmltemplates
      - https://github.com/meteor/meteor/blob/devel/packages/spacebars/README.md
      - namespacing: http://docs.meteor.com/#/full/namespacing
      - async (or lack thereof):
        - http://stackoverflow.com/questions/20313023/why-does-meteor-use-fibers-rather-than-promises-or-async-or-something-else
        - https://www.discovermeteor.com/blog/understanding-sync-async-javascript-node/
        - https://www.discovermeteor.com/blog/wrapping-npm-packages/
  - testing
    - http://www.meteortesting.com/blog/e72fe/the-7-testing-modes-of-meteor
- decide on file structure: http://docs.meteor.com/#/full/structuringyourapp
  - options:
    - folders inside client/ and server/
    - packages
  - we'll use packages; so we then need to learn package structure
    - [look at existing packages and copy structure!]
- create first app  
  - if on Windows [not supported yet], decide on Virtual Machine or Cloud IDE (Koding, Nitrous.io, Cloud9)

  
## Packages
They're auto stored for you in `.meteor/packages` so you don't need to add to a `package.json` or `bower.json` file manually

### Creating & Adding Packages
In general anytime you want common code (used across multiple files), create and add a package. You can publish it to atmosphere or just leave it local. Unlike Angular/MEAN where there's a difference between frontend and backend and directives and services, all packages can do all of these so everything is a package and then whether it touches frontend, backend, or both and whether it touches DOM (directive) or not (pure service) depends on the code and files themselves.

Always keep code DRY so use lots of packages - any time you find yourself doing the same thing more than once (or even think you may in the near term), abstract the code to a package!

`meteor create --package [meteor_developer_username]:[package_name]`
`meteor add [meteor_developer_username]:[package_name]`

Package code looks very similar to a node.js module/file. Create an object, add functions/properties, then in meteor `package.json` export that main object.

  
## Upgrading node (need to be recent for meteor to run)
- http://davidwalsh.name/upgrade-nodejs


## MongoDB
- to build you need to specify a MongoDB; I tried Compose.io (MongoHQ) but I couldn't seem to be able to sign up for a free sandbox account (got blocked by having to enter payment info) so I used MongoLab instead.
- to debug / see local MongoDB, using regular `mongo` command does not seem to work (no database for the Meteor one) but `meteor mongo` does work so just use that.


## Build / Deploy
- `meteor build` but make sure to NOT put the directory inside the meteor app folder itself or it will no longer be able to be re-built and re-run because meteor will try to include the build directory itself!
- meteor includes jQuery and other things for development but seems to do a good job of stripping down for the production build into just a .js file, .css file, websockets (2 files?) and the .js file is only 99kb (jQuery by itself is 140kb)


## Templates
- naming: use camel case (not snake case)
- use `this` inside javascript to get the current data (especially useful with #each and events)
  - http://stackoverflow.com/questions/10168996/meteor-template-events-how-to-get-object-that-caused-event
  - NOTE: `this` object is a 'getter' but not a 'setter' so updating values won't update the parent object; you'll have to do that manually if you want to update it
- use triple brackets {{{ }}} to render html: http://stackoverflow.com/questions/14267856/insert-html-markup-using-meteor
- can pass in arguments / attributes (like AngularJS directives) and access with `this` (not sure how to pass in javascript objects though?)
  - https://www.discovermeteor.com/blog/spacebars-secrets-exploring-meteor-new-templating-engine/
  - http://meteorcapture.com/spacebars/#template-inclusion
  
  
## Reactivity
- use `Session` for any variables you want the UI / template to update with (otherwise changing javascript variables will NOT update the DOM)
  - note that `Session` (like collections) will NOT store functions - so if need to store functions (i.e. as part of an object), use a ReactiveVar instead!
    - http://stackoverflow.com/questions/17302234/why-do-functions-in-object-properties-disappear-if-stored-in-a-session-meteor
- use Collections for everything (even if just a local/client only one - initialize with `null`) since this will create the built in reactivity.
  - use `Template.parentData()` and `Collection.update` calls to update the root items for any sub-item (nested) changes. Basically you'll have to manually update the outermost item for any sub-item changes for nested objects/arrays (unlike Angular where just changing a $scope variable from a (ng-click) directive will auto-propagate up and update within the root object/array as well. {{#each }} gives data context but seems to only be a getter and not a setter since changing `this[property]` is not reactive and doesn't really do anything reliable.
  - http://stackoverflow.com/questions/27958396/meteor-reactive-nested-object-update-parent-object/27976595#27976595
  - https://www.eventedmind.com/feed/meteor-ui-reactivity-in-slow-motion


## LESS
- rename (import) files as `*.import.less` otherwise order will be messed up and lead to errors

## Publish
- when subscribing to a published collection:
  - if you put the subscription in the router (looking up how to do that) then the client will only be subscribed when on that page
  - if you subscribe using the subscription manager package, then it will be cached, and available throughout the session.
  - if you dont put it in either of thos,e and put it in a .js somewhere else, the subscription will be available app-wide.

## Security
- After removing insecure, either:
  - Use Meteor.methods to create server side methods that can be called by the client.
  - Use allow/deny permissions to let the client update -- but this can cause dbSchema issues
  - **Preferably use methods to prevent dbschema inconsistencies.

## Code Scope
- If you want code to be run only when you go to the route of that page, you must either:
  - put it in a Template.templateName.rendered function, or in a separate function, and call it when you route to the page.

## Common Mistakes/solutions
- Reactive publishes based on multiple collections:
  - https://dweldon.silvrback.com/common-mistakes
  - http://stackoverflow.com/questions/26398952/meteor-publish-publish-collection-which-depends-on-other-collection
  - https://www.discovermeteor.com/blog/reactive-joins-in-meteor/
- Return values from a Meteor.call() on the client side:
  - http://stackoverflow.com/questions/10677491/how-to-get-meteor-call-to-return-value-for-template