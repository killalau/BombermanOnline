<?php
error_reporting(E_ALL);
ini_set('display_errors', '1');
include("../internal/dbms.php");
include("../internal/cookie.php");

$lobby_url = '../lobby/lobby.php';

$myDB = new SimpleDB();

//====================HAS COOKIE====================
if (cookieExist()){
    $usr_session = parseCookieSession();
    $db_session = $myDB->getSessionKeyBySession($usr_session);
    
    if ($db_session != null){        
        if ($myDB->getSessionExpiryTime($usr_session) > time()){//e.g. 1366845192
            //update session key (TO BE DONE IN PROTECTED ZONE)
            //setcookie("BomberManCookie", $usr_session, time()+$session_duration, '/');        
            //redirect
            header("Location: $lobby_url");
            exit;
        }
    }
}
//==================================================
/*
1. Expired session
2. Invalid Session key
3. No cookie
-->will stay in this index.html
*/
?>
<html><head>
	<link rel="stylesheet" type="text/css" href="../css/frontpagestyle.css">
    <title>Index - BomberMan by I4s</title>
    </head>
    <body style="font-family: 'Century Gothic';">
	<?echo $usr_session?>
        <div class="page-wrap">
    <div class="titlebar">
    <text class="titlebar-bigtitle">BomberMan</text>
    <text class="titlebar-smalltitle">Online!</text>
    </div>	
    <div class="subtitlebar">
    By Irresistible 4s
    </div>
    
    <div class="login-canvas">
    <br>
    <br>
    <form class="login-form" id="login_form" action="../internal/login.php" method="POST" >
    Player ID<br>
    <input type="text" name="id" autofocus=""><br><br>				
    Password<br>				
    <input type="password" name="pwd">				
    
    </form>
    <input class="login-rightbutton" type="image" src="./Login_go_button.png" form="login_form">
    <a class="login-leftbutton" href="../register/register.html" ><img src="./Login_register_button.png"></a>
    </div>
            <div class="login-notify-node" id="login-notify-node" >
                <?php
                    if (isset($_GET['return']) && ($_GET['return'] == '1')){
                        echo 'Invalid ID or Password';
                    }
                ?>
            </div>
        </div>
    Edited on Github Testing
	
	Forth Test using GitHub for windows
        
        Franky Hack this.
        Franky second hack.
    </body></html>
