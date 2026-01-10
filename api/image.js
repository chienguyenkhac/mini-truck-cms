import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Initialize Supabase with service role key for storage access
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://irncljhvsjtohiqllnsv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
    const { path } = req.query;

    if (!path) {
        return res.status(400).send('Image path is required');
    }

    try {
        // 1. Try to fetch from watermarked cache bucket
        const { data: cachedImage, error: cacheError } = await supabase
            .storage
            .from('watermarked')
            .download(path);

        if (cachedImage && !cacheError) {
            console.log(`Serving cached image: ${path}`);
            const buffer = await cachedImage.arrayBuffer();
            res.setHeader('Content-Type', 'image/jpeg');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            return res.send(Buffer.from(buffer));
        }

        // 2. Not in cache, fetch from original bucket
        const { data: originalImage, error: originalError } = await supabase
            .storage
            .from('original')
            .download(path);

        if (originalError || !originalImage) {
            console.error(`Original image not found: ${path}`, originalError);
            return res.status(404).send('Original image not found');
        }

        // 3. Get watermark settings from site_settings
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

        const originalBuffer = await originalImage.arrayBuffer();
        let finalBuffer;

        if (isEnabled) {
            // 4. Apply watermark using sharp
            const metadata = await sharp(Buffer.from(originalBuffer)).metadata();
            const width = metadata.width || 800;
            const height = metadata.height || 600;

            // Simple SVG watermark
            const svgWidth = Math.floor(width * 0.8);
            const fontSize = Math.floor(svgWidth / watermarkText.length * 1.5);

            const svg = `
                <svg width="${width}" height="${height}">
                    <style>
                        .watermark { 
                            fill: white; 
                            fill-opacity: ${watermarkOpacity * 0.5}; 
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
                        transform="rotate(-45, ${width / 2}, ${height / 2})"
                    >
                        ${watermarkText}
                    </text>
                </svg>
            `;

            finalBuffer = await sharp(Buffer.from(originalBuffer))
                .composite([{
                    input: Buffer.from(svg),
                    top: 0,
                    left: 0,
                }])
                .jpeg({ quality: 85 })
                .toBuffer();
        } else {
            finalBuffer = Buffer.from(originalBuffer);
        }

        // 5. Save processed image to cache bucket for future requests
        // Use upsert: true to overwrite if it somehow exists now
        const { error: uploadError } = await supabase
            .storage
            .from('watermarked')
            .upload(path, finalBuffer, {
                contentType: 'image/jpeg',
                cacheControl: '31536000',
                upsert: true
            });

        if (uploadError) {
            console.error('Error caching watermarked image:', uploadError);
        }

        // 6. Return the watermarked image
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        return res.send(finalBuffer);

    } catch (error) {
        console.error('Image processing error:', error);
        return res.status(500).send('Internal server error during image processing');
    }
}
