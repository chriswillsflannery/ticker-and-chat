# Developer's Notes
**NextJS auth proxy server**

**Note:** Typically an API would automatically set a refresh token as an http-only cookie, which can ONLY get sent cross-origin to the client if the client includes `credentials: include` in the request. However, you CANNOT set `credentials: include` if the API has CORS set to allow all origins. The request will fail. The dev-api.morphyusAI.com API does have CORS set to allow all (*) origins.

So in this case, I do not actually know whether the dev-api.morphyusAI.com API is indeed attempting to set the refresh token as an http-only cookie. It's simply returning the access_token and refresh_token as jwt.

I've created a proxy server in NextJS */api* which hits the dev-api.morphyusAI.com API and then passes the response back to the client, but also sets both the refresh token as http-only cookie.

Authentication and Authorization when done well should take *much* more time and effort than this. There are a ton of small contingencies - like NextJS routing and white flashes of unstyled content. I did my best here in a hurry. Consider this an M-MVP. Forward-thinking, I would probably use a battle-tested solution like BetterAuth or NextAuth if we need flexibility, or Clerk if we don't care about vendor lock-in and cost.

**Refresh Token**

I don't have the secret key for the refresh token which signed in in the python server, so I can't verify the signature of the refresh token. I can only decode the payload.