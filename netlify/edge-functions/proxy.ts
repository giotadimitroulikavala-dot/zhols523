export default async (request: Request) => {
  const targetURL = "https://f003.backblazeb2.com";

  const incomingUrl = new URL(request.url);
  const target = new URL(targetURL);

  // Κρατάμε path + query
  const proxiedUrl = new URL(incomingUrl.pathname + incomingUrl.search, target);

  const proxyRequest = new Request(proxiedUrl.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: "follow",
  });

  proxyRequest.headers.set("host", target.hostname);

  try {
    const response = await fetch(proxyRequest);

    const modified = new Response(response.body, response);

    // CORS
    modified.headers.set("Access-Control-Allow-Origin", "*");
    modified.headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    modified.headers.set("Access-Control-Allow-Headers", "*");

    // Cache (βάλε μεγαλύτερο για production)
    modified.headers.set(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=3600"
    );

    return modified;
  } catch (err) {
    return new Response("Proxy error", { status: 500 });
  }
};
