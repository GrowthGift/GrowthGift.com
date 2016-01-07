Config.amazon =function(params) {
  var ret ={
    s3: {
      key: Config.vars.AWS_ACCESS_KEY || null,
      secret: Config.vars.AWS_ACCESS_SECRET || null,
      buckets: {
        mediaCapture: Config.vars.AWS_BUCKET_MEDIA_CAPTURE || null
      },
      region: Config.vars.AWS_REGION || null
    }
  };
  return ret;
};