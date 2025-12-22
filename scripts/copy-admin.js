import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const sourceDir = join(rootDir, 'admin_ui/dist');
const destDir = join(rootDir, 'dist/secret');

function copyRecursive(src, dest) {
    if (!existsSync(src)) {
        console.error(`❌ Source directory does not exist: ${src}`);
        console.log('💡 Make sure admin_ui is built first: cd admin_ui && npm run build');
        process.exit(1);
    }

    if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
    }

    const entries = readdirSync(src);

    for (const entry of entries) {
        const srcPath = join(src, entry);
        const destPath = join(dest, entry);
        const stat = statSync(srcPath);

        if (stat.isDirectory()) {
            copyRecursive(srcPath, destPath);
        } else {
            copyFileSync(srcPath, destPath);
        }
    }
}

try {
    console.log(`📦 Copying ${sourceDir} to ${destDir}...`);
    copyRecursive(sourceDir, destDir);
    console.log('✅ Admin UI copied to dist/secret successfully!');
} catch (error) {
    console.error('❌ Error copying admin UI:', error);
    process.exit(1);
}

