import { createStore } from 'solid-js/store';
import { type Card, type Deck, type DeckId } from '~/schema';
import type { DeckCard } from '../../shared/data-transfer';
import { api } from '../api';

type DeckEditable = ReturnType<typeof createDeck>;
type DeckWithCards = Deck & { cards: DeckCard[] };

const UPDATE_AFTER_MS = 1000 * 60;
const cache = new Map<
  DeckId,
  {
    deck: DeckEditable;
    lastUpdate?: number;
  }
>();

export function useDeck(id: DeckId) {
  if (!cache.has(id)) {
    cache.set(id, { deck: createDeck(id) });
  }

  const entry = cache.get(id)!;
  const { deck, lastUpdate } = entry;

  if (!lastUpdate || Date.now() - lastUpdate > UPDATE_AFTER_MS) {
    deck.fetch().then(() => registerUpdate(id));
  }

  return deck;
}

function createDeck(id: DeckId, onError?: () => void) {
  const [deck, setDeck] = createStore({
    status: 'loading' as 'loading' | 'ready' | 'error',
    name: '',
    cards: [] as DeckCard[],
  });

  return {
    deck,

    async fetch() {
      const response = await api.get<DeckWithCards>(`/deck/${id}`).json();
      setDeck({ ...response, status: 'ready' });
    },

    changeName(name: string) {
      const prev = deck.name;
      setDeck('name', name);
      api.patch(`/deck/${id}`, { name }).catch(() => setDeck('name', prev));
    },

    hasCard(card: Card) {
      return deck.cards.some((x) => x.id === card.id);
    },

    addCard(card: Card) {
      setDeck('cards', deck.cards.length, {
        id: card.id,
        quantity: 1,
        language: 'ES',
      });

      saveWithCards();
    },

    removeCard,

    updateCardQuantity(card: DeckCard, quantity: number) {
      if (quantity <= 0) {
        return removeCard(card);
      }

      setDeck('cards', deck.cards.indexOf(card), 'quantity', quantity);
      saveWithCards();
    },
  };

  function removeCard(card: DeckCard) {
    setDeck(
      'cards',
      deck.cards.filter((x) => x !== card)
    );

    saveWithCards();
  }

  function saveWithCards() {
    const { status, ...data } = deck;
    api.put(`/deck/${id}`, data);
    registerUpdate(id);
  }
}

function registerUpdate(id: DeckId) {
  cache.get(id)!.lastUpdate = Date.now();
}
