<?php
	
	header('content-text:text/html; charset="utf-8"');
	header("Access-Control-Allow-Origin:*");
	error_reporting(0);
	
	$one=$_POST['one'];
	$two=$_POST['two'];
	$three=$_POST['three'];
	$four=$_POST['four'];
	$five=$_POST['five'];
	$six=$_POST['six'];
	$seven=$_POST['seven'];
	
	$arr = array($one, $two,$three, $four, $five,$six,$seven);

	echo json_encode($arr);

	
