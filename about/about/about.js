if(Meteor.isClient) {
  Template.about.helpers({
    nav: function() {
      return {
        buttons: [
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
      return {
       //  template: (this.nav && this.nav ==='hiw') ?
       // 'howItWorks' : 'faq'
       template: 'faq'
      };
    }
  });
}