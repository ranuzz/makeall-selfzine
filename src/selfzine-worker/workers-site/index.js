import { getAssetFromKV } from '@cloudflare/kv-asset-handler'
import { authorize, handleRedirect, logout, addItem, getItems, removeItem  } from "./app"

// Helper function to include user data in response
const hydrateState = (state = {}) => ({
  element: head => {
    const jsonState = JSON.stringify(state)
    const scriptTag = `<script id="edge_state" type="application/json">${jsonState}</script>`
    head.append(scriptTag, { html: true })
  },
})

// Helper function to include item data in resonse
const hydrateItems = (state = {}) => ({
  element: head => {
    const jsonState = JSON.stringify(state)
    const scriptTag = `<script id="edge_items" type="application/json">${jsonState}</script>`
    head.append(scriptTag, { html: true })
  },
})

// Main Entry Point
addEventListener('fetch', event => {
  event.respondWith(handleEvent(event))
})


async function handleEvent(event) {

  let request = event.request
  let response = new Response(null)
  const url = new URL(request.url)
  let userItems = {};

  // Main try-catch to cover the whole logic
  try {

    // Authorize every request
    const [authorized, { authorization, redirectUrl }] = await authorize(event)

    // HANDLE: /auth
    if (url.pathname === "/auth") {
      try {
        const authorizedResponse = await handleRedirect(event)
        if (!authorizedResponse) {
          return new Response("Unauthorized", { status: 401 })
        }
        response = new Response("Persisting AuthCode", {
          response,
          ...authorizedResponse,
        })
        return response
      } catch (e) {
        return new Response(e.message || e.toString(), { status: 500 })
      }
    }

    // If user is not authorized and it is not a
    // login request then redirect
    if (!authorized) {
      return Response.redirect(redirectUrl)
    }

    // HANDLE: /logout
    if (url.pathname === "/logout") {
      try {
        const { headers } = logout(event)
        return headers
          ? new Response(response.body, {
              ...response,
              headers: Object.assign({}, response.headers, headers)
            })
          : Response.redirect(url.origin)
      } catch (e) {
        return new Response(e.message || e.toString(), { status: 500 })
      }
    }

    // HANDLE: ADD Item
    // Data comes as form body { item: String }
    if (url.pathname === "/submititem") {
      try {
        if (request.method !== "POST") {
          return new Response("Method Not Allowed", {
            status: 405
          })
        }

        const body = await request.formData();
        const {
          item
        } = Object.fromEntries(body)

        await addItem(authorization.userInfo, item);
        return Response.redirect(url.origin);
      } catch (e) {
        return new Response(e.message || e.toString(), { status: 500 })
      }
    }

    // HANDLE: Delete Item
    // Delete key comes as url path
    // url_pathname: /delitem/<key>
    if (/^\/delitem\/[a-z,0-9]+$/.test(url.pathname)) {
      try {
        if (request.method !== "DELETE") {
          return new Response("Method Not Allowed", {
            status: 405
          })
        }

        await removeItem(authorization.userInfo, url.pathname.split('\/')[2]);
        return new Response("", { status: 200 })

      } catch (e) {
        return new Response(e.message || e.toString(), { status: 500 })
      }
    }
    
    // Get the response from worker site
    response = await getAssetFromKV(event)
    
    // Get the user items
    userItems = await getItems(authorization.userInfo);
    
    // rewrite response to include user info and user items
    return new HTMLRewriter()
      .on("head", hydrateState(authorization.userInfo))
      .on("head", hydrateItems(JSON.parse(userItems)))
      .transform(response)

  } catch (e) {
    return new Response(e.message || e.toString(), { status: 500 })
  }
}