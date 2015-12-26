/** simple static server*/
var static = require('node-static');
var file = new static.Server();

var PORT = process.env.PORT || 8000;

require('http').createServer(function(request, response) {
  request.addListener('end', function() {
    file.serve(request, response);
  }).resume();
}).listen(PORT);
console.log("Server listening on port "+PORT);