/// <reference lib="deno.ns" />
import { getEndpoint, isNotFound } from './server.ts';

const PORT = Number(Deno.env.get('PORT') ?? 9837);

Deno.serve({ port: PORT }, async (request) => {
  const url = new URL(request.url);
  const timestamp = new Date().toISOString();
  const log = (...messages: unknown[]) =>
    console.log(
      `[${timestamp}] ${request.method} ${url.pathname}`,
      ...messages
    );

  log('Received');

  try {
    if (url.pathname.startsWith('/api')) {
      log('Resolving as API endpoint');
      const path = url.pathname.replace(/^\/api/, '');
      const result = await resolveApiEndpoint(request, path);
      log('Resolved as endpoint', result.status);
      return result;
    }

    try {
      log('Resolving as static file');
      const response = await serveStaticFile(url.pathname);
      log('Resolved as static file', response.status);
      return response;
    } catch {
      log('Resolving as index.html');
      const index = await serveStaticFile('/index.html');
      log('Resolved as index.html', index.status);
      return index;
    }
  } catch (error) {
    log('Failed:', error.message);
    console.error(error);
    return new Response(error.stack || error, { status: 500 });
  } finally {
    log('Finished');
  }
});

async function serveStaticFile(path: string) {
  const filePath = new URL(`../dist${path}`, import.meta.url);
  const stat = await Deno.stat(filePath);

  if (!stat.isFile) {
    throw new Error('Not a file');
  }

  const file = await Deno.open(filePath);

  return new Response(file.readable, {
    headers: {
      'content-length': stat.size.toString(),
      'content-type':
        contentType(filePath.pathname) || 'text/html; charset=utf-8',
    },
  });
}

function contentType(path: string) {
  const ext = path.split('.').pop();
  return {
    js: 'application/javascript',
    css: 'text/css',
    html: 'text/html; charset=utf-8',
  }[ext!];
}

async function resolveApiEndpoint(request: Request, path: string) {
  try {
    const method = getMethod(request);
    const endpoint = await getEndpoint(method, path);

    if (isNotFound(endpoint)) {
      return cors(endpoint());
    }

    if (request.method === 'OPTIONS') {
      return cors(new Response('OK'));
    }

    const result = await endpoint(request);
    const response = createResponse(result);
    return cors(response);
  } catch (error) {
    if (error instanceof Response) {
      return cors(error);
    }

    console.error(error);
    return cors(new Response(error.stack || error, { status: 500 }));
  }

  function cors(res: Response): Response {
    const headers = ['Content-Type', 'Authorization'];

    res.headers.append('Access-Control-Allow-Methods', getMethod(request));
    res.headers.append('Access-Control-Allow-Headers', headers.join(', '));

    res.headers.append(
      'Access-Control-Allow-Origin',
      request.headers.get('Origin') || '*'
    );

    return res;
  }
}

function createResponse(data: unknown) {
  if (data instanceof Response) return data;

  if (typeof data === 'string') {
    return new Response(data, { status: 200 });
  }

  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
    status: 200,
  });
}

function getMethod(request: Request) {
  return request.method === 'OPTIONS'
    ? request.headers.get('Access-Control-Request-Method')!
    : request.method;
}
