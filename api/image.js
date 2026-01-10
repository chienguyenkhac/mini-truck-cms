import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Initialize Supabase with service role key for storage access
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://irncljhvsjtohiqllnsv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    const { path, url, watermark } = req.query;

    if (!path && !url) {
        return res.status(400).send('Image path or URL is required');
    }

    try {
        const isWatermarkRequested = watermark === 'true';
        const cacheName = (isWatermarkRequested ? 'wm_' : 'clean_') + (path || Buffer.from(url).toString('base64').substring(0, 50) + '.jpg');

        // 1. Try to fetch from watermarked cache bucket
        const { data: cachedImage, error: cacheError } = await supabase
            .storage
            .from('watermarked')
            .download(cacheName);

        if (cachedImage && !cacheError) {
            console.log(`Serving cached image: ${cacheName}`);
            const buffer = await cachedImage.arrayBuffer();
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            if (isWatermarkRequested) {
                res.setHeader('Content-Disposition', `attachment; filename="watermarked_${path || 'image'}.jpg"`);
            }
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

        // 3. Apply watermark if requested
        if (isWatermarkRequested && originalType.startsWith('image/')) {
            const { data: settings } = await supabase
                .from('site_settings')
                .select('key, value')
                .in('key', ['watermark_text', 'watermark_opacity']);

            const getSetting = (key, defaultValue) => {
                const item = settings?.find(s => s.key === key);
                return item ? item.value : defaultValue;
            };

            const watermarkText = getSetting('watermark_text', 'SINOTRUK Hà Nội');
            const watermarkOpacity = parseInt(getSetting('watermark_opacity', '40')) / 100;

            const metadata = await sharp(originalBuffer).metadata();
            const width = metadata.width || 800;
            const height = metadata.height || 600;

            // Small horizontal center watermark (approx 30% of width)
            const targetWidth = Math.floor(width * 0.3);
            const fontSize = Math.floor(targetWidth / watermarkText.length * 1.5);

            const svg = `
                <svg width="${width}" height="${height}">
                    <style>
                        .watermark { 
                            fill: white; 
                            fill-opacity: ${watermarkOpacity * 0.6}; 
                            font-family: Arial, sans-serif; 
                            font-weight: bold;
                            font-size: ${fontSize}px;
                            text-transform: uppercase;
                        }
                    </style>
                    <text 
                        x="50%" 
                        y="50%" 
                        text-anchor="middle" 
                        class="watermark"
                        alignment-baseline="middle"
                    >
                        ${watermarkText}
                    </text>
                </svg>
            `;

            try {
                finalBuffer = await sharp(originalBuffer)
                    .composite([{
                        input: Buffer.from(svg),
                        top: 0,
                        left: 0,
                    }])
                    .jpeg({ quality: 90 })
                    .toBuffer();
            } catch (e) {
                console.error('Sharp error:', e);
            }
        }

        // 4. Cache the result (even for clean images to speed up future requests)
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
        if (isWatermarkRequested) {
            res.setHeader('Content-Disposition', `attachment; filename="watermarked_${path || 'image'}.jpg"`);
        }
        return res.send(finalBuffer);

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).send('Internal server error');
    }
}
