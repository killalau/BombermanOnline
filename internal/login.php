<?php
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
	include("../internal/dbms.php");
	include("../internal/myPath.php");

    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $session_duration = 60;

    //Redirect any abnormal access on this page to index.php
    if (!(isset($_POST["id"])) || !(isset($_POST["pwd"]))){
        header("Location:http://$my_host:$http_port$index_url");
        exit;
    }
    $id = $_POST["id"];
    $pwd = $_POST["pwd"];

    //validate the id only contains valid characters
    for ($i = 0; $i < strlen($id); $i++){
        if (strpos($characters, $id[$i]) == false){
            header("Location:http://$my_host:$http_port$index_url?return=1");
        #header("Location:". $index_url.'?return=1');
            //echo 'contain invalid character(s)';
            exit;
        }
    }

    $myDB = new SimpleDB();

    $db_pwd = $myDB->getPassword($id);

    if ($db_pwd == null){
        header("Location:http://$my_host:$http_port$index_url?return=1");
        #header("Location:". $index_url.'?return=1');
        //echo 'No such ID';
    }else{        
        if ($pwd == $db_pwd){
            //=========Correct Password=========
            $session_key = $myDB->createSession($id);
			$expiry_time = $myDB->getSessionExpiryTime($session_key);
            //     ====set client cookie====
			$id = $myDB->getIdBySession($session_key);
				//setcookie("BomberManCookie", $session_key, $expiry_time, '/');
			setcookie("BomberManCookie", $id.':'.$session_key, $expiry_time, '/');
            //     =========================
            //        ====redirect====
            header("Location:http://$my_host:$nodejs_port$lobby_url");            
            //        ================
            //echo date('Y-m-d H:i:s',$expiry_time);
            //echo date_default_timezone_get();
            echo 'Redirecting...';
            //====================================
        }else{
            #header("Location:". $index_url.'?return=1');
        header("Location:http://$my_host:$http_port$index_url?return=1");
            //echo 'Incorrect ID or Password';
        }
    }
?>
