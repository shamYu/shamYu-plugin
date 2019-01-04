<?php
header("Access-Control-Allow-Origin:*");
if($_GET['num']==0){
	echo '第一项的内容';
}
else if($_GET['num']==1){
	echo '第二项的内容';
}
else if($_GET['num']==2){
	echo '第三项的内容';
}
?> 