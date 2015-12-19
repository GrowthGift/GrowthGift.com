Meteor.methods({
  msSlugValidate: function(slug, collectionKey, existingDoc, params, callback) {
    if(Meteor.isServer) {
      return msSlug.exists(slug, collectionKey, existingDoc, params);
    }
  },
  msSlugAutogenValid: function(name, slug, collectionKey, params, callback) {
    if(Meteor.isServer) {
      return msSlug.autogenValid(name, slug, collectionKey, params);
    }
  }
});

msSlug.getCollection =function(key) {
  return key ==='users' ? Meteor.users :
   key ==='games' ? GamesCollection :
   key ==='gameRules' ? GameRulesCollection :
   null;
};

/**
Do not allow an existing slug UNLESS it is the existing slug for this same
 document. In that case, allow re-saving the existing slug.
@param {Object} [existingDoc]
  @param {String} _id
  @param {String} slug
*/
msSlug.exists =function(slug, collectionKey, existingDoc, params) {
  var collection =msSlug.getCollection(collectionKey);
  if(!collection) {
    return;
  }
  var slugField =(params && params.slugField) ? params.slugField : 'slug';
  var query ={};
  query[slugField] =slug;
  var records =collection.find(query).fetch();
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

msSlug.autogen =function(name, slug) {
  // Do not replace if already exists
  if(slug || !name) {
    return false;
  }
  return name.replace(/[^a-zA-Z0-9 ]/g, '')
    .replace(/ /g, '-').toLowerCase();
};

// Generates a slug that IS valid / unique
msSlug.autogenValid =function(name, slug, collectionKey, params) {
  slug =slug ? slug :
   name ? msSlug.autogen(name, false) :
   (Math.random() + 1).toString(36).substring(7);
  var counter =1;
  var slugBase =slug;
  while(msSlug.exists(slug, collectionKey, false, params) ) {
    // increment
    slug = slugBase + counter.toString();
    counter++;
  }
  return slug;
};

// Generates a slug, but does NOT validate it (it may not be unique)
msSlug.setToAutogen =function(name, slug, classname) {
  var val =msSlug.autogen(name, slug);
  if(val) {
    var ele =document.getElementsByClassName(classname)[0];
    ele.value =val;
  }
};
