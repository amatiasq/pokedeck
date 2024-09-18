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

// async function test() {
//   const deck = `
//     Pokémon: 8
//     1 Jirachi PAR 126 PH
//     2 Charmeleon PAF 8
//     2 Charizard PGO 10
//     1 Kangaskhan ex PR-SV 55
//     1 Radiant Charizard PGO 11
//     4 Charmander MEW 4
//     3 Charizard ex OBF 125
//     1 Charizard ex MEW 6

//     Entrenador: 11
//     2 Ultra Ball SVI 196
//     2 Switch Cart ASR 154
//     4 Rare Candy SVI 191
//     1 Thorton LOR 167
//     2 Jacq SVI 175
//     4 Trekking Shoes ASR 156
//     1 Hisuian Heavy Ball ASR 146
//     4 Pokégear 3.0 SVI 186
//     1 Roxanne ASR 150
//     2 Professor's Research SVI 189
//     2 Boss's Orders PAL 172

//     Energía: 1
//     20 Basic {R} Energy Energy 10

//     Cartas totales: 60
//   `;

//   const cards = await parseDecklist(deck);
//   console.table(cards);
// }

// test();

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
          {/* <a href={`/deck/${id}/print`}>Delete</a> */}
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
