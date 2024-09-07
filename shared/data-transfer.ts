import { InferSelectModel } from 'drizzle-orm';
import { CardId, Session, User, deckCards } from '~/schema.ts';

export interface AuthResponse {
  user: PublicUser;
  session: Session;
}

export type PublicUser = ReturnType<typeof publicUser>;
export function publicUser({ id, email }: User) {
  return { id, email };
}

export type DeckCard = Omit<
  InferSelectModel<typeof deckCards>,
  'deck_id' | 'card_id'
> & { id: CardId };
