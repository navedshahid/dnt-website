const ALLOWED_TYPES = new Set(['config', 'portfolio', 'clients', 'testimonials', 'jobs']);
const ALLOWED_ORIGINS = [
    'https://digitalnatives.work',
    'https://www.digitalnatives.work',
    'https://dnt-website.pages.dev',
    'http://localhost:8788',
    'http://127.0.0.1:8788'
];

function isAllowedOrigin(origin) {
    return origin && ALLOWED_ORIGINS.includes(origin);
}

function corsHeaders(origin) {
    return {
        'Access-Control-Allow-Origin': origin && isAllowedOrigin(origin) ? origin : 'https://digitalnatives.work',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, CMS_SECRET',
        'Vary': 'Origin'
    };
}

function sanitizeJson(data) {
    if (typeof data === 'string') {
        return data.replace(/[<>&'"]/g, c => ({
            '<': '&lt;', '>': '&gt;', '&': '&amp;', '\'': '&#39;', '"': '&quot;'
        })[c]);
    }
    if (Array.isArray(data)) return data.map(sanitizeJson);
    if (data && typeof data === 'object') {
        const out = {};
        for (const k in data) out[k] = sanitizeJson(data[k]);
        return out;
    }
    return data;
}

export async function onRequest(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const secret = request.headers.get('CMS_SECRET');
    const origin = request.headers.get('Origin') || '';

    // 0. Secret verification check
    if (url.searchParams.get('check') === 'true') {
        const isValid = env.CMS_SECRET && secret === env.CMS_SECRET;
        return new Response(JSON.stringify({ valid: isValid, debug: { secretSet: !!env.CMS_SECRET } }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
    }

    // Ping check for manual verification
    if (url.searchParams.get('ping') === 'true') {
        return new Response(JSON.stringify({ status: 'active', time: new Date().toISOString() }), {
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
    }

    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (!type) {
        return new Response(JSON.stringify({ error: 'Missing type parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
    }

    if (!ALLOWED_TYPES.has(type)) {
        return new Response(JSON.stringify({ error: 'Unsupported type' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
    }

    // Basic security check - you MUST set CMS_SECRET in Cloudflare dashboard
    if (request.method !== 'GET' && (!env.CMS_SECRET || secret !== env.CMS_SECRET)) {
        return new Response(JSON.stringify({ error: 'Unauthorized or CMS_SECRET not set in dashboard' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
        });
    }

    // Handle data fetching (GET)
    if (request.method === 'GET') {
        try {
            // Prefer KV if bound (latest published data)
            if (env.CMS_KV) {
                const kvValue = await env.CMS_KV.get(type);
                if (kvValue) {
                    return new Response(kvValue, {
                        headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
                    });
                }
            }

            // In a real Pages environment, static assets are relative to root.
            // When running in a Function, we fetch from the origin.
            const response = await fetch(`${url.origin}/data/${type}.json`);
            return new Response(await response.text(), {
                status: response.status,
                headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: corsHeaders(origin) });
        }
    }

    // Handle data saving (POST)
    if (request.method === 'POST') {
        try {
            const data = await request.json();
            const clean = sanitizeJson(data);

            // Persist to KV if available
            if (env.CMS_KV) {
                await env.CMS_KV.put(type, JSON.stringify(clean, null, 2));
            }

            return new Response(JSON.stringify({
                success: true,
                message: env.CMS_KV
                    ? 'Data saved to KV. Live content will read from KV first.'
                    : 'Data processed. Note: To persist changes, update the JSON files in your repository.',
                data: clean
            }), {
                headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) }
            });
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: corsHeaders(origin) });
        }
    }

    return new Response('Method not allowed', { status: 405, headers: corsHeaders(origin) });
}
