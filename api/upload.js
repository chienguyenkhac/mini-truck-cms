import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

// Get watermark settings from Supabase (cached for performance)
let watermarkCache = {
    enabled: true,
    text: 'SINOTRUK Hà Nội',
    opacity: 40,
    lastFetch: 0
};

async function getWatermarkSettings() {
    // Cache for 5 minutes
    const now = Date.now();
    if (now - watermarkCache.lastFetch < 5 * 60 * 1000) {
        return watermarkCache;
    }

    try {
        // Fetch from Supabase REST API
        const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://irncljhvsjtohiqllnsv.supabase.co';
        const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

        if (supabaseKey) {
            const response = await fetch(
                `${supabaseUrl}/rest/v1/site_settings?key=in.(watermark_enabled,watermark_text,watermark_opacity)`,
                {
                    headers: {
                        'apikey': supabaseKey,
                        'Authorization': `Bearer ${supabaseKey}`
                    }
                }
            );

            if (response.ok) {
                const settings = await response.json();
                settings.forEach(s => {
                    if (s.key === 'watermark_enabled') watermarkCache.enabled = s.value === 'true';
                    if (s.key === 'watermark_text') watermarkCache.text = s.value || 'SINOTRUK Hà Nội';
                    if (s.key === 'watermark_opacity') watermarkCache.opacity = parseInt(s.value) || 40;
                });
            }
        }

        watermarkCache.lastFetch = now;
    } catch (error) {
        console.error('Error fetching watermark settings:', error);
    }

    return watermarkCache;
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { image, skipWatermark = false } = req.body;

        if (!image) {
            return res.status(400).json({ message: 'No image provided' });
        }

        // Get watermark settings
        const watermarkSettings = await getWatermarkSettings();

        // Build transformation array
        const transformations = [];

        // Add watermark overlay if enabled
        if (watermarkSettings.enabled && !skipWatermark) {
            const escapedText = encodeURIComponent(watermarkSettings.text);

            // Single diagonal center watermark
            // Relative width (0.8 = 80% of image width) ensures it scales with the image
            // crop: 'fit' ensures the overlay itself is scaled without stretching the base image
            transformations.push({
                overlay: {
                    font_family: 'Arial',
                    font_size: 100, // Large base size, will be scaled by 'width'
                    font_weight: 'bold',
                    text: escapedText
                },
                width: 0.8,
                crop: 'fit',
                gravity: 'center',
                angle: 45,
                opacity: Math.floor(watermarkSettings.opacity * 0.4),
                color: 'white'
            });
        }

        const result = await cloudinary.uploader.upload(image, {
            folder: 'sinotruk_products',
            transformation: transformations.length > 0 ? transformations : undefined
        });

        return res.status(200).json({
            ...result,
            watermark_applied: watermarkSettings.enabled && !skipWatermark
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Upload failed', error: error.message });
    }
}
