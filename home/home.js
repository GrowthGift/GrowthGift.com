if(Meteor.isClient) {
  Template.home.helpers({
    nav: function() {
      return {
        buttons: [
          {
            icon: 'fa fa-cubes',
            html: 'Button 1',
            click: function() {
              // TODO
            }
          },
          {
            icon: 'fa fa-cubes',
            html: 'Button 2',
            click: function() {
              // TODO
            }
          },
          {
            icon: 'fa fa-plus',
            html: 'Button 3',
            click: function() {
              // TODO
            }
          }
        ]
      };
    }
  });
}