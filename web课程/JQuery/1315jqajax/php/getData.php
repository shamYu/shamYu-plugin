<?php
	$t = isset($_GET['t']) ? $_GET['t']: 'num';
//	$callback = isset($_GET['wwww']) ? $_GET['wwww'] : 'fn';

	$callback = isset($_GET['callback']) ? $_GET['callback'] : 'fn';
	
//	$callback = isset($_GET['wobuaiqian']) ? $_GET['wobuaiqian'] : 'fn';
	
	$arr1 = array('1111', '2222','3333', '44444', '55555');
	$arr2 = array('aaaa', 'bbbb', 'cccc', 'dddd', 'eeee');
	
	//echo 'fn('.json_encode($arr1).')';

	if($t == 'num')
	{
		$data = json_encode($arr1);
	}else{
		$data = json_encode($arr2);
	};
	//echo 'fn('.$data.');';
	echo $callback.'('.$data.');';
//	echo fn($data);
	
