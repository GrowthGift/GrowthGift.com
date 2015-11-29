ggGameRule ={};

var _gameRule ={};

ggGameRule.generateChallenges =function(title, description) {
  var ii;
  var numChallenges =5;
  var challenges =[];
  for(ii =0; ii<numChallenges; ii++) {
    challenges.push({
      id: new Mongo.ObjectID().toHexString(),
      title: title,
      description: description,
      // once per day, converted to minutes
      dueFromStart: (ii+1) * 24 * 60
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
      { value: 'gratitude', label: 'Gratitude' },
      { value: 'growth', label: 'Growth' }
    ]
  };
};