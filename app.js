var mysql = require('mysql');
var conn = mysql.createConnection({
    host: "",
    user: "",
    password: "",
    database: ""
});

const pusher_server = require("pusher");
const pusher_server_socket = new pusher_server({
	appId: '584363',
	key: '3df9164881a3cc6ba333',
	secret: 'ad7d30f73f6203ba9f91',
	encrypted: true,
	cluster: 'ap2'
});

const pusher_client = require("pusher-js");
const pusher_client_socket = new pusher_client('3df9164881a3cc6ba333', {
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
	if(roll)
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
	pusher_server_socket.trigger('my-channel', 'my-event', {
		"rand": rand,
		"data": arr
	});
}