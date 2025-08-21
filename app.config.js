// Clean Expo config for Android build
module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      ...((config && config.plugins) || []),
      // Clean configuration without problematic plugins
    ],
    android: {
      ...(config.android || {}),
      permissions: [
        ...(config.android?.permissions || []),
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
      ],
      config: {
        ...((config.android && config.android.config) || {}),
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY || 'REPLACE_ME_ANDROID_GOOGLE_MAPS_API_KEY',
        },
      },
    },
    ios: {
      ...(config.ios || {}),
      config: {
        ...((config.ios && config.ios.config) || {}),
        googleMapsApiKey: process.env.IOS_GOOGLE_MAPS_API_KEY || undefined,
      },
    },
  };
};


