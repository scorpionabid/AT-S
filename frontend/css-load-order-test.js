// CSS Load Order Test - Browser Console-də işlədin
console.log('=== CSS LOAD ORDER TEST ===');

// 1. Bütün stylesheet-ləri sırala
const styleSheets = Array.from(document.styleSheets);
const cssFiles = [];

styleSheets.forEach((sheet, index) => {
  try {
    if (sheet.href) {
      cssFiles.push({
        order: index,
        href: sheet.href.split('/').pop(),
        fullPath: sheet.href
      });
    } else if (sheet.ownerNode && sheet.ownerNode.tagName === 'STYLE') {
      cssFiles.push({
        order: index,
        href: 'inline-style',
        fullPath: 'Inline <style> tag'
      });
    }
  } catch (e) {
    console.log('CORS blocked stylesheet:', sheet.href);
  }
});

console.table(cssFiles);

// 2. page-header CSS rules-larını tap
const pageHeaderRules = [];
styleSheets.forEach((sheet, sheetIndex) => {
  try {
    const rules = sheet.cssRules || sheet.rules;
    if (rules) {
      Array.from(rules).forEach((rule, ruleIndex) => {
        if (rule.selectorText && rule.selectorText.includes('.page-header')) {
          pageHeaderRules.push({
            sheet: sheetIndex,
            rule: ruleIndex,
            selector: rule.selectorText,
            zIndex: rule.style.zIndex || 'none',
            position: rule.style.position || 'none',
            source: cssFiles[sheetIndex]?.href || 'unknown'
          });
        }
      });
    }
  } catch (e) {
    console.log('Cannot access stylesheet rules:', e);
  }
});

console.log('\n=== PAGE HEADER RULES ===');
console.table(pageHeaderRules);

// 3. Final computed style
const pageHeaderEl = document.querySelector('.standard-page-header-wrapper, .page-header');
if (pageHeaderEl) {
  const computed = window.getComputedStyle(pageHeaderEl);
  console.log('\n=== FINAL COMPUTED STYLE ===');
  console.log({
    element: pageHeaderEl.className,
    zIndex: computed.zIndex,
    position: computed.position,
    top: computed.top,
    background: computed.backgroundColor
  });
}