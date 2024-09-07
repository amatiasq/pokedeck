import { Plugin, defineConfig } from 'vite';
import solid from 'vite-plugin-solid';
import tsconfigPaths from 'vite-tsconfig-paths';
import { readMigrationFiles } from './node_modules/drizzle-orm/migrator.js';

export default defineConfig({
  build: {
    target: ['esnext'],
  },
  plugins: [
    //
    solid(),
    tsconfigPaths() as unknown as Plugin,
    loadMigrations({ migrationsFolder: './migrations' }),
  ],
  optimizeDeps: {
    exclude: ['@electric-sql/pglite'],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:9837',
    },
  },
});

function loadMigrations(config: { migrationsFolder: string }) {
  const moduleName = 'vite:migrations';
  const hook = '\0' + moduleName;

  return {
    name: 'load-migrations',

    resolveId(id) {
      if (id === moduleName) return hook;
    },

    async load(id) {
      if (id === hook) {
        const files = await readMigrationFiles(config);
        return `export default ${JSON.stringify(files)};`;
      }
    },
  } as Plugin;
}
