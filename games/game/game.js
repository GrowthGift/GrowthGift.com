Meteor.methods({
  joinGame: function(game) {
    ggGame.join(game, Meteor.userId(), function(err, result) { });
  },
  leaveGame: function(game) {
    ggGame.leave(game, Meteor.userId(), function(err, result) { });
  }
});

if(Meteor.isServer) {
  Meteor.publish('current-game', function(gameSlug) {
    return GamesCollection.find({slug: gameSlug});
  });
  Meteor.publish('gameRule', function(gameSlug) {
    if(gameSlug) {
      var game =GamesCollection.findOne({slug: gameSlug});
      return GameRulesCollection.find({_id: game.gameRuleId});
    }
    else {
      this.ready();
      return false;
    }
  });
  Meteor.publish('userGame', function(gameSlug) {
    if(gameSlug && this.userId) {
      var game =GamesCollection.findOne({slug: gameSlug});
      return UserGamesCollection.find({ gameId:game._id, userId:this.userId });
    }
    else {
      this.ready();
      return false;
    }
  });
}

if(Meteor.isClient) {
  Template.game.rendered =function() {
    var signInCallback =Session.get('signInCallback');
    if(signInCallback && signInCallback.action) {
      if(signInCallback.action ==='joinGame') {
        Meteor.call("joinGame", signInCallback.data.game);
      }
      //unset for future
      Session.set('signInCallback', false);
    }
  };

  Template.game.helpers({
    game: function() {
      var game =(this.gameSlug && GamesCollection.findOne({slug: this.gameSlug}))
       || null;
      if(!game) {
        if(this.gameSlug) {
          nrAlert.alert("No game rule with slug "+this.gameSlug);
        }
        Router.go('myGames');
        return {};
      }
      var gameRule =GameRulesCollection.findOne({_id: game.gameRuleId});
      game.xHref ={
        gameRule: '/gr/'+gameRule.slug,
        gameRuleText: gameRule.slug
      };
      game.xDisplay ={
        start: moment(game.start, ggConstants.dateTimeFormat).format(ggConstants.dateTimeDisplay)
      };
      return game;
    },
    privileges: function() {
      if(!this.gameSlug) {
        return {};
      }
      var userId =Meteor.userId();
      var game =GamesCollection.findOne({slug: this.gameSlug});
      var edit =(game && ggMay.editGame(game, userId)) ? true : false;
      return {
        edit: edit,
        editLink: (edit && '/save-game?'+game.slug),
        // Show join button if not logged in
        join: (game && (!userId || ggMay.joinGame(game, userId) )) ? true : false,
        leave: (game && ggMay.leaveGame(game, userId) ) ? true : false
      };
    }
  });

  Template.game.events({
    'click .game-join': function(evt, template) {
      var game =GamesCollection.findOne({slug: this.gameSlug});
      //if no user, save data in a session variable and redirect to signup
      if(!Meteor.userId()) {
        Session.set('signInCallback', {
          url: 'g/'+game.slug,
          action: 'joinGame',
          data: {
            game: game
          }
        });
        Router.go('signup');
      }
      else {
        Meteor.call('joinGame', game);
      }
    },
    'click .game-leave': function(evt, template) {
      var game =GamesCollection.findOne({slug: this.gameSlug});
      Meteor.call('leaveGame', game);
    }
  });
}