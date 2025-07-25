/**
 * Lighthouse Performance Testing Configuration
 * 
 * This configuration file defines performance testing settings
 * for the ATİS (Azerbaijan Education Management System) application.
 */

module.exports = {
  extends: 'lighthouse:default',
  settings: {
    // Run performance tests on mobile and desktop
    formFactor: 'desktop',
    throttling: {
      // Simulate 3G network conditions
      rttMs: 40,
      throughputKbps: 1024,
      cpuSlowdownMultiplier: 4,
      requestLatencyMs: 0,
      downloadThroughputKbps: 1024,
      uploadThroughputKbps: 1024,
    },
    // Enable all performance categories
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    // Screen emulation settings
    screenEmulation: {
      mobile: false,
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      disabled: false,
    },
    // Performance budget thresholds
    budgets: [
      {
        path: '/*',
        timings: [
          {
            metric: 'first-contentful-paint',
            budget: 2000,
          },
          {
            metric: 'largest-contentful-paint',
            budget: 2500,
          },
          {
            metric: 'cumulative-layout-shift',
            budget: 0.1,
          },
          {
            metric: 'total-blocking-time',
            budget: 300,
          },
        ],
        resourceSizes: [
          {
            resourceType: 'script',
            budget: 200,
          },
          {
            resourceType: 'stylesheet',
            budget: 100,
          },
          {
            resourceType: 'image',
            budget: 500,
          },
          {
            resourceType: 'total',
            budget: 1000,
          },
        ],
        resourceCounts: [
          {
            resourceType: 'script',
            budget: 10,
          },
          {
            resourceType: 'stylesheet',
            budget: 5,
          },
          {
            resourceType: 'image',
            budget: 20,
          },
          {
            resourceType: 'total',
            budget: 50,
          },
        ],
      },
    ],
  },
  // Audit configuration
  audits: [
    'first-contentful-paint',
    'largest-contentful-paint',
    'cumulative-layout-shift',
    'total-blocking-time',
    'speed-index',
    'interactive',
    'first-meaningful-paint',
    'max-potential-fid',
    'server-response-time',
    'first-cpu-idle',
    'estimated-input-latency',
    'render-blocking-resources',
    'unused-css-rules',
    'unused-javascript',
    'modern-image-formats',
    'uses-optimized-images',
    'uses-webp-images',
    'uses-text-compression',
    'uses-responsive-images',
    'efficient-animated-content',
    'preload-lcp-image',
    'uses-rel-preconnect',
    'uses-rel-preload',
    'critical-request-chains',
    'user-timings',
    'bootup-time',
    'mainthread-work-breakdown',
    'dom-size',
    'uses-long-cache-ttl',
    'total-byte-weight',
    'uses-optimized-images',
    'legacy-javascript',
  ],
  // Categories configuration
  categories: {
    performance: {
      title: 'Performance',
      description: 'These encapsulate your app\'s performance.',
      auditRefs: [
        {id: 'first-contentful-paint', weight: 10, group: 'metrics'},
        {id: 'largest-contentful-paint', weight: 25, group: 'metrics'},
        {id: 'cumulative-layout-shift', weight: 25, group: 'metrics'},
        {id: 'total-blocking-time', weight: 30, group: 'metrics'},
        {id: 'speed-index', weight: 10, group: 'metrics'},
        {id: 'interactive', weight: 10, group: 'load-opportunities'},
        {id: 'max-potential-fid', weight: 10, group: 'load-opportunities'},
        {id: 'server-response-time', weight: 5, group: 'load-opportunities'},
        {id: 'render-blocking-resources', weight: 5, group: 'load-opportunities'},
        {id: 'unused-css-rules', weight: 5, group: 'load-opportunities'},
        {id: 'unused-javascript', weight: 5, group: 'load-opportunities'},
        {id: 'modern-image-formats', weight: 5, group: 'load-opportunities'},
        {id: 'uses-optimized-images', weight: 5, group: 'load-opportunities'},
        {id: 'uses-webp-images', weight: 5, group: 'load-opportunities'},
        {id: 'uses-text-compression', weight: 5, group: 'load-opportunities'},
        {id: 'uses-responsive-images', weight: 5, group: 'load-opportunities'},
        {id: 'efficient-animated-content', weight: 5, group: 'load-opportunities'},
        {id: 'preload-lcp-image', weight: 5, group: 'load-opportunities'},
        {id: 'uses-rel-preconnect', weight: 5, group: 'load-opportunities'},
        {id: 'uses-rel-preload', weight: 5, group: 'load-opportunities'},
        {id: 'critical-request-chains', weight: 5, group: 'diagnostics'},
        {id: 'user-timings', weight: 5, group: 'diagnostics'},
        {id: 'bootup-time', weight: 5, group: 'diagnostics'},
        {id: 'mainthread-work-breakdown', weight: 5, group: 'diagnostics'},
        {id: 'dom-size', weight: 5, group: 'diagnostics'},
        {id: 'uses-long-cache-ttl', weight: 5, group: 'diagnostics'},
        {id: 'total-byte-weight', weight: 5, group: 'diagnostics'},
        {id: 'legacy-javascript', weight: 5, group: 'diagnostics'},
      ],
    },
  },
  // Groups configuration
  groups: {
    metrics: {
      title: 'Metrics',
      description: 'These metrics encapsulate your app\'s performance.',
    },
    'load-opportunities': {
      title: 'Opportunities',
      description: 'These suggestions can help your page load faster.',
    },
    diagnostics: {
      title: 'Diagnostics',
      description: 'More information about the performance of your application.',
    },
  },
};