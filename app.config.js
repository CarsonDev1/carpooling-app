// Dynamic Expo config to inject Google Maps API key for Android (and iOS optionally)
module.exports = ({ config }) => {
  return {
    ...config,
    plugins: [
      ...((config && config.plugins) || []),
      [
        '@rnmapbox/maps',
        {
          RNMapboxMapsDownloadToken:
            'sk.eyJ1IjoiY2Fyc29uZGV2MSIsImEiOiJjbWVoOXk0bGwwNXE1Mm1yNWg0dWhnZnUzIn0.Ovjrdod0bfZkQ84DT0mX-w',
        },
      ],
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


