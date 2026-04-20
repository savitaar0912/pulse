{
  "root": true,
  "env": {
    "es2022": true,
    "node": true,
    "browser": true
  },
  "extends": ["eslint:recommended"],
  "plugins": ["import"],
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "always"
      }
    ],
    "no-unused-vars": "warn",
    "no-console": "off"
  },
  "settings": {
    "import/resolver": {
      "node": {
        "extensions": [".js"]
      }
    }
  }
}