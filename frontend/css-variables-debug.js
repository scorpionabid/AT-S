// CSS VARIABLES RUNTIME DEBUG
// Browser console-də işlədin

console.log('🎨 CSS VARIABLES DEBUG STARTING...');

// 1. ROOT CSS VARIABLES CHECK
const root = document.documentElement;
const rootStyles = window.getComputedStyle(root);

const zIndexVars = [
  '--z-base',
  '--z-content', 
  '--z-page-header',
  '--z-sidebar',
  '--z-sidebar-hover',
  '--z-header',
  '--z-index-dropdown',
  '--z-index-sticky',
  '--z-index-fixed',
  '--z-index-modal-backdrop',
  '--z-index-offcanvas',
  '--z-index-modal',
  '--z-index-popover',
  '--z-index-tooltip',
  '--z-index-toast'
];

console.log('\n🎯 Z-INDEX CSS VARIABLES:');
const varValues = {};
zIndexVars.forEach(varName => {
  const value = rootStyles.getPropertyValue(varName).trim();
  varValues[varName] = value || 'NOT DEFINED';
  console.log(`${varName}: ${value || '❌ NOT DEFINED'}`);
});

// 2. SPECIFIC ELEMENT CSS VARIABLE RESOLUTION
const checkElementVars = (element, elementName) => {
  if (!element) return;
  
  console.log(`\n🔍 ${elementName.toUpperCase()} CSS VARIABLE RESOLUTION:`);
  const styles = window.getComputedStyle(element);
  
  // Check what CSS variables resolve to
  const checkVars = ['--z-page-header', '--z-sidebar', '--z-header'];
  checkVars.forEach(varName => {
    const resolved = styles.getPropertyValue(varName).trim();
    console.log(`${varName}: ${resolved || '❌ NOT RESOLVED'}`);
  });
  
  // Check actual z-index value and how it was computed
  const zIndex = styles.zIndex;
  const position = styles.position;
  console.log(`Final z-index: ${zIndex}`);
  console.log(`Position: ${position}`);
  
  // Check for inline styles that might override
  const inlineZIndex = element.style.zIndex;
  const inlinePosition = element.style.position;
  if (inlineZIndex || inlinePosition) {
    console.log(`🚨 INLINE STYLES DETECTED:`);
    if (inlineZIndex) console.log(`  inline z-index: ${inlineZIndex}`);
    if (inlinePosition) console.log(`  inline position: ${inlinePosition}`);
  }
};

// 3. CHECK KEY ELEMENTS
const sidebar = document.querySelector('.app-sidebar, .sidebar');
const pageHeader = document.querySelector('.standard-page-header-wrapper, .page-header');
const appHeader = document.querySelector('.app-header');

checkElementVars(sidebar, 'SIDEBAR');
checkElementVars(pageHeader, 'PAGE HEADER');
checkElementVars(appHeader, 'APP HEADER');

// 4. CSS CUSTOM PROPERTY CASCADE CHECK
console.log('\n🌊 CSS CUSTOM PROPERTY CASCADE:');

const checkCascade = (element, property) => {
  if (!element) return;
  
  let current = element;
  const cascade = [];
  
  while (current && current !== document) {
    const styles = window.getComputedStyle(current);
    const value = styles.getPropertyValue(property).trim();
    
    if (value) {
      cascade.push({
        element: `${current.tagName}.${current.className.split(' ')[0]}`,
        value: value
      });
    }
    current = current.parentElement;
  }
  
  console.log(`${property} cascade for ${element.tagName}:`, cascade);
  return cascade;
};

if (pageHeader) {
  checkCascade(pageHeader, '--z-page-header');
}

// 5. RUNTIME CSS VARIABLE OVERRIDE TEST
console.log('\n🧪 RUNTIME OVERRIDE TEST:');

if (pageHeader) {
  const originalZIndex = window.getComputedStyle(pageHeader).zIndex;
  console.log(`Original page header z-index: ${originalZIndex}`);
  
  // Test setting a high z-index
  pageHeader.style.zIndex = '9999';
  pageHeader.style.position = 'sticky';
  
  const newZIndex = window.getComputedStyle(pageHeader).zIndex;
  console.log(`After override z-index: ${newZIndex}`);
  
  console.log('⏰ WAIT 2 seconds to see visual change...');
  setTimeout(() => {
    // Reset
    pageHeader.style.zIndex = '';
    pageHeader.style.position = '';
    console.log('✅ Reset to original values');
  }, 2000);
}

console.log('🎨 CSS VARIABLES DEBUG COMPLETED');