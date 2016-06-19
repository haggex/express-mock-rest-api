var MockApiRestServer = require("./MockRestApiServer");


function mockRestServer(mockApiPath, port, options) {
    var mockApiRestServer = new MockApiRestServer(port,mockApiPath,options);
    mockApiRestServer.start();
    return ((server)=>{
        return ()=>{
            server.stop();
        }
    })(mockApiRestServer);
}

module.exports = mockRestServer;