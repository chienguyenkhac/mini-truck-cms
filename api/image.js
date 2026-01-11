import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Initialize Supabase with service role key for storage access
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://irncljhvsjtohiqllnsv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Image Proxy Handler - Always applies watermark, caches result
export default async function handler(req, res) {
    const { path, url } = req.query;

    if (!path && !url) {
        return res.status(400).send('Image path or URL is required');
    }

    try {
        const cacheName = path || Buffer.from(url).toString('base64').substring(0, 50) + '.jpg';

        // 1. Try to fetch from watermarked cache bucket
        const { data: cachedImage, error: cacheError } = await supabase
            .storage
            .from('watermarked')
            .download(cacheName);

        if (cachedImage && !cacheError) {
            console.log(`Serving cached watermarked image: ${cacheName}`);
            const buffer = await cachedImage.arrayBuffer();
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            return res.send(Buffer.from(buffer));
        }

        // 2. Fetch original image
        let originalBuffer;
        let originalType = 'image/jpeg';

        if (path) {
            let { data: imgData, error: imgError } = await supabase
                .storage
                .from('original')
                .download(path);

            if (imgError || !imgData) {
                const { data: legacyData, error: legacyError } = await supabase
                    .storage
                    .from('products')
                    .download(path);

                if (legacyError || !legacyData) {
                    return res.status(404).send('Original image not found');
                }
                imgData = legacyData;
            }
            originalBuffer = Buffer.from(await imgData.arrayBuffer());
            originalType = imgData.type || 'image/jpeg';
        } else if (url) {
            const response = await fetch(decodeURIComponent(url));
            if (!response.ok) throw new Error(`Failed to fetch: ${url}`);
            originalBuffer = Buffer.from(await response.arrayBuffer());
            originalType = response.headers.get('content-type') || 'image/jpeg';
        }

        let finalBuffer = originalBuffer;

        // 3. Apply watermark (ALWAYS, by default)
        if (originalType.startsWith('image/')) {
            const { data: settings } = await supabase
                .from('site_settings')
                .select('key, value')
                .in('key', ['watermark_text', 'watermark_opacity', 'watermark_enabled']);

            const getSetting = (key, defaultValue) => {
                const item = settings?.find(s => s.key === key);
                return item ? item.value : defaultValue;
            };

            const isEnabled = getSetting('watermark_enabled', 'true') === 'true';
            const watermarkText = getSetting('watermark_text', 'SINOTRUK Hà Nội');
            const watermarkOpacity = parseInt(getSetting('watermark_opacity', '40')) / 100;

            if (isEnabled) {
                const metadata = await sharp(originalBuffer).metadata();
                const width = metadata.width || 800;
                const height = metadata.height || 600;

                // Create a simple watermark bar across the center
                const barHeight = Math.floor(height * 0.08);
                const barWidth = Math.floor(width * 0.6);
                const barX = Math.floor((width - barWidth) / 2);
                const barY = Math.floor((height - barHeight) / 2);

                // Create a semi-transparent white rectangle with text
                const escapedText = watermarkText
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&apos;');

                const svg = `
                    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <style type="text/css">
                                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@700&amp;display=swap');
                            </style>
                        </defs>
                        <rect 
                            x="${barX}" 
                            y="${barY}" 
                            width="${barWidth}" 
                            height="${barHeight}"
                            fill="white"
                            fill-opacity="${watermarkOpacity * 0.4}"
                        />
                        <text 
                            x="50%" 
                            y="50%" 
                            text-anchor="middle" 
                            dominant-baseline="middle"
                            fill="rgba(0,0,0,0.8)"
                            font-size="${Math.floor(barHeight * 0.5)}px"
                            font-weight="bold"
                            font-family="Inter, Arial, Helvetica, sans-serif"
                        >
                            ${escapedText}
                        </text>
                    </svg>
                `;

                try {
                    finalBuffer = await sharp(originalBuffer)
                        .composite([{
                            input: Buffer.from(svg, 'utf-8'),
                            top: 0,
                            left: 0,
                        }])
                        .jpeg({ quality: 90 })
                        .toBuffer();
                } catch (e) {
                    console.error('Sharp error:', e);
                    finalBuffer = originalBuffer;
                }
            }
        }

        // 4. Cache the watermarked result
        await supabase
            .storage
            .from('watermarked')
            .upload(cacheName, finalBuffer, {
                contentType: 'image/jpeg',
                cacheControl: '31536000',
                upsert: true
            });

        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.send(finalBuffer);

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).send('Internal server error');
    }
}
