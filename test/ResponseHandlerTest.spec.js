import {ResponseHandler} from "../src/ResponseHandler";


describe('Response Handler Test',()=>{

    var responseHandler;
    beforeEach(()=>{
        responseHandler = new ResponseHandler();
    });

    it('Test add response',()=>{
        var testPath = "/dir1/dir2";

        responseHandler.mapResponse(testPath, "POST", 200,{ "testVar" : "testVal"});
        responseHandler.mapResponse(testPath, "GET", 200,{ "testVar" : "testVal2"});

        expect(responseHandler.pathMappings.length).to.equal(2);

        var response = responseHandler.onRequest(testPath,"POST", null);

        expect(response.path).to.equal(testPath);
        expect(response.method).to.equal("POST");
        expect(response.responseHttpStatus).to.equal(200);
        expect(response.responseBody.testVar).to.equal("testVal");

        var response = responseHandler.onRequest(testPath,"GET",null);

        expect(response.path).to.equal(testPath);
        expect(response.method).to.equal("GET");
        expect(response.responseHttpStatus).to.equal(200);
        expect(response.responseBody.testVar).to.equal("testVal2");

        var requestsForMappings = responseHandler.getRequestsForMappings(testPath);
        expect(requestsForMappings.length).to.equal(2);

        expect(requestsForMappings[0].method).to.equal("POST");
        expect(requestsForMappings[1].method).to.equal("GET");

        requestsForMappings = responseHandler.getRequestsForMappings(testPath, "POST");
        expect(requestsForMappings.length).to.equal(1);
        expect(requestsForMappings[0].method).to.equal("POST");

        requestsForMappings = responseHandler.getRequestsForMappings(testPath, "GET");
        expect(requestsForMappings.length).to.equal(1);
        expect(requestsForMappings[0].method).to.equal("GET");


    });

    it('Test add multiple responses on same path',()=>{
        var testPath = "/dir1/dir2";

        responseHandler.mapResponse(testPath, "POST", 200,{ "testVar" : "testVal"});
        responseHandler.mapResponse(testPath, "POST", 200,{ "testVar" : "testVal2"});
        responseHandler.mapResponse(testPath, "POST", 500,{ "testVar" : "testVal3"});

        expect(responseHandler.pathMappings.length).to.equal(1);

        var response = responseHandler.onRequest(testPath,"POST",null, {"Content-type" : "application/json"});

        expect(response.path).to.equal(testPath);
        expect(response.method).to.equal("POST");
        expect(response.responseHttpStatus).to.equal(200);
        expect(response.responseBody.testVar).to.equal("testVal");

        response = responseHandler.onRequest(testPath,"POST",null, {"Content-type" : "application/json"});

        expect(response.path).to.equal(testPath);
        expect(response.method).to.equal("POST");
        expect(response.responseHttpStatus).to.equal(200);
        expect(response.responseBody.testVar).to.equal("testVal2");

        response = responseHandler.onRequest(testPath,"POST",null, {"Content-type" : "application/json"});

        expect(response.path).to.equal(testPath);
        expect(response.method).to.equal("POST");
        expect(response.responseHttpStatus).to.equal(500);
        expect(response.responseBody.testVar).to.equal("testVal3");

        var requestsForMappings = responseHandler.getRequestsForMappings(testPath,"POST");
        expect(requestsForMappings.length).to.equal(3);


        requestsForMappings = responseHandler.getRequestsForMappings(testPath,"POST",200);
        expect(requestsForMappings.length).to.equal(2);

        requestsForMappings = responseHandler.getRequestsForMappings(testPath,"POST",500);
        expect(requestsForMappings.length).to.equal(1);

    });
});