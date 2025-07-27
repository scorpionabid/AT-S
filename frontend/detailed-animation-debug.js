// DETAILED ANIMATION DEBUG - Browser console-də işlədin
console.log('🎬 DETAILED ANIMATION DEBUG');

const sidebar = document.querySelector('.app-sidebar');
if (!sidebar) {
  console.log('❌ Sidebar not found!');
} else {
  console.log('✅ Sidebar found');
  
  // 1. Check initial state
  console.log('\n📊 INITIAL STATE:');
  const initialStyle = getComputedStyle(sidebar);
  console.log('Initial width:', initialStyle.width);
  console.log('Initial transition:', initialStyle.transition);
  console.log('Initial classes:', sidebar.className);
  console.log('Initial position:', initialStyle.position);
  console.log('Initial left:', initialStyle.left);
  console.log('Initial transform:', initialStyle.transform);
  console.log('Initial visibility:', initialStyle.visibility);
  console.log('Initial opacity:', initialStyle.opacity);
  console.log('Initial display:', initialStyle.display);
  
  // 2. Check CSS custom properties
  console.log('\n🎨 CSS CUSTOM PROPERTIES:');
  const rootStyle = getComputedStyle(document.documentElement);
  console.log('--sidebar-width:', rootStyle.getPropertyValue('--sidebar-width').trim());
  console.log('--sidebar-width-collapsed:', rootStyle.getPropertyValue('--sidebar-width-collapsed').trim());
  console.log('--sidebar-width-expanded:', rootStyle.getPropertyValue('--sidebar-width-expanded').trim());
  
  // 3. Real-time hover monitoring
  console.log('\n🎯 HOVER MONITORING (hover over sidebar now):');
  
  sidebar.addEventListener('mouseenter', () => {
    console.log('\n🔥 MOUSEENTER:');
    console.log('Timestamp:', Date.now());
    
    // Check immediately
    console.log('Immediate - classes:', sidebar.className);
    console.log('Immediate - width:', getComputedStyle(sidebar).width);
    
    // Check after 50ms
    setTimeout(() => {
      console.log('After 50ms - classes:', sidebar.className);
      console.log('After 50ms - width:', getComputedStyle(sidebar).width);
    }, 50);
    
    // Check after 100ms
    setTimeout(() => {
      console.log('After 100ms - classes:', sidebar.className);
      console.log('After 100ms - width:', getComputedStyle(sidebar).width);
    }, 100);
    
    // Check after 200ms
    setTimeout(() => {
      console.log('After 200ms - classes:', sidebar.className);
      console.log('After 200ms - width:', getComputedStyle(sidebar).width);
    }, 200);
    
    // Check after 400ms (after transition should complete)
    setTimeout(() => {
      console.log('After 400ms - classes:', sidebar.className);
      console.log('After 400ms - width:', getComputedStyle(sidebar).width);
      console.log('🔥 MOUSEENTER sequence complete\n');
    }, 400);
  });
  
  sidebar.addEventListener('mouseleave', () => {
    console.log('\n❄️ MOUSELEAVE:');
    console.log('Timestamp:', Date.now());
    
    // Check immediately
    console.log('Immediate - classes:', sidebar.className);
    console.log('Immediate - width:', getComputedStyle(sidebar).width);
    
    // Check after 50ms
    setTimeout(() => {
      console.log('After 50ms - classes:', sidebar.className);
      console.log('After 50ms - width:', getComputedStyle(sidebar).width);
    }, 50);
    
    // Check after 100ms
    setTimeout(() => {
      console.log('After 100ms - classes:', sidebar.className);
      console.log('After 100ms - width:', getComputedStyle(sidebar).width);
    }, 100);
    
    // Check after 200ms
    setTimeout(() => {
      console.log('After 200ms - classes:', sidebar.className);
      console.log('After 200ms - width:', getComputedStyle(sidebar).width);
    }, 200);
    
    // Check after 400ms (after transition should complete)
    setTimeout(() => {
      console.log('After 400ms - classes:', sidebar.className);
      console.log('After 400ms - width:', getComputedStyle(sidebar).width);
      console.log('❄️ MOUSELEAVE sequence complete\n');
    }, 400);
  });
  
  // 4. Check for any CSS rules that might interfere
  console.log('\n🔍 CHECKING CONFLICTING CSS:');
  
  // Check if sidebar has any inline styles
  if (sidebar.style.width) {
    console.log('⚠️ Inline width detected:', sidebar.style.width);
  }
  if (sidebar.style.transform) {
    console.log('⚠️ Inline transform detected:', sidebar.style.transform);
  }
  if (sidebar.style.display) {
    console.log('⚠️ Inline display detected:', sidebar.style.display);
  }
  
  // Check parent elements for overflow hidden
  let parent = sidebar.parentElement;
  let level = 1;
  while (parent && level <= 3) {
    const parentStyle = getComputedStyle(parent);
    if (parentStyle.overflow !== 'visible') {
      console.log(`⚠️ Parent ${level} has overflow: ${parentStyle.overflow} - ${parent.className}`);
    }
    if (parentStyle.transform !== 'none') {
      console.log(`⚠️ Parent ${level} has transform: ${parentStyle.transform} - ${parent.className}`);
    }
    parent = parent.parentElement;
    level++;
  }
  
  console.log('\n✋ Now hover over the sidebar to see real-time debugging...');
}