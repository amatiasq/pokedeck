import { keyframes, styled } from '../css';

const animation = keyframes`
  0% {
    top: 18px;
    left: 18px;
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    top: 0;
    left: 0;
    width: 36px;
    height: 36px;
    opacity: 0;
  }
`;

const Root = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;

  .container {
    display: inline-block;
    position: relative;
    width: 40px;
    height: 40px;
  }

  .ripple {
    position: absolute;
    border: 2px solid white;
    opacity: 1;
    border-radius: 50%;
    animation: ${animation} 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  }

  .ripple-2 {
    animation-delay: -0.5s;
  }
`;

export function Loader() {
  return (
    <Root>
      <div class="container">
        <div class="ripple"></div>
        <div class="ripple ripple2"></div>
      </div>
    </Root>
  );
}
