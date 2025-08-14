// Temporary authentication token setter for testing
// Run this in browser console to set authentication token

// Set the authentication token
localStorage.setItem('auth_token', '72|Qi3AwUU26U7wO3TdYAsiQlYlbaO6AqL0tAzTK18Ie2f61ed8');

// Verify token is set
console.log('🔑 Auth token set:', localStorage.getItem('auth_token'));

// Reload page to apply authentication
window.location.reload();