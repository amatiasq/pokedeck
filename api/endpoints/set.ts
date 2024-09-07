import { sql } from '~/db.ts';
import { sdkSetToDb } from '~/pokemontcgsdk.ts';
import { sets } from '~/schema.ts';

export async function GET() {
  try {
    const response = await fetch('https://api.pokemontcg.io/v2/sets');
    const json = await response.json();

    for (const set of json.data) {
      await sdkSetToDb(set);
    }
  } catch (error) {
    console.error('Failed to fetch sets from SDK', error);
  }

  return sql`SELECT * FROM ${sets}`;
}
