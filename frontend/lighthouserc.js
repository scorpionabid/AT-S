module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/dashboard',
        'http://localhost:3000/users',
        'http://localhost:3000/institutions',
        'http://localhost:3000/surveys'
      ],
      startServerCommand: 'npm run dev',
      startServerReadyPattern: 'Local:',
      startServerTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-setuid-sandbox --disable-dev-shm-usage'
      }
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.8 }],
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['warn', { maxNumericValue: 3000 }],
        'server-response-time': ['warn', { maxNumericValue: 600 }],
        'unused-css-rules': ['warn', { maxLength: 5 }],
        'unused-javascript': ['warn', { maxLength: 5 }],
        'render-blocking-resources': ['warn', { maxLength: 3 }],
        'dom-size': ['warn', { maxNumericValue: 1500 }],
        'total-byte-weight': ['warn', { maxNumericValue: 2000000 }] // 2MB
      }
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'filesystem',
        storagePath: './lighthouse-server-storage'
      }
    }
  }
};