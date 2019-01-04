<?PHP
	header("Access-Control-Allow-Origin:*");
	$a = $_POST["val"];
	
	$arr=array();
	$arr["mainId"]="111111";  
	$arr["text"]="$a";  
	echo json_encode($arr); 

?>