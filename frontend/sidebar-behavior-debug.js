// SIDEBAR BEHAVIOR DEBUG - Browser console-də işlədin
console.log('🎮 SIDEBAR BEHAVIOR DEBUG');

// 1. Find sidebar element
const sidebar = document.querySelector('.app-sidebar');
if (!sidebar) {
  console.log('❌ Sidebar not found!');
  return;
}

console.log('✅ Sidebar found:', sidebar);

// 2. Check current classes
console.log('\n📝 SIDEBAR CLASSES:');
console.log('className:', sidebar.className);
console.log('collapsed?:', sidebar.classList.contains('collapsed'));
console.log('hovered?:', sidebar.classList.contains('hovered'));

// 3. Check computed styles
const style = getComputedStyle(sidebar);
console.log('\n🎨 COMPUTED STYLES:');
console.log('width:', style.width);
console.log('position:', style.position);
console.log('transition:', style.transition);

// 4. Check event listeners
console.log('\n🎯 TESTING HOVER EVENTS:');

// Manual hover test
sidebar.addEventListener('mouseenter', () => {
  console.log('🔥 MOUSEENTER fired!');
  setTimeout(() => {
    console.log('Classes after mouseenter:', sidebar.className);
    console.log('Width after mouseenter:', getComputedStyle(sidebar).width);
  }, 100);
});

sidebar.addEventListener('mouseleave', () => {
  console.log('❄️ MOUSELEAVE fired!');
  setTimeout(() => {
    console.log('Classes after mouseleave:', sidebar.className);
    console.log('Width after mouseleave:', getComputedStyle(sidebar).width);
  }, 100);
});

// 5. Check navigation links
console.log('\n🔗 NAVIGATION LINKS:');
const navLinks = sidebar.querySelectorAll('a');
console.log(`Found ${navLinks.length} navigation links`);

navLinks.forEach((link, index) => {
  console.log(`[${index}] ${link.href} - ${link.textContent}`);
  
  // Add click listener
  link.addEventListener('click', (e) => {
    console.log(`🖱️ CLICKED: ${link.textContent} -> ${link.href}`);
    setTimeout(() => {
      console.log('Sidebar classes after navigation:', sidebar.className);
    }, 100);
  });
});

// 6. Screen size detection
console.log('\n📱 SCREEN SIZE DETECTION:');
console.log('window.innerWidth:', window.innerWidth);
console.log('Expected screenSize:', window.innerWidth <= 768 ? 'mobile' : window.innerWidth <= 1024 ? 'tablet' : 'desktop');

// 7. CSS variables for sidebar width
console.log('\n📏 WIDTH VARIABLES:');
const rootStyle = getComputedStyle(document.documentElement);
console.log('--sidebar-width:', rootStyle.getPropertyValue('--sidebar-width').trim());
console.log('--sidebar-width-collapsed:', rootStyle.getPropertyValue('--sidebar-width-collapsed').trim());
console.log('--sidebar-width-expanded:', rootStyle.getPropertyValue('--sidebar-width-expanded').trim());

console.log('\n✋ Hover over sidebar to test behavior...');