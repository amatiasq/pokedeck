# pokedeck

Colección y mazos de cartas Pokémon: busca cartas, monta mazos y los imprime
como lista. Solid + Vite en el navegador, API en Deno con enrutado por ficheros
(`api/endpoints/`) y Postgres vía Drizzle.

Una carta se busca en tres saltos, y cada uno rellena al anterior: PGlite sobre
IndexedDB en el navegador → la API → `api.pokemontcg.io`. Por eso el catálogo
crece solo y el mismo esquema de Drizzle migra las dos bases.

`make db` levanta Postgres y adminer (hace falta un `.env` con `POSTGRES_USER`,
`POSTGRES_DB` y `POSTGRES_PASSWORD`); `make dev` arranca API y web a la vez.
