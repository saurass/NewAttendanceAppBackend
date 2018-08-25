var mysql = require('mysql');
var conn = mysql.createConnection({
    host: "",
    user: "",
    password: "",
    database: ""
});

const pusher_client = require("pusher-js");
const pusher_client_socket = new pusher_client('bbc80a32d3d897c82c39', {
    cluster: 'ap2',
    encrypted: true
});

var channel = pusher_client_socket.subscribe('my-channel');

channel.bind('my-event', function(data) {
    var rand = data.rand;
    var roll = data.roll;
    var pass = data.pass;
	getAttendance(roll, rand);
});

function getAttendance(roll, rand) {
	console.log('>>',roll);
	var quer = "SELECT sub_id,SUM(attended) as atten,SUM(totalclasses) as tclss,((SUM(attended)/SUM(totalclasses))*100) as per FROM attendance WHERE st_id='" + roll + "' GROUP BY sub_id";
    conn.query(quer, function(err, rows) {
    	sendData(rows, rand);
    });
}

function sendData(rows, rand) {
	var arr = [];
    rows.forEach((row) => {
    	arr.push([row.sub_id, row.atten, row.tclss, row.per]);
    });
    sendDataOnSocket(arr, rand);
}

function sendDataOnSocket(arr, rand) {
    var pusher_server = require("pusher");
    var pusher_server_socket = new pusher_server({
        appId: '585086',
        key: 'bbc80a32d3d897c82c39',
        secret: 'e5a976636a6a9bb38896',
        encrypted: true,
        cluster: 'ap2'
    });
	pusher_server_socket.trigger('my-channel', 'my-event2', {
		"rand": rand,
		"data": arr
	});
}