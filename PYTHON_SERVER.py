from fastapi import FastAPI, HTTPException, Form, Request
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
import jwt 

# NOTE - Please treat this as pseudocode.
# This is just a "best guess".

app = FastAPI()

# secret for signing jwt, which crucially, I don't have access to in my app
SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256" # is this algo still best practice for signing jwts?

# instructions were unclear - *both* have 5min expiry?
ACCESS_TOKEN_EXPIRE_MINUTES = 5
REFRESH_TOKEN_EXPIRE_MINUTES = 5

# Here, connect to a db which has user records.
# each user record should have a hashed pw and role.
# users_db.conn()

def create_access_token(username: str, expires_delta: timedelta = None) -> str:
    """
    I think sub is assigned the username, not role
    I don't see a "role" field on the jwt so I've just been using the sub field to determine role
    """
    to_encode = {"sub": username, "type": "access"}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": int(expire.timestamp())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(username: str, expires_delta: timedelta = None) -> str:
    """
    seems to be roughly same as access_token creation
    """
    to_encode = {"sub": username, "type": "refresh"}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=REFRESH_TOKEN_EXPIRE_MINUTES
        )
    to_encode.update({"exp": int(expire.timestamp())})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

@app.post("/challenge/api/login")
async def login(username: str = Form(...), password: str = Form(...)):
    user = users_db.get(username)
    # in reality we should use whatever is the latest greatest salt/hash lib
    # to store and lookup hashed pw
    if not user or password != user["password"]:
        raise HTTPException(status_code=401, detail="Invalid credentials")

		# optionally get and use role to sign tokens, but we seem to be just expecting
    # client to infer role based on username "sub"
    # role = user["role"]

    access_token = create_access_token(username)
    refresh_token = create_refresh_token(username)

    response = JSONResponse(
        content={
            "access_token": access_token,
            "refresh_token": refresh_token,
        }
    )
    # again, not sure if pydantic is actually doing this (it should be), see developer notes
    response.set_cookie(
        key="refresh_token", value=refresh_token, httponly=True
    )
    return response

@app.post("/challenge/api/refresh")
async def refresh_token_endpoint(data: RefreshRequest):
    refresh_token = data.refresh_token
    try:
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Refresh token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token type")

    username = payload.get("sub")
    if username not in users_db:
        raise HTTPException(status_code=401, detail="Invalid token subject")

    new_access_token = create_access_token(username)
    new_refresh_token = create_refresh_token(username)

    json_response = JSONResponse(
        content={
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
        }
    )
    json_response.set_cookie(key="refresh_token", value=new_refresh_token, httponly=True)
    return json_response

@app.get("/challenge/api/profile")
async def get_profile(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authorization header missing")

    token = auth_header.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Access token expired")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid access token")

    if payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type")

    username = payload.get("sub")
    if username != "admin_user":
        raise HTTPException(status_code=403, detail="Not authorized to view profile")

    return {"username": username, "message": "Welcome to the admin profile"}

# spin this up however, but people seem to really like uvi compared to poetry etc for perf
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
