import type { DeckCard } from '~/data-transfer';
import { styled } from '../css';
import { CardView } from './CardView';

const QuantityControl = styled('div')`
  --border: 1px solid white;

  background: rgba(0, 0, 0, 0.7);
  padding: 0.1em 0.3em;
  border-radius: 1em;
  margin-left: 8px;
  margin-bottom: 8px;
  display: flex;
  width: 7em;
  border: var(--border);
  font-size: 1em;

  button,
  input {
    padding: 0.2em 0.4em;
    font-size: inherit;
    background: transparent;
    border: none;
    color: inherit;
    font-size: inherit;
    text-align: center;
  }

  button:first-child {
    border-right: var(--border);
  }

  button:last-child {
    border-left: var(--border);
  }

  input {
    flex: 1;
    width: 0;
  }
`;

export function CardInDeck(props: {
  card: DeckCard;
  onClick: (card: DeckCard) => void;
  onQuantityChange: (quantity: number) => void;
}) {
  return (
    <CardView id={props.card.id} onClick={() => props.onClick(props.card)}>
      <QuantityControl>
        <button onClick={crement(-1)}>-</button>
        <input value={props.card.quantity} onInput={update} />
        <button onClick={crement(+1)}>+</button>
      </QuantityControl>
    </CardView>
  );

  function crement(amount: number) {
    return () => props.onQuantityChange(props.card.quantity + amount);
  }

  function update(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    const num = Number(value);

    if (isNaN(num)) {
      props.onQuantityChange(num);
    }
  }
}
