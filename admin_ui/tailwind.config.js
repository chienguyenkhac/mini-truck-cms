/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Matching frontend current theme (light theme with sky blue)
                primary: '#0ea5e9',
                'primary-dark': '#0284c7',
                'primary-light': '#7dd3fc',
                background: '#f9fafb',
                surface: '#f1f5f9',
                'surface-dark': '#e2e8f0',
                border: '#d1d5db',
                'border-dark': '#9ca3af',
                'text-primary': '#1f2937',
                'text-secondary': '#6b7280',
            },
            fontFamily: {
                sans: ['Space Grotesk', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
