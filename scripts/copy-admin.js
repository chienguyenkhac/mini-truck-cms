import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

const sourceDir = 'admin_ui/dist';
const destDir = 'dist/secret';

function copyRecursive(src, dest) {
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
    console.log('Copying admin_ui/dist to dist/secret...');
    copyRecursive(sourceDir, destDir);
    console.log('✅ Admin UI copied to dist/secret successfully!');
} catch (error) {
    console.error('❌ Error copying admin UI:', error);
    process.exit(1);
}

