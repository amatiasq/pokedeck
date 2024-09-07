import { PGlite } from '@electric-sql/pglite';
import { sql as sqlChunk, SQLChunk } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/pglite';
// @ts-expect-error
import migrations from 'vite:migrations';
import * as schema from '../../shared/schema.ts';

const client = new PGlite('idb://pokedeck');

export const db = drizzle(client, { schema });

// don't know why the type doesn't contain dialect nor session
const _db = db as any;
await _db.dialect.migrate(migrations, _db.session, {});

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

import { SQL } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';

function debugSql<T>(sql: SQL<T>) {
  const pgDialect = new PgDialect();
  const query = pgDialect.sqlToQuery(sql);
  console.log(query.sql);
  console.log(query.params);
  console.log(query.typings);
}
