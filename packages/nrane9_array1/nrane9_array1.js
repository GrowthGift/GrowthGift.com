nrArray ={};

/**
Removes one or more items from an array
// Array Remove - By John Resig (MIT Licensed)
@usage
// Remove the second item from the array
remove(arr1, 1);
// Remove the second-to-last item from the array
remove(arr1, -2);
// Remove the second and third items from the array
remove(arr1, 1,2);
// Remove the last and second-to-last items from the array
remove(arr1, -2,-1);
@toc 0.
@method remove
@param {Array} arr1 The array to remove from
@param {Number} from The index to remove (or remove starting from if removing more than one)
@param {Number} [to] The index to remove up to. Pass in boolean false to not use this parameter (i.e. if want to use 'params' but not 'to')
@param {Object} [params]
  @param {Boolean} [modifyOriginal] True to modify the passed in array itself (thus no return value is needed) - this is better for performance but can lead to unexpected behavior since the original version is modified everywhere it's used. NOTE: this doesn't seem to be working 100% properly - the returned value IS correct and no '.copy' is used so still good for performance, BUT the original array is cut to smaller length and is wrong..   //@todo - fix this..
@return {Array} arr1 The new array with the appropriate element(s) removed
@usage
  var arr1 =[
    {_id:1, name:'Joe'},
    {_id:2, name:'Bob'},
    {_id:3, name:'Sally'},
    {_id:4, name:'Sue'},
    {_id:5, name:'Becky'}
  ];
  var smallerArray =nrArray.remove(arr1, 1, false, {});    //can also just do 'nrArray.remove(arr1, 1);' if not using 'to' or 'params' parameters
*/
nrArray.remove =function(arrOrig, from, to, params) {
  // console.log(arrOrig);   //TESTING
  if(params ===undefined) {
    params ={};
  }
  var arr1;
  if(params.modifyOriginal !==undefined && params.modifyOriginal) {
    arr1 =arrOrig;
  }
  else {    //make a copy first
    arr1 =EJSON.clone(arrOrig);   //don't' change the original version of the array
  }
  // console.log('array remove: before: '+JSON.stringify(arr1));
  var rest = arr1.slice((to || from) + 1 || arr1.length);
  arr1.length = from < 0 ? arr1.length + from : from;
  // arr1 =arr1.push.apply(this, rest);
  // arr1.push(rest);
  arr1 =arr1.concat(rest);
  // console.log('array remove: after: '+JSON.stringify(arr1));
  return arr1;
};

/**
Returns the index of an 2D []{} associative array when given the key & value to search for within the array. Like native javascript '.indexOf()' but for arrays of objects.
@toc 1.
@method findArrayIndex
@param {Array} array 2D array []{} to search
@param {String} key Object key to check value against
@param {Mixed} val To match key value against
@param {Object} [params]
  @param {Boolean} oneD True if it's a 1D array
@return {Number} The index of the element OR -1 if not found
@usage
  var arr1 =[
    {_id:1, name:'Joe'},
    {_id:2, name:'Bob'},
    {_id:3, name:'Sally'},
    {_id:4, name:'Sue'},
    {_id:5, name:'Becky'}
  ];
  var index1 =nrArray.findArrayIndex(arr1, 'name', 'Bob', {});   //index1 will return 1 since the 2nd element (array index 1 since arrays are 0 indexed) is the one with 'Bob' in the 'name' field
*/
nrArray.findArrayIndex =function(array, key, val, params) {
  var ii;
  var index =-1;
  if(params.oneD)
  {
    for(ii=0; ii<array.length; ii++)
    {
      if(array[ii] == val)
      {
        index = ii;
        break;
      }
    }
  }
  else
  {
    for(ii=0; ii<array.length; ii++)
    {
      if(array[ii][key] == val)
      {
        index = ii;
        break;
      }
    }
  }
  return index;
};

/**
array has 2 elements: 1st is an identifier (for use to match later), 2nd gets sorted & keeps it's identifier with it
@return array1
*/
function subSort2D(array1)
{
  var left;
  var right;
  var beg =[];
  var end =[];
  var pivot =[];
  pivot[0] =[];
  pivot[0][0] =[];
  pivot[0][1] =[];
  pivot[1] =[];
  pivot[1][0] =[];
  pivot[1][1] =[];
  var count =0;

  beg[0] =0;
  //end[0] =rosterLength-1;
  //end[0] =array1.length-1;
  end[0] =array1.length;    //CHANGE - not sure why... (array1 doesn't have a blank last index so don't have to subtract 1 anymore...)
  while(count>=0)
  {
    left =beg[count];
    right =end[count]-1;
    if(left <right)
    {
      pivot[0][1] =array1[left][1];
      pivot[0][0] =array1[left][0];
      while(left <right)
      {
        while((array1[right][1] >= pivot[0][1]) && (left <right))
        {
          right--;
        }
        if(left <right)
        {
          array1[left][0] =array1[right][0];
          array1[left][1] =array1[right][1];
          left++;
        }
        while((array1[left][1] <= pivot[0][1]) && (left <right))
        {
          left++;
        }
        if(left <right)
        {
          array1[right][0] =array1[left][0];
          array1[right][1] =array1[left][1];
          right--;
        }
      }
      array1[left][0] =pivot[0][0];
      array1[left][1] =pivot[0][1];
      beg[count+1] =left+1;
      end[count+1] =end[count];
      end[count] =left;
      count++;
    }
    else
    {
      count--;
    }
  }

  //var yes =1;   //dummy
  return array1;
}

/**
takes a multidimensional array & array index to sort by and returns the multidimensional array, now sorted by that array index
@method sort2D
@param {Array} arrayUnsorted 2D array []{} of objects to sort
@param {Number} column Array index to sort by (note first one is 0)
@param {Object} [params]
  @param {String} [order] 'desc' for reverse order sort
@return {Array} sortedArray input array of objects []{} but now sorted
@usage
  var arr1 =[
    {_id:1, name:'Joe'},
    {_id:2, name:'Bob'},
    {_id:3, name:'Sally'},
    {_id:4, name:'Sue'},
    {_id:5, name:'Becky'}
  ];
  var sortedArray =nrArray.sort2D(arr1, 'name', {});   //will now have array sorted by alphabetical order by name (i.e. Becky, Bob, Joe, Sally, Sue)
*/
nrArray.sort2D =function(arrayUnsorted, column, params) {
  var tempArray =[];  //copy calHide array here to sort; then re-copy back into calHide array once sorted
  var array2D =[];
  var ii;
  for(ii =0; ii<arrayUnsorted.length; ii++)
  {
    tempArray[ii] =[];
    tempArray[ii] =arrayUnsorted[ii];
    array2D[ii] =[ii, tempArray[ii][column]];
  }

  array2D =subSort2D(array2D);    //function    - array2D will come out sorted

  var sortedArray =[];
  var counter =0;
  if(params.order !==undefined && params.order =='desc')
  {
    for(ii=(array2D.length-1); ii>=0; ii--)
    {
      sortedArray[counter] =tempArray[array2D[ii][0]];
      counter++;
    }
  }
  else
  {
    for(ii =0; ii<array2D.length; ii++)
    {
      sortedArray[counter] =tempArray[array2D[ii][0]];
      counter++;
    }
  }
  
  return sortedArray;
};
