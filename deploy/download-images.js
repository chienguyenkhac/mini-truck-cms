// Script to download all images from Supabase Storage
// Run: node download-images.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const supabaseUrl = 'https://irncljhvsjtohiqllnsv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlybmNsamh2c2p0b2hpcWxsbnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY1MTY1MDIsImV4cCI6MjA4MjA5MjUwMn0.TD8kM1DBal95TT-FZVXqz5orUh_9L7EKovZqfx34IJY';

const supabase = createClient(supabaseUrl, supabaseKey);

const OUTPUT_DIR = path.join(__dirname, 'uploads/original');

async function downloadFile(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(filepath);

        protocol.get(url, (response) => {
            if (response.statusCode === 302 || response.statusCode === 301) {
                downloadFile(response.headers.location, filepath)
                    .then(resolve)
                    .catch(reject);
                return;
            }

            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(filepath, () => { });
            reject(err);
        });
    });
}

async function downloadBucket(bucketName) {
    console.log(`\nDownloading from bucket: ${bucketName}`);

    const { data: files, error } = await supabase.storage
        .from(bucketName)
        .list('', { limit: 1000 });

    if (error) {
        console.error(`Error listing ${bucketName}:`, error);
        return;
    }

    if (!files || files.length === 0) {
        console.log(`No files in ${bucketName}`);
        return;
    }

    console.log(`Found ${files.length} files`);

    for (const file of files) {
        if (file.name === '.emptyFolderPlaceholder') continue;

        const { data } = supabase.storage
            .from(bucketName)
            .getPublicUrl(file.name);

        const filepath = path.join(OUTPUT_DIR, file.name);

        try {
            console.log(`Downloading: ${file.name}`);
            await downloadFile(data.publicUrl, filepath);
        } catch (err) {
            console.error(`Failed to download ${file.name}:`, err.message);
        }
    }
}

async function main() {
    // Create output directory
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    console.log('Starting image download from Supabase...');
    console.log(`Output directory: ${OUTPUT_DIR}`);

    // Download from each bucket
    await downloadBucket('original');
    await downloadBucket('products');

    console.log('\nDownload complete!');
}

main().catch(console.error);
