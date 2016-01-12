ggValidate.httpsUrl =function(val) {
  if( val && val.indexOf('https://') < 0 ) {
    return "httpsUrl";
  }
  return null;
};

ggValidate.schemaHttpsUrl =function() {
  return ggValidate.httpsUrl(this.value);
};

ggValidate.youtubeEmbedUrl =function(url) {
  // Extra parameters mess up the embed url.
  if(url.indexOf('&') > -1) {
    url = url.slice(0, url.indexOf('&'));
  }
  return url.replace('watch?v=', 'embed/');
};

ggValidate.imageExtension =function(src) {
  if(src) {
    var allowed =['jpg', 'jpeg', 'png'];
    var ii, match =false, regEx;
    for(ii =0; ii < allowed.length; ii++) {
      regEx =new RegExp("." + allowed[ii] + "$");
      if( regEx.test(src) ) {
        match =true;
        break;
      }
    }
    if(!match) {
      return "imageExtension";
    }
  }
  return null;
};

ggValidate.httpsImageExtension =function(val) {
  var https =ggValidate.httpsUrl(val);
  var imgExt =ggValidate.imageExtension(val);
  if( https && imgExt ) {
    return "httpsImageExtension";
  }
  else if( https ) {
    return "httpsUrl";
  }
  else if( imgExt ) {
    return "imageExtension";
  }
  return null;
};

ggValidate.schemaHttpsImageExtension =function() {
  return ggValidate.httpsImageExtension(this.value);
};