/** @type {import('next').NextConfig} */
const nextConfig = {
  // reactCompiler: true,  ← 이 줄 삭제 또는 주석 처리
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;