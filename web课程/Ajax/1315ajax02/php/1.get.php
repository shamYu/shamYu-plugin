<?php
	header('content-text:text/html; charset="utf-8"');
	header("Access-Control-Allow-Origin:*");
	error_reporting(0);
	
	//echo  1;
	
	$username = $_GET['username'];
	$age	  = $_GET['age'];

	echo "名字:{$username} , 年龄: {$age}"; 
	
//	函数调用的return->返回结果
