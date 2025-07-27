// HOVER RULES INSPECTOR - Browser console-də işlədin
console.log('🔍 HOVER RULES DETAILED INSPECTION');

// 1. Expand hover rules details
console.log('\n🎨 DETAILED HOVER RULES:');
const sidebar = document.querySelector('.app-sidebar');
const stylesheets = Array.from(document.styleSheets);
let detailedRules = [];

stylesheets.forEach((sheet, sheetIndex) => {
  try {
    const rules = Array.from(sheet.cssRules || sheet.rules);
    rules.forEach((rule, ruleIndex) => {
      if (rule.selectorText && rule.selectorText.includes('sidebar') && rule.selectorText.includes('hover')) {
        detailedRules.push({
          sheetIndex,
          ruleIndex,
          selector: rule.selectorText,
          cssText: rule.cssText,
          width: rule.style.width,
          important: rule.style.getPropertyPriority('width'),
          transition: rule.style.transition,
          zIndex: rule.style.zIndex,
          href: sheet.href || 'inline'
        });
      }
    });
  } catch (e) {
    console.log(`Sheet ${sheetIndex} blocked:`, e.message);
  }
});

console.log('Found detailed hover rules:', detailedRules);

// 2. Z-index conflicts details
console.log('\n📐 Z-INDEX CONFLICTS DETAILS:');
const elements = document.querySelectorAll('*');
const conflicts = [];

elements.forEach(el => {
  const style = getComputedStyle(el);
  const zIndex = parseInt(style.zIndex);
  
  if (!isNaN(zIndex) && zIndex >= 990 && zIndex <= 1010) {
    const rect = el.getBoundingClientRect();
    const sidebarRect = sidebar.getBoundingClientRect();
    
    const overlaps = !(rect.right < sidebarRect.left || 
                     rect.left > sidebarRect.right || 
                     rect.bottom < sidebarRect.top || 
                     rect.top > sidebarRect.bottom);
    
    conflicts.push({
      element: `${el.tagName}.${el.className}`,
      zIndex: zIndex,
      position: style.position,
      overlaps: overlaps,
      rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
    });
  }
});

console.log('Z-index conflicts:', conflicts);

// 3. Manual CSS test
console.log('\n🧪 MANUAL CSS TEST:');
console.log('Testing hover manually by adding class...');

sidebar.addEventListener('mouseenter', () => {
  console.log('Adding test class for hover...');
  sidebar.classList.add('test-hover');
  
  setTimeout(() => {
    const newStyle = getComputedStyle(sidebar);
    console.log('Width after manual hover class:', newStyle.width);
    console.log('Transition after manual hover class:', newStyle.transition);
  }, 100);
});

sidebar.addEventListener('mouseleave', () => {
  console.log('Removing test class...');
  sidebar.classList.remove('test-hover');
  
  setTimeout(() => {
    const newStyle = getComputedStyle(sidebar);
    console.log('Width after manual hover class removal:', newStyle.width);
  }, 100);
});

// 4. CSS rule exists check
console.log('\n✅ CHECKING IF CSS RULES ACTUALLY WORK:');

// Create temporary style to test
const testStyle = document.createElement('style');
testStyle.textContent = `
  .app-sidebar.test-hover {
    width: 280px !important;
    background-color: red !important;
  }
`;
document.head.appendChild(testStyle);

console.log('Added test style. Hover over sidebar to see if manual CSS works...');

// 5. Media query check
console.log('\n📱 MEDIA QUERY CHECK:');
const mediaQuery = window.matchMedia('(min-width: 1024px)');
console.log('Desktop media query matches:', mediaQuery.matches);
console.log('Window width:', window.innerWidth);

// 6. Computed style vs applied style
sidebar.addEventListener('mouseenter', () => {
  setTimeout(() => {
    console.log('\n🎯 HOVER STATE ANALYSIS:');
    console.log('Sidebar classes:', sidebar.className);
    console.log('Data attributes:', {
      collapsed: sidebar.getAttribute('data-collapsed'),
      hovered: sidebar.getAttribute('data-hovered'),
      screenSize: sidebar.getAttribute('data-screen-size')
    });
    
    const computed = getComputedStyle(sidebar);
    console.log('Computed width:', computed.width);
    console.log('Computed transition:', computed.transition);
    console.log('Computed z-index:', computed.zIndex);
    
    // Check if hover pseudo-class is active
    console.log('Element matches :hover:', sidebar.matches(':hover'));
    console.log('Element matches .collapsed:hover:', sidebar.matches('.collapsed:hover'));
  }, 50);
});

console.log('\n✋ Hover over sidebar now to see detailed analysis...');