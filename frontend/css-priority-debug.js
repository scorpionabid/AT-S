// CSS PRIORITY DEBUG - Console-da bu məzmunu işlədib nəticəni göstər
console.log('🔧 CSS PRIORITY & SPECIFICITY DEBUG');

const sidebar = document.querySelector('.app-sidebar');

// Sidebar-ın cari style source-larını yoxla
console.log('\n📊 CURRENT STYLES ANALYSIS:');
const computed = getComputedStyle(sidebar);
console.log('Current width:', computed.width);
console.log('Current transition:', computed.transition);

// Bütün stylesheet-ləri yoxla
console.log('\n📚 ALL STYLESHEETS:');
Array.from(document.styleSheets).forEach((sheet, index) => {
  try {
    console.log(`Sheet ${index}: ${sheet.href || 'inline'} (${sheet.cssRules.length} rules)`);
  } catch (e) {
    console.log(`Sheet ${index}: BLOCKED - ${e.message}`);
  }
});

// Sidebar hover rules-ları tap
console.log('\n🎯 SIDEBAR HOVER RULES:');
const hoverRules = [];
Array.from(document.styleSheets).forEach((sheet, sheetIndex) => {
  try {
    Array.from(sheet.cssRules).forEach((rule, ruleIndex) => {
      if (rule.selectorText && 
          rule.selectorText.includes('sidebar') && 
          rule.selectorText.includes('hover') &&
          rule.style.width) {
        hoverRules.push({
          selector: rule.selectorText,
          width: rule.style.width,
          important: rule.style.getPropertyPriority('width'),
          cssText: rule.cssText,
          sheet: sheet.href || `inline-${sheetIndex}`
        });
      }
    });
  } catch (e) {
    // Skip blocked sheets
  }
});

console.log('Found hover rules with width:', hoverRules);

// Force test hover state
console.log('\n🧪 FORCE HOVER STATE TEST:');
sidebar.style.width = '280px';
sidebar.style.setProperty('width', '280px', 'important');
console.log('After force width:', getComputedStyle(sidebar).width);

// Reset
setTimeout(() => {
  sidebar.style.removeProperty('width');
  console.log('After reset:', getComputedStyle(sidebar).width);
}, 2000);

// CSS cascade test
console.log('\n⚡ CSS CASCADE TEST:');
console.log('Testing if CSS hover rules exist and work...');

// Create ultimate test
const ultimateTest = document.createElement('style');
ultimateTest.textContent = `
  .app-sidebar.collapsed:hover {
    width: 300px !important;
    background-color: lime !important;
    transition: all 0.5s ease !important;
  }
`;
document.head.appendChild(ultimateTest);
console.log('Added ultimate test CSS. Hover over sidebar - should turn lime green and expand to 300px');

// Log all applied styles
sidebar.addEventListener('mouseenter', () => {
  setTimeout(() => {
    console.log('\n🔍 HOVER APPLIED STYLES:');
    console.log('Computed width during hover:', getComputedStyle(sidebar).width);
    console.log('Computed background:', getComputedStyle(sidebar).backgroundColor);
    console.log('Inline styles:', sidebar.style.cssText);
    
    // Check all CSS rules affecting this element
    const allRules = [];
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules).forEach(rule => {
          if (rule.selectorText && sidebar.matches && sidebar.matches(rule.selectorText)) {
            allRules.push({
              selector: rule.selectorText,
              matches: true,
              width: rule.style.width || 'not set',
              sheet: sheet.href || 'inline'
            });
          }
        });
      } catch (e) {
        // Skip
      }
    });
    
    console.log('All matching CSS rules:', allRules);
  }, 100);
});

console.log('\n✋ Hover over sidebar to see cascade analysis...');