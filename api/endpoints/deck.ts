import { db, sql } from '~/db.ts';
import { Deck, deckCards, decks } from '~/schema.ts';
import { requireAuth } from './auth.ts';

export async function GET(request: Request) {
  const user = await requireAuth(request);

  const rows = await sql<Deck & { card_ids: string }>`
    SELECT
      ${decks}.*,
      STRING_AGG(${deckCards.card_id}::text, '|') AS card_ids
    FROM ${decks}
    LEFT JOIN ${deckCards} ON ${decks}.id = ${deckCards}.deck_id
    WHERE ${decks.owner_id} = ${user.id}
    GROUP BY ${decks}.id
  `;

  return rows.map(({ card_ids, ...x }) => ({
    ...x,
    cards: card_ids?.split('|').map((id) => ({ id })) ?? [],
  }));
}

export async function POST(request: Request) {
  const user = await requireAuth(request);

  const body: {
    name: string;
    cards: {
      id: number;
      quantity: number;
      language?: string;
    }[];
  } = await request.json();

  return db.transaction(async () => {
    const [deck] = await sql`
      INSERT INTO ${decks} (owner_id, name)
      VALUES (${user.id}, ${body.name})
      RETURNING *
    `;

    const inserts = (body.cards ?? []).map(
      (card) => sql`
        INSERT INTO ${deckCards} (
          deck_id,
          card_id,
          quantity,
          "language"
        )
        VALUES (
          ${deck.id},
          ${card.id},
          ${card.quantity},
          ${card.language ?? 'ES'}
        );
      `
    );

    await db.execute(sql.join(inserts));
    return deck;
  });
}
