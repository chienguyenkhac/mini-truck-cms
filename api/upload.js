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
        if (!req.body) {
            return res.status(400).json({ message: 'Request body is missing. Ensure Content-Type is application/json' });
        }

        const { image, fileName } = req.body;

        if (!supabaseKey) {
            console.error('CRITICAL: Supabase key is missing in environment variables');
            return res.status(500).json({ message: 'Server configuration error: missing credentials' });
        }

        const isServiceRole = !!process.env.SUPABASE_SERVICE_ROLE_KEY && supabaseKey === process.env.SUPABASE_SERVICE_ROLE_KEY;
        console.log(`Upload attempt: using ${isServiceRole ? 'SERVICE_ROLE' : 'ANON'} key`);

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

        console.log(`Attempting to upload to bucket "original" with name: ${name}`);

        // Try primary bucket 'original'
        let { data, error: uploadError } = await supabase
            .storage
            .from('original')
            .upload(name, buffer, {
                contentType,
                upsert: true
            });

        // Fallback to 'products' if 'original' is not found
        if (uploadError && uploadError.message === 'Bucket not found') {
            console.warn('Bucket "original" not found, falling back to "products"');
            const { data: fallbackData, error: fallbackError } = await supabase
                .storage
                .from('products')
                .upload(name, buffer, {
                    contentType,
                    upsert: true
                });

            data = fallbackData;
            uploadError = fallbackError;
        }

        if (uploadError) {
            console.error('Supabase Storage upload error details:', JSON.stringify(uploadError, null, 2));

            // diagnostic: list available buckets and their public status
            let availableBuckets = 'Unknown';
            try {
                const { data: buckets, error: listError } = await supabase.storage.listBuckets();
                if (listError) throw listError;
                availableBuckets = buckets?.map(b => `${b.name}(${b.public ? 'public' : 'private'})`).join(', ') || 'none';
                console.log('Available buckets:', availableBuckets);
            } catch (e) {
                console.error('Failed to list buckets during diagnostic:', e.message);
                availableBuckets = `Error listing: ${e.message}`;
            }

            return res.status(500).json({
                message: 'Supabase upload failed',
                error: uploadError.message,
                statusCode: uploadError.statusCode,
                errorCode: uploadError.error,
                details: JSON.stringify(uploadError),
                availableBuckets,
                usingKey: isServiceRole ? 'SERVICE_ROLE' : 'ANON',
                fileName: name
            });
        }

        // The secure_url will now point to our on-demand watermarking proxy
        const proxyUrl = `/api/image?path=${name}`;

        console.log(`Upload successful: ${name}`);

        return res.status(200).json({
            secure_url: proxyUrl,
            path: name,
            success: true
        });
    } catch (error) {
        console.error('Unexpected upload error:', error);
        return res.status(500).json({ message: 'Upload failed', error: error.message });
    }
}

