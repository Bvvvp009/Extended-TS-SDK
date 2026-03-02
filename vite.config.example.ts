import { defineConfig } from 'vite';

/**
 * Example Vite configuration for extended-typescript-sdk
 * 
 * This configuration enables proper handling of WASM files.
 * Copy relevant sections to your vite.config.ts as needed.
 */
export default defineConfig({
  optimizeDeps: {
    exclude: ['extended-typescript-sdk']
  },
  
  assetsInclude: ['**/*.wasm'],
  
  build: {
    target: 'esnext',
    
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    }
  },
  
  esbuild: {
    supported: {
      'top-level-await': true
    }
  },
  
  plugins: [
    {
      name: 'wasm-content-type',
      configureServer(server: any) {
        server.middlewares.use((req: any, res: any, next: any) => {
          if (req.url?.endsWith('.wasm')) {
            res.setHeader('Content-Type', 'application/wasm');
          }
          next();
        });
      }
    }
  ]
});
