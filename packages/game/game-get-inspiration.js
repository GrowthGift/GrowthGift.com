ggGame.promptForNewInspiration =function(game, userId, nowTime) {
  nowTime =nowTime || msTimezone.curDateTime('moment');
  var minutesSpacing = 12 * 60;
  minutesSpacing =0;    // TESTING
  var mostRecentInspiration =ggGame.getMostRecentInspiration(game);
  if(!mostRecentInspiration) {
    return true;
  }
  var lastInspirationTime =moment(mostRecentInspiration.createdAt,
   msTimezone.dateTimeFormat);
  // If over time limit since last one AND not the same user, prompt.
  if( nowTime.diff(lastInspirationTime, 'minutes') >= minutesSpacing &&
   ( !userId || mostRecentInspiration.userId !== userId) ) {
    return true;
  }
  return false;
};

ggGame.getMostRecentInspiration =function(game) {
  if(!game || !game.inspiration || !game.inspiration.length) {
    return null;
  }
  // Assume in order so last is the most recent
  return game.inspiration[(game.inspiration.length - 1)];
};

/**
Will return most recent OR most liked IF game over.
*/
ggGame.getCurrentInspiration =function(game, nowTime) {
  if(!game || !game.inspiration || !game.inspiration.length) {
    return null;
  }
  nowTime =nowTime || msTimezone.curDateTime('moment');
  var nowTimeFormat =nowTime.format(msTimezone.dateTimeFormat);
  if( game.end <= nowTimeFormat) {
    return _ggGame.getMostLikedInspiration(game);
  }
  else {
    return ggGame.getMostRecentInspiration(game);
  }
};

_ggGame.getMostLikedInspiration =function(game) {
  var mostLikes = {
    amount: 0,
    index: -1
  };
  game.inspiration.forEach(function(inspiration, index) {
    if( inspiration.likes && inspiration.likes.length > mostLikes.amount ) {
      mostLikes ={
        amount: inspiration.likes.length,
        index: index
      };
    }
  });
  if(mostLikes.index < 0) {
    return null;
  }
  return game.inspiration[mostLikes.index];
};