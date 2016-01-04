ggGame.saveInspiration =function(gameId, inspiration) {
  var game =GamesCollection.findOne({ _id: gameId });
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
  if(!inspiration._id) {
    inspiration._id =(Math.random() + 1).toString(36).substring(7);
  }

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

ggGame.likeGameInspiration =function(gameId, inspirationId, userId, callback) {
  var game =GamesCollection.findOne({ _id: gameId });
  var inspirationIndex =( game && game.inspiration ) ?
   _.findIndex(game.inspiration, '_id', inspirationId) : -1;
  var inspiration = ( inspirationIndex > -1 ) ?
   game.inspiration[inspirationIndex] : null;
  if(!game || !inspiration ||
   !ggMay.likeGameInspiration(inspiration, game, userId, null) ) {
    return false;
  }
  var userLike ={
    userId: userId,
    createdAt: msTimezone.curDateTime()
  };
  var modifier ={};
  if( inspiration.likes && inspiration.likes.length ) {
    modifier ={
      $push: {}
    };
    modifier.$push['inspiration.'+inspirationIndex+'.likes'] = userLike;
    inspiration.likes.push(userLike);
  }
  else {
    modifier ={
      $set: {}
    };
    modifier.$set['inspiration.'+inspirationIndex+'.likes'] =[ userLike ];
    inspiration.likes =[ userLike ];
  }
  GamesCollection.update({ _id: gameId }, modifier, function(err, result) {
    callback(err, result, inspiration);
  });
};