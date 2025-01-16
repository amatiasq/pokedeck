import { InferSelectModel, relations } from 'drizzle-orm';
import {
  PgEnum,
  date,
  integer,
  json,
  pgEnum,
  pgTable,
  serial,
  text,
} from 'drizzle-orm/pg-core';

// GENERIC

type InferEnum<T> = T extends PgEnum<infer E> ? E[number] : never;

export type Legality = InferEnum<typeof legality>;
export const legality = pgEnum('Legality', [
  'Unlimited',
  'Expanded',
  'Standard',
]);

export type CardSupertype = InferEnum<typeof cardSupertype>;
export const cardSupertype = pgEnum('CardSupertype', [
  'Energy',
  'Pokémon',
  'Trainer',
]);

export type SetId = 'superpotatosetid';
export type CardSet = Omit<InferSelectModel<typeof sets>, 'id'> & { id: SetId };
export const sets = pgTable('sets', {
  id: text('id').primaryKey().unique().notNull(),
  name: text('name').notNull(),
  legality: legality('legality').notNull(),
  series: text('series').notNull(),
  printed_total: integer('printed_total').notNull(),
  total: integer('total').notNull(),
  ptcgo_code: text('ptcgo_code'),
  release_date: date('release_date').notNull(),
  updated_at: text('updated_at').notNull(),
  img_symbol: text('img_symbol').notNull(),
  img_logo: text('img_logo').notNull(),
});

export const setsRelations = relations(sets, ({ many }) => ({
  cards: many(cards),
}));

export type CardId = 'superpotatocardid';
export type Card = Omit<InferSelectModel<typeof cards>, 'id' | 'set_id'> & {
  id: CardId;
  set_id: SetId;
};
export const cards = pgTable('cards', {
  id: text('id').primaryKey().unique().notNull(),
  name: text('name').notNull(),
  legality: legality('legality').notNull(),
  supertype: cardSupertype('supertype'),
  subtypes: text('subtypes').array(),
  set_id: text('set_id'),
  number: text('number'),
  img_thumb: text('img_thumb').notNull(),
  img_large: text('img_large').notNull(),
  more: json('more'),
});

export const cardsRelations = relations(cards, ({ one }) => ({
  set: one(sets, { fields: [cards.set_id], references: [sets.id] }),
}));

// USERSPACE

export type User = InferSelectModel<typeof users>;
export const users = pgTable('users', {
  id: serial('id').primaryKey().unique().notNull(),
  email: text('email').unique().notNull(),
  salt: text('salt').notNull(),
  hash: text('hash').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  decks: many(decks),
  sessions: many(sessions),
}));

export type Session = InferSelectModel<typeof sessions>;
export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey().unique().notNull(),
  user_id: integer('user_id').notNull(),
  token: text('token').unique().notNull(),
  expires_at: text('expires_at').notNull(),
});

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.user_id], references: [users.id] }),
}));

export type DeckId = 'superpotatodeckid';
export type Deck = Omit<InferSelectModel<typeof decks>, 'id'> & { id: DeckId };
export const decks = pgTable('decks', {
  id: serial('id').primaryKey().unique().notNull(),
  name: text('name').notNull(),
  owner_id: integer('owner_id').notNull(),
});

export const decksRelations = relations(decks, ({ one }) => ({
  owner: one(users, { fields: [decks.owner_id], references: [users.id] }),
}));

export type Language = InferEnum<typeof language>;
export const language = pgEnum('Language', [
  'EN',
  'ES',
  'PT',
  'FR',
  'DE',
  'IT',
  'JA',
  'KO',
  'ZH',
  'XX',
]);

export const deckCards = pgTable('deck_cards', {
  deck_id: integer('deck_id').notNull(),
  card_id: text('card_id').notNull(),
  language: language('language').notNull(),
  quantity: integer('quantity').notNull(),
});

export const deckCardsRelations = relations(deckCards, ({ one }) => ({
  deck: one(decks, { fields: [deckCards.deck_id], references: [decks.id] }),
  card: one(cards, { fields: [deckCards.card_id], references: [cards.id] }),
}));
