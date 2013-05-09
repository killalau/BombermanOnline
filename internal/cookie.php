<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');

class SimpleCookie{

	var $cookieValue = null;

	function __construct(){
		if (isset($_COOKIE['BomberManCookie'])){
			$this->cookieValue = $_COOKIE['BomberManCookie'];
		}
	}

	function cookieExist(){
		if (isset($this->cookieValue)){
			return true;
		}else
			return false;
	}

	function parseCookieSession(){
		$colonPos = strpos($this->cookieValue, ':');
		$session = substr($this->cookieValue, $colonPos+1);
		return $session;
	}

	function parseCookieId(){
		$colonPos = strpos($this->cookieValue, ':');
		$id = substr($this->cookieValue, 0, $colonPos-1);
		return $id;
	}
}
?>