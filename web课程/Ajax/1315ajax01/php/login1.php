<?php
	header('content-text:text/html; charset="utf-8"');
	header("Access-Control-Allow-Origin:*");
	error_reporting(0);
	
	$username=$_POST['username'];
	$password=$_POST['password'];
	
	$canLogin=0;
	$nikeName='未设置昵称';
	$usersex='男';
	
	$user=array(
		'feige'=>'123',
		'binge'=>'456',
		'nuge'=>'789',		
	);
	
	$nike=array(
		'feige'=>'飞哥',
		'binge'=>'斌哥',
		'nuge'=>'努哥',
	);
	
	$sex=array(
		'feige'=>'男',
		'binge'=>'男',
		'nuge'=>'你看着办',
	);
	
	
//	if($SERVER['$REQUEST_METHOD']=='PUT'){
//		
//	}
	
	foreach($user as $key => $value){
		if($username==$key and $password==$value){
			$canLogin=2;
			$nikeName=$nike[$key];
			$usersex=$sex[$key];
			break;
		}else if($username==$key and $password!=$value){
			$canLogin=1;
			break;
		}else{
			$canLogin=0;
		};
	};
	
	$data=array(
		'canLogin'=>$canLogin,
		'nickName'=>$nikeName,
		'userSex'=>$usersex,
	);
	
	echo json_encode($data);
?>