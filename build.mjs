// Bundles the theme's CSS/JS and the site's with esbuild. Run from the root
// of the site (`node themes/bienensteff/build.mjs`); esbuild and the npm
// deps of the theme come from the site's node_modules.
//
//   --watch      rebuild on changes, with sourcemaps
//   --sourcemap  write sourcemaps in a normal build as well

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as esbuild from 'esbuild';

const args = process.argv.slice(2);
const isWatchMode = args.includes('--watch');
const withSourcemap = args.includes('--sourcemap');

const themeDir = path.dirname(fileURLToPath(import.meta.url));

// Output into Hugo's assets/ dir so Hugo Pipes can fingerprint + publish
// (cache-busting, SRI). Nothing here is referenced directly by URL.
const outdir = 'assets/gen';

// The theme's bundles, and the site's own from bundle_src/ where it has
// them: css/style.css and js/main.ts.
const entryPoints = {
  base_bundle: path.join(themeDir, 'bundle_src/js/main.ts'),
  base_style: path.join(themeDir, 'bundle_src/css/main.css'),
};
const siteEntries = {
  style: 'bundle_src/css/style.css',
  bundle: 'bundle_src/js/main.ts',
};
for (const [name, file] of Object.entries(siteEntries)) {
  if (fs.existsSync(file)) entryPoints[name] = path.resolve(file);
}

async function runBuild() {
  try {
    // Chunk names carry a content hash, so every change leaves the old ones
    // behind -- start from an empty outdir so Hugo doesn't publish stale
    // chunks (it publishes everything under gen/chunks/, see
    // layouts/_partials/head/js.html).
    fs.rmSync(outdir, { recursive: true, force: true });

    const ctx = await esbuild.context({
      entryPoints,
      outdir,
      // Code a site loads via dynamic import() only on the pages that need
      // it, and code its bundles share, ends up in content-hashed chunks
      // next to the entry bundles.
      splitting: true,
      chunkNames: 'chunks/[name]-[hash]',
      bundle: true,
      // Sourcemaps only for local `--watch`, unless the site asks for them;
      // keep them out of the deployed site otherwise.
      sourcemap: withSourcemap ? true : isWatchMode ? 'linked' : false,
      minify: true,
      target: 'es2024',
      format: 'esm',
      logLevel: 'info',
      loader: {
        '.woff': 'file',
        '.woff2': 'file'
      },
      assetNames: '[name]',
    });

    if (isWatchMode) {
      await ctx.watch();
    } else {
      const result = await ctx.rebuild();
      console.log('Build completed successfully:', result);

      await ctx.dispose();
      process.exit(0);
    }

  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

runBuild();
