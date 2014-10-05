//TODO: read the port from heroku

var http = require('http'), 
    fs = require('fs');

var currentTemperature;

var port = process.env.PORT || 1337;

var indexHtml = fs.readFileSync(__dirname + '/web-content/index.html');

var server = http.createServer(function (req, res) {
    if(req.url === '/sensor'){
        if(req.method === 'POST'){
            var data = '';
            req.on('data',function(s){
                data += s; 
            });
            req.on('end',function(){
                currentTemperature = JSON.parse(data);

                console.log('updated temperature to',currentTemperature);

                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(currentTemperature));

                //send out to websocket
                if(websocket){
                    websocket.emit('sensor', currentTemperature);
                }
            });
        }else{
            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(currentTemperature));
        }
    }else if(req.url === '/' || req.url === '/index.html'){
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(indexHtml);
    }else{
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Resource not found\n');
    }
});

server.listen(port);
console.log('Server running at',port);

var io = require('socket.io').listen(server);
var websocket;

io.sockets.on('connection', function (socket) {
    websocket = socket;
});
