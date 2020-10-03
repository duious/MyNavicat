module.exports = {
  'root': true,
  'env': {
    'browser': true,
    'es2021': true,
    'node': true,
  },
  'extends': [
    'plugin:vue/essential',
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 12,
    'sourceType': 'module',
  },
  'plugins': [
    'vue',
  ],
  'rules': {
    'semi': [2, 'always'],
    'valid-jsdoc': 'error',
    'require-jsdoc': ['error', {
      'require': {
        'FunctionDeclaration': true,
        'MethodDefinition': true,
        'ClassDeclaration': true,
        'ArrowFunctionExpression': true,
        'FunctionExpression': true,
      },
    }],
    'no-console': 0,
    'comma-dangle': [2, 'always-multiline'],
    'max-len': 0,
    'space-before-function-paren': [2, 'always'],
    'no-unused-expressions': [0, {
      'allowShortCircuit': true,
      'allowTernary': true,
    }],
    'arrow-body-style': ['error', 'as-needed', {'requireReturnForObjectLiteral': true}],
    'arrow-parens': ['error', 'always'],
    'arrow-spacing': ['error', {'before': true, 'after': true}],
    /* 方法规则 */
    'func-call-spacing': ['error', 'never'],
    'func-name-matching': ['error', 'always', {'considerPropertyDescriptor': true}],
    'func-names': ['error', 'as-needed', {'generators': 'never'}],
    'func-style': ['error', 'declaration', {'allowArrowFunctions': true}],
    'function-call-argument-newline': ['error', 'never'],
    'function-paren-newline': ['error', 'never'],
    'prefer-const': 0,
    'no-var': 'error',
    'no-extend-native': 0,
    'no-param-reassign': 0,
    'no-restricted-syntax': 0,
    'no-eval': 0,
    'no-continue': 0,
    'no-unused-vars': [2, {'ignoreRestSiblings': true}],
    'no-underscore-dangle': 0,
    'global-require': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'jsx-a11y/href-no-hash': 0,
    'import/no-extraneous-dependencies': 0,
    'import/prefer-default-export': 0,
    'jsx-a11y/no-static-element-interactions': 0,
  },
};