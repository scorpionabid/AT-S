#!/usr/bin/env node

/**
 * Security Performance Testing Script
 * 
 * This script combines security auditing with performance testing
 * to ensure the application is both secure and performant.
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',
  outputDir: path.join(__dirname, '../security-performance-reports'),
  securityChecks: [
    'https',
    'mixed-content',
    'csp',
    'xss-auditor',
    'no-vulnerable-libraries',
    'password-inputs-can-be-pasted-into',
    'geolocation-on-start',
    'notification-on-start',
    'deprecations',
    'inspector-issues'
  ],
  pages: [
    { path: '/', name: 'login', security: 'high' },
    { path: '/dashboard', name: 'dashboard', security: 'medium' },
    { path: '/users', name: 'users', security: 'high' },
    { path: '/institutions', name: 'institutions', security: 'medium' },
    { path: '/surveys', name: 'surveys', security: 'medium' }
  ]
};

class SecurityPerformanceAuditor {
  constructor() {
    this.reports = [];
    this.securityIssues = [];
    this.performanceIssues = [];
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }
  }

  async runSecurityPerformanceAudit(url, name, securityLevel) {
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-web-security']
    });

    const options = {
      logLevel: 'info',
      output: 'json',
      onlyCategories: ['performance', 'best-practices', 'seo'],
      onlyAudits: [
        // Performance audits
        'first-contentful-paint',
        'largest-contentful-paint',
        'cumulative-layout-shift',
        'total-blocking-time',
        'speed-index',
        'interactive',
        'server-response-time',
        // Security audits
        'is-on-https',
        'uses-https',
        'mixed-content',
        'csp-xss',
        'no-vulnerable-libraries',
        'password-inputs-can-be-pasted-into',
        'geolocation-on-start',
        'notification-on-start',
        'deprecations',
        'inspector-issues'
      ],
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
        securityLevel,
        timestamp: new Date().toISOString(),
        performance: {
          score: runnerResult.lhr.categories.performance?.score || 0,
          metrics: {
            fcp: runnerResult.lhr.audits['first-contentful-paint']?.numericValue || 0,
            lcp: runnerResult.lhr.audits['largest-contentful-paint']?.numericValue || 0,
            cls: runnerResult.lhr.audits['cumulative-layout-shift']?.numericValue || 0,
            tbt: runnerResult.lhr.audits['total-blocking-time']?.numericValue || 0,
            speedIndex: runnerResult.lhr.audits['speed-index']?.numericValue || 0,
            interactive: runnerResult.lhr.audits['interactive']?.numericValue || 0,
            serverResponseTime: runnerResult.lhr.audits['server-response-time']?.numericValue || 0
          }
        },
        security: {
          https: runnerResult.lhr.audits['is-on-https']?.score === 1,
          mixedContent: runnerResult.lhr.audits['mixed-content']?.score === 1,
          csp: runnerResult.lhr.audits['csp-xss']?.score === 1,
          vulnerableLibraries: runnerResult.lhr.audits['no-vulnerable-libraries']?.score === 1,
          passwordInputs: runnerResult.lhr.audits['password-inputs-can-be-pasted-into']?.score === 1,
          geolocation: runnerResult.lhr.audits['geolocation-on-start']?.score === 1,
          notifications: runnerResult.lhr.audits['notification-on-start']?.score === 1,
          deprecations: runnerResult.lhr.audits['deprecations']?.score === 1,
          inspectorIssues: runnerResult.lhr.audits['inspector-issues']?.score === 1
        },
        issues: []
      };

      // Analyze security issues
      if (!report.security.https) {
        report.issues.push({
          type: 'security',
          severity: 'high',
          category: 'https',
          message: 'Page is not served over HTTPS',
          impact: 'Data transmission is not encrypted'
        });
      }

      if (!report.security.mixedContent) {
        report.issues.push({
          type: 'security',
          severity: 'medium',
          category: 'mixed-content',
          message: 'Mixed content detected',
          impact: 'Some resources loaded over HTTP on HTTPS page'
        });
      }

      if (!report.security.csp) {
        report.issues.push({
          type: 'security',
          severity: 'high',
          category: 'csp',
          message: 'Content Security Policy not properly configured',
          impact: 'Vulnerable to XSS attacks'
        });
      }

      if (!report.security.vulnerableLibraries) {
        report.issues.push({
          type: 'security',
          severity: 'high',
          category: 'vulnerable-libraries',
          message: 'Vulnerable JavaScript libraries detected',
          impact: 'Known security vulnerabilities present'
        });
      }

      // Analyze performance issues
      if (report.performance.metrics.fcp > 2000) {
        report.issues.push({
          type: 'performance',
          severity: 'medium',
          category: 'fcp',
          message: `First Contentful Paint too slow (${report.performance.metrics.fcp}ms)`,
          impact: 'Poor user experience and potential SEO impact'
        });
      }

      if (report.performance.metrics.lcp > 2500) {
        report.issues.push({
          type: 'performance',
          severity: 'high',
          category: 'lcp',
          message: `Largest Contentful Paint too slow (${report.performance.metrics.lcp}ms)`,
          impact: 'Poor user experience and confirmed SEO impact'
        });
      }

      if (report.performance.metrics.cls > 0.1) {
        report.issues.push({
          type: 'performance',
          severity: 'medium',
          category: 'cls',
          message: `Cumulative Layout Shift too high (${report.performance.metrics.cls})`,
          impact: 'Poor user experience due to layout instability'
        });
      }

      // Check for security-performance correlations
      if (report.security.https && report.performance.metrics.serverResponseTime > 600) {
        report.issues.push({
          type: 'security-performance',
          severity: 'low',
          category: 'https-performance',
          message: 'HTTPS overhead may be impacting performance',
          impact: 'SSL/TLS handshake contributing to slow response times'
        });
      }

      this.reports.push(report);
      return report;
    } catch (error) {
      await chrome.kill();
      throw error;
    }
  }

  async runNpmAudit() {
    return new Promise((resolve, reject) => {
      exec('npm audit --json', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
        if (error && error.code !== 1) {
          // npm audit returns code 1 when vulnerabilities are found
          reject(error);
          return;
        }

        try {
          const auditResult = JSON.parse(stdout);
          const vulnerabilities = {
            low: auditResult.metadata?.vulnerabilities?.low || 0,
            moderate: auditResult.metadata?.vulnerabilities?.moderate || 0,
            high: auditResult.metadata?.vulnerabilities?.high || 0,
            critical: auditResult.metadata?.vulnerabilities?.critical || 0,
            total: auditResult.metadata?.vulnerabilities?.total || 0
          };

          resolve(vulnerabilities);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  }

  async runESLintSecurity() {
    return new Promise((resolve, reject) => {
      exec('npx eslint . --ext .ts,.tsx --format json', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
        if (error && !stdout) {
          reject(error);
          return;
        }

        try {
          const eslintResult = JSON.parse(stdout);
          const securityIssues = [];

          eslintResult.forEach(file => {
            file.messages.forEach(message => {
              if (message.ruleId && (
                message.ruleId.includes('security') ||
                message.ruleId.includes('xss') ||
                message.ruleId.includes('injection') ||
                message.ruleId.includes('cors')
              )) {
                securityIssues.push({
                  file: file.filePath,
                  line: message.line,
                  column: message.column,
                  rule: message.ruleId,
                  message: message.message,
                  severity: message.severity === 2 ? 'error' : 'warning'
                });
              }
            });
          });

          resolve(securityIssues);
        } catch (parseError) {
          reject(parseError);
        }
      });
    });
  }

  generateSecurityPerformanceReport() {
    const summary = {
      timestamp: new Date().toISOString(),
      totalPages: this.reports.length,
      securityScore: 0,
      performanceScore: 0,
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
      recommendations: []
    };

    // Calculate average scores
    summary.securityScore = this.reports.reduce((sum, report) => {
      const securityChecks = Object.values(report.security);
      const passedChecks = securityChecks.filter(check => check === true).length;
      return sum + (passedChecks / securityChecks.length);
    }, 0) / this.reports.length;

    summary.performanceScore = this.reports.reduce((sum, report) => {
      return sum + report.performance.score;
    }, 0) / this.reports.length;

    // Count issues by severity
    this.reports.forEach(report => {
      report.issues.forEach(issue => {
        switch (issue.severity) {
          case 'critical':
            summary.criticalIssues++;
            break;
          case 'high':
            summary.highIssues++;
            break;
          case 'medium':
            summary.mediumIssues++;
            break;
          case 'low':
            summary.lowIssues++;
            break;
        }
      });
    });

    // Generate recommendations
    if (summary.securityScore < 0.8) {
      summary.recommendations.push({
        priority: 'critical',
        category: 'security',
        message: 'Security posture needs immediate attention. Focus on HTTPS, CSP, and vulnerable libraries.',
        actions: [
          'Implement proper Content Security Policy',
          'Update vulnerable dependencies',
          'Ensure all resources are served over HTTPS',
          'Review and fix XSS vulnerabilities'
        ]
      });
    }

    if (summary.performanceScore < 0.8) {
      summary.recommendations.push({
        priority: 'high',
        category: 'performance',
        message: 'Performance optimization needed to meet acceptable standards.',
        actions: [
          'Optimize Largest Contentful Paint',
          'Reduce Cumulative Layout Shift',
          'Minimize Total Blocking Time',
          'Implement code splitting and lazy loading'
        ]
      });
    }

    if (summary.criticalIssues > 0) {
      summary.recommendations.push({
        priority: 'critical',
        category: 'immediate',
        message: 'Critical security or performance issues require immediate attention.',
        actions: [
          'Review all critical issues in the detailed report',
          'Implement fixes before deployment',
          'Consider security assessment by expert'
        ]
      });
    }

    return summary;
  }

  generateMarkdownReport(summary, npmAudit, eslintSecurity) {
    let markdown = `# ATİS Security & Performance Audit Report\n\n`;
    markdown += `**Generated:** ${new Date().toISOString()}\n\n`;
    
    markdown += `## Executive Summary\n\n`;
    markdown += `- **Security Score:** ${Math.round(summary.securityScore * 100)}%\n`;
    markdown += `- **Performance Score:** ${Math.round(summary.performanceScore * 100)}%\n`;
    markdown += `- **Critical Issues:** ${summary.criticalIssues}\n`;
    markdown += `- **High Issues:** ${summary.highIssues}\n`;
    markdown += `- **Medium Issues:** ${summary.mediumIssues}\n`;
    markdown += `- **Low Issues:** ${summary.lowIssues}\n\n`;

    markdown += `## Security Analysis\n\n`;
    markdown += `### NPM Audit Results\n\n`;
    if (npmAudit.total > 0) {
      markdown += `- **Total Vulnerabilities:** ${npmAudit.total}\n`;
      markdown += `- **Critical:** ${npmAudit.critical}\n`;
      markdown += `- **High:** ${npmAudit.high}\n`;
      markdown += `- **Moderate:** ${npmAudit.moderate}\n`;
      markdown += `- **Low:** ${npmAudit.low}\n\n`;
    } else {
      markdown += `✅ No vulnerabilities found in dependencies\n\n`;
    }

    markdown += `### ESLint Security Analysis\n\n`;
    if (eslintSecurity.length > 0) {
      markdown += `Found ${eslintSecurity.length} security-related code issues:\n\n`;
      eslintSecurity.forEach(issue => {
        markdown += `- **${issue.file}:${issue.line}** - ${issue.message} (${issue.rule})\n`;
      });
    } else {
      markdown += `✅ No security-related ESLint issues found\n\n`;
    }

    markdown += `## Performance Analysis\n\n`;
    markdown += `### Page Performance Summary\n\n`;
    markdown += `| Page | Performance Score | FCP | LCP | CLS | TBT |\n`;
    markdown += `|------|------------------|-----|-----|-----|-----|\n`;
    this.reports.forEach(report => {
      markdown += `| ${report.name} | ${Math.round(report.performance.score * 100)}% | ${Math.round(report.performance.metrics.fcp)}ms | ${Math.round(report.performance.metrics.lcp)}ms | ${report.performance.metrics.cls.toFixed(3)} | ${Math.round(report.performance.metrics.tbt)}ms |\n`;
    });

    markdown += `\n## Security Issues by Page\n\n`;
    this.reports.forEach(report => {
      const securityIssues = report.issues.filter(issue => issue.type === 'security');
      if (securityIssues.length > 0) {
        markdown += `### ${report.name} (${report.securityLevel} security)\n\n`;
        securityIssues.forEach(issue => {
          const severity = issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : issue.severity === 'medium' ? '🟡' : '🟢';
          markdown += `${severity} **${issue.category}:** ${issue.message}\n`;
          markdown += `   - *Impact:* ${issue.impact}\n\n`;
        });
      }
    });

    markdown += `## Recommendations\n\n`;
    summary.recommendations.forEach(rec => {
      const priority = rec.priority === 'critical' ? '🔴' : rec.priority === 'high' ? '🟠' : '🟡';
      markdown += `${priority} **${rec.category.toUpperCase()}:** ${rec.message}\n\n`;
      markdown += `**Actions:**\n`;
      rec.actions.forEach(action => {
        markdown += `- ${action}\n`;
      });
      markdown += `\n`;
    });

    return markdown;
  }

  async run() {
    console.log('🔒 Starting Security & Performance Audit...');

    try {
      // Run npm audit
      console.log('📦 Running npm audit...');
      const npmAudit = await this.runNpmAudit();
      console.log(`   Found ${npmAudit.total} vulnerabilities`);

      // Run ESLint security analysis
      console.log('🔍 Running ESLint security analysis...');
      const eslintSecurity = await this.runESLintSecurity();
      console.log(`   Found ${eslintSecurity.length} security-related code issues`);

      // Run security-performance audits for each page
      console.log('🔍 Running security-performance audits...');
      for (const page of CONFIG.pages) {
        const url = `${CONFIG.baseUrl}${page.path}`;
        console.log(`  Auditing: ${url} (${page.security} security)`);
        
        try {
          const report = await this.runSecurityPerformanceAudit(url, page.name, page.security);
          console.log(`    Security issues: ${report.issues.filter(i => i.type === 'security').length}`);
          console.log(`    Performance issues: ${report.issues.filter(i => i.type === 'performance').length}`);
        } catch (error) {
          console.error(`    ❌ Failed to audit ${url}:`, error.message);
        }
      }

      // Generate summary report
      console.log('📋 Generating security-performance report...');
      const summary = this.generateSecurityPerformanceReport();
      
      // Save reports
      const summaryPath = path.join(CONFIG.outputDir, 'security-performance-summary.json');
      fs.writeFileSync(summaryPath, JSON.stringify({
        summary,
        npmAudit,
        eslintSecurity,
        detailedReports: this.reports
      }, null, 2));

      const markdownReport = this.generateMarkdownReport(summary, npmAudit, eslintSecurity);
      const markdownPath = path.join(CONFIG.outputDir, 'security-performance-report.md');
      fs.writeFileSync(markdownPath, markdownReport);

      // Output results
      console.log('\n🔒 Security & Performance Audit Results:');
      console.log(`🛡️  Security Score: ${Math.round(summary.securityScore * 100)}%`);
      console.log(`⚡ Performance Score: ${Math.round(summary.performanceScore * 100)}%`);
      console.log(`🔴 Critical Issues: ${summary.criticalIssues}`);
      console.log(`🟠 High Issues: ${summary.highIssues}`);
      console.log(`🟡 Medium Issues: ${summary.mediumIssues}`);
      console.log(`📁 Reports saved to: ${CONFIG.outputDir}`);

      // Exit with appropriate code
      if (summary.criticalIssues > 0 || summary.securityScore < 0.7 || summary.performanceScore < 0.7) {
        console.log('\n❌ Security & Performance Audit failed - critical issues found');
        process.exit(1);
      } else {
        console.log('\n✅ Security & Performance Audit passed');
        process.exit(0);
      }

    } catch (error) {
      console.error('💥 Security & Performance Audit failed:', error);
      process.exit(1);
    }
  }
}

// Run if called directly
if (require.main === module) {
  const auditor = new SecurityPerformanceAuditor();
  auditor.run();
}

module.exports = SecurityPerformanceAuditor;