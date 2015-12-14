if(Meteor.isClient) {
  Template.gameUsers.created =function() {
    Meteor.subscribe('game', Template.instance().data.gameSlug);
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
      var users =ggGame.getGameUsersStats(userGames, game, gameUsers, gameRule, null);
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
      users =_.sortByOrder(users, ['buddiedPledgePercent'], ['desc']);
      return {
        game: game,
        gameRule: gameRule,
        gameLink: ggUrls.game(this.gameSlug),
        // Get game challenge completions possible
        gameChallenge: ggGame.getCurrentChallenge(game, gameRule),
        users: users,
        challengeTotals: ggGame.getChallengeTotals(game, userGames, gameRule, null)
      };
    }
  });
}