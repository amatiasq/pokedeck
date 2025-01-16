import { createSignal, type Accessor } from 'solid-js';
import { sets, type CardSet, type SetId } from '~/schema';
import { api } from '../api';
import { db, sql } from './db';

const cache = new Map<SetId, Accessor<CardSet | null>>();
const setters = new Map<SetId, (card: CardSet) => void>();

export function useCardSet(id: SetId) {
  return () => {
    if (cache.has(id)) {
      console.log('cache hit', id)
      return cache.get(id)!();
    }

    const [cardSet, setCardSet] = createSignal<CardSet | null>(null);
    cache.set(id, cardSet);
    setters.set(id, setCardSet);
    loadSet(id).then(x => {
      console.log('asfdaklsdjflkadsjlkasdflk', x)
      setCardSet(x)
  });
    return cardSet();
  };
}

export function cacheCard(card: CardSet) {
  if (setters.has(card.id)) {
    setters.get(card.id)!(card);
    return;
  }

  const [signal, setSignal] = createSignal(card);
  cache.set(card.id, signal);
  setters.set(card.id, setSignal);
}

async function loadSet(id: SetId) {
  const {
    rows: [foundLocally],
  } = await sql.debug<CardSet>`SELECT * FROM ${sets} WHERE id = ${id}`;

  console.log('set local', foundLocally)

  if (foundLocally) {
    return foundLocally;
  }

  const foundInApi = await api.get<CardSet>(`/set/${id}`).json();

  console.log('set api', foundInApi)

  if (!foundInApi) {
    throw new Error('CardSet not found');
  }

  await db.insert(sets).values(foundInApi);
  return foundInApi;
}
