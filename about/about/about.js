if(Meteor.isClient) {
  Template.about.helpers({
    nav: function() {
      return {
        buttons: [
          {
            icon: 'fa fa-info',
            html: 'Overview',
            click: function() {
              Router.go(ggUrls.aboutOverview());
            }
          },
          {
            icon: 'fa fa-question',
            html: 'FAQ',
            click: function() {
              Router.go(ggUrls.faq());
            }
          },
          // {
          //   icon: 'fa fa-cog',
          //   html: 'How It Works',
          //   click: function() {
          //     Router.go(ggUrls.howItWorks());
          //   }
          // }
        ]
      };
    },
    data: function() {
      var nav = this.nav ? this.nav : 'overview';
      return {
        template: ( nav === 'hiw' ) ? 'howItWorks' :
        ( nav === 'faq' ) ? 'faq' :
        'aboutOverview'
      };
    }
  });
}