<?php
	header('content-text:text/html; charset="utf-8"');
	header("Access-Control-Allow-Origin:*");
	error_reporting(0);
	
	//echo  1;
	
	//$_REQUEST
	$username = $_POST['username'];
	$age	  = $_POST['age'];

	echo "账号:{$username} , 密码: {$age}"; 
