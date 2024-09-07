import { AuthResponse, publicUser } from '~/data-transfer.ts';
import { sql } from '~/db.ts';
import { Session, sessions, User, users } from '~/schema.ts';

export async function requireAuth(request: Request) {
  const user = await getUserFor(request);

  if (!user) {
    throw new Response('Unauthorized', { status: 401 });
  }

  return user;
}

async function getUserFor(request: Request) {
  const token = request.headers.get('Authorization');
  if (!token) return null;

  const [session] = await sql<Session>`
    SELECT * FROM ${sessions}
    WHERE token = ${token}
  `;

  if (!session || new Date(session.expires_at) < new Date()) {
    return null;
  }

  const [user] = await sql<User>`
    SELECT * FROM ${users}
    WHERE id = ${session.user_id}
  `;

  return user ?? null;
}

export async function GET(request: Request) {
  const user = await requireAuth(request);
  return createResponse(user);
}

export async function POST(request: Request) {
  const body: {
    email: string;
    password: string;
  } = await request.json();

  if (!body.email || !body.password) {
    return new Response('Bad Request', { status: 400 });
  }

  const [user] = await sql<User>`
    SELECT * FROM ${users}
    WHERE email = ${body.email}
  `;

  if (!user) {
    // return new Response('Unauthorized', { status: 404 });
    const newUser = await createUser(body.email, body.password);
    return createResponse(newUser);
  }

  const input = await hashPassword(body.password, user.salt);

  if (!user.hash) {
    await sql`UPDATE ${users} SET hash = ${input} WHERE id = ${user.id}`;
  } else if (input !== user.hash) {
    return new Response('Unauthorized', { status: 401 });
  }

  return createResponse(user);
}

export async function DELETE(request: Request) {
  const user = await requireAuth(request);

  await sql`
    DELETE FROM ${sessions}
    WHERE user_id = ${user.id}
  `;

  return new Response('OK', { status: 200 });
}

async function createUser(email: string, password: string) {
  const salt = createSalt();
  const hash = await hashPassword(password, salt);

  const [user] = await sql<User>`
    INSERT INTO ${users} (email, salt, hash)
    VALUES (${email}, ${salt}, ${hash})
    RETURNING *
  `;

  return user;
}

async function createResponse(user: User): Promise<AuthResponse> {
  const session = await createSession(user);
  return { user: publicUser(user), session };
}

async function createSession(user: User) {
  const SESSION_EXPIRES_DAYS = 30;
  const DAYS = 1000 * 60 * 60 * 24;
  const expiresAt = new Date(Date.now() + SESSION_EXPIRES_DAYS * DAYS);
  const token = crypto.randomUUID();

  const [result] = await sql<Session>`
    INSERT INTO ${sessions} (user_id, token, expires_at)
    VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
    RETURNING *
  `;

  return result;
}

async function hashPassword(password: string, salt: string) {
  const salted = password + salt;
  const encoded = new TextEncoder().encode(salted);
  const hash = await crypto.subtle.digest('SHA-256', encoded);

  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function createSalt() {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(saltBytes)
    .map((b) => b.toString(16))
    .join('');
}
