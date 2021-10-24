import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'
import { authorize, handleRedirect, logout, addItem, getItems, removeItem  } from "./app"

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false

const hydrateState = (state = {}) => ({
  element: head => {
    const jsonState = JSON.stringify(state)
    const scriptTag = `<script id="edge_state" type="application/json">${jsonState}</script>`
    head.append(scriptTag, { html: true })
  },
})

const hydrateItems = (state = {}) => ({
  element: head => {
    const jsonState = JSON.stringify(state)
    const scriptTag = `<script id="edge_items" type="application/json">${jsonState}</script>`
    head.append(scriptTag, { html: true })
  },
})

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event))
})


async function handleEvent(event) {
  let request = event.request
  let response = new Response(null)
  const url = new URL(request.url)
  let userItems = {};
  try {

    // BEGINNING OF AUTHORIZATION CODE BLOCK
    const [authorized, { authorization, redirectUrl }] = await authorize(event)
    if (authorized && authorization.accessToken) {
      // request = new Request(request, {
      //   headers: {
      //     ...request.headers,
      //     Authorization: `Bearer ${authorization.accessToken}`,
      //   },
      // })
    }

    // BEGINNING OF HANDLE AUTH REDIRECT CODE BLOCK
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
    // END OF HANDLE AUTH REDIRECT CODE BLOCK

    // BEGINNING OF REDIRECT CODE BLOCK
    if (!authorized) {
      return Response.redirect(redirectUrl)
    }
    // END OF REDIRECT CODE BLOCK

    
    // END OF AUTHORIZATION CODE BLOCK

    // BEGINNING OF LOGOUT CODE BLOCK
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
    // END OF LOGOUT CODE BLOCK

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
    

    // BEGINNING OF WORKERS SITES
    // Make sure to not touch this code for the majority of the tutorial.
    response = await getAssetFromKV(event)
    // END OF WORKERS SITES
    userItems = await getItems(authorization.userInfo);
    // BEGINNING OF STATE HYDRATION CODE BLOCK
    return new HTMLRewriter()
      .on("head", hydrateState(authorization.userInfo))
      .on("head", hydrateItems(JSON.parse(userItems)))
      .transform(response)
    // END OF STATE HYDRATION CODE BLOCK

    //return response
  } catch (e) {
    return new Response(e.message || e.toString(), { status: 500 })
  }
}


/*
async function handleEvent(event) {

  let request = event.request
  let response = new Response(null)
  const url = new URL(request.url)

  // BEGINNING OF HANDLE AUTH REDIRECT CODE BLOCK
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
  // END OF HANDLE AUTH REDIRECT CODE BLOCK

  // BEGINNING OF LOGOUT CODE BLOCK
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
  // END OF LOGOUT CODE BLOCK
    
  // BEGINNING OF AUTHORIZATION CODE BLOCK
  if (url.pathname === "/login") {
    try {
      const [authorized, { authorization, redirectUrl }] = await authorize(event)
      if (authorized && authorization.accessToken) {
        request = new Request(request, {
          headers: {
            Authorization: `Bearer ${authorization.accessToken}`,
          },
        })
      }
      // END OF AUTHORIZATION CODE BLOCK

      // BEGINNING OF REDIRECT CODE BLOCK
      if (!authorized) {
        return Response.redirect(redirectUrl)
      }
      // END OF REDIRECT CODE BLOCK

      // BEGINNING OF WORKERS SITES
      // Make sure to not touch this code for the majority of the tutorial.
      response = getAssetFromKV(event)
      // END OF WORKERS SITES

      return response
    } catch (e) {
      return new Response(e.message || e.toString(), { status: 500 })
    }
  }

  let options = {}


  // options.mapRequestToAsset = handlePrefix(/^\/docs/)

  try {
    if (DEBUG) {
      // customize caching
      options.cacheControl = {
        bypassCache: true,
      }
    }

    const page = await getAssetFromKV(event, options)

    // allow headers to be altered
    const response = new Response(page.body, page)

    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('Referrer-Policy', 'unsafe-url')
    response.headers.set('Feature-Policy', 'none')

    return response

  } catch (e) {
    // if an error is thrown try to serve the asset at 404.html
    if (!DEBUG) {
      try {
        let notFoundResponse = await getAssetFromKV(event, {
          mapRequestToAsset: req => new Request(`${new URL(req.url).origin}/404.html`, req),
        })

        return new Response(notFoundResponse.body, { ...notFoundResponse, status: 404 })
      } catch (e) {}
    }

    return new Response(e.message || e.toString(), { status: 500 })
  }
}
*/

/**
 * Here's one example of how to modify a request to
 * remove a specific prefix, in this case `/docs` from
 * the url. This can be useful if you are deploying to a
 * route on a zone, or if you only want your static content
 * to exist at a specific path.
 */
function handlePrefix(prefix) {
  return request => {
    // compute the default (e.g. / -> index.html)
    let defaultAssetKey = mapRequestToAsset(request)
    let url = new URL(defaultAssetKey.url)

    // strip the prefix from the path for lookup
    url.pathname = url.pathname.replace(prefix, '/')

    // inherit all other props from the default request
    return new Request(url.toString(), defaultAssetKey)
  }
}
