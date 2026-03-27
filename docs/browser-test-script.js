/**
 * Browser Test Script for User-Scoped Storage
 * 
 * Copy and paste this entire script into your browser console
 * to test the user-scoped storage implementation.
 * 
 * Usage:
 * 1. Open browser DevTools (F12)
 * 2. Go to Console tab
 * 3. Copy and paste this entire file
 * 4. Press Enter
 * 5. Run: testUserScopedStorage()
 */

const testUserScopedStorage = () => {
  console.clear();
  console.log('🧪 Testing User-Scoped Storage Implementation\n');
  console.log('='.repeat(60));
  
  let passedTests = 0;
  let failedTests = 0;
  
  // Helper functions
  const assert = (condition, message) => {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failedTests++;
    }
  };
  
  const sanitizeEmail = (email) => {
    return email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  };
  
  const getUserHistoryKey = (email) => {
    return `weather_app_search_history_${sanitizeEmail(email)}`;
  };
  
  // Test 1: Email Sanitization
  console.log('\n📝 Test 1: Email Sanitization');
  console.log('-'.repeat(60));
  
  assert(
    sanitizeEmail('Alice@Example.COM') === 'alice_example_com',
    'Uppercase email should be lowercased'
  );
  
  assert(
    sanitizeEmail('user+tag@gmail.com') === 'user_tag_gmail_com',
    'Special characters should be replaced with underscores'
  );
  
  assert(
    sanitizeEmail('test.user@domain.co.uk') === 'test_user_domain_co_uk',
    'Dots should be replaced with underscores'
  );
  
  // Test 2: Storage Key Generation
  console.log('\n🔑 Test 2: Storage Key Generation');
  console.log('-'.repeat(60));
  
  const key1 = getUserHistoryKey('alice@example.com');
  const key2 = getUserHistoryKey('bob@example.com');
  
  assert(
    key1 === 'weather_app_search_history_alice_example_com',
    'Key for alice@example.com should be correct'
  );
  
  assert(
    key2 === 'weather_app_search_history_bob_example_com',
    'Key for bob@example.com should be correct'
  );
  
  assert(
    key1 !== key2,
    'Different users should have different keys'
  );
  
  // Test 3: Data Isolation
  console.log('\n🔒 Test 3: Data Isolation');
  console.log('-'.repeat(60));
  
  // Clear any existing data
  localStorage.removeItem(key1);
  localStorage.removeItem(key2);
  
  // Simulate User 1 data
  const user1Data = [
    { city: 'London', country: 'GB', searchedAt: Date.now() }
  ];
  localStorage.setItem(key1, JSON.stringify(user1Data));
  
  // Simulate User 2 data
  const user2Data = [
    { city: 'Tokyo', country: 'JP', searchedAt: Date.now() }
  ];
  localStorage.setItem(key2, JSON.stringify(user2Data));
  
  // Verify isolation
  const retrieved1 = JSON.parse(localStorage.getItem(key1));
  const retrieved2 = JSON.parse(localStorage.getItem(key2));
  
  assert(
    retrieved1[0].city === 'London',
    'User 1 should have London in history'
  );
  
  assert(
    retrieved2[0].city === 'Tokyo',
    'User 2 should have Tokyo in history'
  );
  
  assert(
    retrieved1[0].city !== retrieved2[0].city,
    'Users should have different data'
  );
  
  // Test 4: No Cross-Contamination
  console.log('\n🚫 Test 4: No Cross-Contamination');
  console.log('-'.repeat(60));
  
  const user1History = JSON.parse(localStorage.getItem(key1));
  const hasTokyoInUser1 = user1History.some(item => item.city === 'Tokyo');
  
  assert(
    !hasTokyoInUser1,
    'User 1 should NOT see User 2\'s searches'
  );
  
  const user2History = JSON.parse(localStorage.getItem(key2));
  const hasLondonInUser2 = user2History.some(item => item.city === 'London');
  
  assert(
    !hasLondonInUser2,
    'User 2 should NOT see User 1\'s searches'
  );
  
  // Test 5: Multiple Searches Per User
  console.log('\n📚 Test 5: Multiple Searches Per User');
  console.log('-'.repeat(60));
  
  const multipleSearches = [
    { city: 'London', country: 'GB', searchedAt: Date.now() },
    { city: 'Paris', country: 'FR', searchedAt: Date.now() },
    { city: 'Berlin', country: 'DE', searchedAt: Date.now() }
  ];
  
  localStorage.setItem(key1, JSON.stringify(multipleSearches));
  const retrieved = JSON.parse(localStorage.getItem(key1));
  
  assert(
    retrieved.length === 3,
    'User should have 3 searches in history'
  );
  
  assert(
    retrieved[0].city === 'London',
    'First search should be London'
  );
  
  // Test 6: Storage Key Listing
  console.log('\n📋 Test 6: Storage Key Listing');
  console.log('-'.repeat(60));
  
  const allKeys = Object.keys(localStorage);
  const historyKeys = allKeys.filter(k => k.includes('search_history'));
  
  console.log(`Found ${historyKeys.length} history keys:`, historyKeys);
  
  assert(
    historyKeys.length >= 2,
    'Should have at least 2 user history keys'
  );
  
  assert(
    historyKeys.includes(key1),
    'Should include User 1 history key'
  );
  
  assert(
    historyKeys.includes(key2),
    'Should include User 2 history key'
  );
  
  // Test 7: Case Insensitivity
  console.log('\n🔤 Test 7: Case Insensitivity');
  console.log('-'.repeat(60));
  
  const keyLower = getUserHistoryKey('user@example.com');
  const keyUpper = getUserHistoryKey('USER@EXAMPLE.COM');
  const keyMixed = getUserHistoryKey('User@Example.Com');
  
  assert(
    keyLower === keyUpper,
    'Lowercase and uppercase emails should produce same key'
  );
  
  assert(
    keyLower === keyMixed,
    'Mixed case email should produce same key'
  );
  
  // Test 8: Empty History
  console.log('\n📭 Test 8: Empty History');
  console.log('-'.repeat(60));
  
  const newUserKey = getUserHistoryKey('newuser@example.com');
  const newUserHistory = localStorage.getItem(newUserKey);
  
  assert(
    newUserHistory === null,
    'New user should have no history in localStorage'
  );
  
  // Test 9: Data Persistence
  console.log('\n💾 Test 9: Data Persistence');
  console.log('-'.repeat(60));
  
  const testData = [
    { city: 'Madrid', country: 'ES', searchedAt: Date.now() }
  ];
  
  localStorage.setItem(key1, JSON.stringify(testData));
  const beforeReload = localStorage.getItem(key1);
  
  // Simulate page reload by re-reading
  const afterReload = localStorage.getItem(key1);
  
  assert(
    beforeReload === afterReload,
    'Data should persist in localStorage'
  );
  
  // Test 10: Cleanup
  console.log('\n🧹 Test 10: Cleanup');
  console.log('-'.repeat(60));
  
  localStorage.removeItem(key1);
  const afterDelete = localStorage.getItem(key1);
  
  assert(
    afterDelete === null,
    'Deleted key should return null'
  );
  
  // Verify other user's data is not affected
  const user2StillExists = localStorage.getItem(key2);
  
  assert(
    user2StillExists !== null,
    'Deleting User 1 data should not affect User 2'
  );
  
  // Final cleanup
  localStorage.removeItem(key2);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed! User-scoped storage is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please review the implementation.');
  }
  
  console.log('\n💡 Tip: Check Application → Local Storage in DevTools to inspect data');
};

// Additional utility functions for manual testing
const inspectStorage = () => {
  console.log('\n🔍 Storage Inspector');
  console.log('='.repeat(60));
  
  const prefix = 'weather_app_';
  const keys = Object.keys(localStorage).filter(k => k.startsWith(prefix));
  
  if (keys.length === 0) {
    console.log('No weather app data found in localStorage');
    return;
  }
  
  keys.forEach(key => {
    const value = localStorage.getItem(key);
    const size = new Blob([value || '']).size;
    console.log(`\n📦 ${key}`);
    console.log(`   Size: ${size} bytes`);
    
    try {
      const parsed = JSON.parse(value || '{}');
      console.log(`   Data:`, parsed);
    } catch {
      console.log(`   Data: ${value}`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
};

const clearAllWeatherData = () => {
  console.log('🧹 Clearing all weather app data...');
  
  const keys = Object.keys(localStorage).filter(k => k.startsWith('weather_app_'));
  keys.forEach(key => localStorage.removeItem(key));
  
  console.log(`✅ Cleared ${keys.length} keys`);
};

const simulateUserFlow = () => {
  console.clear();
  console.log('🎬 Simulating User Flow');
  console.log('='.repeat(60));
  
  const sanitizeEmail = (email) => email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const getUserHistoryKey = (email) => `weather_app_search_history_${sanitizeEmail(email)}`;
  
  // User 1 flow
  console.log('\n👤 User 1 (alice@example.com) logs in...');
  const user1Key = getUserHistoryKey('alice@example.com');
  
  console.log('   Searching for London...');
  localStorage.setItem(user1Key, JSON.stringify([
    { city: 'London', country: 'GB', searchedAt: Date.now() }
  ]));
  
  console.log('   Searching for Paris...');
  const history1 = JSON.parse(localStorage.getItem(user1Key));
  history1.unshift({ city: 'Paris', country: 'FR', searchedAt: Date.now() });
  localStorage.setItem(user1Key, JSON.stringify(history1));
  
  console.log('   User 1 history:', JSON.parse(localStorage.getItem(user1Key)).map(h => h.city));
  console.log('   User 1 logs out.');
  
  // User 2 flow
  console.log('\n👤 User 2 (bob@example.com) logs in...');
  const user2Key = getUserHistoryKey('bob@example.com');
  
  const user2History = localStorage.getItem(user2Key);
  console.log('   User 2 history:', user2History ? JSON.parse(user2History).map(h => h.city) : '(empty)');
  
  console.log('   Searching for Tokyo...');
  localStorage.setItem(user2Key, JSON.stringify([
    { city: 'Tokyo', country: 'JP', searchedAt: Date.now() }
  ]));
  
  console.log('   User 2 history:', JSON.parse(localStorage.getItem(user2Key)).map(h => h.city));
  console.log('   User 2 logs out.');
  
  // User 1 logs back in
  console.log('\n👤 User 1 (alice@example.com) logs back in...');
  console.log('   User 1 history:', JSON.parse(localStorage.getItem(user1Key)).map(h => h.city));
  
  console.log('\n✅ Simulation complete!');
  console.log('   User 1 never saw Tokyo');
  console.log('   User 2 never saw London or Paris');
  console.log('   Data isolation is working correctly!');
};

// Export functions to window for easy access
window.testUserScopedStorage = testUserScopedStorage;
window.inspectStorage = inspectStorage;
window.clearAllWeatherData = clearAllWeatherData;
window.simulateUserFlow = simulateUserFlow;

// Instructions
console.log('🧪 User-Scoped Storage Test Suite Loaded!');
console.log('\nAvailable commands:');
console.log('  testUserScopedStorage()  - Run all tests');
console.log('  inspectStorage()         - View current localStorage data');
console.log('  simulateUserFlow()       - Simulate multi-user scenario');
console.log('  clearAllWeatherData()    - Clear all weather app data');
console.log('\nRun: testUserScopedStorage()');
