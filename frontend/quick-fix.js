// QUICK FIX - Browser console-də işlədin
console.log('🛠️ APPLYING QUICK Z-INDEX FIX...');

// 1. Find elements
const sidebar = document.querySelector('.app-sidebar');
const pageHeader = document.querySelector('.standard-page-header-wrapper');

if (sidebar) {
  sidebar.style.zIndex = '1000';
  sidebar.style.position = 'fixed';
  console.log('✅ Sidebar z-index set to 1000');
} else {
  console.log('❌ Sidebar not found');
}

if (pageHeader) {
  pageHeader.style.zIndex = '500';
  pageHeader.style.position = 'sticky';
  console.log('✅ Page header z-index set to 500');
} else {
  console.log('❌ Page header not found');
}

// 2. Verify changes
setTimeout(() => {
  console.log('\n🔍 VERIFICATION:');
  if (sidebar) {
    console.log('Sidebar z-index:', getComputedStyle(sidebar).zIndex);
  }
  if (pageHeader) {
    console.log('Page header z-index:', getComputedStyle(pageHeader).zIndex);
  }
  console.log('🛠️ Quick fix applied! Sidebar should now be above page header.');
}, 100);