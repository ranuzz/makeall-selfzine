import cookie from "cookie"

//let AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET, AUTH0_CALLBACK_URL, SALT

// will be passed as secret later
const auth0 = {
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
    clientSecret: AUTH0_CLIENT_SECRET,
    callbackUrl: AUTH0_CALLBACK_URL,
}

const cookieKey = "AUTH0-AUTH"
  
const redirectUrl = state => `https://${auth0.domain}/authorize?response_type=code&client_id=${auth0.clientId}&redirect_uri=${auth0.callbackUrl}&scope=openid%20profile%20email&state=${encodeURIComponent(state)}`
  
const generateStateParam = async () => {
    const resp = await fetch("https://csprng.xyz/v1/api")
    const { Data: state } = await resp.json()
    await AUTH_STORE.put(`state-${state}`, true, { expirationTtl: 86400 })
    return state
  }
  
const verify = async event => {
    const cookieHeader = event.request.headers.get("Cookie")
    if (cookieHeader && cookieHeader.includes(cookieKey)) {
        const cookies = cookie.parse(cookieHeader)
        if (!cookies[cookieKey]) return {}
        const sub = cookies[cookieKey]
      
        const kvData = await AUTH_STORE.get(sub)
        if (!kvData) {
        throw new Error("Unable to find authorization data")
        }

        let kvStored
        try {
        kvStored = JSON.parse(kvData)
        } catch (err) {
        throw new Error("Unable to parse auth information from Workers KV")
        }

        const { access_token: accessToken, id_token: idToken } = kvStored
        const userInfo = JSON.parse(decodeJWT(idToken))
        return { accessToken, idToken, userInfo }
    }
    return {}
}
  
// Returns an array with the format
//   [authorized, context]
export const authorize = async event => {
    const authorization = await verify(event)
    if (authorization.accessToken) {
        return [true, { authorization }]
    } else {
        const state = await generateStateParam()
        return [false, { redirectUrl: redirectUrl(state) }]
    }
}

// https://github.com/pose/webcrypto-jwt/blob/master/workers-site/index.js
const decodeJWT = function(token) {
    var output = token
      .split(".")[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
    switch (output.length % 4) {
      case 0:
        break
      case 2:
        output += "=="
        break
      case 3:
        output += "="
        break
      default:
        throw "Illegal base64url string!"
    }
  
    const result = atob(output)
  
    try {
      return decodeURIComponent(escape(result))
    } catch (err) {
      console.log(err)
      return result
    }
  }

  const validateToken = token => {
    try {
      const dateInSecs = d => Math.ceil(Number(d) / 1000)
      const date = new Date()
  
      let iss = token.iss
  
      // ISS can include a trailing slash but should otherwise be identical to
      // the AUTH0_DOMAIN, so we should remove the trailing slash if it exists
      iss = iss.endsWith("/") ? iss.slice(0, -1) : iss
  
      if (iss !== AUTH0_DOMAIN) {
        throw new Error(
          `Token iss value (${iss}) doesn’t match AUTH0_DOMAIN (${AUTH0_DOMAIN})`,
        )
      }
  
      if (token.aud !== AUTH0_CLIENT_ID) {
        throw new Error(
          `Token aud value (${token.aud}) doesn’t match AUTH0_CLIENT_ID (${AUTH0_CLIENT_ID})`,
        )
      }
  
      if (token.exp < dateInSecs(date)) {
        throw new Error(`Token exp value is before current time`)
      }
  
      // Token should have been issued within the last day
      date.setDate(date.getDate() - 1)
      if (token.iat < dateInSecs(date)) {
        throw new Error(`Token was issued before one day ago and is now invalid`)
      }
  
      return true
    } catch (err) {
      console.log(err.message)
      return false
    }
  }

//Persisting authorization data in Workers KV
const persistAuth = async exchange => {
    const body = await exchange.json()
  
    if (body.error) {
      throw new Error(body.error)
    }
  
    console.log(body) // { access_token: "...", id_token: "...", ... }
    const decoded = JSON.parse(decodeJWT(body.id_token))
    // const validToken = validateToken(decoded)
    // if (!validToken) {
    //   return { status: 401 }
    // }

    const text = new TextEncoder().encode(`${SALT}-${decoded.sub}`)
    const digest = await crypto.subtle.digest({ name: "SHA-256" }, text)
    const digestArray = new Uint8Array(digest)
    const id = btoa(String.fromCharCode.apply(null, digestArray))

    await AUTH_STORE.put(id, JSON.stringify(body))

    const date = new Date()
    date.setDate(date.getDate() + 1)
  
    const headers = {
      Location: "/",
      "Set-cookie": `${cookieKey}=${id}; Secure; HttpOnly; SameSite=Lax; Expires=${date.toUTCString()}`,
    }
  
    return { headers, status: 302 }
  }

//take the code parameter, and make a request back to Auth0, exchanging it for an access token:
const exchangeCode = async code => {
    const body = JSON.stringify({
      grant_type: "authorization_code",
      client_id: auth0.clientId,
      client_secret: auth0.clientSecret,
      code,
      redirect_uri: auth0.callbackUrl,
    })
  
    // We’ll define persistAuth in the next section
    return persistAuth(
      await fetch("https://" + AUTH0_DOMAIN + "/oauth/token", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
      })
    )
  }

// parse the incoming URL, and pass the code login parameter to exchangeCode. 
// Check for a state parameter, which you will use to prevent CSRF attacks. 
// This state parameter should be matched to a known key in KV, 
// indicating that the authorization request is valid:
export const handleRedirect = async event => {
    const url = new URL(event.request.url)
  
    const state = url.searchParams.get("state")
    if (!state) {
      return null
    }
  
    const storedState = await AUTH_STORE.get(`state-${state}`)
    if (!storedState) {
      return null
    }
  
    const code = url.searchParams.get("code")
    if (code) {
      return exchangeCode(code)
    }
    return {}
  }

  export const logout = event => {
    const cookieHeader = event.request.headers.get("Cookie")
    if (cookieHeader && cookieHeader.includes(cookieKey)) {
      return {
        headers: {
          "Set-cookie": `${cookieKey}=""; SameSite=Lax; Secure;`,
        },
      }
    }
    return {}
  }

export const getItems = async (userInfo) => {
  return await AUTH_STORE.get(userInfo.email);
}

export const addItem = async (userInfo, item) => {
  
  let curItems = await getItems(userInfo);
  curItems = JSON.parse(curItems);
  curItems = curItems === null ? {} : curItems;
  let ts = parseInt(new Date().getTime() / 1000) * 2;
  let delkey = null;
  let count = 1;
  for (var prop in curItems) {
    if (curItems.hasOwnProperty(prop)) {
      if (parseInt(prop) < ts) {
        delkey = prop;
      }
      count += 1;
    }
  }

  if (delkey !== null && count >= 10) {
    delete curItems[delkey]; 
    count -= 1; 
  }

  curItems["count"] = count;

  let itemKey = parseInt(new Date().getTime() / 1000).toString();
  curItems[itemKey] = item;

  await AUTH_STORE.put(userInfo.email, JSON.stringify(curItems));
}


export const removeItem = async (userInfo, key) => {
  
  let curItems = await getItems(userInfo);
  curItems = JSON.parse(curItems);

  if (curItems === null) {
    return;
  }

  if (!(key in curItems)) {
    return;
  }
  
  let count = curItems["count"];
  delete curItems[key];
  count -= 1;

  curItems["count"] = count;
  await AUTH_STORE.put(userInfo.email, JSON.stringify(curItems));
}