if(Meteor.isClient) {
  function formFaq() {
    var appInfo =Config.appInfo();
    var hiEmail ="hi@growthgift.com";   // TODO - pull from config
    var faq ={
      general: [
        {
          q: "What is Growth Gift?",
          a: "Partnered games to help break big goals into daily habits, with a focus on human connection. 1 game, 1 buddy, 5 minutes a day. Big impact.",
          link: 'what'
        },
        {
          q: "Where did this come from?",
          a: "It stems from the <a href='http://www.thehappymovie.com/' target='_blank'>Happy Documentary</a> focus on personal growth, relationships, and giving back. Secondly, from a strong belief in mentoring and a desire to start a (giving) movement.",
          link: 'where'
        },
        {
          q: "Why 3 categories?",
          a: "The 'relationships' piece is inherent in the group and buddy aspects of the games, leaving 'growth' and 'giving' as the other 2 pieces of the happiness puzzle. And we think 'gratitude' is so powerful that we added it too.",
          link: '3-categories'
        },
        {
          q: "Is there a mobile app?",
          a: "Yep! <a href='"+appInfo.mobileApps.android.link+"' target='_blank'>Android is live</a> and iOS is coming.",
          link: 'mobile-app',
          nonCordovaOnly: true
        },
        {
          q: "The app is not working for me.",
          a: "If you found a bug or are having issues, please send us an email at <a href='mailto:"+hiEmail+"' target='_blank'>"+hiEmail+"</a> with the details and we'll work to get it fixed pronto. The more information you can include, the faster we'll be able to fix it. Notably, your browser name (e.g. Chrome, Firefox, Safari, Internet Explorer), operating system (e.g. Mac, Windows), platform (desktop, Android app, iOS app) and the steps you took so we can reproduce it.",
          link: 'feedback-bug',
          nonCordovaOnly: true
        },
        {
          q: "I have a suggestion.",
          a: "We love feedback. Send us an email at <a href='mailto:"+hiEmail+"' target='_blank'>"+hiEmail+"</a> with the details and we'll get in touch to discuss!",
          link: 'feedback-suggestion'
        },
        {
          q: "I'd like to share my testimonial or story and be featured on the blog.",
          a: "Awesome! We're glad you're enjoying the app. Send us an email at <a href='mailto:"+hiEmail+"' target='_blank'>"+hiEmail+"</a> with a few sentences summary and we'll get in touch!",
          link: 'feedback-story-blog'
        }
      ],
      games: [
        {
          q: "What is the game structure?",
          a: "The 'G Games' are weekly (5 day) group challenges comprised of simple, small actions.",
          link: 'game-structure'
        },
        {
          q: "What does 'G Games' stand for?",
          a: "The 'G' represents both the 3 categories of games and the group aspect of them all. So it can be used for any of 'Growth Games', 'Giving Games', 'Gratitude Games' and / or 'Group Games'.",
          link: 'g-games'
        },
        {
          q: "Are these competitive?",
          a: "Not really - these are 'collaborative games'. While you're welcome to personally challenge friends or your buddy to see who can make the biggest impact among yourselves, these games do NOT have winners or losers. We're all working on the same team to see how big a positive difference we can make together.",
          link: 'game-collaborative'
        },
        {
          q: "The goal is huge! Will I matter?",
          a: "Yes! Every single action counts. The point of the games is building positive habits and change together, ONE action at a time. Secondly, you can multiply your impact by inviting more people to join the game. So no matter how much you can do individually, empowering others will almost always be the way to make the biggest difference.",
          link: 'game-my-impact'
        },
        {
          q: "What is the time commitment?",
          a: "Each game typically takes just 5 minutes a day. The focus is on building habits, so the shorter it is, the easier it is to do it each day.",
          link: 'game-time'
        },
        {
          q: "What are some game examples?",
          a: "A Gratitude Journal game could be writing down 1 thing you are grateful for each day. A pushups game could be doing as many pushups as you can each day.",
          link: 'game-examples'
        },
        {
          q: "What is a game buddy?",
          a: "An 'accountabilty buddy' is your partner for the game. You two help each other complete your challenge each day. The idea is to build deeper human connection with and focus on ONE (different) person for each game.",
          link: 'game-buddy-what'
        },
        {
          q: "Who should I choose for my game buddy?",
          a: "We recommend trying a broad range of different buddies to see what is most fulfilling and effective for you. Try pursuing a goal together with a close friend. Try reconnecting with an old friend or new acquaintance. Try building a new connection with a complete stranger. The one piece of guidance we can offer is that evenly matched buddies for the particular game tend to do the best together.",
          link: 'game-buddy-who'
        },
        {
          q: "Will I be auto-matched with a buddy if I do not have one?",
          a: "Nope. The buddy connection is sacred and is to be chosen by you! Phone a friend or family member and ask them to be your buddy! As a last resort, you can find and message other not yet buddied people in the game to ask them to be your buddy.",
          link: 'game-buddy-auto-match'
        },
        {
          q: "Will I get reminders?",
          a: "Hopefully not. You buddy IS your reminder. The games are built around human connection. So call, text or talk in person with your buddy after you complete your pledge for the day and remind them to do theirs. That said, if NEITHER of you have completed your pledge for the day, you may get a reminder.",
          link: 'game-reminder'
        },
        {
          q: "I have a game idea, can I create a game?",
          a: "Yep! Send us an email at <a href='mailto:"+hiEmail+"' target='_blank'>"+hiEmail+"</a> with the game type (Growth, Giving, Gratitude) and the details!",
          link: 'game-create'
        },
        {
          q: "I forgot to log my results! But I did it, I promise!",
          a: "Doh! Do you have a buddy? This is what your buddy is for - helping you remember to complete & log your daily pledge! You may only log while the challenge is active. But as long as it is not the last day, you can just add it to today's score.",
          link: 'game-forgot-to-log'
        }

      ]
    };

    // Add some common fields
    var type, curIndex =0;
    var faqFinal ={};
    for(type in faq) {
      faqFinal[type] =[];
      curIndex =0;    // Reset
      faq[type].forEach(function(item, index) {
        if( !Meteor.isCordova || !item.nonCordovaOnly ) {
          faqFinal[type][curIndex] =_.extend({}, item, {
            classes: {
              visible: 'visible'
            },
            type: type,
            index: curIndex
          });
          curIndex++;
        }
      });
    }

    return faqFinal;
  }

  Template.faq.created =function() {
    this.faqItems =new ReactiveVar(formFaq());
  };

  Template.faq.helpers({
    faq: function() {
        if(this.hash) {
        var hash =this.hash;
        setTimeout(function() {
          var adjustment =-1 * (ggConstants.headerHeight + ggConstants.navHeight);
          ggDom.scrollToEle('faq-hash-'+hash, adjustment);
        }, 100);
      }
      return Template.instance().faqItems.get();
    },
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