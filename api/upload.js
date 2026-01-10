import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://irncljhvsjtohiqllnsv.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { image, fileName } = req.body;

        if (!image) {
            return res.status(400).json({ message: 'No image provided' });
        }

        // Handle base64 image data
        const matches = image.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: 'Invalid image format. Expected base64 with data URI scheme.' });
        }

        const contentType = matches[1];
        const buffer = Buffer.from(matches[2], 'base64');
        const extension = contentType.split('/')[1] || 'jpg';
        const name = fileName ? `${Date.now()}_${fileName}` : `${Date.now()}.${extension}`;

        // Upload to 'original' bucket in Supabase Storage
        // Make sure this bucket is created in your Supabase dashboard
        const { data, error: uploadError } = await supabase
            .storage
            .from('original')
            .upload(name, buffer, {
                contentType,
                upsert: true
            });

        if (uploadError) {
            console.error('Supabase Storage upload error:', uploadError);
            throw uploadError;
        }

        // The secure_url will now point to our on-demand watermarking proxy
        const proxyUrl = `/api/image?path=${name}`;

        return res.status(200).json({
            secure_url: proxyUrl, // Kept for compatibility with existing frontend
            path: name,
            success: true
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ message: 'Upload failed', error: error.message });
    }
}

