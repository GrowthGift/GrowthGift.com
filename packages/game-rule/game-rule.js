ggGameRule ={};

var _gameRule ={};

ggGameRule.generateChallenges =function(title, description) {
  var ii, dueTime;
  var numChallenges =5;
  var challenges =[];
  for(ii =0; ii<numChallenges; ii++) {
    dueTime =( (ii+1) * 24 * 60 );
    // Make the LAST challenge 1 minute shorter so it ends on the SAME day.
    // This avoids a 12am Monday start that ends on Sat at 12am. Instead
    // it is nicer to show an 11:59pm Fri end, so it's truly Mon - Fri.
    dueTime =( ii === (numChallenges -1) ) ? ( dueTime -1 )
       : dueTime;
    challenges.push({
      id: new Mongo.ObjectID().toHexString(),
      title: title,
      description: description,
      // once per day, converted to minutes
      dueFromStart: dueTime
    });
  }
  return challenges;
};

_gameRule.buildQuery =function(filters) {
  var query ={};
  if(filters.title.val) {
    query.title ={
      $regex: filters.title.val,
      $options: 'i'
    };
  }
  if(filters.type.val) {
    query.type =filters.type.val;
  }
  return query;
};

_gameRule.getGameRules =function(query) {
  var gameRules =GameRulesCollection.find(query).fetch();
  return ggGameRule.formatGameRules(gameRules);
};

ggGameRule.formatGameRules =function(gameRules) {
  return gameRules.map(function(gameRule) {
    if(gameRule.challenges) {
      gameRule.challenges =gameRule.challenges.map(function(challenge) {
        return _.extend({}, challenge, {
          xDisplay: {
            description: _.trunc(challenge.description, {length: 100})
          }
        });
      });
    }
    return _.extend({}, gameRule, {
      xDisplay: {
        description: _.trunc(gameRule.description, {length: 100})
      }
    });
  });
};

ggGameRule.search =function(filters) {
  var query =_gameRule.buildQuery(filters);
  return _gameRule.getGameRules(query);
};

ggGameRule.initFilters =function() {
  return {
    title: {
      val: ''
    },
    type: {
      val: ''
    }
  }
};

ggGameRule.inputOpts =function() {
  return {
    typeOpts: [
      { value: 'giving', label: 'Giving' },
      { value: 'growth', label: 'Growth' }
    ]
  };
};

ggGameRule.allSelectOpts =function() {
  var gameRules =GameRulesCollection.find({}).fetch();
  return _.sortByOrder(gameRules.map(function(gameRule) {
    return { value: gameRule._id, label: gameRule.slug };
  }), ['label'], ['asc']);
};

ggGameRule.findBySlug =function(slug) {
  return GameRulesCollection.findOne({slug:slug});
};