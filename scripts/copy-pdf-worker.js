import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// pdfjs-dist 5.x+ uses .mjs; earlier versions use .min.js
const nodeModulesWorkerMjs = path.resolve(
    __dirname,
    '..',
    'node_modules',
    'pdfjs-dist',
    'build',
    'pdf.worker.min.mjs'
);
const nodeModulesWorkerJs = path.resolve(
    __dirname,
    '..',
    'node_modules',
    'pdfjs-dist',
    'build',
    'pdf.worker.min.js'
);
const dest = path.resolve(__dirname, '..', 'public', 'pdf.worker.min.mjs');

async function main() {
    // 1) Try copying .mjs version (pdfjs-dist 5.x+)
    if (fs.existsSync(nodeModulesWorkerMjs)) {
        try {
            fs.copyFileSync(nodeModulesWorkerMjs, dest);
            console.log('Copied pdf.worker.min.mjs to public/pdf.worker.min.mjs');
            return;
        } catch (err) {
            console.error(
                'Failed to copy pdf.worker.min.mjs from node_modules:',
                err instanceof Error ? err.message : String(err)
            );
        }
    }

    // 2) Try copying .min.js version (older pdfjs-dist)
    if (fs.existsSync(nodeModulesWorkerJs)) {
        try {
            fs.copyFileSync(nodeModulesWorkerJs, dest);
            console.log('Copied pdf.worker.min.js to public/pdf.worker.min.mjs');
            return;
        } catch (err) {
            console.error(
                'Failed to copy pdf.worker.min.js from node_modules:',
                err instanceof Error ? err.message : String(err)
            );
        }
    }

    // 3) Fall back to fetching from the CDN using the version in package.json
    try {
        const pkgPath = path.resolve(__dirname, '..', 'package.json');
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        let depVersion =
            (pkg.dependencies && pkg.dependencies['pdfjs-dist']) || 'latest';
        // strip leading ^~>= characters
        depVersion = String(depVersion).replace(/^[^0-9]*/, '') || 'latest';
        const url = `https://unpkg.com/pdfjs-dist@${depVersion}/build/pdf.worker.min.mjs`;
        console.log(
            `pdf.worker not found locally — attempting to download from ${url}`
        );

        const res = await fetch(url);
        if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            fs.writeFileSync(dest, buf);
            console.log('Downloaded pdf.worker to public/pdf.worker.min.mjs');
            return;
        } else {
            console.error(
                `Failed to download worker from CDN: ${res.status} ${res.statusText}`
            );
        }
    } catch (err) {
        console.error(
            'Failed to fetch pdf.worker from CDN:',
            err instanceof Error ? err.message : String(err)
        );
    }

    // 4) Give a friendly warning but do not fail install
    console.warn(
        'Could not place pdf.worker in public/. If you encounter worker errors, run `npm install` then `npm run copy-pdf-worker` once node_modules is available.'
    );
}

main();
