// FIND PAGE HEADER - Browser console-də işlədin
console.log('🔍 FINDING PAGE HEADER ELEMENTS');

// Try different selectors
const selectors = [
  '.standard-page-header-wrapper',
  '.page-header',
  '[data-component="page-header"]',
  '[class*="page-header"]',
  '[class*="header"]'
];

selectors.forEach(selector => {
  const elements = document.querySelectorAll(selector);
  console.log(`${selector}: ${elements.length} found`);
  
  elements.forEach((el, index) => {
    console.log(`  [${index}] ${el.tagName}.${el.className}`);
    if (el.style.zIndex) {
      console.log(`      z-index: ${el.style.zIndex}`);
    }
  });
});

// Check current page path
console.log('\n🌐 Current page:', window.location.pathname);

// Look for any sticky elements
console.log('\n📌 ALL STICKY ELEMENTS:');
const allElements = document.querySelectorAll('*');
const stickyElements = Array.from(allElements).filter(el => {
  const style = getComputedStyle(el);
  return style.position === 'sticky';
});

stickyElements.forEach(el => {
  const style = getComputedStyle(el);
  console.log(`${el.tagName}.${el.className}:`);
  console.log(`  position: ${style.position}`);
  console.log(`  z-index: ${style.zIndex}`);
  console.log(`  top: ${style.top}`);
});

// Check if we're in correct URL
if (!window.location.pathname.includes('/users')) {
  console.log('⚠️  You need to be on /users page to see page header!');
}