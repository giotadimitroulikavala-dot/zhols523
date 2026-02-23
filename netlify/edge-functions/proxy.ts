export default async (request: Request) => {
  const targetOrigin = "https://f003.backblazeb2.com";

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(
    incomingUrl.pathname + incomingUrl.search,
    targetOrigin
  );

  // Handle CORS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(),
    });
  }

  try {
    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: cleanHeaders(request.headers),
      body: request.method !== "GET" && request.method !== "HEAD"
        ? request.body
        : undefined,
    });

    const proxied = new Response(response.body, response);

    // CORS
    applyCors(proxied);

    // Cache heavily (αλλιώς δεν έχει νόημα)
    proxied.headers.set(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=3600"
    );

    return proxied;
  } catch (err) {
    return new Response("Proxy Error", { status: 500 });
  }
};

function cleanHeaders(headers: Headers) {
  const newHeaders = new Headers(headers);

  // Αφαιρούμε headers που χαλάνε proxy/cache
  newHeaders.delete("host");
  newHeaders.delete("connection");
  newHeaders.delete("cookie");

  return newHeaders;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

function applyCors(response: Response) {
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "*");
}
