var MockRestApiServer = require("../lib/express-mock-rest-api").MockRestApiServer;

var server = new MockRestApiServer(8999,"/mock-api",{});
server.start();