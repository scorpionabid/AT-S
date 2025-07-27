// REACT STATE DEBUG - Browser console-də işlədin
console.log('⚛️ REACT STATE DEBUG');

// Find React Fiber node to access component state
const sidebar = document.querySelector('.app-sidebar');
if (!sidebar) {
  console.log('❌ Sidebar not found!');
} else {
  // Get React Fiber instance
  const fiberKey = Object.keys(sidebar).find(key => key.startsWith('__reactFiber'));
  const fiber = sidebar[fiberKey];
  
  if (fiber) {
    console.log('✅ React Fiber found');
    
    // Find LayoutContext consumer
    let currentFiber = fiber;
    let contextValue = null;
    
    while (currentFiber) {
      if (currentFiber.memoizedProps || currentFiber.memoizedState) {
        console.log('Fiber type:', currentFiber.type?.name || currentFiber.elementType?.name || 'Unknown');
        
        // Check for LayoutContext
        if (currentFiber.dependencies?.firstContext) {
          let context = currentFiber.dependencies.firstContext;
          while (context) {
            if (context.context?.displayName === 'LayoutContext' || 
                context.memoizedValue?.isCollapsed !== undefined) {
              contextValue = context.memoizedValue;
              console.log('🎯 LayoutContext found:', contextValue);
              break;
            }
            context = context.next;
          }
        }
      }
      currentFiber = currentFiber.return;
    }
    
    if (!contextValue) {
      console.log('❌ LayoutContext not found in fiber tree');
    }
  } else {
    console.log('❌ React Fiber not found');
  }
  
  // Alternative: Check React DevTools hook
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log('🔧 React DevTools available');
    
    // Find all React components
    const renderers = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.renderers;
    if (renderers.size > 0) {
      console.log(`Found ${renderers.size} React renderer(s)`);
    }
  }
  
  // Manual state check - dispatch custom event to check if React handlers work
  console.log('\n🧪 TESTING REACT HANDLERS:');
  
  const mouseEnterEvent = new MouseEvent('mouseenter', {
    bubbles: true,
    cancelable: true,
    clientX: 100,
    clientY: 100
  });
  
  const mouseLeaveEvent = new MouseEvent('mouseleave', {
    bubbles: true,
    cancelable: true,
    clientX: 200,
    clientY: 200
  });
  
  console.log('Dispatching mouseenter...');
  sidebar.dispatchEvent(mouseEnterEvent);
  
  setTimeout(() => {
    console.log('Classes after React mouseenter:', sidebar.className);
    console.log('Width after React mouseenter:', getComputedStyle(sidebar).width);
    
    console.log('Dispatching mouseleave...');
    sidebar.dispatchEvent(mouseLeaveEvent);
    
    setTimeout(() => {
      console.log('Classes after React mouseleave:', sidebar.className);
      console.log('Width after React mouseleave:', getComputedStyle(sidebar).width);
    }, 200);
  }, 200);
}