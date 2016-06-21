var MockRestApiServer = require("../lib/express-mock-rest-api").MockRestApiServer;

var server = new MockRestApiServer(8999,"/mock-api",{
    useRequestHostAsAllowOrigin : true,
    headers : {
        "Access-Control-Allow-Headers" : ""
    }
});
server.start();