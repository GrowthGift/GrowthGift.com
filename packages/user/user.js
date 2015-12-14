ggUser ={};

ggUser.getByUsername =function(username) {
  return Meteor.users.findOne({ username: username });
}

/**
@param {String} [format ='firstLastInitial'] One of 'firstLastInitial'
*/
ggUser.getName =function(user, format) {
  if(!user || !user.profile || !user.profile.name) {
    return null;
  }
  var name =user.profile.name;
  var posSpace =name.indexOf(' ');
  var first =name.slice(0, posSpace);
  var last =name.slice((posSpace+1), name.length);
  var lastInitial =( last && last.length >0 ) ? ( last.slice(0,1) + '.' ) : '';
  return ( first + ' ' + lastInitial );
}