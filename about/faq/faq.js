if(Meteor.isClient) {
  function formFaq() {
    var appInfo =Config.appInfo();
    var faq ={
      general: [
        {
          q: "What is Growth Gift?",
          a: "Partnered games to help break big goals into daily habits, with a focus on human connection. 1 game, 1 buddy, 5 minutes a day. Big impact."
        },
        {
          q: "Where did this come from?",
          a: "It stems from the <a href='http://www.thehappymovie.com/' target='_blank'>Happy Documentary</a> focus on personal growth, relationships, and giving back. Secondly, from a strong belief in mentoring and a desire to start a (giving) movement."
        },
        {
          q: "Why 3 categories?",
          a: "The 'relationships' piece is inherent in the group aspect of the games, leaving 'growth' and 'giving' as the other 2 pieces of the happiness puzzle. And we think 'gratitude' is so powerful that we added it too."
        },
        {
          q: "Is there a mobile app?",
          a: "Yep! <a href='"+appInfo.mobileApps.android.link+"' target='_blank'>Android is live</a> and iOS is coming."
        }
      ],
      games: [
        {
          q: "What is the game structure?",
          a: "The 'G Games' are weekly (5 day) group challenges comprised of simple, small actions."
        },
        {
          q: "What is the time commitment?",
          a: "Each game typically takes just 5 minutes a day. The focus is on building habits, so the shorter it is, the easier it is to do it each day."
        },
        {
          q: "What is a game example?",
          a: "A Gratitude Journal game could be writing down 1 thing you are grateful for each day."
        },
        {
          q: "What is a game buddy?",
          a: "An 'accountabilty buddy' is your partner for the game. You two help each other complete your challenge each day."
        },
        {
          q: "Who can create a game?",
          a: "Anyone!"
        },

      ]
    };

    // Add some common fields
    var type;
    for(type in faq) {
      faq[type] =faq[type].map(function(item, index) {
        return _.extend({}, item, {
          classes: {
            visible: 'visible'
          },
          type: type,
          index: index
        });
      });
    }

    return faq;
  }

  Template.faq.created =function() {
    this.faqItems =new ReactiveVar(formFaq());
  };

  Template.faq.helpers({
    faq: function() {
      return Template.instance().faqItems.get();
    }
  });

  Template.faq.events({
    'click .faq-header': function(evt, template) {
      var faqItems =template.faqItems.get();
      var newClass =(this.classes.visible ==='hidden') ? 'visible' : 'hidden';
      faqItems[this.type][this.index].classes.visible =newClass;
      template.faqItems.set(faqItems);
    }
  });
}