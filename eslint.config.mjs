import airbnbBase from 'eslint-config-airbnb-base';
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


export default [
  {languageOptions: { globals: globals.browser }},
  {rules:{
    ...airbnbBase.rules,
    'no-magic-numbers': ['error', { ignore: [0, 1], ignoreArrayIndexes: true }],
    'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }]
  }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];