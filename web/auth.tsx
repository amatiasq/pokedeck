import { createSignal } from 'solid-js';
import type { AuthResponse } from '~/data-transfer';
import { api, API_URL } from './api';
import { styled } from './css';

const [session, setSession] = createSignal(getSession());
validateSession().then((isValid) => isValid || setSession(null));

export { session };

function saveSession({ user, session }: AuthResponse) {
  localStorage.setItem(`pokedeck::user::${user.id}`, user.email);
  sessionStorage.setItem('pokedeck::user', JSON.stringify(user));
  sessionStorage.setItem('pokedeck::session', JSON.stringify(session));
  setSession(session);
}

export async function logout() {
  await api.delete('/auth');
  sessionStorage.removeItem('pokedeck::user');
  sessionStorage.removeItem('pokedeck::session');
}

export function getUser() {
  const user = sessionStorage.getItem('pokedeck::user');
  return user && JSON.parse(user);
}

function getSession() {
  const session = sessionStorage.getItem('pokedeck::session');
  return session && JSON.parse(session);
}

async function validateSession() {
  if (!session()) return false;

  const response = await fetch(`${API_URL}/auth`, {
    headers: { Authorization: session().token },
  });

  if (!response.ok) {
    sessionStorage.removeItem('pokedeck::user');
    sessionStorage.removeItem('pokedeck::session');
    return false;
  }

  return true;
}

// UI

const Form = styled('form')`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  gap: 1rem;

  input,
  button {
    font-size: inherit;
    border-radius: 0.25rem;
    border: 0;
    width: 100%;
    padding: 0.5rem 1rem;
  }

  input {
    margin-bottom: 1rem;
    text-align: center;
    background-color: #f0f0f0;
  }

  button {
    background-color: var(--primary, #3c3c3c);
    color: white;
    cursor: pointer;
  }
`;

export function Login() {
  return (
    <Form onSubmit={onSubmit}>
      <label>Email</label>
      <input type="email" required />
      <label>Password</label>
      <input type="password" required />
      <button>Login</button>
    </Form>
  );

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const field = (name: string) =>
      form.querySelector(`[type=${name}]`) as HTMLInputElement;

    const email = field('email').value;
    const password = field('password').value;

    const response = await api
      .post<AuthResponse>('/auth', { email, password })
      .json();

    saveSession(response);
  }
}
