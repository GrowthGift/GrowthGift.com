Meteor.methods({
  joinGame: function(game, buddyRequestKey, inviteUsername) {
    ggGame.join(game, Meteor.userId(), buddyRequestKey, inviteUsername, function(err, result) {
      if(Meteor.isClient && !err) {
        var templateInst =msTemplate.getMainTemplate("Template.game");
        var slug =templateInst.data.gameSlug;
        // Need to clear cache
        var cacheKey ='game_slug_'+slug+'_user_id_'+Meteor.userId();
        ggGame.clearCache(cacheKey);
        if(slug) {
          Router.go(ggUrls.gameInvite(slug));
        }
      }
    });
  },
  leaveGame: function(game) {
    ggGame.leave(game, Meteor.userId(), function(err, result) {
      if(Meteor.isClient && !err) {
        var templateInst =msTemplate.getMainTemplate("Template.game");
        var slug =templateInst.data.gameSlug;
        // Need to clear cache
        var cacheKey ='game_slug_'+slug+'_user_id_'+Meteor.userId();
        ggGame.clearCache(cacheKey);
        // Trigger reload of data
        templateInst.dataLoaded.set(false);
      }
    });
  },
  saveGameBuddy: function(game, buddyRequestKey) {
    ggGame.saveBuddy(game, Meteor.userId(), buddyRequestKey, function(err, result) {
      if(Meteor.isClient && !err) {
        var templateInst =msTemplate.getMainTemplate("Template.game");
        var slug =templateInst.data.gameSlug;
        // Need to clear cache
        var cacheKey ='game_slug_'+slug+'_user_id_'+Meteor.userId();
        ggGame.clearCache(cacheKey);
        // Since the same URL, the template destroyed & created do not
        // appear to be fired so we do a partial refresh manually.
        // refreshTemplate(templateInst);
        Router.go(ggUrls.game(slug));
        // TODO - figure out a better way to do this than a page reload..
        // Without this, the templateHelperData is blank in the DOM, even
        // though it is defined in javascript console logging..
        document.location.reload(true);
      }
    });
  }
});

if(Meteor.isClient) {
  function getTemplateData(ret, templateData, templateInst) {
    var selfGameUser =( Meteor.userId() && ret.game ) ? ggGame.getGameUser(ret.game, Meteor.userId(), {}) : null;
    var buddyId =selfGameUser ? selfGameUser.buddyId : null;

    var templateHelperData ={
      challengeInstruction: {
        showChooseBuddy: ( ret.userInGame && !buddyId ) ? true : false,
        showChoosePledge: ( ret.userInGame && !selfGameUser.selfGoal ) ? true : false
      },
      gameChallengeLink: ret.gameChallengeLink,
      gameInviteLink: ret.gameInviteLink,
      links: ret.links,
      awards: ret.awards,
      gameState: ret.gameState,
      gameMainAction: ret.gameRule.mainAction,
      game: ret.game
    };
    // Set on template instance so it is accessible.
    templateInst.data.templateHelperData =templateHelperData;

    return ret;
  }

  function getData(templateData, templateInst) {
    var dataLoaded = templateInst.dataLoaded.get();
    var dataReady =templateInst.dataReady.get();
    var userId =Meteor.userId();
    var cacheKey ='game_slug_'+templateData.gameSlug+'_user_id_'+userId;
    var ret;
    if(dataLoaded) {
      return ggGame.hasCache(cacheKey);
    }
    // Check cache
    ret = ggGame.hasCache(cacheKey);
    if(ret) {
      templateInst.dataLoaded.set(true);
      return getTemplateData(ret, templateData, templateInst);
    }

    var game =(templateData.gameSlug && GamesCollection.findOne({slug: templateData.gameSlug}))
     || null;
    var gameRule =(game && GameRulesCollection.findOne({_id: game.gameRuleId}) )
     || null;
    var userGame =(game && userId &&
     UserGamesCollection.findOne({ userId: userId, gameId: game._id }) )
     || null;
    var userGames =(game && UserGamesCollection.find({ gameId:game._id }).fetch() ) || null;

    var selfGameUser =( userId && game ) ? ggGame.getGameUser(game, userId, {}) : null;
    var buddyId =selfGameUser ? selfGameUser.buddyId : null;
    var userGameBuddy =( buddyId && game ) ?
     UserGamesCollection.findOne({ userId: buddyId, gameId: game._id }) : null;

    var buddyGameUser;
    if(templateData.buddy) {
      // Look up buddy name
      buddyGameUser =game ? ggGame.getGameUser(game, null,
       { buddyRequestKey: templateData.buddy }) : null;
      if(buddyGameUser) {
        var buddyUser =Meteor.users.findOne({ _id: buddyGameUser.userId },
         { fields: { profile:1, username:1 } });
      }
    }

    ret =ggGame.getCacheGameByUser(cacheKey, userId,
     Meteor.user(), game, gameRule, userGame, userGames, userGameBuddy,
     buddyUser, buddyGameUser, templateData, dataReady);

    if(!ret.game) {
      // Game does not exist (or has not loaded yet).
      return {
        _xNotFound: true,
        _xHref: ggUrls.myGames()
      };
    }
    // Set to true since may be using cache.
    templateInst.dataLoaded.set(true);
    templateInst.dataReady.set(true);

    ret =getTemplateData(ret, templateData, templateInst);

    return ret;
  }

  function initTemplate(templateInst) {
    refreshTemplate(templateInst);
    templateInst.dataReady = new ReactiveVar(false);
  }

  function refreshTemplate(templateInst) {
    templateInst.dataLoaded = new ReactiveVar(false);
    templateInst.display =new ReactiveVar({
      impactDetails: false,
      impactDetailsInfo: false
    });
    templateInst.data.templateHelperData =null;
  }

  Template.game.created =function() {
    initTemplate(this);
    self = this;
    Meteor.subscribe('game', Template.instance().data.gameSlug, {
      onReady: function() { self.dataReady.set(true); }
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

  Template.game.destroyed =function() {
    initTemplate(this);
  };

  Template.game.helpers({
    data: function() {
      if(!this.gameSlug) {
        Router.go('myGames');
        return false;
      }
      return getData(this, Template.instance());
    },
    display: function() {
      return Template.instance().display.get();
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