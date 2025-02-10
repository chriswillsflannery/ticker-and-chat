# Stock ticker with chatbot

Application with NextJS, Tailwind, shadcn

## How to / local development

### install dependencies

```bash
install packages necessary for nextjs:
in root folder:
npm i

run nextjs locally:
npm run dev

NOTE: You will need .env in root
NEXT_PUBLIC_API_URL= [python endpoint here]
OPENAI_API_KEY= [api key here]
```

# Developer's Notes

**Auth - high level**

Splash page is only available to non-logged in users. User can login as regular or admin, and once logged in, will be automatically directed to dashboard, and cannot visit the splash or login pages. Only an Admin should see a button linking them to the profile/settings page.

Various useful client-side auth properties like `isAuthenticated`, `accessToken` and `isAdmin`, and methods like `login` and `logout` are controlled by AuthContext and available via a custom hook to any client component.

Upon login, the client sends a request to the NextJS proxy server, which forwards the request to the Python server and then attaches the `refresh_token` as an http-only cookie which is later used for refresh. The `access_token` is kept in-memory only, in a `useState` within AuthContext.

**Scenario: User refreshes page (and loses in-memory accessToken)**

The `useEffect` will fire inside of AuthContext any time a page is refreshed, check cookies to see whether there is a valid, unexpired refreshToken, and then use that refreshToken to get a new access_token (and a new refreshToken).

**Why not handle the refresh check in a request intercept?**

Since the `access_token` is stored client-side only in memory, the best way I could think of to make it accessible to the axios request/response interceptors was to wrap the axios stuff in a big react hook, and then try to keep that synchronized with AuthContext. This still feels code smelly/bloated to me, but the general idea is that we intercept outgoing requests and attach the access token, and if it comes back 401, we intercept that, and we know that the access token expired, so we use the refresh token to get a new one.

It would be easy to get around all of this by just taking the easy way out and storing the `access_token` in browser memory, but that would kinda defeat the purpose of having the access/refresh token paradigm. Maybe there is a better way to couple interceptors and client auth state by storing those in the same place like in some kind of singleton class, but I'm spending a lot of time on this, and need to move on to the financial dashboard UI.

**auth addendum after writing chatbot**

I went into this challenge pretty dogmatic on the paradigm of "access token should only be stored in-memory". But now I think it might have been better to just stick the access token in an http-only cookie as well, because there are a bunch of server side operations calling other server side operations which need the access token. For example, when the chat ai pipeline needs to make a tool call to the /summary api. If all the auth checks were just simply happening server side, maybe all of the request/response intercept stuff could have just happened in NextJS middleware or something. Hindsight 20/20

**Server-side authorization**

I've used NextJS middleware to automatically re-route users to public and private routes respectively. This way, re-routing should feel "slick" (ie. the user should never see a "flicker" of the UI elements of the page the do not have access to.) One caveat here is that as a website grows, this can start to cause latency in "perceived" page load times because the re-routing is going on "behind the scenes". Something to bear in mind, and profile for in the future. The middleware ONLY handles redirects - any token refreshing happens client-side.

**PYTHON SERVER**

Please see `PYTHON_SERVER.py` for some pseudo code that is my best guess at what the python api layer might look like, roughly.

**Dashboard/ticker infos**

Let's make the chart the star of the show. Big, bold, unabashed.

An obvious enhancement here would be to open some kind of socket connection to get real-time streaming data. But there are certainly some things here which can be easy perf enhancement grabs too, like caching images (maybe Next already does this behind the scenes?)

This would also be a great place to think about some optimistic UI patterns. For example, when I select a new ticker from the dropdown, I shouldn't have to wait for the network query to complete - the new ticker value should immediately populate the "title".

**Chatbot**

The super latent `/summary` endpoint is a real doozy to work with. I can spin the app up locally in development mode and successfully chain tool calls, but when [I tried a vercel deployment here](https://ticker-and-chat.vercel.app/) the tool calls would just bomb out with no response or error. I _think_ it has something to do with Vercel/nodeJS timeout limits somewhere, so I tried switching the relevant Next routes from edge runtime to nodejs runtime, but that still bombed out. At this point, I'm running a little short on time. If I had to do this _for real_ I would look at some best practices in deployed examples and really pore over the ai sdk docs. It seems that general best practices in this situation are to try and do something where the tool call is running as a background job, and the server just starts streaming in some preliminary model-generated text relevant to your query while that is finishing, so the UI at least has the perception of something happening.

I didn't have time to implement caching but that would be an obvious enhancement. [It seems like that's pretty straightforward to implement.](https://sdk.vercel.ai/docs/advanced/caching). One thing worth mentioning is that the response from the tool call exceeded the total token limit for the entirety of the gpt-4 context window (lol) so I just chose to only extract the `agent_summary`. If we really needed more fields (like citations and sources etc.) we could extract just those fields we need. As the context window grows, we can make some calculated choices about which older messages we want to either truncate or summarize. This is something that can be looked at on a model-by-model basis and we can decide how to truncate/summarize most efficiently for that model's context limit etc.

Addendum after testing with a personal OpenAI key - It's possible that OpenAI erroneously returns 200 OK on a tool call if your OpenAI account has a billing issue. Need to look into this further. I'll try [upping the max timeout in vercel.](https://vercel.com/docs/functions/configuring-functions/duration#maximum-duration-for-different-runtimes)

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

For a weekend of hacking, I'm satisfied with this. It's messy, and there are likely some edge cases yet to be discovered. I would NOT ship this as-is in production. I would like to more thoroughly look at how solutions like `BetterAuth` handle all of the edge cases first. I would also like to more deeply read and understand the ai-sdk docs, as there are likely a lot of best practices I'm unaware of (this was my first time attempting to build anything that does tool calls).

Thanks! This was fun. Learned a lot.

![Splash](https://github.com/chriswillsflannery/ticker-and-chat/blob/main/public/splash.png)
![Login](https://github.com/chriswillsflannery/ticker-and-chat/blob/main/public/login.png)
![Stats](https://github.com/chriswillsflannery/ticker-and-chat/blob/main/public/stats.png)
![Chat](https://github.com/chriswillsflannery/ticker-and-chat/blob/main/public/chat.png)
