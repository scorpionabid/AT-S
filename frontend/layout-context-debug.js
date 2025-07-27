// LAYOUT CONTEXT DEBUG - Browser console-də işlədin
console.log('⚛️ LAYOUT CONTEXT DEBUG');

// Mock setHovered to test if it's being called
const sidebar = document.querySelector('.app-sidebar');
if (sidebar) {
  // Check if React DevTools available for state inspection
  if (window.React) {
    console.log('React available');
  }
  
  // Check screen size calculation manually
  const width = window.innerWidth;
  console.log('Window width:', width);
  console.log('Expected screenSize:', width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop');
  
  // Override hover behavior temporarily to test
  sidebar.addEventListener('mouseenter', () => {
    console.log('DOM mouseenter - adding hovered class manually...');
    sidebar.classList.add('hovered');
    console.log('Classes after manual add:', sidebar.className);
    console.log('Width after manual add:', getComputedStyle(sidebar).width);
  });
  
  sidebar.addEventListener('mouseleave', () => {
    console.log('DOM mouseleave - removing hovered class manually...');
    sidebar.classList.remove('hovered');
    console.log('Classes after manual remove:', sidebar.className);
    console.log('Width after manual remove:', getComputedStyle(sidebar).width);
  });
  
  console.log('Manual hover test enabled. Hover over sidebar...');
} else {
  console.log('❌ Sidebar not found');
}