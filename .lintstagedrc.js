module.exports = {
  // TypeScript e JavaScript: lint + format
  "*.{ts,tsx,js,jsx,mjs}": ["eslint --fix --max-warnings=0", "prettier --write"],
  // JSON, CSS, MD: solo format
  "*.{json,css,md}": ["prettier --write"],
};
