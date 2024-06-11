
/** @type {import('next').NextConfig} */
const nextConfig = {
    poweredByHeader: false,
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
   
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
            allowedOrigins: ['localhost:3000'],
        },
    },
}

export default nextConfig;
