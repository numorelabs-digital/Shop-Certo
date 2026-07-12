import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers(){return [{source:"/(.*)",headers:[{key:"X-Content-Type-Options",value:"nosniff"},{key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},{key:"Permissions-Policy",value:"geolocation=(self), camera=(), microphone=()"},{key:"X-Frame-Options",value:"DENY"},{key:"Content-Security-Policy",value:"default-src 'self'; connect-src 'self' https://nominatim.openstreetmap.org; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"}]}]}
};

export default nextConfig;
