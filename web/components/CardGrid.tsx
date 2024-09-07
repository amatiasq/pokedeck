import { For, type JSX } from 'solid-js';
import { styled } from '../css.ts';

const PdCardGrid = styled('pd-card-grid')`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  grid-gap: 1rem;
  align-self: stretch;
`;

export function CardGrid<T>(props: {
  cards: T[];
  onClick?: () => void;
  children: (card: T) => JSX.Element;
}) {
  return (
    <PdCardGrid onClick={props.onClick}>
      <For each={props.cards}>{props.children}</For>
    </PdCardGrid>
  );
}
