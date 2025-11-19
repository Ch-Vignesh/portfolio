import { defineConfig } from 'vite';

export default defineConfig({
    // Base path for GitHub Pages (repo name)
    base: '/portfolio/',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    }
});
