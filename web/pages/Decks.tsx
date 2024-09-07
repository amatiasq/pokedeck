import { useNavigate } from '@solidjs/router';
import { createSignal, Show } from 'solid-js';
import type { CardId, Deck } from '~/schema';
import { api } from '../api';
import { Button, PrimaryButton } from '../atoms/Button';
import { Center } from '../atoms/Center';
import { Header } from '../atoms/Header';
import { Loader } from '../atoms/Loader';
import { logout } from '../auth';
import { CardGrid } from '../components/CardGrid';
import { CardView } from '../components/CardView';
import { styled } from '../css';

const Link = styled('a')`
  color: var(--text-primary);
  text-decoration: none;
  cursor: pointer;
`;

const Main = styled('main')`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
`;

export function Decks() {
  const navigate = useNavigate();
  const [decks, setDecks] = createSignal<
    (Deck & { cards: { id: CardId }[] })[]
  >(null!);
  api.get('/deck').json().then(setDecks);

  return (
    <Show when={decks()} fallback={<Center children={<Loader />} />}>
      <Show
        when={decks().length}
        fallback={
          <Center>
            <p>You have no decks yet.</p>
            <PrimaryButton onClick={createDeck}>Create one</PrimaryButton>
          </Center>
        }
      >
        <Header>
          <div>
            <Button onClick={logout}>Logout</Button>
          </div>
          <h1>Decks</h1>
          <div>
            <PrimaryButton onClick={createDeck}>Create</PrimaryButton>
          </div>
        </Header>

        <Main>
          <CardGrid cards={decks()}>
            {(deck) => (
              <Link href={`/deck/${deck.id}`}>
                <h2>{deck.name || '(unnamed)'}</h2>
                <Show when={deck.cards.length}>
                  <CardView id={deck.cards[0].id} />
                </Show>
              </Link>
            )}
          </CardGrid>

          {/* <For each={decks()}>
          </For> */}
        </Main>
      </Show>
    </Show>
  );

  async function createDeck() {
    const deck = await api.post<Deck>('/deck', { name: 'New Deck' }).json();
    navigate(`/deck/${deck.id}`);
  }
}
