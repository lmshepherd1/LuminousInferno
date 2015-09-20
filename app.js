var sensorInterface = angular.module('sensorInterface', ['n3-line-chart', 'firebase']);

sensorInterface.controller("MainCtrl", function( $scope, $firebaseArray){
  $scope.temp = 32;   
  $scope.off = false; 
  $scope.unplugged = true; 

  // Get a database reference to our posts
  var ref = new Firebase("https://luminous-inferno-1879.firebaseio.com/AngularData");
  // create a synchronized array from what's in the db already
  $scope.data = $firebaseArray(ref); 
  
  // Attach an asynchronous callback to read the data at our posts reference
  ref.on("child_added", function(snapshot, prevChildKey) {
    //if the point is older than 300 s... get rid of it  
    var newPost = snapshot.val(); 
    $scope.temp = newPost.y; 
    $scope.data.forEach(function(entry) { 
      if(entry.y === -1111)
      {
        console.log(entry.y)
      }
      if(Math.abs(Date.now() - (entry.x)) > 300000)
      {
        $scope.data.$remove(entry);
      }
    })
    }, function (errorObject) {
      console.log("The read failed: " + errorObject.code);
  }); //end refon

});//end controller 
>>>>>>> origin/Teamwork

sensorInterface.directive('tempDirective', function() 
{  
  var controller = ['$scope', '$firebaseArray', function($scope, $firebaseArray) {
    $scope.buttonText = "Turn Probe/LEDs On";   
    $scope.probeOn = false; 
<<<<<<< HEAD
    $scope.celsiusScale = false;  

    var ref2 = new Firebase("https://luminous-inferno-1879.firebaseio.com/PowerData");
    // create a synchronized array
    $scope.messages = $firebaseArray(ref2);
    // add new items to the array
    // the message is automatically added to our Firebase database!
    $scope.addMessage = function() {
      $scope.messages.$add({
        text: $scope.newMessageText
      });
    };  
=======
    $scope.celsiusScale = false;     

    var ref = new Firebase("https://luminous-inferno-1879.firebaseio.com/PowerData");
    $scope.messages = $firebaseArray(ref);  
    ref.set({ 
      power: { 
        setting: false
      }
    });
>>>>>>> origin/Teamwork

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
    $scope.count = 0;
    // Get a database reference to our posts
    var ref = new Firebase("https://luminous-inferno-1879.firebaseio.com/AngularData");

    // create a synchronized array from what's in the db already
    $scope.data = $firebaseArray(ref);
    
    // Attach an asynchronous callback to read the data at our posts reference
    ref.on("value", function(snapshot) {
      //if the point is older than 300 s... get rid of it
      $scope.data.forEach(function(entry) { 
        console.log(entry)
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
      },
      drawLegend: false
    };
  }];
  return{ 
    templateUrl: 'chart.html', 
    scope: { 
      data: "="
    }, 
    controller: controller
  }//end return
});//end directive

