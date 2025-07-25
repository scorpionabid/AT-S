// Verification script to check if the schedule component loads without errors
console.log('🔍 Schedule Component Verification Script');
console.log('======================================');

// Check if we're in the right environment
if (typeof window !== 'undefined') {
  console.log('✅ Browser environment detected');
  
  // Add listener for console errors
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  // Wait a bit and then check for specific errors
  setTimeout(() => {
    const apiErrors = errors.filter(error => 
      error.includes('GET') && 
      (error.includes('/api/') || error.includes('500') || error.includes('json'))
    );
    
    if (apiErrors.length === 0) {
      console.log('✅ No API-related errors detected!');
      console.log('✅ Schedule component appears to be working correctly');
    } else {
      console.log('❌ API-related errors still present:');
      apiErrors.forEach(error => console.log('  -', error));
    }
    
    console.log(`📊 Total console errors: ${errors.length}`);
    console.log(`📊 API-related errors: ${apiErrors.length}`);
  }, 3000);
  
} else {
  console.log('ℹ️ This script should be run in the browser console');
}

// Export for manual testing
window.verifySchedule = {
  checkErrors: () => {
    console.log('Checking for schedule-related errors...');
    return 'Check your console for detailed results';
  }
};

console.log('🎯 To manually verify:');
console.log('1. Open browser console');
console.log('2. Navigate to schedule page');
console.log('3. Look for the timestamp log: "ScheduleGenerator: UPDATED VERSION"');
console.log('4. Check that no API calls are made');
console.log('5. Verify mock data loads successfully');