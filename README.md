# Developer's Notes
**Don't put auth tokens in localstorage!**

**Note:** Typically an API would set a refresh token as an http-only cookie, which can ONLY get sent cross-origin to the client if the client includes `credentials: include` in the request. However, you CANNOT set `credentials: include` if the API has CORS set to allow all (*) origins. The request will fail. 

So in this case, I do not actually know whether the dev-api.morphyusAI.com API is indeed setting the refresh token as an http-only cookie. As a workaround, I've created a proxy server in NextJS */api* which hits the dev-api.morphyusAI.com API and then passes the response back to the client, but also sets both the refresh token and access token as http-only cookies. Subsequent user authentication is then handled by the proxy server, which can check the cookies for both tokens.

Authentication and Authorization when done well should take *much* more time and effort than this. There are a ton of small contingencies - like NextJS routing and white flashes of unstyled content. I did my best here in a hurry. Consider this an M-MVP.