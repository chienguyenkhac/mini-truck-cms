// Centralized images for SINOTRUK website
// Using local images from /public/images/

export const IMAGES = {
    // Hero section - banner slideshow
    hero: {
        main: '/images/banner-1.png',
        secondary: '/images/banner-2.png',
    },

    // Truck models
    trucks: {
        howoA7: '/images/howoA7.jpg',
        sitrakT7H: '/images/sitrakg7s.webp',
        howoBen: '/images/howoben371.webp',
        howoMixer: '/images/howo_tx.webp',
        howoMax: '/images/howomax.webp',
        sitrakG7S: '/images/sitrakg7s.webp',
    },

    // Categories
    categories: {
        dumpTruck: '/images/xebencongtruong.jpg',
        tractorUnit: '/images/howoA7.jpg',
        cargoTruck: '/images/xetaithunglung.jpg',
    },

    // Auto parts
    parts: {
        cabinCylinder: '/images/xilanh.jpg',        // Xilanh kích cabin VX350 VX400
        bearing: '/images/phanhchongtang.jpg',      // Tăm bét trước (using phanh image as placeholder)
        oilFilter: '/images/locdau.webp',           // Lọc dầu động cơ HOWO A7
        clutchDisc: '/images/phanhchongtang.jpg',   // Lá côn HOWO 420 (using phanh as placeholder)
        drumBrake: '/images/phanhchongtang.jpg',    // Phanh tang trống sau SITRAK
        airFilter: '/images/daulockhi.webp',        // Đầu lọc khí nén HOWO
    },

    // Video section
    video: {
        thumbnail: '/images/howomax.webp',
    },

    // About section
    about: {
        background: '/images/howoA7.jpg',
    },

    // Gallery - complete collection
    gallery: [
        { id: 1, src: '/images/howoA7.jpg', title: 'HOWO A7 Đầu Kéo', category: 'Xe Đầu Kéo' },
        { id: 2, src: '/images/sitrakg7s.webp', title: 'SITRAK G7S Premium', category: 'Xe Đầu Kéo' },
        { id: 3, src: '/images/howoben371.webp', title: 'HOWO Ben 371HP', category: 'Xe Ben' },
        { id: 4, src: '/images/xetronbetong.jpg', title: 'Xe Trộn Bê Tông', category: 'Xe Chuyên Dụng' },
        { id: 5, src: '/images/howomax.webp', title: 'HOWO MAX 460HP', category: 'Xe Đầu Kéo' },
        { id: 6, src: '/images/howo_tx.webp', title: 'HOWO TX Mixer', category: 'Xe Chuyên Dụng' },
        { id: 7, src: '/images/xetaithunglung.jpg', title: 'Xe Tải Thùng Lửng', category: 'Xe Tải Thùng' },
        { id: 8, src: '/images/xebencongtruong.jpg', title: 'Xe Ben Công Trường', category: 'Xe Ben' },
        { id: 9, src: '/images/somiromoc.jpg', title: 'Sơ Mi Rơ Moóc Container', category: 'Xe Chuyên Dụng' },
    ],

    // Placeholder fallback
    placeholder: '/images/howoA7.jpg',
}

export default IMAGES
