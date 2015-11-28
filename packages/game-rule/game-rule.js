ggGameRule ={};

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