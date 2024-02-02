import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import typescript from '@rollup/plugin-typescript';
import svg from 'rollup-plugin-svg';
import commonjs from '@rollup/plugin-commonjs';

import terser from '@rollup/plugin-terser';

const backendConfig = {
  input: 'src/routes/routes.ts',
  output: {
    file: 'dist/routes.js',
    format: 'es',
  },
  plugins: [typescript(), json()],
  external: [
    '@hapi/boom',
    'ajv',
    'd3-format',
    'joi',
    'module',
    'path',
    'simple-statistics',
    'svelte/internal',
    'uglify-js',
    'url',
  ],
};

const frontendConfig = {
  input: 'src/components/index.svelte',
  output: {
    name: 'window.q_quiz',
    file: 'dist/Q-Quiz.js',
    format: 'iife',
  },
  plugins: [
    typescript({ sourceMap: true }),
    json(),
    svg(),
    commonjs({
      include: 'node_modules/**', // Default: undefined
    }),
    svelte({
      preprocess: sveltePreprocess({ sourceMap: true }),
      emitCss: false,
      compilerOptions: {},
      onwarn: (warning, handler) => {
        // Silence accessibility warnings.
        if (warning.code.startsWith('a11y-')) {
          return;
        }

        handler(warning);
      },
    }),
    nodeResolve({ browser: true }),
    // terser(),

    alias({
      entries: [
        // If you add a new top-level-folder besides src which you want to use, add it here.
        { find: /^@src(\/|$)/, replacement: `${__dirname}/src/` },
        { find: /^@cps(\/|$)/, replacement: `${__dirname}/src/components/` },
        { find: /^@helpers(\/|$)/, replacement: `${__dirname}/src/helpers/` },
      ],
    }),
  ],
};

export default [frontendConfig, backendConfig];
