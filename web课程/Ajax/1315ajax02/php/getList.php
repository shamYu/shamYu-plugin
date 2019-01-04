<?php
	header('content-text:text/html; charset="utf-8"');
	header("Access-Control-Allow-Origin:*");
	error_reporting(0);
	
	//$arr1 = array('lily', 'momo', 'zhangsan');
	
	$arr2 = array('username'=>'lily', 'age'=>32);
	
	//echo 'lily,momo,zhangsan';
	
	echo json_encode($arr2);
