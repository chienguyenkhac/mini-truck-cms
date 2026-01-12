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
            const watermarkText = getSetting('watermark_text', 'SINOTRUK Ha Noi');
            const watermarkOpacity = parseInt(getSetting('watermark_opacity', '40')) / 100;

            if (isEnabled) {
                const metadata = await sharp(originalBuffer).metadata();
                const width = metadata.width || 800;
                const height = metadata.height || 600;

                // Convert Vietnamese text to ASCII-safe version for SVG rendering
                const safeText = watermarkText
                    .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/gi, 'a')
                    .replace(/[èéẹẻẽêềếệểễ]/gi, 'e')
                    .replace(/[ìíịỉĩ]/gi, 'i')
                    .replace(/[òóọỏõôồốộổỗơờớợởỡ]/gi, 'o')
                    .replace(/[ùúụủũưừứựửữ]/gi, 'u')
                    .replace(/[ỳýỵỷỹ]/gi, 'y')
                    .replace(/đ/gi, 'd')
                    .replace(/[^\x00-\x7F]/g, '');

                const fontSize = Math.floor(Math.min(width, height) * 0.05);
                const angle = -30;

                // Calculate center position with rotation offset
                const centerX = width / 2;
                const centerY = height / 2;

                // Use minimal SVG with DejaVu Sans (commonly available on Linux/Vercel)
                // or sans-serif as ultimate fallback
                const svg = Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
                    <text 
                        x="${centerX}" 
                        y="${centerY}" 
                        text-anchor="middle" 
                        dominant-baseline="central"
                        fill="rgba(255,255,255,${watermarkOpacity})"
                        font-size="${fontSize}"
                        font-weight="700"
                        font-family="DejaVu Sans, Liberation Sans, FreeSans, sans-serif"
                        transform="rotate(${angle} ${centerX} ${centerY})"
                    >${safeText}</text>
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
