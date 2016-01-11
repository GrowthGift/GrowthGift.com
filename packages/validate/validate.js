ggValidate.httpsUrl =function(val) {
  if( val && val.indexOf('https://') < 0 ) {
    return "httpsUrl";
  }
  return null;
};

ggValidate.schemaHttpsUrl =function() {
  return ggValidate.httpsUrl(this.value);
};