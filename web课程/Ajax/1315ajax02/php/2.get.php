<?php
	header('content-text:text/html; charset="utf-8"');
	header("Access-Control-Allow-Origin:*");
	error_reporting(0);
	
	
	$username = $_GET['username'];
	$age	  = $_GET['age'];

	echo "欢迎。。。名字:{$username} , 年龄: {$age}"; 
