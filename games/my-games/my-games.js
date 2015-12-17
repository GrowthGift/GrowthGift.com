if(Meteor.isClient) {
  Template.myGames.created =function() {
    Meteor.subscribe('my-games');
  };

  Template.myGames.helpers({
    nav: function() {
      return {
        buttons: [
          {
            icon: 'fa fa-cubes',
            html: 'Current',
            click: function() {
              Router.go(ggUrls.myGames('now'));
            }
          },
          {
            icon: 'fa fa-cubes',
            html: 'Past',
            click: function() {
              Router.go(ggUrls.myGames('past'));
            }
          },
          // {
          //   icon: 'fa fa-plus',
          //   html: 'New Game',
          //   click: function() {
          //     Router.go('saveGame');
          //   }
          // }
        ]
      };
    },
    data: function() {
      var ret ={
        userGames: []
      };

      var view =(this.view && this.view ==='past') ? 'past' : 'now';
      var endedText =(view ==='past') ? "Ended" : "Ends";

      var nowTimeFormat =moment().format(msTimezone.dateTimeFormat);
      var userGames =ggGame.getUserGames(Meteor.userId()).filter(function(ug) {
        if(view ==='past') {
          // Filter out any games that are not over
          return (ug.gameEnd <= nowTimeFormat) ? true : false;
        }
        else {
          // Filter out any games that are over
          return (ug.gameEnd > nowTimeFormat) ? true : false;
        }
      });

      var sortOrder =( view ==='past' ) ? 'desc' : 'asc';
      ret.userGames =_.sortByOrder(userGames.map(function(ug) {
        return _.extend({}, ug, {
          xDisplay: {
            gameTime: (ug.gameStart > nowTimeFormat) ? ( "Starts " +
             moment(ug.gameStart, msTimezone.dateTimeFormat).fromNow() ) :
             ( endedText+ " " + moment(ug.gameEnd, msTimezone.dateTimeFormat).fromNow() ),
            gameLink: ggUrls.game(ug.game.slug)
          }
        });
      }), ['gameStart'], [sortOrder]);

      return ret;
    }
  });
}