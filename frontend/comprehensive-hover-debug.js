// COMPREHENSIVE HOVER DEBUG - Browser console-də işlədin
console.log('🔬 COMPREHENSIVE HOVER DEBUG - All possible causes');

const sidebar = document.querySelector('.app-sidebar');
if (!sidebar) {
  console.log('❌ Sidebar not found!');
} else {
  console.log('✅ Starting comprehensive analysis...');
  
  // 1. INITIAL STATE ANALYSIS
  console.log('\n📊 INITIAL STATE:');
  const style = getComputedStyle(sidebar);
  console.log('Width:', style.width);
  console.log('Position:', style.position);
  console.log('Z-index:', style.zIndex);
  console.log('Transition:', style.transition);
  console.log('Overflow-x:', style.overflowX);
  console.log('Overflow-y:', style.overflowY);
  
  // 2. PARENT CONTAINERS ANALYSIS
  console.log('\n👨‍👦 PARENT CONTAINERS:');
  let parent = sidebar.parentElement;
  let level = 1;
  while (parent && level <= 3) {
    const parentStyle = getComputedStyle(parent);
    console.log(`Parent ${level} (${parent.tagName}.${parent.className}):`);
    console.log(`  Overflow: ${parentStyle.overflow} / ${parentStyle.overflowX} / ${parentStyle.overflowY}`);
    console.log(`  Z-index: ${parentStyle.zIndex}`);
    console.log(`  Position: ${parentStyle.position}`);
    console.log(`  Transform: ${parentStyle.transform}`);
    parent = parent.parentElement;
    level++;
  }
  
  // 3. CSS RULES ANALYSIS
  console.log('\n🎨 CSS HOVER RULES CHECK:');
  const stylesheets = Array.from(document.styleSheets);
  let hoverRules = [];
  
  stylesheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || sheet.rules);
      rules.forEach(rule => {
        if (rule.selectorText && rule.selectorText.includes('sidebar') && rule.selectorText.includes('hover')) {
          hoverRules.push({
            selector: rule.selectorText,
            width: rule.style.width,
            transition: rule.style.transition,
            zIndex: rule.style.zIndex
          });
        }
      });
    } catch (e) {
      // Cross-origin stylesheet, skip
    }
  });
  
  console.log('Found hover rules:', hoverRules);
  
  // 4. MOUSE EVENT TRACKING
  console.log('\n🖱️ MOUSE EVENT TRACKING:');
  let mouseEvents = [];
  let hoverStartTime = null;
  let isCurrentlyHovered = false;
  
  const logEvent = (eventType, timestamp, target) => {
    const event = { 
      type: eventType, 
      time: timestamp, 
      target: target.tagName + '.' + target.className,
      sidebarWidth: getComputedStyle(sidebar).width
    };
    mouseEvents.push(event);
    
    if (mouseEvents.length > 10) {
      mouseEvents = mouseEvents.slice(-10); // Keep last 10 events
    }
    
    console.log(`${eventType.toUpperCase()}: ${event.target} | Width: ${event.sidebarWidth}`);
  };
  
  // Add comprehensive event listeners
  sidebar.addEventListener('mouseenter', (e) => {
    hoverStartTime = Date.now();
    isCurrentlyHovered = true;
    logEvent('mouseenter', Date.now(), e.target);
  });
  
  sidebar.addEventListener('mouseleave', (e) => {
    const hoverDuration = hoverStartTime ? Date.now() - hoverStartTime : 0;
    isCurrentlyHovered = false;
    logEvent('mouseleave', Date.now(), e.target);
    console.log(`Hover duration: ${hoverDuration}ms`);
  });
  
  sidebar.addEventListener('mousemove', (e) => {
    // Log mouse position relative to sidebar
    const rect = sidebar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Only log if at edges (potential leave triggers)
    if (x < 5 || x > rect.width - 5 || y < 5 || y > rect.height - 5) {
      console.log(`Mouse near edge: x=${x.toFixed(1)}, y=${y.toFixed(1)}, width=${rect.width}`);
    }
  });
  
  // 5. ANIMATION FRAME TRACKING
  console.log('\n🎬 ANIMATION FRAME TRACKING:');
  let animationFrames = [];
  let trackingAnimation = false;
  
  const trackAnimation = () => {
    if (trackingAnimation) {
      const currentWidth = getComputedStyle(sidebar).width;
      animationFrames.push({
        time: Date.now(),
        width: currentWidth
      });
      
      if (animationFrames.length < 60) { // Track for ~1 second at 60fps
        requestAnimationFrame(trackAnimation);
      } else {
        console.log('Animation frames captured:', animationFrames);
        trackingAnimation = false;
        animationFrames = [];
      }
    }
  };
  
  sidebar.addEventListener('mouseenter', () => {
    if (!trackingAnimation) {
      trackingAnimation = true;
      animationFrames = [];
      requestAnimationFrame(trackAnimation);
    }
  });
  
  // 6. Z-INDEX CONFLICT DETECTION
  console.log('\n📐 Z-INDEX CONFLICT DETECTION:');
  const elements = document.querySelectorAll('*');
  const potentialConflicts = [];
  
  elements.forEach(el => {
    const elStyle = getComputedStyle(el);
    const zIndex = parseInt(elStyle.zIndex);
    
    if (!isNaN(zIndex) && zIndex >= 990 && zIndex <= 1010) {
      const rect = el.getBoundingClientRect();
      const sidebarRect = sidebar.getBoundingClientRect();
      
      // Check if overlaps with sidebar area
      const overlaps = !(rect.right < sidebarRect.left || 
                       rect.left > sidebarRect.right || 
                       rect.bottom < sidebarRect.top || 
                       rect.top > sidebarRect.bottom);
      
      if (overlaps) {
        potentialConflicts.push({
          element: el.tagName + '.' + el.className,
          zIndex: zIndex,
          overlaps: overlaps
        });
      }
    }
  });
  
  console.log('Potential z-index conflicts:', potentialConflicts);
  
  // 7. MANUAL HOVER TEST
  console.log('\n🧪 MANUAL HOVER TEST READY:');
  console.log('Hover over the sidebar icons now...');
  console.log('Watch for:');
  console.log('- Event sequence timing');
  console.log('- Width changes during animation');
  console.log('- Z-index conflicts');
  console.log('- Parent container overflow');
  
  // 8. RESULTS SUMMARY FUNCTION
  window.showHoverDebugSummary = () => {
    console.log('\n📋 HOVER DEBUG SUMMARY:');
    console.log('Recent mouse events:', mouseEvents.slice(-5));
    console.log('Current hover state:', isCurrentlyHovered);
    console.log('Current width:', getComputedStyle(sidebar).width);
    console.log('Potential conflicts:', potentialConflicts.length);
    console.log('Hover rules found:', hoverRules.length);
  };
  
  console.log('\n✅ Comprehensive debugging enabled!');
  console.log('💡 Type "showHoverDebugSummary()" anytime for a summary');
}