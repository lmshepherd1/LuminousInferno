var sensorInterface = angular.module('sensorInterface', ['n3-line-chart', 'firebase']);

sensorInterface.controller("MainCtrl", function( $scope, $firebaseArray, $interval){
  $scope.temp = 32;   
  $scope.off = true; 
  $scope.unplugged = true; 
  var offValue = 8000;

  // Get a database reference to our posts
  var ref = new Firebase("https://luminous-inferno-1879.firebaseio.com/AngularData");
  // create a synchronized array from what's in the db already
  $scope.data = $firebaseArray(ref); 
  $scope.viewableData = [];
  
  $scope.callAtInterval = function(){ 
    var lastIndex = $scope.data.length;  
    if(lastIndex > 0)
    { 
      var time = Math.abs(Date.now()-($scope.data[lastIndex-1].x)); 
      if(Math.abs(Date.now()-($scope.data[lastIndex-1].x)) > offValue){ 
        $scope.off = true;  
        $scope.viewableData.push({ 
          x: Date.now(), 
          y: -12345
        });
        //check the oldest point to see if it is too old
        if(Math.abs(Date.now() - ($scope.viewableData[0].x)) > 300000)
        {
          $scope.viewableData.splice(0,1)
        }
      }else{ 
	       $scope.off = false; 
      } 

      if($scope.data[lastIndex-1] == false){  
        $scope.unplugged = true;
      }else{ 
        $scope.unplugged = false; 
      } 
    }
  };
  $interval(function(){$scope.callAtInterval();}, 1000); 

  // Attach an asynchronous callback to read the data at our posts reference
  ref.on("child_added", function(snapshot, prevChildKey) {
    //get the local version of the data
    $scope.viewableData.push(snapshot.val())
    var oldEntry = $scope.viewableData[0];

    //if the local point is older than 300 s... get rid of it
    $scope.viewableData.forEach(function(entry) {
      /************COMMENT THIS OUT TO REVERT*********************/
      //reinvent the breaks on the front end
      if(Math.abs(entry.x - (oldEntry.x)) > offValue)
      {
        $.each($scope.viewableData, function(i){
          if($scope.viewableData[i].x === entry.x && $scope.viewableData[i].y === entry.y) {
              $scope.viewableData.splice(i,0,{x: oldEntry.y+Math.abs(entry.x - (oldEntry.x))/2, y: -12345});
              return false;
          }
        });
      }
      /************************************************************/
      if(Math.abs(Date.now() - (entry.x)) > 300000)
      {
        $.each($scope.viewableData, function(i){
            if($scope.viewableData[i].x === entry.x && $scope.viewableData[i].y === entry.y) {
                $scope.viewableData.splice(i,1);
                return false;
            }
        });
      }
    //increment the old entry comparison pointer
    oldEntry = entry;
    });

    //if the db point is older than 300 s... get rid of it  
    var newPost = snapshot.val(); 
    $scope.temp = newPost.y; 
    $scope.data.forEach(function(entry) {
      if(Math.abs(Date.now() - (entry.x)) > 300000)
      {
        $scope.data.$remove(entry);
      }
    })
  }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
  }); //end refon
});//end controller

sensorInterface.directive('tempDirective', function() 
{  
  var controller = ['$scope', '$firebaseArray', function($scope, $firebaseArray) {
    $scope.buttonText = "Turn Probe/LEDs On";   
    $scope.probeOn = false; 
    $scope.celsiusScale = true;     

    var ref = new Firebase("https://luminous-inferno-1879.firebaseio.com/PowerData");
    $scope.messages = $firebaseArray(ref);  
    ref.set({ 
      power: { 
        setting: false
      }
    });

    $scope.changeLedState = function() {  
      if(!$scope.probeOn){ 
        $scope.probeOn = true; 
        $scope.buttonText = "Turn Probe/LEDs Off";  
      }else{   
        $scope.probeOn = false;
        $scope.buttonText = "Turn Probe/LEDs On";  
      }   
      ref.set({ 
        power: { 
          setting: $scope.probeOn
        } 
      });
    }; 

    $scope.convert = function(){   
      if($scope.celsiusScale){    
        //convert to celsius
       $scope.temp = ($scope.temp - 32) / 1.8;  
       $scope.temp = $scope.temp.toFixed(2);

      }else{    
        //convert to farenheit
        $scope.temp = ($scope.temp*1.8) + 32; 
        $scope.temp = $scope.temp.toFixed(2);
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
    $scope.message;  

    $scope.updateTextInfo = function(){ 
      //Check for appropriate values
    } 

    $scope.sendText = function(){ 
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", "sendSMS.php?q=" + $scope.phoneNum +"&m="+ $scope.message, true);
        xmlhttp.send(); 
    }  

    $scope.$watch('temp', function(newVal, oldVal){ 
      if(($scope.phoneNum != undefined) && ($scope.minValue != undefined) && ($scope.maxValue != undefined)){
        if((oldVal > $scope.minValue) && (oldVal < $scope.maxValue)){ 
          if(newVal < $scope.minValue){   
            $scope.message = "Temperature below minimum value";
            $scope.sendText(); 
          }else if(newVal > $scope.maxValue){  
            $scope.message = "Temperature above maximum value";
            $scope.sendText(); 
          }
        }else if((oldVal < $scope.minValue) && (newVal > $scope.maxValue)){   
          $scope.message = "Temperature above maximum value";
          $scope.sendText();
        }else if((oldVal > $scope.maxValue) && (newVal < $scope.minValue)){   
          $scope.message = "Temperature below minimum value";
          $scope.sendText();
        }
      }
    });
  }];
  return{ 
    templateUrl: 'text.html', 
    scope: { 
      temp: "="
    }, 
    controller: controller
  }//end return
});//end directive 

sensorInterface.directive('chartDirective', function()  
{  
  var controller = ['$scope', '$firebaseArray', function($scope, $firebaseArray) {

    $scope.click = function()
    {
      // add new items to the array
      // the message is automatically added to our Firebase database!
      $scope.data.$add({
        x: Date.now(),
        y: Number($scope.newValue)
      });
      $scope.viewableData.push({
        x: Date.now(),
        y: Number($scope.newValue)
      })
    };

    //graph options
    $scope.options = {
      axes: {
        x: {
          type: "date",
          label: "Time past (seconds)",
          labelFunction: (function (d) { return ''; })
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
        // mode: 'none'
      },
      drawLegend: false
    };
  }];
  return{ 
    templateUrl: 'chart.html', 
    scope: { 
      data: "=",
      viewableData: "="
    }, 
    controller: controller
  }//end return
});//end directive

