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
    
    if ($db_session != null){
		//redirect
		header("Location:http://$my_host:$http_port$revisit_url");
		//update session key (TO BE DONE IN PROTECTED ZONE)
    }
}
//==================================================
/*
1. Expired session	***(Canceled, sicne only persistent cookie and session cookie are used)***
2. Invalid Session key
3. No cookie
-->will stay in this index.html
*/
?>
<html>
	<head>
		<link rel="stylesheet" type="text/css" href="../css/frontpagestyle.css">
		<title>Index - BomberMan by I4s</title>
		<script>
			window.history.forward();
		</script>
    </head>
    <body style="font-family: 'Century Gothic';">
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
					<input type="password" name="pwd"><br>
					<input class="rememberme" type="checkbox" name="persistent" value="true"><span class="rememberme">Keep me logged in</span>				
				</form>
				<input class="login-button-adjust login-rightbutton" type="image" src="./Login_go_button.png" form="login_form">
				<a class="login-button-adjust login-leftbutton" href="../register/register.html" ><img src="./Login_register_button.png"></a>
			</div>
            <div class="login-notify-node" id="login-notify-node" >
                <?php
                    if (isset($_GET['return']) && ($_GET['return'] == '1')){
                        echo 'Invalid ID or Password';
                    }
                ?>
            </div>
        </div>        
    </body>
</html>