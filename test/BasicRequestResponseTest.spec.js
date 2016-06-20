import {mockRequest} from "./TestServerUtils";


describe("Basic Request/Response Test",()=>{

    var testCall;

    var request;
    beforeEach(()=>{
        request = mockRequest("http://localhost:8999","/responses", "/mock-api");
    });
    afterEach((done)=>{
        request.reset().then(()=>{
            done();
        }).catch( err=> {
            assert(false,"error resetting mock server " + err);
        });
    })

    it("Test basic request to mocked endpoint", (done)=>{

        var expectedResponse = { testingNumber : 1, testingString : "test", nested : { variable : "var"}};


        request
            .path("/testing/1")
            .status(200)
            .method("POST")
            .body(expectedResponse)
            .execute()
            .then( apiCall => {
                apiCall().then( response => {
                    console.log(response.data);
                    expect(expectedResponse).to.deep.equal(response.data)
                    done();
                }).catch(err => {
                    console.log("ERROR", err);
                    assert(false,"error thrown =" + err);
                    done();
                });
            }).catch(err=>{
                console.log("ERROR =" , err);
                assert(false,"error thrown =" + err);
                done();
            });


    });
});