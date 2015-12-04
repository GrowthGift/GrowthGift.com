Meteor.methods({
  ggSlugValidate: function(slug, collectionKey, existingDoc, callback) {
    if(Meteor.isServer) {
      temp =ggSlug.exists(slug, collectionKey, existingDoc);
      return temp;
    }
  }
});

ggSlug.getCollection =function(key) {
  return key ==='games' ? GamesCollection :
   key ==='gameRules' ? GameRulesCollection :
   key ==='users' ? Meteor.users :
   null;
};

/**
Do not allow an existing slug UNLESS it is the existing slug for this same
 document. In that case, allow re-saving the existing slug.
@param {Object} [existingDoc]
  @param {String} _id
  @param {String} slug
*/
ggSlug.exists =function(slug, collectionKey, existingDoc) {
  var collection =ggSlug.getCollection(collectionKey);
  if(!collection) {
    return;
  }
  var records =collection.find({slug: slug}).fetch();
  if(records && records.length) {
    if(records.length ===1 && existingDoc &&
     ( (existingDoc._id && existingDoc._id ===records[0]._id) ||
     (existingDoc.slug && existingDoc.slug ===records[0].slug) ) ) {
      var allowed =true;
    }
    else {
      return true;
    }
  }
  return false;
};

ggSlug.autogen =function(name, slug) {
  // Do not replace if already exists
  if(slug || !name) {
    return false;
  }
  return name.replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/ /g, '-').toLowerCase();
};

// Generates a slug that IS valid / unique
ggSlug.autogenValid =function(name, slug, collectionKey) {
  slug =slug ? slug :
   name ? ggSlug.autogen(name, false) :
   (Math.random() + 1).toString(36).substring(7);
  console.log(slug);
  var counter =1;
  while(ggSlug.exists(slug, collectionKey, false) ) {
    // increment
    slug +=counter.toString();
    console.log(slug);
  }
  return slug;
};

// Generates a slug, but does NOT validate it (it may not be unique)
ggSlug.setToAutogen =function(name, slug, classname) {
  var val =ggSlug.autogen(name, slug);
  if(val) {
    var ele =document.getElementsByClassName(classname)[0];
    ele.value =val;
  }
};
