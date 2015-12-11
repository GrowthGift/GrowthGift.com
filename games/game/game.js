Meteor.methods({
  joinGame: function(game, buddyRequestKey) {
    ggGame.join(game, Meteor.userId(), buddyRequestKey, function(err, result) {
      if(Meteor.isClient) {
        if(!err && result) {
          var templateInst =ggTemplate.getMainTemplate("Template.game");
          var slug =templateInst.data.gameSlug;
          if(slug) {
            Router.go(ggUrls.gameInvite(slug));
          }
        }
      }
    });
  },
  leaveGame: function(game) {
    ggGame.leave(game, Meteor.userId(), function(err, result) { });
  }
});

if(Meteor.isClient) {
  Template.game.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
  };

  Template.game.rendered =function() {
    var signInCallback =Session.get('signInCallback');
    if(signInCallback && signInCallback.action) {
      if(signInCallback.action ==='joinGame') {
        Meteor.call("joinGame", signInCallback.data.game, signInCallback.data.buddy);
      }
      //unset for future
      Session.set('signInCallback', false);
    }
  };

  Template.game.helpers({
    data: function() {
      var game =(this.gameSlug && GamesCollection.findOne({slug: this.gameSlug}))
       || null;
      var gameRule =(game && GameRulesCollection.findOne({_id: game.gameRuleId}) )
       || null;
      if(!game || !gameRule) {
        if(this.gameSlug) {
          // Game does not exist (or has not loaded yet).
          return {
            _xNotFound: true,
            _xHref: ggUrls.myGames()
          };
        }
        Router.go('myGames');
        return false;
      }
      game.xHref ={
        gameRule: '/gr/'+gameRule.slug,
        gameRuleText: gameRule.slug
      };
      game.xDisplay ={
        start: moment(game.start, ggConstants.dateTimeFormat).format(ggConstants.dateTimeDisplay)
      };

      // TODO - fix this to allow access rules on cordova apps..
      game.xDisplay.img =(game.image && !Meteor.isCordova) ? game.image
       : ggUrls.img('games')+'playful-beach.jpg';

      var userId =Meteor.userId();
      var userGame =userId && UserGamesCollection.findOne({ userId: userId, gameId: game._id })
       || null;
      // Privileges
      var edit =(game && ggMay.editGame(game, userId)) ? true : false;

      var ret ={
        game: game,
        gameRule: gameRule,
        privileges: {
          edit: edit,
          editLink: (edit && '/save-game?slug='+game.slug),
          // Show join button if not logged in
          join: (game && (!userId || ggMay.joinGame(game, userId) )) ? true : false,
          leave: (game && ggMay.leaveGame(game, userId) ) ? true : false,
          viewPlayers: (game && userId) ? true : false,
          viewChallenges: (game && ggMay.viewUserGameChallenge(game, userId)) ? true : false,
          addChallenge: false,
          buddy: ( this.buddy ? ggMay.beGameBuddy(game, null, this.buddy) : false )
        },
        // challenges: {
        //   possibleCompletions: 0,
        //   selfCompletions: 0
        // },
        // curChallenge: null,
        // gameEndedForUser: false,
        challenges: ggGame.getChallengesWithUser(game, gameRule, userGame, null),
        userChallengeTotals: {},
        gameUsersLink: ggUrls.gameUsers(game.slug),
        gameChallengeLink: ggUrls.gameChallenge(game.slug),
        gameInviteLink: ggUrls.gameInvite(game.slug),
        buddyName: null,
        buddyErrorMessage: null
      };

      if(this.buddy) {
        // Look up buddy name
        var buddyUser =ggGame.getGameUser(game, null, { buddyRequestKey: this.buddy });
        if(buddyUser) {
          var user =Meteor.users.findOne({ _id: buddyUser.userId }, { fields: { profile:1, username:1 } });
          if(user) {
            ret.buddyName =user.profile.name;
          }
          // If were trying to buddy but cannot, output why
          if(!ret.privileges.buddy) {
            ret.buddyErrorMessage ="Buddy taken. Join to invite another one!";
          }
        }
        // If were trying to buddy but cannot, output why
        else {
          ret.buddyErrorMessage ="No buddy found. Please check your link.";
        }
      }

      // // Game users
      // ret.curChallenge =ggGame.getCurrentChallenge(game, gameRule);
      // if(ret.curChallenge.nextChallenge) {
      //   ret.curChallenge.nextChallenge.xDisplay ={
      //     start: moment(ret.curChallenge.nextChallenge.start, ggConstants.dateTimeFormat).fromNow()
      //   }
      // }
      // if(ret.curChallenge.currentChallenge) {
      //   ret.curChallenge.currentChallenge.xDisplay ={
      //     end: moment(ret.curChallenge.currentChallenge.end, ggConstants.dateTimeFormat).fromNow()
      //   };
      // }
      // ret.challenges.possibleCompletions =ret.curChallenge.possibleCompletions;

      // // Can only show challenges if user is in game
      // if(ret.privileges.viewChallenges) {
      //   var userGameSelf =UserGamesCollection.findOne({ gameId:game._id, userId:Meteor.userId() });
      //   var userChallengeSelf =ggGame.getCurrentUserChallenge(game._id, Meteor.userId(), userGameSelf);
      //   ret.challenges.selfCompletions =userChallengeSelf.numCompletions;
      //   ret.privileges.addChallenge =(ggMay.addUserGameChallenge(game, Meteor.userId(), userGameSelf, gameRule) )
      //    ? true : false;
      // }

      // ret.gameEndedForUser =( ret.curChallenge.gameEnded || (ret.privileges.viewChallenges && !ret.privileges.addChallenge) )
      //  ? true : false;

      var userGames =UserGamesCollection.find({ gameId:game._id }).fetch();
      ret.userChallengeTotals =ggGame.getChallengeTotals(game, userGames, gameRule);
      ret.userChallengeTotals.numUsersText =(ret.userChallengeTotals.numUsers ===1) ?
       "1 player" : ret.userChallengeTotals.numUsers + " players";

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
            game: game,
            buddy: this.buddy
          }
        });
        Router.go('signup');
      }
      else {
        Meteor.call('joinGame', game, this.buddy);
      }
    },
    'click .game-leave': function(evt, template) {
      var game =GamesCollection.findOne({slug: this.gameSlug});
      Meteor.call('leaveGame', game);
    }
  });

  Template.gameChallengesUser.helpers({
    data: function() {
      return {
        gameChallengeLink: ggUrls.gameChallenge(this.gameSlug),
      }
    }
  });
}