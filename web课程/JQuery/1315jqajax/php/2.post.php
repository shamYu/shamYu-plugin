<?php
	header('content-text:text/html; charset="utf-8"');
	header("Access-Control-Allow-Origin:*");
	error_reporting(0);
	
	
	$username = $_POST['username'];
	$age	  = $_POST['age'];

	echo "欢迎xxxx。。。名字:{$username} , 年龄: {$age}"; 
