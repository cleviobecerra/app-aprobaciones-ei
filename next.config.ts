import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "bcryptjs", "nodemailer"],
  experimental: {
    serverActions: {
      bodySizeLimit: "12mb",
      allowedOrigins: ["app-aprobaciones-ei.vercel.app", "*.vercel.app"],
    },
  },
};

if (!process.env.VERCEL) {
  nextConfig.turbopack = { root: path.resolve(__dirname) };
}

export default nextConfig;
