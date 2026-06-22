// babel-preset-expo já habilita o suporte ao expo-router (SDK 50+).
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
