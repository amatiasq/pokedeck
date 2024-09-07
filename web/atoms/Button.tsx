import { styled } from '../css';

export const Button = styled('button')`
  font-size: inherit;
  border-radius: 0.25rem;
  border: 0;
  padding: 0.5rem 1rem;
  cursor: pointer;
  white-space: nowrap;
`;

export const PrimaryButton = styled(Button)`
  background-color: var(--primary);
  color: white;
`;

export const InvisibleButton = styled('button')`
  font-size: inherit;
  border: 0;
  padding: 0;
  background-color: transparent;
  color: inherit;
  cursor: pointer;
`;

const Link = styled('a')`
  font-size: inherit;
  border-radius: 0.25rem;
  border: 0;
  padding: 0.7rem 1.2rem;
  cursor: pointer;
  white-space: nowrap;

  @media print {
    display: none;
  }
`;

export const LinkButton = styled(Link)`
  background-color: #f0f0f0;
  color: #3c3c3c;
`;

export const PrimaryLinkButton = styled(Link)`
  background-color: var(--primary);
  color: white;
`;
