<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
include("../internal/dbms.php");
include("../internal/cookie.php");

$index_url = '../index/index.php';
$myDB = new SimpleDB();

//====================HAS COOKIE====================
if (cookieExist()){
    $usr_session = parseCookieSession();
    $db_session = $myDB->getSessionKeyBySession($usr_session);
    
    if ($db_session != null){
        if ($myDB->getSessionExpiryTime($usr_session) > time()){//e.g. 1366845192
            $myDB->updateSession($usr_session);
			$id = $myDB->getIdBySession($usr_session);
			$new_expiry_time = $myDB->getSessionExpiryTime($usr_session);
				//setcookie('BomberManCookie', $usr_session, $new_expiry_time, '/');
			setcookie('BomberManCookie', $id.':'.$usr_session, $new_expiry_time, '/');
            //display the page...
        }else{
            //======invalid session=======
            header("Location: $index_url");
            exit;
            //============================
        }
    }else{
        //=======no such session in DB=====
        header("Location: $index_url");
        exit;
        //=================================
    }
//==================================================
//===================NO COOKIE======================
}else{
    header("Location: $index_url");
    exit;
}

/*
1. Expired session
2. Invalid Session key
3. No cookie
-->kick him to index.php
*/
?>
<html>
    <head>
        <title>
            Lobby - BomberMan By I4s
        </title>
    </head>
    <body>
        This is Lobby.
        Session only valid for 20s...
        Refreshing the page will update the session.
    </body>
</html>