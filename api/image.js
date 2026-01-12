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
                .in('key', ['watermark_opacity', 'watermark_enabled', 'company_logo']);

            const getSetting = (key, defaultValue) => {
                const item = settings?.find(s => s.key === key);
                return item ? item.value : defaultValue;
            };

            const isEnabled = getSetting('watermark_enabled', 'true') === 'true';
            const watermarkOpacity = parseInt(getSetting('watermark_opacity', '40')) / 100;
            const logoUrl = getSetting('company_logo', '');

            if (isEnabled && logoUrl) {
                const metadata = await sharp(originalBuffer).metadata();
                const width = metadata.width || 800;
                const height = metadata.height || 600;

                try {
                    // Fetch the logo image
                    const logoResponse = await fetch(logoUrl);
                    if (!logoResponse.ok) throw new Error('Failed to fetch logo');

                    const logoBuffer = Buffer.from(await logoResponse.arrayBuffer());

                    // Calculate logo size (15% of the smaller dimension for 5x5 grid)
                    const logoSize = Math.floor(Math.min(width, height) * 0.15);

                    // Fixed 30% opacity for watermark
                    const fixedOpacity = 0.30;

                    // Resize and reduce opacity of logo
                    const resizedLogo = await sharp(logoBuffer)
                        .resize(logoSize, logoSize, { fit: 'inside' })
                        .ensureAlpha()
                        .composite([{
                            input: Buffer.from([255, 255, 255, Math.floor(255 * fixedOpacity)]),
                            raw: { width: 1, height: 1, channels: 4 },
                            tile: true,
                            blend: 'dest-in'
                        }])
                        .png()
                        .toBuffer();

                    // Get processed logo dimensions
                    const logoMeta = await sharp(resizedLogo).metadata();
                    const logoW = logoMeta.width || logoSize;
                    const logoH = logoMeta.height || logoSize;

                    // Rotate logo -45 degrees (lower part on left side)
                    const rotatedLogo = await sharp(resizedLogo)
                        .rotate(-45, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
                        .png()
                        .toBuffer();

                    // Get rotated logo dimensions (will be larger due to rotation)
                    const rotatedMeta = await sharp(rotatedLogo).metadata();
                    const rotatedW = rotatedMeta.width || logoW;
                    const rotatedH = rotatedMeta.height || logoH;

                    // Create tiled watermark pattern (5x5 grid)
                    const composites = [];
                    const gridSize = 5;
                    const spacingX = width / gridSize;
                    const spacingY = height / gridSize;

                    for (let row = 0; row < gridSize; row++) {
                        for (let col = 0; col < gridSize; col++) {
                            const x = Math.floor(col * spacingX + (spacingX - rotatedW) / 2);
                            const y = Math.floor(row * spacingY + (spacingY - rotatedH) / 2);
                            composites.push({
                                input: rotatedLogo,
                                top: Math.max(0, y),
                                left: Math.max(0, x),
                            });
                        }
                    }

                    finalBuffer = await sharp(originalBuffer)
                        .composite(composites)
                        .jpeg({ quality: 90 })
                        .toBuffer();

                } catch (logoError) {
                    console.error('Logo watermark error:', logoError);
                    // Fallback to simple diagonal lines if logo fails
                    const svg = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern id="diag" width="100" height="100" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
                                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,${watermarkOpacity})" stroke-width="1"/>
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#diag)"/>
                    </svg>`);

                    finalBuffer = await sharp(originalBuffer)
                        .composite([{ input: svg, top: 0, left: 0 }])
                        .jpeg({ quality: 90 })
                        .toBuffer();
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
