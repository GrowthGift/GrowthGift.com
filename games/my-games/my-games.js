if(Meteor.isClient) {
  Template.myGames.helpers({
    nav: function() {
      return {
        buttons: [
          {
            icon: 'fa fa-cubes',
            html: 'Current',
            click: function() {
            }
          },
          {
            icon: 'fa fa-cubes',
            html: 'All',
            click: function() {
            }
          },
          {
            icon: 'fa fa-plus',
            html: 'New Game',
            click: function() {
            }
          }
        ]
      };
    }
  });
}