<?php
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
	include("../internal/dbms.php");

    $index_url = '../index/index.php';
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    //Redirect any abnormal access on this page to index.php
    if (!(isset($_POST["id"])) || !(isset($_POST["pwd"]))){
        header("Location:". $index_url);
        exit;
    }

    $id = $_POST["id"];
    $pwd = $_POST["pwd"];

    //validate the id only contains valid characters
    for ($i = 0; $i < strlen($id); $i++){
        if (strpos($characters, $id[$i]) == false){
            echo "Fail";
            exit;
        }
    }    

    $myDB = new SimpleDB();
	$result = $myDB->getIdById($id);

    if ($result != null){
        //Normally, this case wont be reached, already guarded on client side
        echo "Error: Same account ID already exist";
    }else{
        $result = $myDB->createAccount($id, $pwd);
        if ($result == true){
            //Account ID creation success            
            echo "Success";
            //echo "Fail";//***testing***
        }else{
            //Account ID creation failed
            echo "Fail";
        }
    }

?>