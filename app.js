var sensorInterface = angular.module('sensorInterface', ['n3-line-chart', 'firebase']);

sensorInterface.controller("MainCtrl", function( $scope ){
  $scope.temp = 32;
});

sensorInterface.directive('tempDirective', function() 
{  
  var controller = ['$scope', function($scope) {
    $scope.buttonText = "Turn Probe/LEDs On";   
    $scope.probeOn = false; 
    $scope.celsiusScale = false;    

    $scope.changeLedState = function() {  
      if(!$scope.probeOn){ 
        $scope.probeOn = true; 
        $scope.buttonText = "Turn Probe/LEDs Off";  
      }else{   
        $scope.probeOn = false;
        $scope.buttonText = "Turn Probe/LEDs On";  
      }
    }; 

    $scope.convert = function(){   
      if($scope.celsiusScale){    
        //convert to celsius
       $scope.temp = ($scope.temp - 32) / 1.8;
      }else{    
        //convert to farenheit
        $scope.temp = ($scope.temp*1.8) + 32;
      }
    }; 
  }]; 
  return{  
    restrict: "EA", 
    scope: {
      temp: "="
    },  
    templateUrl: 'temp.html',
    controller: controller
  }//end return
});//end directive 

sensorInterface.directive('textDirective', function()  
{  
  var controller = ['$scope', function($scope) {
    $scope.phoneNum; 
    $scope.minValue; 
    $scope.maxValue;    

    $scope.updateTextInfo = function(){ 
      //Check for appropriate values
    } 

    $scope.sendText = function(){ 
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "sendSMS.php?q=" + $scope.phoneNum, true);
        xmlhttp.send();
    } 
  }];
  return{ 
    templateUrl: 'text.html', 
    scope: {}, 
    controller: controller
  }//end return
});//end directive 

sensorInterface.directive('chartDirective', function()  
{  
  var controller = ['$scope', '$firebaseArray', function($scope, $firebaseArray) {
    $scope.count = 0;
    // Get a database reference to our posts
    var ref = new Firebase("https://luminous-inferno-1879.firebaseio.com/AngularData");

    // create a synchronized array from what's in the db already
    $scope.data = $firebaseArray(ref);
    
    // Attach an asynchronous callback to read the data at our posts reference
    ref.on("value", function(snapshot) {
      //if the point is older than 300 s... get rid of it
      $scope.data.forEach(function(entry) { 
        if(entry.y === -1111)
        {
          console.log(entry.y)
        }
        if(Math.abs(Date.now() - (entry.x)) > 300000)
        {
          $scope.data.$remove(entry);
        }
        else
        {
          //continue
        } 
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
  }];
  return{ 
    templateUrl: 'chart.html', 
    scope: {}, 
    controller: controller
  }//end return
});//end directive

