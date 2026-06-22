// metro.config.js — Dono da Pelada
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// 1. Adiciona suporte para carregar arquivos .wasm exigidos pelo expo-sqlite no Web
config.resolver.assetExts.push('wasm');

// 2. Configura os cabeçalhos HTTP (COOP e COEP) para habilitar SharedArrayBuffer no Metro
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
      return middleware(req, res, next);
    };
  },
};

module.exports = config;
