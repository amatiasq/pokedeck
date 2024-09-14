import { sql } from '~/db.ts';
import { PokemonTcgSdkCard, sdkCardToDb } from '~/pokemontcgsdk.ts';
import { sets } from '~/schema.ts';

export async function GET(_: Request, { id }: { id: string }) {
  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const [card] = await sql`
    SELECT *
    FROM ${sets}
    WHERE ${sets.id} = ${id}
    LIMIT 1
  `;

  if (!card) {
    console.log(`Card ${id} not found. Searching SDK...`);
    return findInSdk(id);
  }

  return card;
}

async function findInSdk(id: string) {
  const enc = encodeURIComponent(id);
  const url = `https://api.pokemontcg.io/v2/sets/${enc}`;
  const response = await fetch(url);
  const content = await response.json();
  const card = content.data as PokemonTcgSdkCard;

  if (!card) throw new Error(`Card ${id} not found in SDK`);

  const fromDb = await sdkCardToDb(card);
  return fromDb.card;
}
