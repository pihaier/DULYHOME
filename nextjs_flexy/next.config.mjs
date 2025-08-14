
const nextConfig = {
    reactStrictMode: true,
    images: { 
        domains: ['localhost', 'nextjsflexy-khjoascxz-doohos-projects.vercel.app'],
        formats: ['image/avif', 'image/webp'],
    },
    // Vercel-Supabase Integration 환경변수 매핑
    env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
};

export default nextConfig;
