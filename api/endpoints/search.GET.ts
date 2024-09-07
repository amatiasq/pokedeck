import { sql } from '~/db.ts';
import { PokemonTcgSdkCard, sdkCardToDb } from '~/pokemontcgsdk.ts';
import { cards, sets } from '~/schema.ts';

export default function search(request: Request) {
  const url = new URL(request.url);
  const term = url.searchParams.get('name');

  if (!term) {
    return new Response('Missing search term', { status: 400 });
  }

  return findCards(term);
}

async function findCards(term: string) {
  const sdkCards = findCardsInSdk(term).then((cards) =>
    cards.length > 0 ? cards : findCardsInSdk(`*${term}*`)
  );

  const dbCards = await findCardInDb(term);

  if (dbCards.length > 0) {
    return dbCards;
  }

  await sdkCards;
  return findCardInDb(term);
}

function findCardInDb(term: string) {
  return sql`
    SELECT ${cards}.*
    FROM ${cards}
    JOIN ${sets} ON ${cards.set_id} = ${sets.id}
    WHERE ${cards.name} ILIKE ${`%${term}%`}
    ORDER BY ${sets.release_date} DESC
  `;
}

async function findCardsInSdk(term: string) {
  const enc = encodeURIComponent(term);
  const url = `https://api.pokemontcg.io/v2/cards?q=name:${enc}`;
  const response = await fetch(url);
  const content = await response.json();
  const cards = content.data as PokemonTcgSdkCard[];
  const result = [];

  for (const card of cards) {
    result.push((await sdkCardToDb(card)).card);
  }

  return result;
}
