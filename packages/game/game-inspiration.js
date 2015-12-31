ggGame.saveInspiration =function(gameId, inspiration) {
  var game =GamesCollection.findOne({ _id: gameId }, { fields: { inspiration:1 } });
  if(!game) {
    return false;
  }
  
  // If no content, try to set it from type
  if(!inspiration.content && inspiration[inspiration.type]) {
    inspiration.content = inspiration[inspiration.type];
    var types =['video', 'image', 'quote'];
    types.forEach(function(type) {
      if(inspiration[type]) {
        delete inspiration[type];
      }
    });
  }
  inspiration.createdAt =msTimezone.curDateTime();

  var modifier ={};
  if(!game.inspiration || !game.inspiration.length) {
    modifier ={
      $set: {
        inspiration: [ inspiration ]
      }
    };
  }
  else {
    modifier ={
      $push: {
        inspiration: inspiration
      }
    };
  }

  GamesCollection.update({ _id: gameId }, modifier, function(err, result) {});
};