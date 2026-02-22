export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const secret = request.headers.get('CMS_SECRET');

    // 0. Secret verification check
    if (url.searchParams.get('check') === 'true') {
        const isValid = env.CMS_SECRET && secret === env.CMS_SECRET;
        return new Response(JSON.stringify({ valid: isValid, debug: { secretSet: !!env.CMS_SECRET } }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Ping check for manual verification
    if (url.searchParams.get('ping') === 'true') {
        return new Response(JSON.stringify({ status: 'active', time: new Date().toISOString() }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (!type) {
        return new Response(JSON.stringify({ error: 'Missing type parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Basic security check - you MUST set CMS_SECRET in Cloudflare dashboard
    if (request.method !== 'GET' && (!env.CMS_SECRET || secret !== env.CMS_SECRET)) {
        return new Response(JSON.stringify({ error: 'Unauthorized or CMS_SECRET not set in dashboard' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Handle data fetching (GET)
    if (request.method === 'GET') {
        try {
            // In a real Pages environment, static assets are relative to root.
            // When running in a Function, we fetch from the origin.
            const response = await fetch(`${url.origin}/data/${type}.json`);
            return response;
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
        }
    }

    // Handle data saving (POST)
    if (request.method === 'POST') {
        try {
            const data = await request.json();

            // LOGIC: Since we don't have direct FS access in Workers, 
            // we would normally write to KV: `await env.CMS_KV.put(type, JSON.stringify(data))`
            // For now, we return the data and tell the user to update their repo
            // OR we can use a GitHub API integration here if the user provides a token.

            return new Response(JSON.stringify({
                success: true,
                message: 'Data processed. Note: To persist changes, update the JSON files in your repository.',
                data: data
            }), {
                headers: { 'Content-Type': 'application/json' }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
        }
    }

    return new Response('Method not allowed', { status: 405 });
}
