module.exports = {
  env: {
    'vitest-globals/env': true,
    'cypress/globals': true,
    'jest/globals': true
  },
  extends: [
    '@vue/standard',
    'plugin:vitest-globals/recommended',
    'plugin:cypress/recommended'
  ],
  plugins: [
    'vitest-globals',
    'cypress',
    'jest'
  ],
  rules: {
    // Regras específicas para testes
    'vitest/expect-expect': 'error',
    'vitest/no-disabled-tests': 'warn',
    'vitest/no-focused-tests': 'error',
    'vitest/no-identical-title': 'error',
    'vitest/prefer-to-be': 'error',
    'vitest/prefer-to-have-length': 'error',
    'vitest/valid-expect': 'error',
    
    // Regras do Cypress
    'cypress/no-unnecessary-waiting': 'warn',
    'cypress/assertion-before-screenshot': 'warn',
    'cypress/no-force': 'warn',
    
    // Regras gerais relaxadas para testes
    'no-console': 'off',
    'no-unused-expressions': 'off',
    'no-undef': 'off',
    'import/no-unresolved': 'off',
    
    // Permitir uso de vi (Vitest)
    'no-global-assign': ['error', { exceptions: ['vi'] }],
    
    // Permitir describe, it, expect, etc.
    'no-undef': 'off'
  },
  globals: {
    vi: 'readonly',
    describe: 'readonly',
    it: 'readonly',
    test: 'readonly',
    expect: 'readonly',
    beforeEach: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    afterAll: 'readonly',
    cy: 'readonly',
    Cypress: 'readonly'
  },
  overrides: [
    {
      files: ['**/*.test.js', '**/*.spec.js'],
      env: {
        'vitest-globals/env': true
      }
    },
    {
      files: ['cypress/**/*.js'],
      env: {
        'cypress/globals': true
      }
    }
  ]
}
