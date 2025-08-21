
const nextConfig = {
    reactStrictMode: true,
    images: { 
        domains: [
            'localhost', 
            'nextjsflexy-khjoascxz-doohos-projects.vercel.app',
            'cbu01.alicdn.com',
            'cbu02.alicdn.com',
            'cbu03.alicdn.com',
            'cbu04.alicdn.com',
            'img.alicdn.com',
            'gw.alicdn.com',
            'i01.c.aliimg.com',
            'i02.c.aliimg.com',
            'i03.c.aliimg.com',
            'i04.c.aliimg.com'
        ],
        formats: ['image/avif', 'image/webp'],
    },
    // Vercel-Supabase Integration 환경변수 매핑
    env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
    // ESLint 설정 - 빌드 시 에러 무시
    eslint: {
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;
