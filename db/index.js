var mysql = require('mysql');
var config = require('./config');

var connection = mysql.createConnection(config);
connection.connect(function(err) {
    if(err) console.log(err);
});

function handleDisconnect(connection) {
    connection.on('error', function(err){
        if(!err.fatal) {
            return;
        }

        if(err.code !== 'PROTOCOL_CONNECTION_LOST') {
            throw err;
        }
        connection.end();
        console.log('\nRe-connecting lost connection: ' + err.stack);

        setTimeout(function()
        {
            connection = mysql.createConnection(connection.config);
            handleDisconnect(connection);
            connection.connect();
        }, 1000); // 1 sec
    });
}

handleDisconnect(connection);

module.exports = connection;