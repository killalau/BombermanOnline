function createConnection(){
	console.log('[node-mysql]');
	var mysql = require('mysql');
	var mysqlConnection = mysql.createConnection({
		host     : 'localhost',
		user     : 'root',
		password : 'fr5zbbqf',
		database : 'bomberman',
	});
	return mysqlConnection;
}

exports.createConnection = createConnection;