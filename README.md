# Developer's Notes

**Auth - high level**

Splash page is only available to non-logged in users. User can login as regular or admin, and once logged in, will be automatically directed to dashboard, and cannot visit the splash or login pages. Only an Admin should see a button linking them to the profile/settings page.

Various useful client-side auth properties like `isAuthenticated`, `accessToken` and `isAdmin`, and methods like `login` and `logout` are controlled by AuthContext and available via a custom hook to any client component.

Upon login, the client sends a request to the NextJS proxy server, which forwards the request to the Python server and then attaches the `refresh_token` as an http-only cookie which is later used for refresh. The `access_token` is kept in-memory only, in a `useState` within AuthContext.

**Scenario: User refreshes page (and loses in-memory accessToken)**

The `useEffect` will fire inside of AuthContext any time a page is refreshed, check cookies to see whether there is a valid, unexpired refreshToken, and then use that refreshToken to get a new access_token (and a new refreshToken).

**Why not handle the refresh check in a request intercept?**

Since the `access_token` is stored client-side only in memory, I don't have a great way of retrieving it from memory inside of an `axios request interceptor` hook. I don't think this is an issue though, because I _believe_ the python API will deny a request with 401 if the `access_token` is expired, and we can catch it on the way back in the `axios response interceptor` hook. I don't love this solution. It would be easy to get around all of this by just taking the easy way out and storing the `access_token` in browser memory, but that would defeat the purpose of having the access/refresh token paradigm. Maybe there is a better way to couple interceptors and client auth state by storing those in the same place, but I'm spending a lot of time on this, and need to move on to the financial dashboard UI.

**auth addendum after writing chatbot**

I went into this challenge pretty dogmatic on the paradigm of "access token should only be stored in memory". But now I think it might have been better to just stick the access token in an http-only cookie as well, because there are a bunch of server side operations calling other server side operations which need the access token. For example, when the chat ai pipeline needs to make a tool call to the /summary api. If all the auth checks were just simply happening server side, maybe all of the request/response intercept stuff could have just happened in NextJS middleware or something. Hindsight 20/20

**Server-side authorization**

I've used NextJS middleware to automatically re-route users to public and private routes respectively. This way, re-routing should feel "slick" (ie. the user should never see a "flicker" of the UI elements of the page the do not have access to.) One caveat here is that as a website grows, this can start to cause latency in "perceived" page load times because the re-routing is going on "behind the scenes". Something to bear in mind, and profile for in the future. The middleware ONLY handles redirects - any token refreshing happens client-side.

**PYTHON SERVER**

Please see `PYTHON_SERVER.py` for some pseudo code that is my best guess at what the python api layer might look like, roughly.

**Dashboard/ticker infos**

Let's make the chart the star of the show. Big, bold, unabashed.

An obvious enhancement here would be to open some kind of socket connection to get real-time streaming data. But there are certainly some things here which can be easy perf enhancement grabs too, like caching images (maybe Next already does this behind the scenes?)

This would also be a great place to think about some optimistic UI patterns. For example, when I select a new ticker from the dropdown, I shouldn't have to wait for the network query to complete - the new ticker value should immediately populate the "title".

# Caveats / weird things

**NextJS auth proxy server**

Typically an API would automatically set a refresh token as an http-only cookie, which can ONLY get sent cross-origin to the client if the client includes `credentials: include` in the request. However, you CANNOT set `credentials: include` if the API has CORS set to allow all origins. The request will fail. The `dev-api.morphyusAI.com` API does have CORS set to allow all (\*) origins.

So in this case, I do not actually know whether the `dev-api.morphyusAI.com` API is indeed attempting to set the refresh token as an http-only cookie. It's simply returning the access_token and refresh_token as jwt.

I've created a proxy server in NextJS _/api_ which hits the `dev-api.morphyusAI.com` API and then passes the response back to the client, but also sets both the refresh token as http-only cookie.

Authentication and Authorization when done well should take _much_ more time and effort than this. There are a ton of small contingencies - like NextJS routing and white flashes of unstyled content. I did my best here in a hurry. Consider this an M-MVP. Forward-thinking, I would probably use a battle-tested solution like BetterAuth or NextAuth if we need flexibility, or Clerk if we don't care about vendor lock-in and cost.

**Refresh Token**

I don't have the secret key for the refresh token which signed in in the python server, so I can't verify the signature of the refresh token. I can only decode the payload. In production, you would definitely want to use either `jsonwebtoken or jose etc.` to verify the signature.

**Double Fetch**

Network request triggered by useEffect are firing twice. I think this is due to Strict Mode in React which fires useEffects twice in development, so it's expected. (I think).

**Meta is everywhere!**

All tickers seem to have a lot of the same metadata (get it? Meta? data? ha) including the `logo_url` in s3.

---

For a weekend of hacking, I'm satisfied with this. It's messy, and there are likely some edge cases yet to be discovered. I would NOT ship this as-is in production - I would like to more thoroughly look at how solutions like `BetterAuth` handle all of the edge cases first.
