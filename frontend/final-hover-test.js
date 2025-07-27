// FINAL HOVER TEST - Run this in browser console to verify the fix
console.log('🎯 FINAL HOVER ANIMATION TEST');

const sidebar = document.querySelector('.app-sidebar');
if (!sidebar) {
  console.log('❌ Sidebar not found!');
} else {
  console.log('✅ Sidebar found, testing hover animation...');
  
  // 1. Check initial state
  console.log('\n📊 INITIAL STATE:');
  const initialStyle = getComputedStyle(sidebar);
  console.log('Initial width:', initialStyle.width);
  console.log('Has collapsed class:', sidebar.classList.contains('collapsed'));
  console.log('Screen size (min-width: 1024px):', window.matchMedia('(min-width: 1024px)').matches);
  
  // 2. Check if CSS rule exists
  console.log('\n🎨 CSS RULE CHECK:');
  let foundRule = false;
  Array.from(document.styleSheets).forEach(sheet => {
    try {
      Array.from(sheet.cssRules).forEach(rule => {
        if (rule.selectorText && rule.selectorText.includes('.app-sidebar.collapsed:hover')) {
          foundRule = true;
          console.log('✅ Found hover rule:', rule.selectorText);
          console.log('Rule width:', rule.style.width);
          console.log('Rule importance:', rule.style.getPropertyPriority('width'));
        }
      });
    } catch (e) {
      // Skip blocked stylesheets
    }
  });
  
  if (!foundRule) {
    console.log('❌ No hover rule found in stylesheets!');
  }
  
  // 3. Monitor hover events
  console.log('\n👂 MONITORING HOVER EVENTS:');
  sidebar.addEventListener('mouseenter', () => {
    setTimeout(() => {
      const hoverStyle = getComputedStyle(sidebar);
      console.log('🖱️ HOVER ENTER - Width:', hoverStyle.width);
    }, 50);
  });
  
  sidebar.addEventListener('mouseleave', () => {
    setTimeout(() => {
      const leaveStyle = getComputedStyle(sidebar);
      console.log('🖱️ HOVER LEAVE - Width:', leaveStyle.width);
    }, 50);
  });
  
  console.log('\n✋ Now hover over the collapsed sidebar icons...');
  console.log('💡 Expected behavior:');
  console.log('- Icons should expand from 80px to 280px smoothly');
  console.log('- Animation should take 0.3 seconds');
  console.log('- No instant appearance/disappearance');
}