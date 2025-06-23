function getCORSHeaders(): Record<string, string> {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
    };
}

function handleCORS(): Response {
    return new Response(null, {
        headers: {
            ...getCORSHeaders(),
            "Access-Control-Max-Age": "86400"
        }
    });
}

export { getCORSHeaders, handleCORS };