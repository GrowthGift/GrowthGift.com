if(Meteor.isClient) {
  function formatUsers(users, sortKeys, sortOrders) {
    users.forEach(function(user) {
      if(user) {
        user.xDisplay ={
          user1: {
            href: ( user.user1.username ) ? ggUrls.user(user.user1.username) : ''
          },
          user2: {
            href: ( user.user2.username ) ? ggUrls.user(user.user2.username) : ''
          },
          displayHtml: null,
          classes: {
            row: ''
          }
        };
        if(user.user1._id && user.user2._id) {
          // user.xDisplay.displayHtml ='<a href=' + user.xDisplay.user1.href +
          //  '>' + ggUser.getName(user.user1) + '</a> & <a href=' +
          //  user.xDisplay.user2.href + '>' + ggUser.getName(user.user2) + '</a>';
          user.xDisplay.displayHtml = ggUser.getName(user.user1) + ' & ' + ggUser.getName(user.user2);
        }
        else if(user.user1._id) {
          // user.xDisplay.displayHtml ='*<a href=' + user.xDisplay.user1.href
          //  + '>' + ggUser.getName(user.user1) + '</a>';
          user.xDisplay.displayHtml ='*' + ggUser.getName(user.user1);
          if(user.user1._id ===Meteor.userId()) {
            user.xDisplay.classes.row ='self';
          }
        }
        else if(user.user2._id) {
          // user.xDisplay.displayHtml ='*<a href=' + user.xDisplay.user2.href
          //  + '>' + ggUser.getName(user.user2) + '</a>';
          user.xDisplay.displayHtml ='*' + ggUser.getName(user.user2);
          if(user.user2._id ===Meteor.userId()) {
            user.xDisplay.classes.row ='self';
          }
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
    this.inited =false;
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
      if(!game || !gameRule || !userGames) {
        return {
          _xNotFound: true,
          _xHref: ggUrls.myGames()
        };
      }

      var gameUsers =ggGame.getGameUsersInfo(userGames);
      var users;
      var reactiveUsers =Template.instance().users.get();
      if(!Template.instance().inited) {
        Template.instance().inited =true;
        users =ggGame.getGameUsersStats(userGames, game, gameUsers, gameRule, null);
        users =formatUsers(users, ['buddiedPledgePercent'], ['desc']);
        Template.instance().users.set(users);
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
      users =_.sortByOrder(users, ['buddiedReachTeamsNumActions'], ['desc']);
      template.users.set(users);
    },
    'click .game-users-info-btn': function(evt, template) {
      var display =template.display.get();
      display.info =!display.info;
      template.display.set(display);
    }
  });
}