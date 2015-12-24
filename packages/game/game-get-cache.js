/**
@param {Object} _ggGame.cache
  @param {String} loadedAt The last load timestamp to check if stale.
  @param {Object|Array} data
*/
_ggGame.cache ={};
_ggGame.cacheTime =2;   // Minutes

ggGame.clearCache =function(key) {
  if(_ggGame.cache[key]) {
    delete _ggGame.cache[key];
  }
};

ggGame.cacheClearAll =function() {
  var cc;
  for(cc in _ggGame.cache) {
    delete _ggGame.cache[cc];
  }
};

ggGame.hasCache =function(key) {
  // First check cache
  var timestampMoment =msTimezone.curDateTime('moment');
  var dtFormat =msTimezone.dateTimeFormat;
  // If we have a cache for this key AND it's NOT stale, just use cache.
  if(_ggGame.cache[key]) {
    if(moment(_ggGame.cache[key].loadedAt, dtFormat).add(_ggGame.cacheTime, 'minutes')
     > timestampMoment ) {
      return _ggGame.cache[key].data;
    }
    else {
      delete _ggGame.cache[key];
    }
  }
  return null;
};

ggGame.getCacheGameByUser =function(key, userId, user, game, gameRule,
 userGame, userGames, userGameBuddy, buddyUser, buddyGameUser, templateData, dataReady) {
  var ret =ggGame.hasCache(key);
  if(ret) {
    return ret;
  }

  // if(!game || !gameRule) {
  if(!dataReady || !game || !gameRule || game.users.length !== userGames.length) {
    return {};
  }
  var timestamp =msTimezone.curDateTime();

  game.xHref ={
    gameRule: '/gr/'+gameRule.slug,
    gameRuleText: gameRule.slug
  };
  game.xDisplay ={
    start: msUser.toUserTime(user, game.start, null, msTimezone.dateTimeDisplay)
  };

  // TODO - fix this to allow access rules on cordova apps..
  game.xDisplay.img =(game.image && !Meteor.isCordova) ? game.image
   : ggUrls.img('games')+'playful-beach.jpg';

  // Privileges
  var edit =(game && ggMay.editGame(game, userId)) ? true : false;

  var gameUsers =ggGame.getGameUsersInfo(userGames);

  ret ={
    game: game,
    gameRule: gameRule,
    privileges: {
      edit: edit,
      editLink: (edit && '/save-game?slug='+game.slug),
      // Show join button if not logged in
      join: (game && (!userId || ggMay.joinGame(game, userId) )) ? true : false,
      leave: (game && ggMay.leaveGame(game, userId) ) ? true : false,
      viewChallenges: (game && ggMay.viewUserGameChallenge(game, userId)) ? true : false,
      addChallenge: false,
      buddy: ( templateData.buddy ? ggMay.beGameBuddy(game, userId, templateData.buddy) : false )
    },
    challenges: ggGame.getChallengesWithUser(game, gameRule, userGame, null, userGameBuddy),
    gameState: ggGame.getGameState(game, gameRule, null),
    userChallengeTotals: ggGame.getChallengeTotals(game, userGames, gameRule),
    gameUserStats: ggGame.getGameUserStats(userGames, game, gameUsers, gameRule, userId, null),
    gameUsersLink: ggUrls.gameUsers(game.slug),
    gameChallengeLink: ggUrls.gameChallenge(game.slug),
    gameInviteLink: ggUrls.gameInvite(game.slug),
    myGamesLink: ggUrls.myGames(),
    buddyName: null,
    buddyErrorMessage: null,
    userInGame: ( userId ) ? ggGame.userInGame(game, userId) : false,
    awards: ggGame.getAwards(userGames, game, gameUsers, gameRule, null)
  };

  ret.showHowToPlay =ret.userInGame ? false : true;
  ret.showImpact = ( ret.userInGame && ret.gameState.gameStarted ) ? true : false;

  if(ret.gameState && ret.gameState.starts && ret.gameState.ends) {
    ret.gameState.starts =msUser.toUserTime(user, ret.gameState.starts, null, msTimezone.dateTimeDisplay);
    ret.gameState.ends =msUser.toUserTime(user, ret.gameState.ends, null, msTimezone.dateTimeDisplay);
  }

  if(ret.challenges && ret.challenges.challenges) {
    ret.challenges.challenges.forEach(function(challenge, index) {
      ret.challenges.challenges[index].timeDisplay = ( !challenge.started) ?
       ( "Starts " + msUser.toUserTime(user, challenge.start, null, 'from') )
       : ( challenge.started && !challenge.ended) ?
       ( "Ends " + msUser.toUserTime(user, challenge.end, null, 'from') )
       : ( "Ended " + msUser.toUserTime(user, challenge.end, null, 'from') );
    });
  }

  ret.userChallengeTotals.numUsersText =(ret.userChallengeTotals.numUsers ===1) ?
   "1 player" : ret.userChallengeTotals.numUsers + " players";

  if(templateData.buddy) {
    if(buddyGameUser) {
      if(buddyUser) {
        ret.buddyName =buddyUser.profile.name;
      }
      // If were trying to buddy but cannot, output why
      if(!ret.privileges.buddy) {
        ret.buddyErrorMessage = ( selfGameUser && selfGameUser.buddyId ) ?
         "You already have a buddy" : ( selfGameUser && selfGameUser.userId ===
         buddyGameUser.userId ) ? "You may not buddy with yourself" :
         "Buddy taken. " + ( userId ? "Invite" : "Join to invite" ) +
         " another one!";
      }
    }
    // If were trying to buddy but cannot, output why
    else {
      ret.buddyErrorMessage ="No buddy found. Please check your link.";
    }
  }

  // Save in cache for next time.
  _ggGame.cache[key] ={
    data: ret,
    loadedAt: timestamp
  };
  return ret;
};