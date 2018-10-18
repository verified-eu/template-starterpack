# Verified Template Starter Pack

### Resources
[API Documentation](https://docs.verified.eu/)  
[VeLib 1.2.3](https://github.com/code11/verified-library/tree/1.2.3) (to be replaced in the near future)  
[Verified PROD](https://app.verified.eu)  
[Verified DEV](https://verified-dev.c11.io)  
[MarkoJS](https://markojs.com/)  

In the examples directory you can find a typical public template using Angular and [VeLib](https://github.com/code11/verified-library/tree/1.2.3), Verifieds (soon to be replaced) frontend API library. The included `printpdf` directory contains the PDF view - a series of [marko](https://markojs.com/) files that builds into the PDF. The marko files are always hosted under Verifieds domain, however you can host your own frontend (requires you to proxy all /api/ requests to https://app.verified.eu/api/).

```
http-server -a 127.0.0.1 -p 80 -P https://app.verified.eu -c-1
```

Assuming you have [http-server](https://www.npmjs.com/package/http-server) installed globally you can use the command above to set up a simple static webserver that forwards all unhandled requests (such as api calls) to Verifieds domain.

Using [VeLib](https://github.com/code11/verified-library/tree/1.2.3) is optional - you can just as well create your own API wrapper or make raw calls to the API.

### Token handling
Alternatively to [authenticating with a company user](https://docs.verified.eu/v2.1/general-and-concepts/authentication) in your backend, we can issue permanent public tokens that are limited to make API calls on your specific template - this is useful if you don't want to have your own backend and want a token that can be exposed publicly. *Note that we do not issue out public tokens with access to sensitive endpoints such as bisnode and idrigths lookup, for this you should have your own backend for more control over your token*.

### [examples/demo-template-public demo](https://app.verified.eu/lib/iframes/demo-template-public/?access_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOnsidWlkIjoiL3B1YmxpYy9jb21wYW5pZXMvcjFNWnRmV1c3L3RtcGwvZGVtby10ZW1wbGF0ZS1wdWJsaWMiLCJmYW1pbHlOYW1lIjoiRGVtbyIsImdpdmVuTmFtZSI6IlZlcmlmaWVkIiwibmFtZXNwYWNlIjoiL2NvbXBhbmllcy9yMU1adGZXVzcifSwianRpIjoicGdzbGN0LXFpZWFvdCIsImlhdCI6MTUzOTg2MjMwMSwicm9sZXMiOlsiL3JvbGVzL3RtcGwvY29tcGFuaWVzL3IxTVp0ZldXNyJdLCJwZXJtcyI6W10sImV4cCI6MTYwMzAyMDcwMX0.dIE4LimfSGLqiLp67evhO8FLFNTWBP8YshfCiJe1CbpVeNztlNWZahztKeRrShsKEJlaXJ9GpvX-Vd_5YyTQG7qQ6DH3leDF1Z7yhPBDr8mz-f_f8eC9zcHoqPodYAlu-UWPz7ysIRazJWRf7WxEgG1qn9cAsHT5-4I0c4sWuPCPoKqoBKqyQ69hZctczLUHPNGgAnGYewqxvRuoORsF9zY22BTKGduEOIL4VndUQACXqkfPfOnbeN7mFnJID_rQZdfTZxr18s9l-18M15JcYgguZ6c8wvx-f5QWXL_cUAC4Eoh2Qm3-aMbxY-NGwa2-phh0bY-K5PjRb9VeBbKUJw)
