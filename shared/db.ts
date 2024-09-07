import { SQLChunk, sql as sqlChunk } from 'drizzle-orm';
import { PostgresJsDatabase, drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema.ts';

const SERVER = Deno.env.get('POSTGRES_SERVER') ?? 'localhost';
const USER = Deno.env.get('POSTGRES_USER') ?? 'postgres';
const DB = Deno.env.get('POSTGRES_DB') ?? 'pokedeck';
const PASSWORD = Deno.env.get('POSTGRES_PASSWORD');

const client = postgres(`postgres://${USER}:${PASSWORD}@${SERVER}/${DB}`);
export const db = drizzle(client, { schema });

export const sql = Object.assign(
  function sql<T extends Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...values: unknown[]
  ) {
    return db.execute<T>(sqlChunk(strings, ...values));
  },
  {
    chunk: sqlChunk,

    join: (list: SQLChunk[], separator = ', ') =>
      sqlChunk.join(list, sqlChunk.raw(separator)),

    debug: <T extends Record<string, unknown>>(
      strings: TemplateStringsArray,
      ...values: unknown[]
    ) => {
      const x = sqlChunk(strings, ...values);
      debugSql(x);
      return db.execute<T>(x);
    },
  }
);

await migrate(db, { migrationsFolder: './migrations' });

export type Db = PostgresJsDatabase<typeof schema>;

import { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';

function debugSql<T>(sql: SQL<T>) {
  const pgDialect = new PgDialect();
  const query = pgDialect.sqlToQuery(sql);
  console.log(query.sql);
  console.log(query.params);
  console.log(query.typings);
}
