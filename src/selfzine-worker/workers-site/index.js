import { getAssetFromKV, mapRequestToAsset } from '@cloudflare/kv-asset-handler'
import { authorize, handleRedirect, logout  } from "./auth0"

/**
 * The DEBUG flag will do two things that help during development:
 * 1. we will skip caching on the edge, which makes it easier to
 *    debug.
 * 2. we will return an error message on exception in your Response rather
 *    than the default 404.html page.
 */
const DEBUG = false

addEventListener('fetch', event => {
  event.respondWith(handleEvent(event))
})

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

  /**
   * You can add custom logic to how we fetch your assets
   * by configuring the function `mapRequestToAsset`
   */
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
