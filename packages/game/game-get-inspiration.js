ggGame.promptForNewInspiration =function(game, userId, nowTime) {
  nowTime =nowTime || msTimezone.curDateTime('moment');
  var minutesSpacing = 12 * 60;
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