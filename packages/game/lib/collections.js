// For tests, we need to define collections. But this needs to be done in
// the NON test environment so we only want to set if it is not already
// defined to distinguish if we are running within a test or not.

// if( typeof TEST_ENV !== "undefined" && TEST_ENV &&
//  ( typeof UserAwardsCollection === "undefined" || !UserAwardsCollection ) ) {
  // console.log('yes - blank collection');
// TODO - even though we do NOT seem to get in this if statement when not
// running tests, if this is NOT commented out, the collection does not work..
// UPDATE: even having the `if` branch breaks the tests even though we were
// getting in it..
// Currently we have to uncomment this for tests and re-comment for non tests
  // UserAwardsCollection =new Meteor.Collection();
// }