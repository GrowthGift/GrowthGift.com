ggS3 ={};

_s3 ={};

Meteor.methods({
  ggS3Delete: function(objKey) {
    if(Meteor.isServer) {
      _s3.deleteObject(objKey);
    }
  }
});

if(Meteor.isServer) {
  _s3.deleteObject =function(objKey) {
    S3.knox.deleteFile(objKey, function(err, res) {
      // console.log(err, res);
      // check `err`, then do `res.pipe(..)` or `res.resume()` or whatever.
    });
  };
}

ggS3.deleteFile =function(fullPath) {
  var awsSearch = 'amazonaws.com';
  var posAws = fullPath ? fullPath.indexOf(awsSearch) : -1;
  if( posAws > -1 ) {
    // Need to get the folder path WITHOUT the bucket, which is the first
    // part after the domain.
    var posFolderPathStart = posAws + awsSearch.length + 5;
    var posSlash = fullPath.indexOf('/', posFolderPathStart);
    var path = fullPath.slice(( posSlash ), fullPath.length);

    // Gives a 400 error..
    // S3.delete({
    //   path: path
    // }, function(err, result) {
    //   console.log(err, result);
    // });

    Meteor.call("ggS3Delete", path, function(err, res) {
    });    
  }
};

/*
/6b6146f7-2b54-4eec-9665-f95276cd4215.jpeg
/6b6146f7-2b54-4eec-9665-f95276cd4215.jpeg
*/