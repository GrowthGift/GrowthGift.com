## Indentation - Tabs or Spaces?
We'll standardize on 2 spaces per indent.
NO TABS. Use your text editor (i.e. sublime) to allow typing the tab character on your keyboard but have the text editor add 2 spaces for you.

- text wrapping - none; cut off at 80 character line lengths.
- utc dates - All dates stored anywhere should be stored in UTC.


## Workflow

Git pull requests.
Create a NEW branch, commit your changes, push to github and open a pull
 request.
Someone ELSE will then review it and merge it in to master.

See `git-workflow-steps.md` for more.


## Environment Variables

Some (non-sensitive) constants and variables are in the `lukemadera_config`
 and `constants` packages. But all credentials (3rd party services, etc.) and
 values that are DIFFERENT between environments, should be set as environment
 variables and NEVER checked in to the Github repo.
TODO - set this up


## Seed & Migrate Database

The `mock-data` package used for automated tests can also be used to seed
 data into a (local) database.

Additionally, any time a schema change is made, update `db_schema.json`,
 `simple-schema.js`, and write a database migrate script to handle this
 change. This migration will then need to be run on ALL environments
 (locally, dev / staging, production).

Use the `database-migration` package to add a new migration (by adding a 
 new function and a new key). Then run it by calling `ggDatabaseMigration.run`,
 which can currently be called from the `dev-test-test` page. We should
 probably add this in to be auto-run before tests rather than triggered by
 a frontend, publicly accessible page button. Though since migrations should
 never be run more than once, it should be safe here.


## File structure

There are basically 2 types of files:

1. templates
2. packages

The majority of the code should be in packages.


### Templates

To create a new template (can be used as a full page or part of one)

1. Create a new folder, either on the root level directory or within a
 subdirectory to group it with other common functionality.
  1. In general, do NOT use `client` or `server` folders, just use
   `Meteor.isClient` and `Meteor.isServer` in the javascript file.
2. Add a `*.html` and `*.js` file per folder.
  1. Maybe a `*.import.less` file IF you have custom styles (though these
   often aren't necessary - get familiar with and use the common styles in
   `client/less`). If you DO add a new style file, add it to `_base.less`.
3. If a new page / route, add to `lib/router.js`. Do NOT use
 `Meteor.subscribe` here; use that in the individual template and code
 defensively to allow for before the data has loaded.
  1. If you need a new `Meteor.publish`, put it in `lib/publish.js`.


The most common things to do in templates are:

- `Meteor.subscribe` and `Collection.find` to get data
- `Template.*.helpers` to load and format data for use in HTML
  - To keep things DRY, to avoid multiple `Collection.find` calls on the
   same data and multiple defensive 'data has not loaded yet' handling,
   in general have ONE big template helper that gets everything.
  - Check privileges
- `Template.*.events`
- `Meteor.method` to update collections / save data (to backend). This
 will most often be used with forms, which is what probably half of template
 files are for - collecting user data. The other half is displaying it.


### Packages

This is where about 3/4 of the code should go. Abstract as much functionality
 away into packages as possible. Most packages will perform CRUD operations
 on a collection. For those, in general have 3 types of files:

1. `*-save.js` for Create and Update. In general just one one save function
 to handle both create (if no `id` present) or update.
2. `*-get.js` for Read (and mutate as necessary for frontend display use).
3. `*-remove.js` for Delete
4. `*-get-query.js` for abstracted, complicated `Collection.find` calls

In general, try to keep any database calls (`Collection.*`) OUT of packages
 as much as possible, especially for READs. `*-save.js` and `*-remove.js`
 will obviously have to have at least once Collection call each. But try to
 have ZERO database Collection calls for the `*-get.js` files. Instead, do
 the database Collection calls in the Template and then pass in the looked up
 objects to the `*-get.js` functions for mutating, searching, etc.
If there ARE complicated Collection READ calls, put them in a separate
 `*-get-query.js` file. This should keep the majority of package files easy
 to test, as they are completely synchronous and just take in javascript
 arrays and objects and use that to output new arrays and objects.


Notable Packages:

- `may` for checking privileges.
- `constants` (and `lukemadera_config`) for any often used, app wide values.
- `mock-data` for tests


## Testing

Automated testing is THE main way we ensure our code works. Followed secondly
 by Github Pull Requests for manual (human) testing (and code review).

Because Meteor is isomorphic, there's no need for separate frontend and
 backend tests. And because we have basically 2 types of files, templates
 and packages, with the great majority of the functionality in the packages,
 we basically just need to test the packages and add end to end tests for the
 templates.


### Packages (Unit Tests)

Most of the (complicated) code is likely going to be in the `*-get.js` files,
 and these should have NO database Collection calls, so there are pure
 javascript, easy to test files. These should have >=90% code coverage.

The `*-save.js`, `*-remove.js` and `*-get-query.js` files mostly test
 database Collection calls.
TODO - figure out & add testing framework / conventions for this.


### Templates (End to End Tests)

These are arguably the most important tests and should test all "happy paths"
 for a user.
TODO - figure out & add testing framework / conventions for this.
