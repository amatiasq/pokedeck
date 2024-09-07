import { db } from './db.ts';
import {
  Card,
  CardId,
  CardSet,
  Legality,
  SetId,
  cards,
  sets,
} from './schema.ts';

// TODO: rename PokemonTcgSdk => Tcgio

export interface PokemonTcgSdkCard {
  id: CardId;
  name: string;
  supertype: Supertype;
  subtypes: string[];
  hp?: string;
  types?: RetreatCost[];
  evolvesTo?: string[];
  attacks?: Attack[];
  weaknesses?: Resistance[];
  retreatCost?: RetreatCost[];
  convertedRetreatCost?: number;
  set: PokemonTcgSdkSet;
  number: string;
  artist?: string;
  rarity: Rarity;
  flavorText?: string;
  nationalPokedexNumbers?: number[];
  legalities: Legalities;
  regulationMark?: RegulationMark;
  images: CardImages;
  evolvesFrom?: string;
  resistances?: Resistance[];
  abilities?: Ability[];
  rules?: string[];
  tcgplayer?: unknown;
  cardmarket?: unknown;
}

interface Ability {
  name: string;
  text: string;
  type: Type;
}

enum Type {
  Ability = 'Ability',
}

interface Attack {
  name: string;
  cost: RetreatCost[];
  convertedEnergyCost: number;
  damage: string;
  text?: string;
}

enum RetreatCost {
  Colorless = 'Colorless',
  Darkness = 'Darkness',
  Dragon = 'Dragon',
  Fighting = 'Fighting',
  Fire = 'Fire',
  Free = 'Free',
  Grass = 'Grass',
  Lightning = 'Lightning',
  Metal = 'Metal',
  Psychic = 'Psychic',
  Water = 'Water',
}

interface CardImages {
  small: string;
  large: string;
}

interface Legalities {
  unlimited: Expanded;
  standard?: Expanded;
  expanded: Expanded;
}

enum Expanded {
  Legal = 'Legal',
}

enum Rarity {
  Common = 'Common',
  DoubleRare = 'Double Rare',
  HyperRare = 'Hyper Rare',
  IllustrationRare = 'Illustration Rare',
  Promo = 'Promo',
  RadiantRare = 'Radiant Rare',
  Rare = 'Rare',
  RareHolo = 'Rare Holo',
  RareHoloV = 'Rare Holo V',
  RareHoloVMAX = 'Rare Holo VMAX',
  RareShinyGX = 'Rare Shiny GX',
  RareUltra = 'Rare Ultra',
  Uncommon = 'Uncommon',
}

enum RegulationMark {
  D = 'D',
  E = 'E',
  F = 'F',
  G = 'G',
  H = 'H',
}

interface Resistance {
  type: RetreatCost;
  value: string;
}

export interface PokemonTcgSdkSet {
  id: SetId;
  name: string;
  series: Series;
  printedTotal: number;
  total: number;
  legalities: Legalities;
  ptcgoCode?: string;
  releaseDate: string;
  updatedAt: string;
  images: SetImages;
}

interface SetImages {
  symbol: string;
  logo: string;
}

enum Series {
  ScarletViolet = 'Scarlet & Violet',
  SunMoon = 'Sun & Moon',
  SwordShield = 'Sword & Shield',
  Xy = 'XY',
}

enum Supertype {
  Energy = 'Energy',
  Pokémon = 'Pokémon',
  Trainer = 'Trainer',
}

export async function sdkCardToDb({
  tcgplayer: _1,
  cardmarket: _2,
  ...json
}: PokemonTcgSdkCard) {
  const set = await sdkSetToDb(json.set);
  const card = cardToDb(json, set.id);

  await db.insert(cards).values(card).onConflictDoUpdate({
    target: cards.id,
    set: card,
  });

  return { card, set };
}

export async function sdkSetToDb(json: PokemonTcgSdkSet) {
  const set = setToDb(json);

  await db.insert(sets).values(set).onConflictDoUpdate({
    target: sets.id,
    set: set,
  });

  return set;
}

function cardToDb(card: PokemonTcgSdkCard, set_id: string): Card {
  return {
    id: card.id,
    name: card.name,
    legality: parseLegality(card.legalities),
    supertype: card.supertype,
    subtypes: card.subtypes,
    set_id: set_id,
    number: card.number,
    img_thumb: card.images.small,
    img_large: card.images.large,
    more: card,
  };
}

function setToDb(set: PokemonTcgSdkSet): CardSet {
  return {
    id: set.id,
    name: set.name,
    legality: parseLegality(set.legalities),
    series: set.series,
    printed_total: set.printedTotal,
    total: set.total,
    ptcgo_code: set.ptcgoCode ?? '',
    release_date: parseDate(set.releaseDate),
    updated_at: parseDatetime(set.updatedAt),
    img_symbol: set.images.symbol,
    img_logo: set.images.logo,
  };
}

function parseLegality(legalities: PokemonTcgSdkSet['legalities']): Legality {
  if (legalities.standard) return 'Standard';
  if (legalities.expanded) return 'Expanded';
  return 'Unlimited';
}

function parseDate(raw: string) {
  // if (!raw) return null;
  //  "%Y/%m/%d"
  const [year, month, day] = raw.split('/');
  // return new Date(Number(year), Number(month) - 1, Number(day));
  return `${year}-${month}-${day}`;
}

function parseDatetime(raw: string) {
  // if (!raw) return null;
  //  "%Y/%m/%d %H:%M:%S"
  const [date, time] = raw.split(' ');
  const [year, month, day] = date.split('/');
  const [hour, minute, second] = time.split(':');
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  );
  // return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}
