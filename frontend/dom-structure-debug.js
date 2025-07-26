// DOM Structure və Z-Index Analizi
// Browser console-də işlədin

console.log('=== DOM STRUCTURE ANALYSIS ===');

// 1. Ana layout elementlərini tap
const elements = {
  dashboard: document.querySelector('.dashboard'),
  sidebar: document.querySelector('.app-sidebar'),
  header: document.querySelector('.app-header'),
  main: document.querySelector('.dashboard-main'),
  pageHeaderWrapper: document.querySelector('.standard-page-header-wrapper'),
  pageHeader: document.querySelector('.page-header')
};

console.log('Found Elements:', Object.keys(elements).filter(key => elements[key]));

// 2. Hər element üçün computed styles
Object.entries(elements).forEach(([name, el]) => {
  if (el) {
    const styles = window.getComputedStyle(el);
    console.log(`\n${name.toUpperCase()}:`, {
      zIndex: styles.zIndex,
      position: styles.position,
      transform: styles.transform,
      isolation: styles.isolation,
      contain: styles.contain,
      willChange: styles.willChange,
      top: styles.top,
      left: styles.left,
      width: styles.width,
      className: el.className.substring(0, 100)
    });
  }
});

// 3. Parent-child hierarchy yoxla
function getStackingContext(element) {
  const style = window.getComputedStyle(element);
  const hasStackingContext = 
    style.zIndex !== 'auto' ||
    style.isolation === 'isolate' ||
    style.position === 'fixed' ||
    style.position === 'sticky' ||
    style.transform !== 'none' ||
    style.contain === 'layout' ||
    style.contain === 'style' ||
    style.contain === 'paint' ||
    style.willChange !== 'auto';
  
  return {
    element: element.tagName + '.' + element.className.split(' ')[0],
    hasStackingContext,
    zIndex: style.zIndex,
    reason: hasStackingContext ? 'Creates stacking context' : 'Normal flow'
  };
}

// 4. Stacking context tree
console.log('\n=== STACKING CONTEXT TREE ===');
const mainElements = [elements.dashboard, elements.sidebar, elements.main, elements.pageHeaderWrapper].filter(Boolean);
mainElements.forEach(el => {
  console.log(getStackingContext(el));
});

// 5. Real hierarchy test
console.log('\n=== HIERARCHY TEST ===');
if (elements.sidebar && elements.pageHeaderWrapper) {
  const sidebarRect = elements.sidebar.getBoundingClientRect();
  const headerRect = elements.pageHeaderWrapper.getBoundingClientRect();
  
  console.log('Sidebar rect:', sidebarRect);
  console.log('Header rect:', headerRect);
  console.log('Overlap?', !(headerRect.right < sidebarRect.left || 
                            headerRect.left > sidebarRect.right || 
                            headerRect.bottom < sidebarRect.top || 
                            headerRect.top > sidebarRect.bottom));
}