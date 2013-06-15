var static = require('node-static');
var fileServer = new static.Server('./client');

require('http').createServer(function (request, response) {
    //request.addListener('end', function () {
        fileServer.serve(request, response);
    //});
}).listen(8085);

console.log("Server started on 8085");
