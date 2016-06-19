var mockServer = require("../lib/express-mock-rest-api");

mockServer("/mock-api",8999,{
    useRequestHostAsAllowOrigin : true,
    headers : {
        "Access-Control-Allow-Headers" : ""
    }
});
