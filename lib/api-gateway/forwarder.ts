import { NextRequest } from 'next/server';

/**
 * Microservice Registry
 * Map the first path segment of the URL (e.g. /api/auth) to specific backend services.
 */
const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

const SERVICE_REGISTRY: Record<string, string> = {
    auth: `${backendUrl}/v1`,
    projects: `${backendUrl}/projects`,
    clients: `${backendUrl}/clients`,
    meetings: `${backendUrl}/meetings`,
    tickets: `${backendUrl}/tickets`,
    team: `${backendUrl}/team`,
    users: `${backendUrl}/users`,
    default: backendUrl,
};

export async function forwardToBackend(req: NextRequest, proxyPath: string[]) {
    try {
        // 1. Determine which microservice to use based on the first path segment
        let serviceName = proxyPath[0];
        let serviceBaseUrl = SERVICE_REGISTRY[serviceName];
        const targetPathArray = [...proxyPath];

        if (serviceBaseUrl) {
            // We matched a registered microservice (e.g. 'test'). 
            // Strip the prefix so we don't send `/test` to the actual backend.
            targetPathArray.shift();
        } else {
            // Fallback to default if prefix doesn't match a microservice
            serviceName = 'default';
            serviceBaseUrl = SERVICE_REGISTRY['default'];
        }

        // 2. Construct the target URL
        const targetPath = targetPathArray.join('/');
        const searchParams = req.nextUrl.search; // keep the query parameters (?id=123 etc)
        const targetUrl = new URL(`${serviceBaseUrl}/${targetPath}${searchParams}`);

        console.log(`[API-GATEWAY] Routing ${req.method} request via '${serviceName}' service to: ${targetUrl.toString()}`);

        // 3. Clone headers (remove Next.js host header so the new fetch works properly)
        const headers = new Headers(req.headers);
        headers.delete('host');
        // Prevent the backend from returning a compressed body. Railway's proxy
        // handles compression to the client — forwarding Accept-Encoding causes
        // the backend to compress, and Railway compresses again (double-encoding).
        headers.delete('accept-encoding');

        // Securely inject the auth token from cookies into the Authorization header
        const token = req.cookies.get('auth_token')?.value;
        if (token) {
            headers.set('Authorization', `Bearer ${token}`);
        }

        // 3. Extract the body conditionally
        let body: BodyInit | null = null;
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            body = await req.arrayBuffer(); // read the raw stream
        }

        // 4. Perform the external request
        const externalResponse = await fetch(targetUrl.toString(), {
            method: req.method,
            headers,
            body,
            // Don't modify redirect handling unless required
            redirect: 'manual',
        });

        // 5. Construct the response to send back to the frontend client
        const responseHeaders = new Headers(externalResponse.headers);
        // Railway's proxy handles compression — remove any encoding headers the
        // backend set so we don't end up with a mismatched body/header pair.
        responseHeaders.delete('content-encoding');
        responseHeaders.delete('transfer-encoding');

        return new Response(externalResponse.body, {
            status: externalResponse.status,
            statusText: externalResponse.statusText,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error('[API-GATEWAY] Forwarding Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Gateway Error' }), {
            status: 502, // Bad Gateway
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
