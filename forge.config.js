module.exports = {
  packagerConfig: {
    icon: "src/assets/icons/icon",
    asar: true,
  },
  rebuildConfig: {
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        //iconUrl: './src/assets/icons/icon.ico',
        icon: "src/assets/icons/icon.ico",
        setupIcon: "src/assets/icons/icon.ico"
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
