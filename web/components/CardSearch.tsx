import { Scheduler } from '@amatiasq/scheduler';
import { createResource, createSignal, Show, type JSX } from 'solid-js';
import type { Card } from '~/schema.ts';
import { api } from '../api.ts';
import { Loader } from '../atoms/Loader.tsx';
import { CardGrid } from '../components/CardGrid.tsx';
import { styled } from '../css.ts';
import { cacheCard } from '../store/useCard.ts';

const InputWrap = styled('pd-card-search')`
  display: flex;
  align-self: stretch;
  align-items: stretch;
  justify-content: stretch;
  border-radius: 0.5rem;
  background-color: #f0f0f0;
  color: black;

  &:not(.is-loading) > :first-child {
    visibility: hidden;
  }
  &.is-loading .ripple {
    border-color: black;
  }

  &:not(.has-results) > :last-child {
    visibility: hidden;
  }

  input,
  button {
    height: 40px;
  }

  button {
    border: 0;
    font-size: 2rem;
    margin-right: 0.5rem;
    line-height: 1rem;
  }

  input {
    flex: 1;
    font-size: inherit;
    text-align: center;
    background-color: transparent;
    border: 0;
    padding: 0.5rem;

    &:focus {
      outline: none;
    }
  }
`;

export function CardSearch(props: {
  closeOnClick?: boolean;
  placeholder?: string;
  autofocus?: boolean;
  children: (card: Card) => JSX.Element;
}) {
  const [term, setTerm] = createSignal(location.hash.slice(1) ?? '');
  const [cards] = createResource(
    term,
    (term) =>
      term ? findCards(term) : new Promise<Card[]>((resolve) => resolve([])),
    { initialValue: [] }
  );

  const input = (
    <input
      value={term()}
      placeholder={props.placeholder}
      onKeyDown={handleKeyDown}
      autofocus={props.autofocus}
    />
  ) as HTMLInputElement;

  const delay = new Scheduler(1000, () => set(input.value));

  return (
    <>
      <InputWrap
        class={[
          cards.loading ? 'is-loading' : '',
          cards().length ? 'has-results' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Loader />
        {input}
        <button onClick={close}>&times;</button>
      </InputWrap>

      <Show when={cards().length}>
        <CardGrid cards={cards()} onClick={onGridClick}>
          {props.children}
        </CardGrid>
      </Show>
    </>
  );

  function onGridClick() {
    if (props.closeOnClick) {
      close();
      input.focus();
    }
  }

  function close() {
    delay.stop();
    set('');
    input.value = '';
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key == 'Enter') {
      delay.run();
    } else if (event.key == 'Escape') {
      close();
    } else {
      delay.restart();
    }
  }

  function set(value: string) {
    location.hash = value;
    setTerm(value);
  }
}

async function findCards(term: string) {
  const result = await api.get<Card[]>(`/search?name=${term}`).json();

  for (const card of result) {
    cacheCard(card);
  }

  return result;
}
