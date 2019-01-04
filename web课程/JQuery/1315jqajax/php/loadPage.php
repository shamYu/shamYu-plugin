<?PHP
	header("Access-Control-Allow-Origin:*");
	if( $_GET["num"] == 1 ){
		echo '[{"mainId":"3456666","text":"回到房间打开饭盒"},{"mainId":"345646666","text":"sdfsdfff"},{"mainId":"345896666","text":"分哈哈哈哈哈"}]';
	}
	else if( $_GET["num"] == 2 ){
		echo '[{"mainId":"345668866","text":"ssssssssss"},{"mainId":"3456462666","text":"llkkkkk"},{"mainId":"345896666","text":"痘痘的都"}]';
	}
	else if( $_GET["num"] == 3 ){
		echo '[{"mainId":"3411156666","text":"回到s房间打开饭盒"},{"mainId":"3456464666","text":"对对对"},{"mainId":"3458966666","text":"ffff"}]';
	}

?>