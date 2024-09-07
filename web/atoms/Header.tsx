import { styled } from '../css';

export const Header = styled('header')`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  gap: 1rem;

  > :first-child,
  > :last-child {
    flex: 1;
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: flex-start;
  }

  > :last-child {
    // text-align: right;
    flex-direction: row-reverse;
  }

  > :nth-child(2) {
    flex: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
  }
`;
