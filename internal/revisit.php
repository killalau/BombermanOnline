<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
include("../internal/dbms.php");
include("../internal/cookie.php");
include("../internal/myPath.php");

$myDB = new SimpleDB();
$myCookie = new SimpleCookie();

//====================HAS COOKIE====================
if ($myCookie->cookieExist()){
    $usr_session = $myCookie->parseCookieSession();
    $db_session = $myDB->getSessionKeyBySession($usr_session);
    
	//=====REDIRECT ANY UNAUTHORIZED ACCESS WITHOUT VALID COOKIE=====
    if ($db_session == null){
		//remove cookie
		setrawcookie("BomberManCookie", '0', mktime(0, 0, 0, 1, 1, 1970), '/');
		//redirect
		header("Location:http://$my_host:$http_port$index_url");
		exit;
    }
//====================NO COOKIE====================
}else{
	//=====REDIRECT ANY UNAUTHORIZED ACCESS WITHOUT VALID COOKIE=====
	header("Location:http://$my_host:$http_port$index_url");
	exit;
}

//===update session key===
$new_session = $myDB->updateSession($usr_session);
//===set cookie===
$id = $myDB->getIdBySession($new_session);
$persistent = $myDB->getPersistentBySession($new_session);
if ($persistent){
	$expiry_time = time() + 60*60*24*365*10;
}else{
	$expiry_time = 0;
}
setrawcookie("BomberManCookie", $id.':'.$new_session, $expiry_time, '/');
//===redirect===
header("Location:http://$my_host:$nodejs_port$lobby_url");




	
?>