import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	Object.assign(process.env, env);

	return {
		plugins: [
			tailwindcss(),
			sveltekit({
				preprocess: vitePreprocess(),
				adapter: adapter()
			})
		],
		resolve: {
			alias: {
				'$lib': path.resolve('./src/lib')
			}
		},
		server: {
			host: '0.0.0.0',
			port: 3000
		}
	};
});
