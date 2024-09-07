import { DeckCard } from '~/data-transfer.ts';
import { db, sql } from '~/db.ts';
import { Deck, deckCards, decks } from '~/schema.ts';
import { requireAuth } from '../auth.ts';

export async function GET(request: Request, { id }: { id: string }) {
  const user = await requireAuth(request);

  const [row] = await sql<Deck>`
    SELECT *
    FROM ${decks}
    WHERE ${decks.owner_id} = ${user.id}
      AND ${decks.id} = ${id}
  `;

  if (!row) {
    return new Response('Not Found', { status: 404 });
  }

  const { owner_id: _, ...deck } = row;

  return {
    ...deck,
    cards: await sql<Deck & DeckCard>`
      SELECT
        ${deckCards.card_id} as id,
        ${deckCards.quantity}
      FROM ${deckCards}
      WHERE ${deckCards.deck_id} = ${id}
    `,
  };
}

export async function PATCH(request: Request, { id }: { id: string }) {
  const user = await requireAuth(request);
  const body = await request.json();

  const [deck] = await sql`
    UPDATE ${decks}
    SET name = ${body.name}
    WHERE ${decks.id} = ${id}
      AND ${decks.owner_id} = ${user.id}
  `;

  return deck;
}

export async function PUT(request: Request, { id }: { id: string }) {
  const user = await requireAuth(request);
  const body: {
    name: string;
    cards: {
      id: string;
      quantity: number;
    }[];
  } = await request.json();

  const [deck] = await sql<Deck>`
    SELECT *
    FROM ${decks}
    WHERE ${decks.owner_id} = ${user.id}
      AND ${decks.id} = ${id}
  `;

  if (!deck) {
    return new Response('Not Found', { status: 404 });
  }

  await db.transaction(async () => {
    await sql`
      UPDATE ${decks}
      SET name = ${body.name}
      WHERE ${decks.id} = ${id}
    `;

    await sql`
      DELETE FROM ${deckCards}
      WHERE ${deckCards.deck_id} = ${id}
    `;

    if (!body.cards.length) return;

    const values = body.cards.map(
      (card) => sql.chunk`(${id}, ${card.id}, ${card.quantity}, ${'ES'})`
    );

    await sql`
      INSERT INTO ${deckCards} (deck_id, card_id, quantity, language)
      VALUES ${sql.join(values)};
  `;
  });
}
