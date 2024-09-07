import { createSignal, type Accessor } from 'solid-js';
import { cards, type Card, type CardId } from '~/schema';
import { api } from '../api';
import { db, sql } from './db';

const cache = new Map<CardId, Accessor<Card | null>>();
const setters = new Map<CardId, (card: Card) => void>();

export function useCard(id: CardId) {
  return () => {
    if (cache.has(id)) {
      return cache.get(id)!();
    }

    const [card, setCard] = createSignal<Card | null>(null);
    cache.set(id, card);
    setters.set(id, setCard);
    loadCard(id).then(setCard);
    return card();
  };
}

export function cacheCard(card: Card) {
  if (setters.has(card.id)) {
    setters.get(card.id)!(card);
    return;
  }

  const [signal, setSignal] = createSignal(card);
  cache.set(card.id, signal);
  setters.set(card.id, setSignal);
}

async function loadCard(id: CardId) {
  const {
    rows: [foundLocally],
  } = await sql.debug<Card>`SELECT * FROM ${cards} WHERE id = ${id}`;

  if (foundLocally) {
    return foundLocally;
  }

  const foundInApi = await api.get<Card>(`/card/${id}`).json();

  if (!foundInApi) {
    throw new Error('Card not found');
  }

  await db.insert(cards).values(foundInApi);
  return foundInApi;
}
