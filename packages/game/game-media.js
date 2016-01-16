ggGame.uploadMedia =function(challenge, callback) {
  if(!challenge.media) {
    return callback(null, challenge);
  }
  var media = ( challenge.media.type === 'image' && challenge.media.image )
   ? challenge.media.image :
   ( challenge.media.type === 'video' && challenge.media.video ) ?
   challenge.media.video : null;
  if( challenge.media.message ) {
    challenge.mediaMessage =challenge.media.message;
  }
  if( challenge.media.privacy ) {
    challenge.mediaPrivacy =challenge.media.privacy;
  }
  if(!media) {
    delete challenge.media;
    return callback(null, challenge);
  }
  challenge.mediaType =challenge.media.type;
  delete challenge.media;
  S3.upload({
    files: [ media ],
    encoding: 'base64'
  }, function(err, result) {
    if(err) {
      delete challenge.mediaType;
    }
    else {
      challenge.media =result.secure_url;
    }
    callback(null, challenge);
  });
};