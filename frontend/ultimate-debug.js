// ULTIMATE Z-INDEX DEBUG SCRIPT
// Browser console-də users page-də işlədin

console.log('🔥 ULTIMATE Z-INDEX DEBUG STARTING...');

// 1. REAL DOM ELEMENT SEARCH
const findElements = () => {
  const selectors = [
    '.app-sidebar',
    '.sidebar',
    '[data-component="sidebar"]',
    '.standard-page-header-wrapper', 
    '.page-header',
    '[data-component="page-header"]',
    '.app-header',
    '.dashboard-main',
    '.dashboard'
  ];
  
  const found = {};
  selectors.forEach(selector => {
    const els = document.querySelectorAll(selector);
    if (els.length > 0) {
      found[selector] = Array.from(els);
    }
  });
  
  console.log('🎯 FOUND ELEMENTS:', found);
  return found;
};

const elements = findElements();

// 2. DETAILED STYLE ANALYSIS
const analyzeElement = (el, name) => {
  const computed = window.getComputedStyle(el);
  const rect = el.getBoundingClientRect();
  
  return {
    name,
    element: el.tagName + '.' + el.className.substring(0, 50),
    // Z-Index Chain
    zIndex: computed.zIndex,
    position: computed.position,
    // Stacking Context Creators
    transform: computed.transform,
    isolation: computed.isolation,
    contain: computed.contain,
    willChange: computed.willChange,
    opacity: computed.opacity,
    filter: computed.filter,
    // Position
    top: computed.top,
    left: computed.left,
    // Dimensions & Visibility
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    visible: rect.width > 0 && rect.height > 0,
    // Parent info
    parentTag: el.parentElement?.tagName,
    parentClass: el.parentElement?.className.substring(0, 30)
  };
};

// 3. ANALYZE ALL KEY ELEMENTS
console.log('\n🔍 DETAILED ELEMENT ANALYSIS:');
Object.entries(elements).forEach(([selector, els]) => {
  els.forEach((el, index) => {
    const analysis = analyzeElement(el, `${selector}[${index}]`);
    console.table([analysis]);
  });
});

// 4. STACKING CONTEXT TREE
const buildStackingTree = (el, depth = 0) => {
  const computed = window.getComputedStyle(el);
  const indent = '  '.repeat(depth);
  
  const hasStackingContext = 
    computed.zIndex !== 'auto' ||
    computed.isolation === 'isolate' ||
    computed.position === 'fixed' ||
    computed.position === 'sticky' ||
    computed.transform !== 'none' ||
    computed.contain.includes('layout') ||
    computed.contain.includes('paint') ||
    computed.willChange !== 'auto' ||
    computed.opacity !== '1';
    
  const info = `${indent}${el.tagName}.${el.className.split(' ')[0]} (z:${computed.zIndex}, pos:${computed.position})`;
  
  if (hasStackingContext) {
    console.log(`🔴 ${info} - CREATES STACKING CONTEXT`);
  } else {
    console.log(`⚪ ${info}`);
  }
  
  // Recurse into children that might create stacking contexts
  Array.from(el.children).forEach(child => {
    const childComputed = window.getComputedStyle(child);
    if (childComputed.position !== 'static' || childComputed.zIndex !== 'auto') {
      buildStackingTree(child, depth + 1);
    }
  });
};

console.log('\n🌳 STACKING CONTEXT TREE:');
const body = document.body;
buildStackingTree(body);

// 5. CSS RULE CONFLICTS
const findConflictingRules = () => {
  console.log('\n⚔️ CSS RULE CONFLICTS:');
  
  const pageHeader = document.querySelector('.standard-page-header-wrapper, .page-header');
  if (!pageHeader) {
    console.log('❌ No page header found!');
    return;
  }
  
  // Get all matching CSS rules
  const matchedRules = [];
  Array.from(document.styleSheets).forEach((sheet, sheetIndex) => {
    try {
      const rules = sheet.cssRules || sheet.rules;
      if (rules) {
        Array.from(rules).forEach((rule, ruleIndex) => {
          if (rule.selectorText && rule.style) {
            // Check if selector matches our element
            try {
              if (pageHeader.matches(rule.selectorText)) {
                matchedRules.push({
                  sheet: sheetIndex,
                  rule: ruleIndex,
                  selector: rule.selectorText,
                  zIndex: rule.style.zIndex,
                  position: rule.style.position,
                  specificity: calculateSpecificity(rule.selectorText),
                  source: sheet.href ? sheet.href.split('/').pop() : 'inline'
                });
              }
            } catch (e) {
              // Selector might be invalid, skip
            }
          }
        });
      }
    } catch (e) {
      console.log(`Cannot access sheet ${sheetIndex}:`, e.message);
    }
  });
  
  // Sort by specificity and source order
  matchedRules.sort((a, b) => {
    if (a.specificity !== b.specificity) return a.specificity - b.specificity;
    return a.sheet - b.sheet;
  });
  
  console.table(matchedRules);
  
  return matchedRules;
};

// Simple specificity calculator
const calculateSpecificity = (selector) => {
  const ids = (selector.match(/#/g) || []).length * 100;
  const classes = (selector.match(/\./g) || []).length * 10;
  const elements = (selector.match(/[a-zA-Z]/g) || []).length;
  return ids + classes + elements;
};

findConflictingRules();

// 6. OVERLAP DETECTION
console.log('\n📐 OVERLAP DETECTION:');
const sidebar = document.querySelector('.app-sidebar, .sidebar');
const pageHeader = document.querySelector('.standard-page-header-wrapper, .page-header');

if (sidebar && pageHeader) {
  const sRect = sidebar.getBoundingClientRect();
  const hRect = pageHeader.getBoundingClientRect();
  
  const overlap = !(hRect.right < sRect.left || 
                   hRect.left > sRect.right || 
                   hRect.bottom < sRect.top || 
                   hRect.top > sRect.bottom);
  
  console.log('Sidebar rect:', sRect);
  console.log('Header rect:', hRect);
  console.log('OVERLAP:', overlap);
  
  if (overlap) {
    console.log('🚨 ELEMENTS ARE OVERLAPPING!');
    
    // Check which one is visually on top
    const sidebarZ = parseInt(window.getComputedStyle(sidebar).zIndex) || 0;
    const headerZ = parseInt(window.getComputedStyle(pageHeader).zIndex) || 0;
    
    console.log(`Sidebar z-index: ${sidebarZ}`);
    console.log(`Header z-index: ${headerZ}`);
    
    if (headerZ > sidebarZ) {
      console.log('🔴 HEADER IS ON TOP (WRONG!)');
    } else {
      console.log('✅ SIDEBAR IS ON TOP (CORRECT)');
    }
  }
}

console.log('🔥 ULTIMATE DEBUG COMPLETED');