import { Show, createSignal, type JSX } from 'solid-js';
import type { Card, CardId } from '~/schema.ts';
import { styled } from '../css.ts';
import { useCard } from '../store/useCard.ts';

const PdCard = styled('pd-card')`
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;

  /* Card proportions */
  aspect-ratio: 63 / 88;
  border-radius: 5% / 3.5%;
  max-height: 100%;
  max-width: 100%;
  margin: auto;

  --color1: #efb2fb;
  --color2: #acc6f8;

  transition: scale 0.15s ease-in-out;

  &:not(.is-large) {
    max-height: 50dvh;
  }

  &:has([data-zoom]:hover) {
    scale: 1.05;
  }
`;

const FillImg = styled('img')`
  /* The image should grow as big as possible */
  height: 100dvh;
  width: 100dvw;
  /* But never more than it's parent */
  max-width: 100%;
  max-height: 100%;
`;

const Controls = styled('div')`
  display: block;
  position: relative;

  > div {
    position: absolute;
    bottom: 0;
    width: 100%;
    display: flex;
  }
`;

// const IconButton = styled(InvisibleButton)`
//   align-self: flex-end;
//   position: absolute;
//   right: 5px;

//   svg {
//     width: 2.5em;
//     height: 2.5em;
//   }
// `;

export function CardView(props: {
  id: CardId;
  class?: string;
  large?: boolean;
  // hideZoom?: boolean;
  onClick?: (card: Card) => void;
  children?: JSX.Element;
}) {
  // const large = () => props.large;
  const large = () => true;
  const card = useCard(props.id);

  return (
    <PdCard
      class={[props.class, large() ? 'is-large' : ''].filter(Boolean).join(' ')}
      data-id={card()?.id}
      onClick={() => card() && props.onClick?.(card()!)}
    >
      <Show when={card()}>
        {(card) => (
          <>
            <Show when={large()} fallback={<FillImg src={card().img_thumb} />}>
              <ScaledImage small={card().img_thumb} large={card().img_large} />
            </Show>
            <Controls>
              <div onClick={(event) => event.stopPropagation()}>
                {props.children}
                {/*
                <Show when={!props.hideZoom}>
                  <IconButton data-zoom onClick={zoom}>
                    <ZoomIcon />
                  </IconButton>
                </Show>
                */}
              </div>
            </Controls>
          </>
        )}
      </Show>
    </PdCard>
  );
}

function ScaledImage(props: { small: string; large: string }) {
  const [isReady, setIsReady] = createSignal(false);

  const img = new Image();
  img.onload = () => setIsReady(true);
  img.src = props.large;

  return <FillImg src={isReady() ? props.large : props.small} />;
}

// function zoom(event: MouseEvent) {
//   const card = (event.target as HTMLElement).closest('pd-card')!;
//   card.classList.toggle('is-zoomed');
// }
