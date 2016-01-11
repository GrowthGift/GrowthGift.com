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