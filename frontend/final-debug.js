// FINAL DEBUG - Browser console-də işlədin
console.log('🎯 FINAL Z-INDEX & STACKING CONTEXT DEBUG');

// 1. CSS Variables check
const root = document.documentElement;
const computed = getComputedStyle(root);

console.log('\n📊 CSS VARIABLES:');
const vars = ['--z-sidebar', '--z-page-header', '--z-header'];
vars.forEach(v => {
  const value = computed.getPropertyValue(v).trim();
  console.log(`${v}: ${value || '❌ NOT FOUND'}`);
});

// 2. Find elements and check stacking contexts
console.log('\n🎯 ELEMENT ANALYSIS:');
const sidebar = document.querySelector('.app-sidebar');
const pageHeader = document.querySelector('.standard-page-header-wrapper');
const appHeader = document.querySelector('.app-header');

[
  {element: sidebar, name: 'Sidebar', selector: '.app-sidebar'},
  {element: pageHeader, name: 'Page Header', selector: '.standard-page-header-wrapper'},
  {element: appHeader, name: 'App Header', selector: '.app-header'}
].forEach(({element, name, selector}) => {
  if (element) {
    const style = getComputedStyle(element);
    console.log(`\n${name} (${selector}):`);
    console.log(`  z-index: ${style.zIndex}`);
    console.log(`  position: ${style.position}`);
    console.log(`  isolation: ${style.isolation}`);
    console.log(`  transform: ${style.transform}`);
    console.log(`  opacity: ${style.opacity}`);
    console.log(`  filter: ${style.filter}`);
    console.log(`  contain: ${style.contain}`);
    
    // Check if creates stacking context
    const createsStackingContext = 
      style.position !== 'static' && style.zIndex !== 'auto' ||
      style.opacity < 1 ||
      style.transform !== 'none' ||
      style.isolation === 'isolate' ||
      style.filter !== 'none' ||
      style.contain.includes('layout') || style.contain.includes('paint');
    
    console.log(`  Creates stacking context: ${createsStackingContext ? '🚨 YES' : '✅ NO'}`);
  } else {
    console.log(`\n${name}: ❌ NOT FOUND`);
  }
});

// 3. Parent-child stacking context check
console.log('\n🔗 STACKING CONTEXT HIERARCHY:');
if (sidebar && pageHeader) {
  const sidebarParent = sidebar.offsetParent || document.body;
  const pageHeaderParent = pageHeader.offsetParent || document.body;
  
  console.log(`Sidebar stacking parent: ${sidebarParent.tagName}.${sidebarParent.className}`);
  console.log(`Page header stacking parent: ${pageHeaderParent.tagName}.${pageHeaderParent.className}`);
  console.log(`Same stacking context: ${sidebarParent === pageHeaderParent ? '✅ YES' : '🚨 NO'}`);
}

// 4. Visual test
console.log('\n👁️ VISUAL HIERARCHY TEST:');
if (sidebar && pageHeader) {
  const sidebarRect = sidebar.getBoundingClientRect();
  const pageHeaderRect = pageHeader.getBoundingClientRect();
  
  console.log(`Sidebar position: left=${sidebarRect.left}, top=${sidebarRect.top}`);
  console.log(`Page header position: left=${pageHeaderRect.left}, top=${pageHeaderRect.top}`);
  
  // Check if they overlap
  const overlap = !(sidebarRect.right < pageHeaderRect.left || 
                   sidebarRect.left > pageHeaderRect.right || 
                   sidebarRect.bottom < pageHeaderRect.top || 
                   sidebarRect.top > pageHeaderRect.bottom);
  
  console.log(`Elements overlap: ${overlap ? '🚨 YES' : '✅ NO'}`);
}

// 5. Final verdict
console.log('\n🏁 EXPECTED BEHAVIOR:');
console.log('✅ Sidebar should be UNDER page header');
console.log('✅ Page header should be ABOVE sidebar');
console.log('✅ App header should be ABOVE everything');
console.log('\n🔍 If page header is still above sidebar, check for stacking context issues above!');