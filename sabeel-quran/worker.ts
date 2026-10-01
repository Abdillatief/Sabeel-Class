/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface Env {
  ASSETS?: {
    fetch: (request: Request | string) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // 1. Serve static assets via Cloudflare Assets binding if present
    if (env.ASSETS) {
      let response = await env.ASSETS.fetch(request);

      // 2. SPA Fallback: If 404 and the request path is a navigation route (does not have a file extension)
      const lastSegment = url.pathname.split('/').pop() || '';
      const hasFileExtension = lastSegment.includes('.');

      if (response.status === 404 && !hasFileExtension) {
        const indexRequest = new Request(new URL('/index.html', request.url).toString(), request);
        response = await env.ASSETS.fetch(indexRequest);
      }

      // 3. Ensure Strict and Correct MIME types
      const headers = new Headers(response.headers);
      const pathname = url.pathname.toLowerCase();

      if (pathname.endsWith('.js') || pathname.endsWith('.mjs')) {
        headers.set('Content-Type', 'application/javascript; charset=utf-8');
      } else if (pathname.endsWith('.css')) {
        headers.set('Content-Type', 'text/css; charset=utf-8');
      } else if (pathname.endsWith('.json') || pathname.endsWith('manifest.json')) {
        headers.set('Content-Type', 'application/manifest+json; charset=utf-8');
      } else if (pathname.endsWith('.svg')) {
        headers.set('Content-Type', 'image/svg+xml');
      } else if (pathname.endsWith('.html') || pathname === '/' || !hasFileExtension) {
        headers.set('Content-Type', 'text/html; charset=utf-8');
      }

      // 4. Set Production Caching & Security Headers
      if (pathname.startsWith('/assets/')) {
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
      }

      headers.set('X-Content-Type-Options', 'nosniff');
      headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      headers.set('Permissions-Policy', 'microphone=(self), camera=()');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    return new Response('Cloudflare Assets binding not configured. Check wrangler.toml [assets] section.', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
};
