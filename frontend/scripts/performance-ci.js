#!/usr/bin/env node

/**
 * Performance CI Script for ATİS Frontend
 * 
 * This script runs automated performance tests and generates reports
 * for continuous integration and deployment pipelines.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

// Configuration
const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  outputDir: path.join(__dirname, '../performance-reports'),
  thresholds: {
    performance: 0.8,
    accessibility: 0.9,
    bestPractices: 0.8,
    seo: 0.8,
    fcp: 2000,
    lcp: 2500,
    cls: 0.1,
    tbt: 300
  },
  pages: [
    { path: '/', name: 'login' },
    { path: '/dashboard', name: 'dashboard' },
    { path: '/users', name: 'users' },
    { path: '/institutions', name: 'institutions' },
    { path: '/surveys', name: 'surveys' }
  ]
};

class PerformanceCI {
  constructor() {
    this.reports = [];
    this.failures = [];
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
  }

  async runLighthouseAudit(url, name) {
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
    });

    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
      throttling: {
        rttMs: 40,
        throughputKbps: 1024,
        cpuSlowdownMultiplier: 4
      }
    };

    try {
      const runnerResult = await lighthouse(url, options);
      await chrome.kill();

      const report = {
        name,
        url,
        timestamp: new Date().toISOString(),
        scores: {
          performance: runnerResult.lhr.categories.performance.score,
          accessibility: runnerResult.lhr.categories.accessibility.score,
          bestPractices: runnerResult.lhr.categories['best-practices'].score,
          seo: runnerResult.lhr.categories.seo.score
        },
        metrics: {
          fcp: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
          lcp: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
          cls: runnerResult.lhr.audits['cumulative-layout-shift'].numericValue,
          tbt: runnerResult.lhr.audits['total-blocking-time'].numericValue,
          speedIndex: runnerResult.lhr.audits['speed-index'].numericValue,
          interactive: runnerResult.lhr.audits['interactive'].numericValue
        },
        opportunities: runnerResult.lhr.audits,
        diagnostics: {
          domSize: runnerResult.lhr.audits['dom-size'].numericValue,
          bootupTime: runnerResult.lhr.audits['bootup-time'].numericValue,
          unusedCSS: runnerResult.lhr.audits['unused-css-rules'].details?.items?.length || 0,
          unusedJS: runnerResult.lhr.audits['unused-javascript'].details?.items?.length || 0
        }
      };

      // Save individual report
      const reportPath = path.join(CONFIG.outputDir, `${name}-lighthouse-report.json`);
      fs.writeFileSync(reportPath, JSON.stringify(runnerResult.lhr, null, 2));

      this.reports.push(report);
      return report;
    } catch (error) {
      await chrome.kill();
      throw error;
    }
  }

  async runPlaywrightPerformanceTests() {
    return new Promise((resolve, reject) => {
      exec('npm run test:performance', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
        if (error) {
          console.error('Playwright performance tests failed:', error);
          reject(error);
          return;
        }

        console.log('Playwright performance tests completed successfully');
        resolve(stdout);
      });
    });
  }

  async runBundleAnalysis() {
    return new Promise((resolve, reject) => {
      exec('npm run build -- --analyze', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
        if (error) {
          console.error('Bundle analysis failed:', error);
          reject(error);
          return;
        }

        // Parse bundle analysis results
        const bundleStats = {
          totalSize: 0,
          jsSize: 0,
          cssSize: 0,
          chunkCount: 0,
          treeshakingEfficiency: 0
        };

        // In a real implementation, parse the build output
        // This is a placeholder for actual bundle analysis
        resolve(bundleStats);
      });
    });
  }

  checkThresholds(report) {
    const failures = [];

    // Check score thresholds
    Object.entries(CONFIG.thresholds).forEach(([metric, threshold]) => {
      if (report.scores[metric] && report.scores[metric] < threshold) {
        failures.push({
          type: 'score',
          metric,
          actual: report.scores[metric],
          threshold,
          message: `${metric} score (${report.scores[metric]}) below threshold (${threshold})`
        });
      }
    });

    // Check metric thresholds
    if (report.metrics.fcp > CONFIG.thresholds.fcp) {
      failures.push({
        type: 'metric',
        metric: 'fcp',
        actual: report.metrics.fcp,
        threshold: CONFIG.thresholds.fcp,
        message: `First Contentful Paint (${report.metrics.fcp}ms) exceeds threshold (${CONFIG.thresholds.fcp}ms)`
      });
    }

    if (report.metrics.lcp > CONFIG.thresholds.lcp) {
      failures.push({
        type: 'metric',
        metric: 'lcp',
        actual: report.metrics.lcp,
        threshold: CONFIG.thresholds.lcp,
        message: `Largest Contentful Paint (${report.metrics.lcp}ms) exceeds threshold (${CONFIG.thresholds.lcp}ms)`
      });
    }

    if (report.metrics.cls > CONFIG.thresholds.cls) {
      failures.push({
        type: 'metric',
        metric: 'cls',
        actual: report.metrics.cls,
        threshold: CONFIG.thresholds.cls,
        message: `Cumulative Layout Shift (${report.metrics.cls}) exceeds threshold (${CONFIG.thresholds.cls})`
      });
    }

    if (report.metrics.tbt > CONFIG.thresholds.tbt) {
      failures.push({
        type: 'metric',
        metric: 'tbt',
        actual: report.metrics.tbt,
        threshold: CONFIG.thresholds.tbt,
        message: `Total Blocking Time (${report.metrics.tbt}ms) exceeds threshold (${CONFIG.thresholds.tbt}ms)`
      });
    }

    return failures;
  }

  generateSummaryReport() {
    const summary = {
      timestamp: new Date().toISOString(),
      totalPages: this.reports.length,
      passedPages: this.reports.filter(r => this.checkThresholds(r).length === 0).length,
      failedPages: this.reports.filter(r => this.checkThresholds(r).length > 0).length,
      averageScores: {},
      averageMetrics: {},
      failures: this.failures,
      recommendations: []
    };

    // Calculate averages
    const scoreKeys = Object.keys(this.reports[0]?.scores || {});
    const metricKeys = Object.keys(this.reports[0]?.metrics || {});

    scoreKeys.forEach(key => {
      summary.averageScores[key] = this.reports.reduce((sum, r) => sum + r.scores[key], 0) / this.reports.length;
    });

    metricKeys.forEach(key => {
      summary.averageMetrics[key] = this.reports.reduce((sum, r) => sum + r.metrics[key], 0) / this.reports.length;
    });

    // Generate recommendations
    if (summary.averageScores.performance < 0.8) {
      summary.recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Performance score is below acceptable threshold. Consider optimizing bundle size and reducing render-blocking resources.'
      });
    }

    if (summary.averageMetrics.lcp > 2500) {
      summary.recommendations.push({
        type: 'lcp',
        priority: 'high',
        message: 'Largest Contentful Paint is too slow. Optimize images and critical rendering path.'
      });
    }

    if (summary.averageMetrics.cls > 0.1) {
      summary.recommendations.push({
        type: 'cls',
        priority: 'medium',
        message: 'Cumulative Layout Shift is too high. Ensure proper sizing for images and dynamic content.'
      });
    }

    return summary;
  }

  generateMarkdownReport(summary) {
    const formatScore = (score) => {
      const percentage = Math.round(score * 100);
      const emoji = percentage >= 90 ? '🟢' : percentage >= 75 ? '🟡' : '🔴';
      return `${emoji} ${percentage}%`;
    };

    const formatMetric = (value, unit = 'ms') => {
      return `${Math.round(value)}${unit}`;
    };

    let markdown = `# ATİS Performance Test Report\n\n`;
    markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
    markdown += `## Summary\n\n`;
    markdown += `- **Total Pages Tested:** ${summary.totalPages}\n`;
    markdown += `- **Passed:** ${summary.passedPages}\n`;
    markdown += `- **Failed:** ${summary.failedPages}\n\n`;

    markdown += `## Average Scores\n\n`;
    markdown += `| Category | Score |\n`;
    markdown += `|----------|-------|\n`;
    Object.entries(summary.averageScores).forEach(([key, score]) => {
      markdown += `| ${key.charAt(0).toUpperCase() + key.slice(1)} | ${formatScore(score)} |\n`;
    });

    markdown += `\n## Core Web Vitals\n\n`;
    markdown += `| Metric | Value | Threshold | Status |\n`;
    markdown += `|--------|-------|-----------|--------|\n`;
    markdown += `| First Contentful Paint | ${formatMetric(summary.averageMetrics.fcp)} | ${CONFIG.thresholds.fcp}ms | ${summary.averageMetrics.fcp <= CONFIG.thresholds.fcp ? '✅' : '❌'} |\n`;
    markdown += `| Largest Contentful Paint | ${formatMetric(summary.averageMetrics.lcp)} | ${CONFIG.thresholds.lcp}ms | ${summary.averageMetrics.lcp <= CONFIG.thresholds.lcp ? '✅' : '❌'} |\n`;
    markdown += `| Cumulative Layout Shift | ${formatMetric(summary.averageMetrics.cls, '')} | ${CONFIG.thresholds.cls} | ${summary.averageMetrics.cls <= CONFIG.thresholds.cls ? '✅' : '❌'} |\n`;
    markdown += `| Total Blocking Time | ${formatMetric(summary.averageMetrics.tbt)} | ${CONFIG.thresholds.tbt}ms | ${summary.averageMetrics.tbt <= CONFIG.thresholds.tbt ? '✅' : '❌'} |\n`;

    if (summary.failures.length > 0) {
      markdown += `\n## Failures\n\n`;
      summary.failures.forEach(failure => {
        markdown += `- **${failure.metric}:** ${failure.message}\n`;
      });
    }

    if (summary.recommendations.length > 0) {
      markdown += `\n## Recommendations\n\n`;
      summary.recommendations.forEach(rec => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        markdown += `${priority} **${rec.type.toUpperCase()}:** ${rec.message}\n\n`;
      });
    }

    return markdown;
  }

  async run() {
    console.log('🚀 Starting ATİS Performance CI...');

    try {
      // Run Playwright performance tests
      console.log('📊 Running Playwright performance tests...');
      await this.runPlaywrightPerformanceTests();

      // Run Lighthouse audits for each page
      console.log('🔍 Running Lighthouse audits...');
      for (const page of CONFIG.pages) {
        const url = `${CONFIG.baseUrl}${page.path}`;
        console.log(`  Auditing: ${url}`);
        
        try {
          const report = await this.runLighthouseAudit(url, page.name);
          const failures = this.checkThresholds(report);
          
          if (failures.length > 0) {
            this.failures.push(...failures);
            console.log(`    ❌ ${failures.length} threshold failures`);
          } else {
            console.log(`    ✅ All thresholds passed`);
          }
        } catch (error) {
          console.error(`    ❌ Failed to audit ${url}:`, error.message);
          this.failures.push({
            type: 'audit-error',
            page: page.name,
            message: `Failed to audit ${url}: ${error.message}`
          });
        }
      }

      // Generate summary report
      console.log('📋 Generating summary report...');
      const summary = this.generateSummaryReport();
      
      // Save reports
      const summaryPath = path.join(CONFIG.outputDir, 'performance-summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

      const markdownReport = this.generateMarkdownReport(summary);
      const markdownPath = path.join(CONFIG.outputDir, 'performance-report.md');
      fs.writeFileSync(markdownPath, markdownReport);

      // Output results
      console.log('\n📊 Performance CI Results:');
      console.log(`✅ Pages passed: ${summary.passedPages}/${summary.totalPages}`);
      console.log(`❌ Pages failed: ${summary.failedPages}/${summary.totalPages}`);
      console.log(`📁 Reports saved to: ${CONFIG.outputDir}`);

      // Exit with appropriate code
      if (summary.failedPages > 0) {
        console.log('\n❌ Performance CI failed - some pages did not meet thresholds');
        process.exit(1);
      } else {
        console.log('\n✅ Performance CI passed - all pages meet thresholds');
        process.exit(0);
      }

    } catch (error) {
      console.error('💥 Performance CI failed:', error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const ci = new PerformanceCI();
  ci.run();
}

module.exports = PerformanceCI;