import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { image } = req.body;

        if (!image) {
            return res.status(400).json({ message: 'No image provided' });
        }

        const result = await cloudinary.uploader.upload(image, {
            folder: 'sinotruk-admin/avatars',
            transformation: [
                { width: 200, height: 200, crop: 'fill', gravity: 'face' }
            ]
        });

        return res.status(200).json({
            secure_url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ message: 'Upload failed', error: error.message });
    }
}
