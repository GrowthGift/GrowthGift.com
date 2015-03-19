Auth ={};

/**
Checks if user has privileges to view this page (i.e. logged in, member status)
@toc 5.
@method checkAuth
@param {Object} params
  @param {Object} [auth] Object of objects; each key is an authorization required for this page and has a 'redirect' key inside it that tells which page to send the user to if they do NOT meet this authorization and thus aren't allowed to view this page
    @param {Object} [loggedIn] Add this key to require the user to be logged in to view this page. NOTE: the default redirect page is 'login' so this value does NOT need to be set if you want to just use the default.
@return {Boolean} True if allowed to view this page
@example
  checkAuth({});
  
  checkAuth(
    {
      auth: {
        loggedIn: {
          exceptionUrlParamsRegex: {
            p1: '.*'    //will match anything so as long as 'p1' URL param is present, will be allowed, even if not logged in
          }
        }    //require user to be logged in to view this page
      }
    }
  );
*/
Auth.checkAuth =function(params) {
  var ret ={valid: true, redirectPage:''};
  if(params.auth !==undefined) {
    //order matters here - check the most stringent first
    if(ret.valid && params.auth.loggedIn !==undefined && !(Meteor.loggingIn() || Meteor.user())) {
      //since NOT logged in, not authorized to view this page
      ret.valid =false;
      //search through the exception url params - if a match, ALLOW this page
      /*
      if(params.auth.loggedIn.exceptionUrlParamsRegex !==undefined) {   //check regex exceptions as well
        //if exception match found, this page is VALID
        ret.valid =this.checkUrlParams(params.auth.loggedIn.exceptionUrlParamsRegex, {});
      }
      */
      if(!ret.valid) {
        if(params.auth.loggedIn.redirect ===undefined) {
          params.auth.loggedIn.redirect ='login';   //default
        }
        ret.redirectPage =params.auth.loggedIn.redirect;
      }
    }
  }
  return ret;
};
