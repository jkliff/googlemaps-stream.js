#!env node

usage = function () {
    console.log ('node app.js [FILE TO WATCH]');
}

if (process.argv.length != 3) {
    console.log ('Missing argument.');
    usage();
    return -1;
}

var watched_file = process.argv[2];

var http = require('http'),
    url = require ('url'),
    app = http.createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    events = require ('events'),
    tail = require ('tail');

app.listen(8000);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

var _u = "http://maps.googleapis.com/maps/api/geocode/json";
var u = url.parse (_u);
var client = http.createClient (u.port, u.host);

var markEmitter = new events.EventEmitter();

tail = new tail.Tail (watched_file);

tail.on("line", function(chunk) {
    console.log ('Received address: ' + chunk);
    var r = client.request ('GET', u.pathname + '?address=' + encodeURIComponent(chunk) + '&sensor=false', {'host': u.host});
    r.end ();
    r.on ('response', function (res) {
        var s = '';
        res.on('data', function(chunk) {
            s += chunk;
        });
        res.on ('end', function () {
            var j = JSON.parse (s);
            if (!j.results[0]) {
                return;
            }
            markEmitter.emit ('update', j.results[0].geometry.location);
        });
    });
});

io.of ('/map').on('connection', function (socket) {

    socket.emit('sale', { hello: 'world' });
    markEmitter.on ('update', function (data) {
        socket.emit ('mark', data);
    });
});

