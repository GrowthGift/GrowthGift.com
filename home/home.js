if(Meteor.isClient) {
  Template.home.helpers({
    nav: function() {
      return {
        buttons: [
          {
            icon: 'fa fa-cube',
            html: 'Test',
            click: function() {
              Router.go('/dev-test-test');
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