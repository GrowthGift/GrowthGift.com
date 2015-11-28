Meteor.methods({
  saveGameRule: function(doc, docId) {

    var onSuccess =function(error, result) {
      if(Meteor.isClient) {
        if(!error && result) {
          if(slug) {
            Router.go('/save-game-rule?slug='+slug);
          }
        }
      }
    };

    var valid =true;
    if(docId) {
      var gameRule =GameRulesCollection.findOne({_id: docId});
      valid =ggMay.editGameRule(gameRule, Meteor.userId());
    }
    var slug =(doc.$set && doc.$set.slug) || doc.slug;
    if(slug) {
      var existingDoc =(docId && ({_id: docId})) || null;
      var slugExists =ggSlug.exists(slug, 'gameRules', existingDoc);
      if(slugExists) {
        valid =false;
      }
    }

    if(!valid) {
      if(Meteor.isClient) {
        nrAlert.alert("Only game admins may edit game rules.");
      }
    }
    else {
      if(docId) {
        var modifier =doc;
        // If BOTH title and description have changed, re-generate challenges
        if(modifier.$set.title && modifier.$set.description) {
          modifier.$set.challenges =ggGameRule.generateChallenges(modifier.$set.title,
           modifier.$set.description);
        }
        console.log(modifier);

        GameRulesCollection.update({_id:docId}, modifier, onSuccess);
      }
      else {
        GameRuleSchema.clean(doc);

        // Generate challenges
        doc.challenges =ggGameRule.generateChallenges(doc.title, doc.description);
        console.log(doc);

        if(Meteor.user()) {
          doc.users =[
            {
              userId: Meteor.userId(),
              role: 'creator'
            }
          ];
        }
        GameRulesCollection.insert(doc, onSuccess);
      }
    }

  }
});

if(Meteor.isServer) {
  Meteor.publish('current-game-rule', function(gameRuleSlug) {
    return GameRulesCollection.find({slug: gameRuleSlug});
  });
}

if(Meteor.isClient) {
  Template.saveGameRule.created =function() {
    this.inited =false;
  };

  Template.saveGameRule.helpers({
    gameRule: function() {
      if(!this.gameRuleSlug) {
        return {};
      }
      var gameRule =GameRulesCollection.findOne({slug: this.gameRuleSlug});
      if(!Template.instance().inited) {
        if(!gameRule || !gameRule._id || !ggMay.editGameRule(gameRule, Meteor.userId()) ) {
          nrAlert.alert("No game rule with slug "+this.gameRuleSlug);
          Router.go('myGames');
        }
        Template.instance().inited =true;
      }
      return gameRule;
    },
    afMethod: function() {
      return (this.gameRuleSlug && 'method-update') || 'method';
    },
    inputOpts: function() {
      var gameRule ={};
      if(this.gameRuleSlug) {
        gameRule =GameRulesCollection.findOne({slug: this.gameRuleSlug});
      }
      var edit =(gameRule && gameRule._id && true) || false;
      var disabled =(edit && true) || false;

      var opts ={
        slugDisabled: disabled,
        typeOpts: [
          { value: 'giving', label: 'Giving' },
          { value: 'gratitude', label: 'Gratitude' },
          { value: 'growth', label: 'Growth' }
        ]
      };

      return opts;
    }
  });

  Template.saveGameRule.events({
    'blur .save-game-rule-input-title': function(evt, template) {
      ggSlug.setToAutogen(AutoForm.getFieldValue('title', 'saveGameRuleForm'),
       AutoForm.getFieldValue('slug', 'saveGameRuleForm'), 'save-game-rule-input-slug');
    },
    'blur .save-game-rule-input-slug': function(evt, template) {
      var slug =AutoForm.getFieldValue('slug', 'saveGameRuleForm');
      var existingGameRule =(template.data.gameRuleSlug &&
       GameRulesCollection.findOne({slug: template.data.gameRuleSlug}) ) || null;
      Meteor.call('ggSlugValidate', slug, 'gameRules', existingGameRule, function(err, exists) {
        if(exists) {
          AutoForm.addStickyValidationError('saveGameRuleForm', 'slug', 'slugExists', slug);
        }
        else {
          AutoForm.removeStickyValidationError('saveGameRuleForm', 'slug');
        }
      });
    }
  });
}