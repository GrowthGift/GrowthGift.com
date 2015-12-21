Meteor.methods({
  joinGame: function(game, buddyRequestKey, inviteUsername) {
    ggGame.join(game, Meteor.userId(), buddyRequestKey, inviteUsername, function(err, result) {
      if(Meteor.isClient && !err) {
        var templateInst =msTemplate.getMainTemplate("Template.game");
        var slug =templateInst.data.gameSlug;
        if(slug) {
          Router.go(ggUrls.gameInvite(slug));
        }
      }
    });
  },
  leaveGame: function(game) {
    ggGame.leave(game, Meteor.userId(), function(err, result) { });
  },
  saveGameBuddy: function(game, buddyRequestKey) {
    ggGame.saveBuddy(game, Meteor.userId(), buddyRequestKey, function(err, result) {
      if(Meteor.isClient && !err) {
        var templateInst =msTemplate.getMainTemplate("Template.game");
        var slug =templateInst.data.gameSlug;
        if(slug) {
          Router.go(ggUrls.game(slug));
        }
      }
    });
  }
});

if(Meteor.isClient) {
  Template.game.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
    this.display =new ReactiveVar({
      impactDetails: false,
      impactDetailsInfo: false
    });
  };

  Template.game.rendered =function() {
    var signInCallback =Session.get('signInCallback');
    if(signInCallback && signInCallback.action) {
      if(signInCallback.action ==='joinGame') {
        Meteor.call("joinGame", signInCallback.data.game, signInCallback.data.buddy, signInCallback.data.inviteUsername);
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
        start: msUser.toUserTime(Meteor.user(), game.start, null, msTimezone.dateTimeDisplay)
      };

      // TODO - fix this to allow access rules on cordova apps..
      game.xDisplay.img =(game.image && !Meteor.isCordova) ? game.image
       : ggUrls.img('games')+'playful-beach.jpg';

      var userId =Meteor.userId();
      var userGame =userId && UserGamesCollection.findOne({ userId: userId, gameId: game._id })
       || null;
      var selfGameUser =( userId ) ? ggGame.getGameUser(game, userId, {}) : null;
      var buddyId =selfGameUser ? selfGameUser.buddyId : null;
      var userGameBuddy =buddyId ? UserGamesCollection.findOne({ userId: buddyId, gameId: game._id }) : null;

      // Privileges
      var edit =(game && ggMay.editGame(game, userId)) ? true : false;

      var userGames =UserGamesCollection.find({ gameId:game._id }).fetch();
      var gameUsers =ggGame.getGameUsersInfo(userGames);

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
          buddy: ( this.buddy ? ggMay.beGameBuddy(game, userId, this.buddy) : false )
        },
        // challenges: {
        //   possibleCompletions: 0,
        //   selfCompletions: 0
        // },
        // curChallenge: null,
        // gameEndedForUser: false,
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
        display: Template.instance().display.get(),
        userInGame: ( userId ) ? ggGame.userInGame(game, userId) : false
      };

      ret.showHowToPlay =ret.userInGame ? false : true;

      var templateHelperData ={
        challengeInstruction: {
          showChooseBuddy: ( ret.userInGame && !buddyId ) ? true : false,
          showChoosePledge: ( ret.userInGame && !selfGameUser.selfGoal ) ? true : false
        },
        gameChallengeLink: ret.gameChallengeLink,
        gameInviteLink: ret.gameInviteLink
      };
      // Set on template instance so it is accessible.
      Template.instance().data.templateHelperData =templateHelperData;

      if(ret.gameState && ret.gameState.starts && ret.gameState.ends) {
        ret.gameState.starts =msUser.toUserTime(Meteor.user(), ret.gameState.starts, null, msTimezone.dateTimeDisplay);
        ret.gameState.ends =msUser.toUserTime(Meteor.user(), ret.gameState.ends, null, msTimezone.dateTimeDisplay);
      }

      if(ret.challenges && ret.challenges.challenges) {
        ret.challenges.challenges.forEach(function(challenge, index) {
          ret.challenges.challenges[index].timeDisplay = ( !challenge.started) ?
           ( "Starts " + msUser.toUserTime(Meteor.user(), challenge.start, null, 'from') )
           : ( challenge.started && !challenge.ended) ?
           ( "Ends " + msUser.toUserTime(Meteor.user(), challenge.end, null, 'from') )
           : ( "Ended " + msUser.toUserTime(Meteor.user(), challenge.end, null, 'from') );
        });
      }

      ret.userChallengeTotals.numUsersText =(ret.userChallengeTotals.numUsers ===1) ?
       "1 player" : ret.userChallengeTotals.numUsers + " players";

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
            ret.buddyErrorMessage = ( selfGameUser && selfGameUser.buddyId ) ?
             "You already have a buddy" : ( selfGameUser && selfGameUser.userId ===
             buddyUser.userId ) ? "You may not buddy with yourself" :
             "Buddy taken. " + ( userId ? "Invite" : "Join to invite" ) +
             " another one!";
          }
        }
        // If were trying to buddy but cannot, output why
        else {
          ret.buddyErrorMessage ="No buddy found. Please check your link.";
        }
      }

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
            buddy: this.buddy,
            inviteUsername: this.inviteUsername
          }
        });
        Router.go('signup');
      }
      else {
        Meteor.call('joinGame', game, this.buddy, this.inviteUsername);
      }
    },
    'click .game-leave': function(evt, template) {
      var game =GamesCollection.findOne({slug: this.gameSlug});
      Meteor.call('leaveGame', game);
    },
    'click .game-buddy': function(evt, template) {
      var game =GamesCollection.findOne({slug: this.gameSlug});
      Meteor.call('saveGameBuddy', game, this.buddy);
    },
    'click .game-impact-details-btn': function(evt, template) {
      var display =template.display.get();
      display.impactDetails =!display.impactDetails;
      template.display.set(display);
    },
    'click .game-impact-details-info-btn': function(evt, template) {
      var display =template.display.get();
      display.impactDetailsInfo =!display.impactDetailsInfo;
      template.display.set(display);
    }
  });
}