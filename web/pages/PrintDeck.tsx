import { useNavigate, useParams } from '@solidjs/router';
import { createSignal, For, Show } from 'solid-js';
import { effect } from 'solid-js/web';
import type { DeckCard } from '../../shared/data-transfer';
import type { DeckId } from '../../shared/schema';
import { LinkButton, PrimaryButton } from '../atoms/Button';
import { Center } from '../atoms/Center';
import { Header } from '../atoms/Header';
import { CardView } from '../components/CardView';
import { styled } from '../css';
import { useCard } from '../store/useCard';
import { useDeck } from '../store/useDeck';

const MagicalHeader = styled(Header)`
  @media print {
    display: none !important;
  }
`;

const Main = styled('main')`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;

  ul {
    display: flex;
    justify-content: space-between;
    list-style: none;
    padding: 0;
  }

  table {
    float: left;
  }

  th {
    text-align: left;
  }

  th,
  td {
    white-space: nowrap;
    padding: 0.3rem 0.5rem;
  }

  pd-card {
    max-width: 6rem;
    float: right;
  }

  @media print {
    * {
      color: black !important;
    }

    .controls {
      display: none;
    }
  }
`;

export function PrintDeck() {
  const navigate = useNavigate();
  const { id } = useParams() as { id: DeckId };
  const { deck } = useDeck(id);
  const [showMiniatures, checkMiniatures] = useCheckbox('Miniatures');
  const [legalities, checkLegalities] = useCheckbox('Legalities', true);
  const [counters, checkCounters] = useCheckbox('Count', true);

  effect(() => {
    if (deck.status === 'error') {
      navigate('/decks');
    }
  });

  const cards = () => deck.cards.map((x) => [x, useCard(x.id)] as const);
  const cardCount = () => count(cards());

  const countByType = (type: string) =>
    count(cards().filter((x) => x[1]()?.supertype === type));

  const energies = () => countByType('Energy');
  const trainers = () => countByType('Trainer');
  const pokemons = () => countByType('Pokémon');

  return (
    <Show when={deck.status === 'ready'} fallback={<Center>Loading...</Center>}>
      <MagicalHeader>
        <div>
          <LinkButton href={`/deck/${id}`}>← Back</LinkButton>
        </div>
        <h2>{deck.name}</h2>
        <div>
          <PrimaryButton onClick={() => window.print()}>🖨️</PrimaryButton>
        </div>
      </MagicalHeader>

      <Main>
        <ul class="controls">
          <li children={checkMiniatures} />
          <li children={checkLegalities} />
          <li children={checkCounters} />
        </ul>

        <Show when={counters()}>
          <ul>
            <li>{cardCount()} cards</li>
            <li>{energies()} energies</li>
            <li>{trainers()} trainers</li>
            <li>{pokemons()} pokemons</li>
          </ul>
        </Show>

        <div>
          <table>
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>Card</th>
                <Show when={legalities()}>
                  <th>Legality</th>
                </Show>
              </tr>
            </thead>

            <tbody>
              <For each={deck.cards} fallback={<li>No cards</li>}>
                {(deckCard) => (
                  <Show when={useCard(deckCard.id)()}>
                    {(card) => (
                      <tr>
                        <td>{deckCard.quantity}</td>
                        <td>{card().id}</td>
                        <td class="card-name">{card().name}</td>
                        <Show when={legalities()}>
                          <td>{card().legality}</td>
                        </Show>
                      </tr>
                    )}
                  </Show>
                )}
              </For>
            </tbody>
          </table>

          <Show when={showMiniatures()}>
            <For each={deck.cards}>
              {(deckCard) => <CardView id={deckCard.id} />}
            </For>
          </Show>
        </div>
      </Main>
    </Show>
  );
}

function count(cards: (readonly [DeckCard, any])[]) {
  return cards.reduce((acc, [{ quantity }]) => acc + quantity, 0);
}

function useCheckbox(label: string, defaultValue = false) {
  const [checked, setChecked] = createSignal(defaultValue);

  return [
    checked,

    <label>
      <input
        type="checkbox"
        checked={checked()}
        onChange={(event) => setChecked(event.currentTarget.checked)}
      />
      {label}
    </label>,
  ] as const;
}
