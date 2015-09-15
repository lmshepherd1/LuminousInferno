var sensorInterface = angular.module('sensorInterface', ['n3-line-chart', 'firebase']);

sensorInterface.controller('ChartCtrl', ['$scope', '$firebaseArray', function($scope, $firebaseArray) {
  $scope.count = 0;
  // Get a database reference to our posts
  var ref = new Firebase("https://luminous-inferno-1879.firebaseio.com/AngularData");

  // create a synchronized array from what's in the db already
  $scope.data = $firebaseArray(ref);
  //get rid of old values
  $scope.data.forEach(function(entry) {
    if(Math.abs(Date.now() - (entry.x)) > 300000)
    {
      $scope.data.$remove(entry);
    }
    else
    {
      //continue
    } 
    $scope.iterator += 1; 
  })

  // Attach an asynchronous callback to read the data at our posts reference
  ref.on("value", function(snapshot) {
    //if the point is older than 300 s... get rid of it
    $scope.data.forEach(function(entry) {
      if(Math.abs(Date.now() - (entry.x)) > 300000)
      {
        $scope.data.$remove(entry);
      }
      else
      {
        //continue
      } 
      $scope.iterator += 1; 
    })
    console.log(snapshot.val());
  }, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
  });

  $scope.click = function()
  {
    // add new items to the array
    // the message is automatically added to our Firebase database!
    $scope.data.$add({
      x: Date.now(),
      y: Number($scope.newValue)
    });
    $scope.count += 1;

    //figure out how to show a break instead of connecting line
    if($scope.count>3 && $scope.count<8)
    {
      $scope.newValue = null;
    }
  };

  //graph options
  $scope.options = {
    axes: {
      x: {
        type: "date",
        label: "Time past (seconds)"
      }
    },
    series: [
      {
        y: "y",
        label: "Temperature (°)",
        color: "#9467bd"
      }
    ],
    tooltip: {
      mode: "scrubber"
    },
    drawLegend: false
  };
}]);

sensorInterface.controller('TextCtrl', function($scope) {
	$scope.name = "Hello"; 
	
	$scope.click = function()
    {
      $scope.name = $scope.name + "!";
    };
});