<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

$cookieName = 'BomberManCookie';

function cookieExist(){
	if (isset($_COOKIE[$cookieName])){
		return true;
	}else
		return false;
}

function parseCookieSession(){
	$cookieValue = $_COOKIE[$cookieName];
	$colonPos = strpos($cookieValue, '%');
	$session = substr($cookieValue, $colonPos+3);
	return $session;
}

function parseCookieId(){
	$cookieValue = $_COOKIE[$cookieName];
	$colonPos = strpos($cookieValue, '%');
	$id = substr($cookieValue, 0, $colonPos-1);
	return $id;
}
?>