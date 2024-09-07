/* @refresh reload */
import { Route, Router } from '@solidjs/router';
import { render, Show } from 'solid-js/web';
import { Center } from './atoms/Center.tsx';
import { Login, session } from './auth.tsx';
import './index.css';
import { Deck } from './pages/Deck.tsx';
import { Decks } from './pages/Decks.tsx';
import { PrintDeck } from './pages/PrintDeck.tsx';

const root = document.getElementById('root');

render(
  () => (
    <Show when={session()} fallback={<Center children={<Login />} />}>
      <Router>
        <Route path="/" component={Decks} />
        <Route path="/decks" component={Decks} />
        <Route path="/deck/:id" component={Deck} />
        <Route path="/deck/:id/print" component={PrintDeck} />
      </Router>
    </Show>
  ),
  root!
);
