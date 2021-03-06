GameRulesFiltersSchema = new SimpleSchema({
  title: {
    type: String,
    optional: true
  },
  type: {
    type: String,
    optional: true
  }
});

if(Meteor.isClient) {
  var getFormValues =function(template) {
    var filters =template.filters.get();
    // Want to update even if not values set as need to broaden and re-search.
    filters.title.val =AutoForm.getFieldValue('title', 'gameRulesForm');
    filters.type.val =AutoForm.getFieldValue('type', 'gameRulesForm');
    template.filters.set(filters);
    template.gameRules.set(ggGameRule.search(filters));
  };

  AutoForm.hooks({
    gameRulesForm: {
      onSubmit: function(insertDoc, updateDoc, currentDoc) {
        //without this, the Meteor.call line submits the form..
        this.event.preventDefault();
        this.event.stopPropagation();

        getFormValues(msTemplate.getMainTemplate("Template.gameRules"));
      }
    }
  });

  Template.gameRules.created =function() {
    Meteor.subscribe('gameRules');

    var filters =ggGameRule.initFilters({});
    this.filters =new ReactiveVar(filters);

    this.gameRules =new ReactiveVar([]);
  };

  Template.gameRules.helpers({
    data: function() {
      var filters =Template.instance().filters.get();
      var gameRules =ggGameRule.search(filters);
      Template.instance().gameRules.set(gameRules);
      var hrefPart =(this.gameSelect && '?gameSelect='+this.gameSelect) || '';
      return {
        gameRules: gameRules.map(function(gameRule) {
          return _.extend({}, gameRule, {
            xHref: {
              cardLink: '/gr/'+gameRule.slug+hrefPart
            }
          });
        }),
        noResults: (!gameRules.length) ? true : false,
        inputOpts: ggGameRule.inputOpts()
      };
    }
  });

  Template.gameRules.events({
    'blur .game-rules-input-title, change .game-rules-input-type': function(evt, template) {
      getFormValues(template);
    }
  });
}