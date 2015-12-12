ggUser ={};

ggUser.getByUsername =function(username) {
  return Meteor.users.findOne({ username: username });
}