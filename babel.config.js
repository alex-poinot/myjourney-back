export default {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'auto',
        targets: {
          node: 'current'
        }
      }
    ]
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            }
          }
        ]
      ]
    }
  }
};