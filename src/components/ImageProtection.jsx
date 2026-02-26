import { useEffect } from 'react';

/**
 * ImageProtection Component
 * Intercepts right-click "Save Image As" on protected images
 * and redirects to download the watermarked version instead.
 * 
 * Usage: Wrap your app or image containers with <ImageProtection />
 * Mark images with data-protected="true" to enable protection.
 */
const ImageProtection = () => {
    useEffect(() => {
        const handleContextMenu = (e) => {
            const target = e.target;

            // Check if right-clicked on an image
            if (target.tagName === 'IMG') {
                const src = target.src;

                // Only intercept protected images served through our proxy
                if (target.hasAttribute('data-protected') && src.includes('/api/image')) {
                    e.preventDefault();

                    // Extract path from URL
                    const url = new URL(src);
                    const imagePath = url.searchParams.get('path');
                    const imageUrl = url.searchParams.get('url');

                    // Show custom context menu
                    showCustomMenu(e.clientX, e.clientY, imagePath, imageUrl, target.alt);
                }
            }
        };

        const showCustomMenu = (x, y, path, url, altText) => {
            // Remove existing menu if any
            const existingMenu = document.getElementById('image-protect-menu');
            if (existingMenu) existingMenu.remove();

            // Create custom context menu
            const menu = document.createElement('div');
            menu.id = 'image-protect-menu';
            menu.style.cssText = `
                position: fixed;
                top: ${y}px;
                left: ${x}px;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                padding: 8px 0;
                z-index: 99999;
                min-width: 200px;
                font-family: system-ui, -apple-system, sans-serif;
                animation: menuFadeIn 0.15s ease-out;
            `;

            // Add CSS animation
            if (!document.getElementById('image-protect-styles')) {
                const style = document.createElement('style');
                style.id = 'image-protect-styles';
                style.textContent = `
                    @keyframes menuFadeIn {
                        from { opacity: 0; transform: scale(0.95); }
                        to { opacity: 1; transform: scale(1); }
                    }
                    #image-protect-menu button {
                        width: 100%;
                        padding: 10px 16px;
                        text-align: left;
                        background: none;
                        border: none;
                        cursor: pointer;
                        font-size: 14px;
                        color: #374151;
                        display: flex;
                        align-items: center;
                        gap: 10px;
                        transition: background 0.1s;
                    }
                    #image-protect-menu button:hover {
                        background: #f3f4f6;
                    }
                    #image-protect-menu button .icon {
                        font-size: 18px;
                        color: #6b7280;
                    }
                `;
                document.head.appendChild(style);
            }

            // Download button (with watermark)
            const downloadBtn = document.createElement('button');
            downloadBtn.innerHTML = `
                <span class="material-symbols-outlined icon">download</span>
                <span>Tải ảnh xuống</span>
            `;
            downloadBtn.onclick = () => {
                // Build watermark URL
                let downloadUrl = '/api/image?watermark=true';
                if (path) downloadUrl += `&path=${encodeURIComponent(path)}`;
                if (url) downloadUrl += `&url=${encodeURIComponent(url)}`;

                // Method 2: Fetch and download (more reliable for triggering network request)
                fetch(downloadUrl)
                    .then(response => {
                        if (!response.ok) throw new Error('Network response was not ok');
                        return response.blob();
                    })
                    .then(blob => {
                        const objectUrl = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = objectUrl;
                        a.download = altText || 'image.jpg';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(objectUrl);
                    })
                    .catch(err => {
                        console.error('Download failed:', err);
                        alert('Không thể tải xuống ảnh. Vui lòng thử lại.');
                    });
                
                menu.remove();
            };

            // Copy link button
            const copyBtn = document.createElement('button');
            copyBtn.innerHTML = `
                <span class="material-symbols-outlined icon">link</span>
                <span>Sao chép liên kết</span>
            `;
            copyBtn.onclick = () => {
                navigator.clipboard.writeText(window.location.href);
                menu.remove();
            };

            menu.appendChild(downloadBtn);
            menu.appendChild(copyBtn);
            document.body.appendChild(menu);

            // Close menu when clicking outside
            const closeMenu = (e) => {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            };
            setTimeout(() => document.addEventListener('click', closeMenu), 10);
        };

        // Attach to document
        document.addEventListener('contextmenu', handleContextMenu);

        // Also prevent drag (another way to save images)
        const handleDragStart = (e) => {
            if (e.target.tagName === 'IMG' && e.target.src.includes('/api/image')) {
                e.preventDefault();
            }
        };
        document.addEventListener('dragstart', handleDragStart);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('dragstart', handleDragStart);
        };
    }, []);

    return null; // This component doesn't render anything
};

export default ImageProtection;
