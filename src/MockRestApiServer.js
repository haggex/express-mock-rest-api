import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import {ResponseHandler} from "./ResponseHandler";


class MockRestApiServer {

    constructor(port,mockApiPath,options) {
        this.started = false;
        this.options = options;
        this.port = port;
        this.mockApiPath = mockApiPath;
        this.responseHandler = new ResponseHandler();
        this.server = null;
    }
    stop() {
        if(this.server != null && this.started == true) {
            this.server.stop();
        }
    }
    start() {
        var app = express();
        app.disable('etag');
        app.set("port", this.port);

        var responseApi = express();
        var corsOptionsDelegate = (req, callback) => {
            callback(null,{ origin: true, credentials : true});
        };
        responseApi.options("/*",cors(corsOptionsDelegate));
        responseApi.use(bodyParser.json());
        responseApi.post("/add",(request,response) => {
            var json = request.body;
            this.responseHandler.mapResponse(json.path, json.method, json.responseHttpStatus, json.responseBody, json.responseHeaders || {});
            response.set("Access-Control-Allow-Origin",request.headers.origin);
            response.set("Content-Type", "application/json");
            response.send('{"result" : "OK"}');
        });
        responseApi.get("/reset",(request,response)=>{
            this.responseHandler.reset();
            response.status(200);
            response.set("Content-Type", "application/json");
            response.send('{"result" : "OK"}');
        });


        var mockApi = express();

        mockApi.use(cors(corsOptionsDelegate));
        mockApi.disable('etag');
        mockApi.post("/*",(request,response)=>{
            console.log("Handle POST");
            this.handleRequest(request, "POST", response);
        });
        mockApi.get("/*",(request,response)=>{
            console.log("Handle GET");
            this.handleRequest(request, "GET", response);
        });

        app.use("/responses",responseApi);
        app.use(this.mockApiPath,mockApi);

        var welcome = express();
        welcome.get("/",(req,res)=>{
            res.send("Welcome!");
        });
        app.use("/",welcome);

        this.server = app.listen(app.get('port'), () => {
            var port = this.server.address().port;
            console.log('Magic happens on port ' + port);
            this.started = true;
        });
    }
    setGlobalHeaders(request, response) {
        if(this.options.useRequestHostAsAllowOrigin) {
            response.set("Access-Control-Allow-Origin",request.headers.host)
        }
        if(this.options.headers) {
            for(var h in this.options.headers) {
                response.set(h,this.options.headers[h]);
            }
        }
    }

    handleRequest(request, method, response) {
        var apiResponse = this.responseHandler.onRequest(request.url,method,request.body,null);
        if (apiResponse) {
            if (apiResponse.responseHeaders) {
                for (var x in response.responseHeaders) {
                    response.set(x, response.responseHeaders[x]);
                }
            }
            response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
            response.header('Expires', '-1');
            response.header('Pragma', 'no-cache');
            console.log("Sending response = ", apiResponse.responseBody);
            response.status(apiResponse.responseHttpStatus).json(apiResponse.responseBody);
        } else {
            this.notFound(response, request);
        }
    }

    notFound(response, request) {
        response.status(404).send("No response mapped for " + request.url + " available: " + this.responseHandler.getMappedPaths());
    }

}

module.exports = MockRestApiServer;