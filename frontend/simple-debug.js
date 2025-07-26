// SIMPLE DEBUG - Browser console-də işlədin
console.log('🔍 SIMPLE CSS DEBUG');

// 1. CSS Variables check
const root = document.documentElement;
const computed = getComputedStyle(root);

console.log('\n📊 CSS VARIABLES:');
const vars = ['--z-sidebar', '--z-page-header', '--z-header'];
vars.forEach(v => {
  const value = computed.getPropertyValue(v).trim();
  console.log(`${v}: ${value || '❌ NOT FOUND'}`);
});

// 2. Find elements
console.log('\n🎯 FINDING ELEMENTS:');
const selectors = ['.app-sidebar', '.standard-page-header-wrapper', '.page-header'];
selectors.forEach(sel => {
  const el = document.querySelector(sel);
  if (el) {
    const style = getComputedStyle(el);
    console.log(`${sel}: z-index=${style.zIndex}, position=${style.position}`);
  } else {
    console.log(`${sel}: ❌ NOT FOUND`);
  }
});

// 3. Check current URL
console.log('\n🌐 CURRENT PAGE:', window.location.pathname);