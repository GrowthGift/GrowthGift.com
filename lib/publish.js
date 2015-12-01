if(Meteor.isServer) {
  
  Meteor.publish('users-game-slug', function(gameSlug) {
    var game =(gameSlug && GamesCollection.findOne({slug: gameSlug})) || null;
    var userGames =(game && UserGamesCollection.find({ gameId:game._id }).fetch())
     || null;
    if(game && userGames) {
      var userIds =[];
      userGames.forEach(function(user) {
        userIds.push(user.userId);
      });
      // console.info('users-game-slug: ', Meteor.users.find({ _id: { $in:userIds } }, { fields: { profile:1 } }).fetch());
      return Meteor.users.find({ _id: { $in:userIds } }, { fields: { profile:1 } });
    }
    else {
      this.ready();
      return false;
    }
  });

}