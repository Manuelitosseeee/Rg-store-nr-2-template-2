/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Host autorizzati a caricare le risorse di sviluppo (senza questi, il
  // browser riceve 403 sui chunk JS e la pagina resta senza idratazione,
  // quindi nessun pulsante risponde).
  allowedDevOrigins: [
    "**.daytonaproxy01.net",
    "**.proxy.daytona.works",
    "**.daytona.works",
    "localhost",
    "127.0.0.1",
  ],
}

export default nextConfig