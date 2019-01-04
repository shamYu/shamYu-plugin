<?php
	header('content-text:text/html; charset="utf-8"');
	error_reporting(0);
	
	//echo  1;
	
	//$_REQUEST
	$username = $_POST['username'];
	$age	  = $_POST['age'];

	echo "名字:{$username} , 年龄: {$age}"; 
