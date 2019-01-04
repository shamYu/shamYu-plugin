<?php
	
	$one=$_POST['one'];
	$two=$_POST['two'];
	$three=$_POST['three'];
	$four=$_POST['four'];
	$five=$_POST['five'];
	
	$arr = array($one, $two,$three, $four, $five);

	echo json_encode($arr);

	
