var udp = require('dgram'),
    osc = require('osc-min'),
    http = require('http');


var hostname = "node-muse-server-example.herokuapp.com",
    port = 80;

//var hostname = 'localhost',
//    port = 1337;

//var re = /^\/muse\/dsp\/elements\/$/;
var ELE = '/muse/dsp/elements/';

var ts = new Date();
var sock = udp.createSocket("udp4", function(msg, rinfo) {

  var error;
  try {
    var o = osc.fromBuffer(msg);
    if(!(o.address === '/muse/eeg' 
          //|| o.address === ELE + 'delta' 
          //|| o.address === ELE + 'beta' 
          //|| o.address === ELE + 'gamma' 
          //|| o.address === ELE + 'alpha'
          //|| o.address === ELE + 'theta' 
        )) return;


    var now = new Date();

    var delta = now - ts;
    if(delta < 1000) return;      //process 1 event per second

    ts = now;

    console.log('sending eeg reading',o);

    //send a POST
    var options = {
      hostname: hostname,
      port: port,
      path: '/sensor',
      method: 'POST'
    };

    var req = http.request(options, function(res) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
        console.log('BODY: ' + chunk);
      });
    });

    req.on('error', function(e) {
      console.log('problem with request: ' + e.message);
    });

    // write data to request body
    req.write(JSON.stringify(o));
    req.end();
  } catch (_error) {
    error = _error;
    return console.log("invalid OSC packet",error.message );
  }
});

sock.bind(5000);
