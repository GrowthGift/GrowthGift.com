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
      if(!game) {
        this.ready();
        return false;
      }
      return GameRulesCollection.find({_id: game.gameRuleId});
    }
    else {
      this.ready();
      return false;
    }
  });
  Meteor.publish('userGames', function(gameSlug) {
    if(gameSlug) {
      var game =GamesCollection.findOne({slug: gameSlug});
      if(!game) {
        this.ready();
        return false;
      }
      return UserGamesCollection.find({ gameId:game._id });
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
        start: moment(game.start, ggConstants.dateTimeFormat).format(ggConstants.dateTimeDisplay),
        shareLink: 'http://'+Config.appInfo().shortDomain+'/g/'+game.slug
      };
      return game;
    },
    data: function() {
      var ret ={
        privileges: {},
        challenges: {
          possibleCompletions: 0,
          selfCompletions: 0
        },
        gameChallengeLink: '',
        userChallengeTotals: {},
        gameUsersLink: ''
      };
      if(!this.gameSlug) {
        return ret;
      }

      var userId =Meteor.userId();
      var game =GamesCollection.findOne({slug: this.gameSlug});

      // Privileges
      var edit =(game && ggMay.editGame(game, userId)) ? true : false;
      ret.privileges ={
        edit: edit,
        editLink: (edit && '/save-game?slug='+game.slug),
        // Show join button if not logged in
        join: (game && (!userId || ggMay.joinGame(game, userId) )) ? true : false,
        leave: (game && ggMay.leaveGame(game, userId) ) ? true : false,
        viewChallenges: (game && ggMay.viewUserGameChallenge(game, userId)) ? true : false
      };

      // Challenge link
      ret.gameChallengeLink ='/gc/'+this.gameSlug;

      // Game users
      var gameRule =GameRulesCollection.findOne({ _id:game.gameRuleId });
      var curChallenge =ggGame.getCurrentChallenge(game, gameRule);
      ret.challenges.possibleCompletions =curChallenge.possibleCompletions;

      // Can only show challenges if user is in game
      if(ret.privileges.leave) {
        var userGameSelf =UserGamesCollection.findOne({ gameId:game._id, userId:Meteor.userId() });
        var userChallengeSelf =ggGame.getCurrentUserChallenge(game._id, Meteor.userId(), userGameSelf);
        ret.challenges.selfCompletions =userChallengeSelf.numCompletions;
      }

      var userGames =UserGamesCollection.find({ gameId:game._id }).fetch();
      ret.userChallengeTotals =ggGame.getChallengeTotals(game, userGames, gameRule);
      ret.userChallengeTotals.numUsersText =(ret.userChallengeTotals.numUsers ===1) ?
       "1 player" : ret.userChallengeTotals.numUsers + " players";

      ret.gameUsersLink =ggUrls.gameUsers(game.slug);

      return ret;
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
    },
    'click .game-input-share-link': function(evt, template) {
      ggDom.inputSelectAll('game-input-share-link');
    }
  });
}