
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.alicdn.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: '**.aliimg.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '**.alicdn.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'http',
                hostname: '**.aliimg.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'localhost',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'nextjsflexy.vercel.app',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'nextjsflexy-khjoascxz-doohos-projects.vercel.app',
                port: '',
                pathname: '/**',
            }
        ],
        formats: ['image/avif', 'image/webp'],
        unoptimized: false,
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
