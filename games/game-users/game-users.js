if(Meteor.isClient) {
  function formatUsers(users, sortKeys, sortOrders, showBuddyButton, gameSlug) {
    users.forEach(function(user) {
      if(user) {
        var isSelf =( ( user.user1._id && user.user1._id === Meteor.userId() ) ||
         ( user.user2._id && user.user2._id === Meteor.userId() ) )
         ? true : false;
        user.xDisplay ={
          user1: {
            // href: ( user.user1.username ) ? ggUrls.user(user.user1.username) : ''
            href: ( user.user1.username ) ?
             ggUrls.gameChallengeLog(gameSlug, user.user1.username) : ''
          },
          user2: {
            // href: ( user.user2.username ) ? ggUrls.user(user.user2.username) : ''
            href: ( user.user2.username ) ?
             ggUrls.gameChallengeLog(gameSlug, user.user2.username) : ''
          },
          displayHtml: null,
          buddyLink: null,
          classes: {
            row: isSelf ? 'self' : ''
          },
          // Would do number of stars but for use with #each, needs to be an
          // array. The values do not matter; just the length of the array.
          pledgeStars: ( user.buddiedPledgePercent >=100 ) ? [1,1,1,1,1] :
           ( user.buddiedPledgePercent >=90 ) ? [1,1,1,1] :
           ( user.buddiedPledgePercent >=75 ) ? [1,1,1] :
           ( user.buddiedPledgePercent >=50 ) ? [1,1] :
           ( user.buddiedPledgePercent >=20 ) ? [1] : [],
          pledgeHalfStar: ( user.buddiedPledgePercent > 0 &&
           user.buddiedPledgePercent <20 ) ? true : false
        };
        if(user.user1._id && user.user2._id) {
          user.xDisplay.displayHtml ='<a href=' + user.xDisplay.user1.href +
           '>' + msUser.getName(user.user1) + '</a> & <a href=' +
           user.xDisplay.user2.href + '>' + msUser.getName(user.user2) + '</a>';
          // user.xDisplay.displayHtml = msUser.getName(user.user1) + ' & ' + msUser.getName(user.user2);
        }
        else if(user.user1._id) {
          user.xDisplay.displayHtml ='*<a href=' + user.xDisplay.user1.href
           + '>' + msUser.getName(user.user1) + '</a>';
          // user.xDisplay.displayHtml ='*' + msUser.getName(user.user1);
          user.xDisplay.buddyLink = ( showBuddyButton && !isSelf ) ?
           ggUrls.gameUserBuddyRequest(gameSlug, user.user1.username) : null;
        }
        else if(user.user2._id) {
          user.xDisplay.displayHtml ='*<a href=' + user.xDisplay.user2.href
           + '>' + msUser.getName(user.user2) + '</a>';
          // user.xDisplay.displayHtml ='*' + msUser.getName(user.user2);
          user.xDisplay.buddyLink = ( showBuddyButton && !isSelf ) ?
           ggUrls.gameUserBuddyRequest(gameSlug, user.user2.username) : null;
        }
      }
    });
    if(sortKeys && sortOrders) {
      users =_.sortByOrder(users, sortKeys, sortOrders);
    }
    return users;
  }

  Template.gameUsers.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
    this.users = new ReactiveVar([]);
    this.display = new ReactiveVar({
      info: false
    });
    // We will track when to get updates in the reactive var by when the
    // game users array length changes
    this.dataLoaded ={
      gameUsersLength: 0,
      gameUsersInfoLength: 0,
      userGamesLength: 0
    };
  };

  Template.gameUsers.helpers({
    data: function() {
      if(!this.gameSlug) {
        Router.go('myGames');
        return false;
      }
      var game =GamesCollection.findOne({slug: this.gameSlug});
      var gameRule =(game && GameRulesCollection.findOne({ _id:game.gameRuleId }) )
       || null;
      var userGames =(game && UserGamesCollection.find({ gameId:game._id }).fetch() ) || null;
      var gameUsers =ggGame.getGameUsersInfo(userGames);

      var userId = Meteor.userId();
      var gameUser =( game && userId ) ? ggGame.getGameUser(game, userId)
       : null;
      var user =( userId ) ? Meteor.users.findOne({ _id: userId },
       { fields: { profile:1, username:1 } }) : null;

      // Have to wait until all users are loaded, which is when the game.users
      // array length matches the the userGames length.
      if(!game || !gameRule || !userGames || !userGames.length || !gameUsers
       || !gameUsers.length) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var showBuddyButton = ggMay.requestGameBuddy(game, userId, null);

      var users;
      var reactiveUsers =Template.instance().users.get();
      var dataLoaded =Template.instance().dataLoaded;
      if(dataLoaded.gameUsersLength !==game.users.length ||
       dataLoaded.gameUsersInfoLength !==gameUsers.length ||
       dataLoaded.userGamesLength !==userGames.length) {
        users =ggGame.getGameUsersStats(userGames, game, gameUsers, gameRule, null);
        users =formatUsers(users, ['buddiedPledgePercent'], ['desc'],
         showBuddyButton, game.slug);
        Template.instance().users.set(users);
        // update for next time
        Template.instance().dataLoaded.gameUsersLength =game.users.length;
        Template.instance().dataLoaded.gameUsersInfoLength =gameUsers.length;
        Template.instance().dataLoaded.userGamesLength =userGames.length;
      }
      else {
        users =Template.instance().users.get();
      }
      return {
        game: game,
        gameRule: gameRule,
        gameLink: ggUrls.game(this.gameSlug),
        // Get game challenge completions possible
        gameChallenge: ggGame.getCurrentChallenge(game, gameRule),
        users: users,
        challengeTotals: ggGame.getChallengeTotals(game, userGames, gameRule, null),
        display: Template.instance().display.get()
      };
    }
  });

  Template.gameUsers.events({
    'click .game-users-header-buddy': function(evt, template) {
      var users =template.users.get();
      users =_.sortByOrder(users, ['xDisplay.displayHtml'], ['asc']);
      template.users.set(users);
    },
    'click .game-users-header-pledge': function(evt, template) {
      var users =template.users.get();
      users =_.sortByOrder(users, ['buddiedPledgePercent'], ['desc']);
      template.users.set(users);
    },
    'click .game-users-header-impact': function(evt, template) {
      var users =template.users.get();
      // users =_.sortByOrder(users, ['buddiedReachTeamsNumActions'], ['desc']);
      users =_.sortByOrder(users, ['buddiedTeamSize'], ['desc']);
      template.users.set(users);
    },
    'click .game-users-header-completions': function(evt, template) {
      var users =template.users.get();
      users =_.sortByOrder(users, ['buddiedCompletionPercent'], ['desc']);
      template.users.set(users);
    },
    'click .game-users-info-btn': function(evt, template) {
      var display =template.display.get();
      display.info =!display.info;
      template.display.set(display);
    }
  });
}