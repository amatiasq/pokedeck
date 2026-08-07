import { useNavigate, useParams } from '@solidjs/router';
import { Show } from 'solid-js';
import { effect } from 'solid-js/web';
import type { DeckCard } from '../../shared/data-transfer';
import type { DeckId } from '../../shared/schema';
import { LinkButton, PrimaryLinkButton } from '../atoms/Button';
import { Header } from '../atoms/Header';
import { CardGrid } from '../components/CardGrid';
import { CardInDeck } from '../components/CardInDeck';
import { CardSearch } from '../components/CardSearch';
import { CardView } from '../components/CardView';
import { styled } from '../css';
import { useDeck } from '../store/useDeck';

const Center = styled('div')`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const Main = styled('main')`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;

  search {
    margin-bottom: 1rem;
    font-size: 1.2rem;
  }
`;

export function Deck() {
  const navigate = useNavigate();
  const { id } = useParams() as { id: DeckId };
  const {
    //
    deck,
    changeName,
    hasCard,
    addCard,
    updateCardQuantity,
  } = useDeck(id);

  effect(() => {
    if (deck.status === 'error') {
      navigate('/decks');
    }
  });

  const searchField = (
    <CardSearch placeholder="Add card..." closeOnClick autofocus>
      {(card) => (
        <CardView
          id={card.id}
          class={hasCard(card) ? 'selected' : ''}
          onClick={addCard}
        />
      )}
    </CardSearch>
  );

  return (
    <Show when={deck.status === 'ready'} fallback={<Center>Loading...</Center>}>
      <Header>
        <div>
          <LinkButton href="/decks">← Back</LinkButton>
        </div>
        <h2
          contentEditable
          onBlur={(event) => changeName(event.currentTarget.textContent!)}
        >
          {deck.name}
        </h2>
        <div>
          <PrimaryLinkButton href={`/deck/${id}/print`}>
            Print →
          </PrimaryLinkButton>
        </div>
      </Header>

      <Main>
        {searchField}

        <CardGrid cards={deck.cards}>
          {(card) => (
            <CardInDeck
              card={card}
              onClick={() => updateCard(card, card.quantity + 1)}
              onQuantityChange={(value) => updateCard(card, value)}
            />
          )}
        </CardGrid>
      </Main>
    </Show>
  );

  function updateCard(card: DeckCard, quantity: number) {
    updateCardQuantity(card, quantity);
    (searchField as unknown as any).focus();
  }
}
