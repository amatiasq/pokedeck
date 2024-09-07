import {
  cards,
  sets,
  type Card,
  type CardId,
  type CardSet,
} from '../../shared/schema';
import { api } from '../api';
import { db, sql } from './db';

const energyAbbrs: Record<string, string> = {
  '{L}': 'Lightning',
  '{D}': 'Darkness',
  '{M}': 'Metal',
  '{C}': 'Colorless',
  '{G}': 'Grass',
  '{W}': 'Water',
  '{R}': 'Fire',
  '{F}': 'Fighting',
  '{Y}': 'Fairy',
  '{P}': 'Psychic',
  '{N}': 'Dragon',
};

export async function parseDecklist(decklist: string) {
  const [sets, energies] = await Promise.all([getAllSets(), getAllEnergies()]);
  const ptcgoCodes = new Set(sets.map((set) => set.ptcgo_code!));

  return decklist
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(isValidCardLine)
    .map((line) => line.replace('&amp;', '*').replace('&', '*'))
    .map((line) => parseEnergy(line) ?? parseCard(line));

  function parseEnergy(line: string): ParsedCard | null {
    const type = getEnergyType(line);
    if (!type) return null;

    const match = line.match(/^(\d+)/);
    if (!match) throw new Error(`Can't find quantity in line: ${line}`);

    const typeName = energyAbbrs[type].toLocaleLowerCase();
    const card = energies.find((card) =>
      card.name.toLocaleLowerCase().includes(typeName)
    );

    if (!card) throw new Error(`Can't find energy card for type: ${type}`);

    return {
      quantity: parseInt(match[0], 10),
      tcgioId: card.id as CardId,
    };
  }

  function parseCard(line: string): ParsedCard {
    const [amount, ...chunks] = line.split(' ');

    const setPos = chunks.findIndex((chunk) => ptcgoCodes.has(chunk));
    if (setPos === -1) throw new Error(`Can't find SET code in line: ${line}`);
    const setCode = chunks.splice(setPos, 1)[0];

    const numPos = chunks.findLastIndex((chunk) => /^\d+$/.test(chunk));
    if (numPos === -1)
      throw new Error(`Can't find card number in line: ${line}`);
    const number = chunks.splice(numPos, 1)[0];

    const setId = sets
      .filter((set) => set.ptcgo_code === setCode)
      .map((set) => set.id)
      .sort((a, b) => a.length - b.length)[0];

    return {
      quantity: parseInt(amount, 10),
      // name: chunks.filter((x) => x !== 'PH').join(' '),
      tcgioId: `${setId}-${number}` as CardId,
      // setCode,
      // number: parseInt(number, 10),
    };
  }
}

function isValidCardLine(line: string) {
  return (
    line &&
    /^\d/.test(line) &&
    !line.includes('#') &&
    !line.includes('Generated') &&
    !line.includes('Total Cards') &&
    !line.includes('Trading Card Game')
  );
}

function getEnergyType(line: string): keyof typeof energyAbbrs | undefined {
  return Object.keys(energyAbbrs).find((abbr) => line.includes(abbr));
}

type ParsedCard = {
  quantity: number;
  tcgioId: CardId;
};

async function getAllSets() {
  const { rows } = await sql<CardSet>`SELECT * FROM sets`;

  if (rows.length) {
    return rows;
  }

  const fromApi = await api.get<CardSet[]>('/set').json();

  await db
    .insert(sets)
    .values(
      fromApi.map((x) => ({
        ...x,
        updated_at: new Date(x.updated_at),
      }))
    )
    .onConflictDoNothing();

  return fromApi;
}

async function getAllEnergies() {
  const { rows } = await sql<Card>`
    SELECT *
    FROM ${cards}
    WHERE supertype = 'Energy'
      AND subtypes @> ARRAY['Basic']
      AND legality = 'Standard'
  `;

  if (rows.length) {
    return rows;
  }

  const fromApi = await api.get<Card[]>('/card/energies').json();
  await db.insert(cards).values(fromApi).onConflictDoNothing();
  return fromApi;
}
