require('dotenv').config();
const authService = require('./src/services/authService');

console.log('Testing Microsoft OAuth Configuration...\n');

// Check OAuth status
const status = authService.getOAuthStatus();

console.log('OAuth Configuration Status:');
console.log('- Microsoft OAuth:', status.microsoft.configured ? '✓ Configured' : '✗ Not configured');
if (status.microsoft.configured) {
  console.log('  - Client ID:', status.microsoft.clientId);
  console.log('  - Callback URL:', status.microsoft.callbackUrl);
}
console.log('- JWT:', status.jwt.configured ? '✓ Configured' : '✗ Not configured');
if (status.jwt.configured) {
  console.log('  - Access Token Expiry:', status.jwt.expiresIn);
  console.log('  - Refresh Token Expiry:', status.jwt.refreshExpiresIn);
}

// Test OAuth URL generation
if (!process.env.MICROSOFT_CLIENT_ID) {
  console.log('\n⚠️  Microsoft OAuth not configured. Set these environment variables:');
  console.log('  - MICROSOFT_CLIENT_ID');
  console.log('  - MICROSOFT_CLIENT_SECRET');
  console.log('  - OAUTH_CALLBACK_URL');
} else {
  try {
    const oauthUrl = authService.getMicrosoftOAuthUrl('test-state');
    console.log('\n✓ Microsoft OAuth URL generated successfully');
    console.log('OAuth URL:', oauthUrl);
  } catch (error) {
    console.error('\n✗ Failed to generate OAuth URL:', error.message);
  }
}

// Test JWT token generation
try {
  const testUser = {
    id: 'test-user-123',
    email: 'test@example.com',
    name: 'Test User',
    subscription: { plan: 'free' }
  };
  
  const accessToken = authService.generateAccessToken(testUser);
  const refreshToken = authService.generateRefreshToken(testUser);
  
  console.log('\n✓ JWT tokens generated successfully');
  
  // Verify tokens
  const decodedAccess = authService.verifyAccessToken(accessToken);
  const decodedRefresh = authService.verifyRefreshToken(refreshToken);
  
  console.log('✓ JWT tokens verified successfully');
  console.log('  - Access token user ID:', decodedAccess.id);
  console.log('  - Refresh token user ID:', decodedRefresh.id);
} catch (error) {
  console.error('\n✗ JWT token test failed:', error.message);
}

console.log('\nOAuth test complete!');
