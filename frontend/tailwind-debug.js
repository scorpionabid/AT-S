// TAILWIND CSS DEBUG - Browser console-də işlədin
console.log('🎨 TAILWIND CSS DEBUG STARTING...');

// 1. CHECK GENERATED TAILWIND UTILITIES
const checkTailwindUtilities = () => {
  console.log('\n🔍 CHECKING TAILWIND Z-INDEX UTILITIES:');
  
  const testElement = document.createElement('div');
  document.body.appendChild(testElement);
  
  const zIndexClasses = [
    'z-auto', 'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50', 'z-60'
  ];
  
  zIndexClasses.forEach(className => {
    testElement.className = className;
    const computed = window.getComputedStyle(testElement);
    console.log(`${className}: z-index = ${computed.zIndex}`);
  });
  
  document.body.removeChild(testElement);
};

checkTailwindUtilities();

// 2. CHECK ELEMENTS WITH TAILWIND Z-INDEX CLASSES
const findTailwindZElements = () => {
  console.log('\n🎯 ELEMENTS WITH TAILWIND Z-INDEX:');
  
  const zClasses = ['z-auto', 'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50', 'z-60'];
  const found = [];
  
  zClasses.forEach(className => {
    const elements = document.querySelectorAll(`.${className}`);
    if (elements.length > 0) {
      elements.forEach(el => {
        const computed = window.getComputedStyle(el);
        found.push({
          class: className,
          element: `${el.tagName}.${el.className.split(' ')[0]}`,
          computedZIndex: computed.zIndex,
          position: computed.position,
          visible: el.offsetWidth > 0 && el.offsetHeight > 0
        });
      });
    }
  });
  
  if (found.length > 0) {
    console.table(found);
  } else {
    console.log('✅ No Tailwind z-index utilities found in DOM');
  }
  
  return found;
};

const tailwindElements = findTailwindZElements();

// 3. CHECK FOR CONFLICTING INLINE STYLES
const checkInlineStyles = () => {
  console.log('\n💉 CHECKING INLINE Z-INDEX STYLES:');
  
  const allElements = document.querySelectorAll('*');
  const inlineZIndex = [];
  
  allElements.forEach(el => {
    if (el.style.zIndex) {
      const computed = window.getComputedStyle(el);
      inlineZIndex.push({
        element: `${el.tagName}.${el.className.split(' ')[0]}`,
        inlineZIndex: el.style.zIndex,
        computedZIndex: computed.zIndex,
        position: computed.position,
        className: el.className.substring(0, 50)
      });
    }
  });
  
  if (inlineZIndex.length > 0) {
    console.table(inlineZIndex);
  } else {
    console.log('✅ No inline z-index styles found');
  }
  
  return inlineZIndex;
};

const inlineElements = checkInlineStyles();

// 4. FINAL RECOMMENDATION
console.log('\n🎯 ANALYSIS COMPLETE:');
if (tailwindElements.length > 0) {
  console.log('🚨 Tailwind z-index utilities detected - these might override CSS variables');
}
if (inlineElements.length > 0) {
  console.log('🚨 Inline z-index styles detected - these override all CSS');
}

console.log('🎨 TAILWIND DEBUG COMPLETED');