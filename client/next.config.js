/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'localhost',                  // ✅ Add this for local images
      's.gravatar.com',
      'cdn.auth0.com',
      'lh3.googleusercontent.com',
    ],
  },
};

module.exports = nextConfig;