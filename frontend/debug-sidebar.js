// SIDEBAR DEBUG - Browser console-də işlədin
console.log('🔍 SIDEBAR POSITION DEBUG');

const sidebar = document.querySelector('.app-sidebar');
if (sidebar) {
  const computed = getComputedStyle(sidebar);
  
  console.log('\n📊 SIDEBAR COMPUTED STYLES:');
  console.log('position:', computed.position);
  console.log('z-index:', computed.zIndex);
  console.log('top:', computed.top);
  console.log('left:', computed.left);
  console.log('width:', computed.width);
  console.log('height:', computed.height);
  
  console.log('\n🎯 CSS CLASSES:');
  console.log('classes:', sidebar.className);
  
  console.log('\n🔧 INLINE STYLES:');
  console.log('style attribute:', sidebar.getAttribute('style'));
  
  // Check all CSS rules that might override position
  console.log('\n📋 ALL CSS RULES AFFECTING POSITION:');
  const rules = Array.from(document.styleSheets)
    .flatMap(sheet => {
      try {
        return Array.from(sheet.cssRules || sheet.rules);
      } catch (e) {
        return [];
      }
    })
    .filter(rule => {
      return rule.selectorText && 
             rule.selectorText.includes('app-sidebar') && 
             rule.style && 
             (rule.style.position || rule.style.zIndex);
    });
    
  rules.forEach(rule => {
    console.log(`${rule.selectorText}: {`);
    if (rule.style.position) console.log(`  position: ${rule.style.position};`);
    if (rule.style.zIndex) console.log(`  z-index: ${rule.style.zIndex};`);
    console.log(`}`);
  });
  
} else {
  console.log('❌ Sidebar not found');
}