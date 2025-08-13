module.exports = {
  // 👇 CHỈ định rõ những ngôn ngữ bạn hỗ trợ
  locales: ['en', 'vi', 'ja', 'ko'],
  defaultLocale: 'en',
  defaultNamespace: 'translation',
  namespaceSeparator: false,
  keySeparator: '.',
  input: ['src/**/*.{ts,tsx}'], // 👈 Lọc file cần quét
  output: 'public/locales/$LOCALE/translation.json',
  defaultValue: '',
  createOldCatalogs: false,
  keepRemoved: false,
};
