import { sql } from '~/db.ts';
import { sdkCardToDb } from '~/pokemontcgsdk.ts';
import { cards } from '~/schema.ts';

export async function GET() {
  try {
    const response = await fetch(
      'https://api.pokemontcg.io/v2/cards?q=supertype:energy%20subtypes:Basic%20legalities.standard:Legal'
    );
    const json = await response.json();

    for (const set of json.data) {
      await sdkCardToDb(set);
    }
  } catch (error) {
    console.error('Failed to fetch energies from SDK', error);
  }

  return sql`
    SELECT *
    FROM ${cards}
    WHERE supertype = 'Energy'
      AND subtypes @> ARRAY['Basic']
      AND legality = 'Standard'
  `;
}
