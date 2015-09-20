<?php
require 'class-Clockwork.php'; 
$API_KEY = "0cacf5553e6f0cc9a5b2d8a1e98884de562cb2fa"; 

$q = $_REQUEST["q"]; 
$m = $_REQUEST["m"];


try
{
    // Create a Clockwork object using your API key
    $clockwork = new Clockwork( $API_KEY );
 
    // Setup and send a message
    $message = array( 'to' => $q, 'message' => $m );
    $result = $clockwork->send( $message );
 
    // Check if the send was successful
    if($result['success']) {
        echo 'Message sent - ID: ' . $result['id'];
    } else {
        echo 'Message failed - Error: ' . $result['error_message'];
    }
}
catch (ClockworkException $e)
{
    echo 'Exception sending SMS: ' . $e->getMessage();
}
?>