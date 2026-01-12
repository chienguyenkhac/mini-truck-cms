import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';

// Initialize Supabase with service role key for storage access
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://irncljhvsjtohiqllnsv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// Image Proxy Handler - Selective watermarking (only when ?watermark=true)
export default async function handler(req, res) {
    const { path, url, watermark } = req.query;
    const applyWatermark = watermark === 'true';

    if (!path && !url) {
        return res.status(400).send('Image path or URL is required');
    }

    try {
        const baseName = path || Buffer.from(url).toString('base64').substring(0, 50) + '.jpg';

        // If watermark requested, check cache first
        if (applyWatermark) {
            const cacheName = `wm_${baseName}`;
            const { data: cachedImage, error: cacheError } = await supabase
                .storage
                .from('watermarked')
                .download(cacheName);

            if (cachedImage && !cacheError) {
                console.log(`Serving cached watermarked image: ${cacheName}`);
                const buffer = await cachedImage.arrayBuffer();
                res.setHeader('Content-Type', 'image/jpeg');
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
                res.setHeader('Content-Disposition', `attachment; filename="${baseName}"`);
                return res.send(Buffer.from(buffer));
            }
        }

        // Fetch original image
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

        // If no watermark requested, return clean image immediately
        if (!applyWatermark) {
            res.setHeader('Content-Type', originalType);
            res.setHeader('Cache-Control', 'public, max-age=86400');
            return res.send(originalBuffer);
        }

        // Apply watermark for download
        let finalBuffer = originalBuffer;

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
            const watermarkOpacity = parseInt(getSetting('watermark_opacity', '40')) / 100;

            if (isEnabled) {
                const metadata = await sharp(originalBuffer).metadata();
                const width = metadata.width || 800;
                const height = metadata.height || 600;

                // Use simple geometric watermark that doesn't require fonts
                // Create diagonal striped pattern as watermark
                const patternSize = Math.min(width, height) * 0.15;
                const numStripes = Math.ceil(Math.max(width, height) / patternSize) * 2;

                // Generate diagonal lines pattern
                let lines = '';
                for (let i = -numStripes; i < numStripes * 2; i++) {
                    const offset = i * patternSize;
                    lines += `<line x1="${offset}" y1="0" x2="${offset + height}" y2="${height}" 
                        stroke="rgba(255,255,255,${watermarkOpacity * 0.3})" stroke-width="2"/>`;
                }

                // Add company logo-style watermark using simple shapes
                const logoSize = Math.min(width, height) * 0.3;
                const centerX = width / 2;
                const centerY = height / 2;

                const svg = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                    <!-- Diagonal stripes pattern -->
                    <g transform="rotate(-30 ${centerX} ${centerY})">
                        ${lines}
                    </g>
                    <!-- Central watermark circle -->
                    <circle cx="${centerX}" cy="${centerY}" r="${logoSize * 0.4}" 
                        fill="none" stroke="rgba(255,255,255,${watermarkOpacity})" stroke-width="${logoSize * 0.02}"/>
                    <circle cx="${centerX}" cy="${centerY}" r="${logoSize * 0.35}" 
                        fill="none" stroke="rgba(255,255,255,${watermarkOpacity * 0.7})" stroke-width="${logoSize * 0.01}"/>
                    <!-- S letter using paths (SINOTRUK) -->
                    <path d="M${centerX - logoSize * 0.12} ${centerY - logoSize * 0.15}
                        Q${centerX - logoSize * 0.2} ${centerY - logoSize * 0.15} ${centerX - logoSize * 0.2} ${centerY - logoSize * 0.05}
                        Q${centerX - logoSize * 0.2} ${centerY + logoSize * 0.05} ${centerX} ${centerY + logoSize * 0.05}
                        Q${centerX + logoSize * 0.2} ${centerY + logoSize * 0.05} ${centerX + logoSize * 0.2} ${centerY + logoSize * 0.15}
                        Q${centerX + logoSize * 0.2} ${centerY + logoSize * 0.25} ${centerX} ${centerY + logoSize * 0.25}"
                        fill="none" stroke="rgba(255,255,255,${watermarkOpacity})" stroke-width="${logoSize * 0.03}" stroke-linecap="round"/>
                </svg>`);

                try {
                    finalBuffer = await sharp(originalBuffer)
                        .composite([{
                            input: svg,
                            top: 0,
                            left: 0,
                        }])
                        .jpeg({ quality: 90 })
                        .toBuffer();
                } catch (e) {
                    console.error('Sharp watermark error:', e);
                    finalBuffer = originalBuffer;
                }
            }
        }

        // Cache the watermarked result
        const cacheName = `wm_${baseName}`;
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
        res.setHeader('Content-Disposition', `attachment; filename="${baseName}"`);
        return res.send(finalBuffer);

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).send('Internal server error');
    }
}
