<?php
	header('content-text:text/html; charset="utf-8"');
	error_reporting(0);
	
	//echo  1;
	
	$username = $_GET['username'];
	$age	  = $_GET['age'];

	echo "名字:{$username} , 年龄: {$age}"; 
