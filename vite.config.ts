import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			alias: {
				$lib: 'src/lib',
				'$lib/*': 'src/lib/*'
			}
		})
	],
	server: {
		host: '0.0.0.0',
		port: 3000
	}
});
