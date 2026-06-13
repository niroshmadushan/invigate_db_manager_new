/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config) => {
    config.cache = false;
    config.cache = false;
    const existingOptions = config.watchOptions || {};
    const existingIgnored = existingOptions.ignored;
    const ignoredArray = Array.isArray(existingIgnored) ? existingIgnored : (existingIgnored ? [existingIgnored] : []);
    const filteredIgnored = ignoredArray.filter(i => i && typeof i === 'string');
    
    config.watchOptions = {
      ...existingOptions,
      ignored: [
        ...filteredIgnored,
        '**/C:/Users/**',
        'C:/Users/**'
      ]
    };
    return config;
  },
};

export default config;
