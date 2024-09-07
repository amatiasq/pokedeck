type MaybePromise<T> = T | Promise<T>;
type Endpoint = (_: Request) => MaybePromise<Response | string | void>;

const lower = (x: string) => x.toLocaleLowerCase();
const upper = (x: string) => x.toLocaleUpperCase();
const cache = new Map<string, Endpoint>();
const notFound = (() =>
  new Response('Not found', { status: 404 })) satisfies Endpoint;

export async function getEndpoint(
  method: string,
  path: string
): Promise<Endpoint> {
  const key = `${method} ${lower(path)}`;
  const endpoint = cache.get(key);
  if (endpoint) return endpoint;

  const parts = path.split('/').filter(Boolean);
  const found = (await findEndpoint(method, parts)) ?? notFound;
  cache.set(key, found);
  return found;
}

export function isNotFound(endpoint: Endpoint): endpoint is typeof notFound {
  return endpoint === notFound;
}

async function findEndpoint(
  method: string,
  path: string[],
  at = `${import.meta.dirname}/endpoints`,
  replacements: Record<string, string> | null = null
): Promise<Endpoint | null> {
  const [curr, ...rest] = path;
  const entries = await Array.fromAsync(Deno.readDir(at));
  return rest.length ? findDirectory() : findFile();

  function findDirectory() {
    const directories = entries.filter((x) => x.isDirectory);
    const dir = directories.find((x) => lower(x.name) === lower(curr));

    if (dir) {
      // console.log({ path, at, dir });
      return findEndpoint(method, rest, `${at}/${dir.name}`, replacements);
    }

    const captureDir = directories.find((x) => /^\[.*\]$/.test(x.name));

    if (captureDir) {
      // console.log({ path, at, captureDir });
      return findEndpoint(method, rest, `${at}/${captureDir.name}`, {
        ...replacements,
        [captureDir.name.slice(1, -1)]: curr,
      });
    }

    return null;
  }

  function findFile() {
    const files = entries.filter((x) => x.isFile);
    const exporterFile = files.find(
      (x) => lower(x.name) === lower(`${curr}.ts`)
    );

    if (exporterFile) {
      // console.log({ path, at, exporterFile });
      return importEndpoint(
        `${at}/${exporterFile.name}`,
        replacements,
        upper(method)
      );
    }

    const fileLike = files.find(
      (x) => lower(x.name) === lower(`${curr}.${method}.ts`)
    );

    if (fileLike) {
      // console.log({ path, at, fileLike });
      return importEndpoint(`${at}/${fileLike.name}`, replacements);
    }

    const exporterCapture = files.find((x) => lower(x.name).endsWith(`].ts`));

    if (exporterCapture) {
      // console.log({ path, at, exporterCapture });
      return importEndpoint(
        `${at}/${exporterCapture.name}`,
        {
          ...replacements,
          [exporterCapture.name.slice(1, -`].ts`.length)]: curr,
        },
        upper(method)
      );
    }

    const capture = files.find((x) =>
      lower(x.name).endsWith(lower(`].${method}.ts`))
    );

    if (capture) {
      // console.log({ path, at, capture });
      return importEndpoint(`${at}/${capture.name}`, {
        ...replacements,
        [capture.name.slice(1, -`].${method}.ts`.length)]: curr,
      });
    }

    return null;
  }
}

async function importEndpoint(
  filePath: string,
  replacements: Record<string, string> | null,
  exportKey: string = 'default'
): Promise<Endpoint> {
  if (replacements) console.log(replacements);

  const mod = await import(filePath);
  const endpoint = mod[exportKey] as EndpointWithCaptures;

  if (!endpoint) {
    console.error(`No export '${exportKey}' in ${filePath}`);
    return () => new Response('Invalid method implementation', { status: 500 });
  }

  return replacements ? (req) => endpoint(req, replacements) : endpoint;
}

type EndpointWithCaptures = (
  _: Request,
  captures?: Record<string, string>
) => MaybePromise<Response | string | void>;
