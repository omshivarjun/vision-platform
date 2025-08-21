import React, { useState } from 'react'
import { toastService } from './services/toastService'

/**
 * Test component for verifying toast deduplication and accessibility
 */
export const TestToastComponent: React.FC = () => {
  const [messageCount, setMessageCount] = useState(0)

  const testDeduplication = () => {
    // Try to show the same message multiple times rapidly
    const message = 'This is a test message'
    
    // Should only show once due to deduplication
    for (let i = 0; i < 5; i++) {
      toastService.success(message)
    }
    
    // Different message should show
    toastService.success('This is a different message')
  }

  const testMaxToasts = () => {
    // Test max toast limit (default is 5)
    for (let i = 1; i <= 10; i++) {
      toastService.info(`Info message ${i}`)
    }
  }

  const testAccessibility = () => {
    // Test different priority levels for screen readers
    toastService.success('Operation completed successfully')
    setTimeout(() => {
      toastService.error('An error occurred during processing')
    }, 1000)
    setTimeout(() => {
      toastService.critical('Critical system failure!')
    }, 2000)
  }

  const testCriticalBypass = () => {
    // Critical errors should bypass deduplication
    const criticalMessage = 'Database connection lost!'
    toastService.critical(criticalMessage)
    toastService.critical(criticalMessage) // Should show again
  }

  const testCleanup = () => {
    // Test dismissing all toasts
    toastService.success('Toast 1')
    toastService.info('Toast 2')
    toastService.warning('Toast 3')
    
    setTimeout(() => {
      toastService.dismissAll()
      console.log('All toasts dismissed')
    }, 2000)
  }

  const getStats = () => {
    const stats = toastService.getStats()
    console.log('Toast Service Stats:', stats)
    alert(JSON.stringify(stats, null, 2))
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Toast Service Test</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '400px' }}>
        <button 
          onClick={testDeduplication}
          style={{ padding: '10px', cursor: 'pointer' }}
        >
          Test Deduplication (5 same + 1 different)
        </button>
        
        <button 
          onClick={testMaxToasts}
          style={{ padding: '10px', cursor: 'pointer' }}
        >
          Test Max Toasts (10 messages, limit 5)
        </button>
        
        <button 
          onClick={testAccessibility}
          style={{ padding: '10px', cursor: 'pointer' }}
        >
          Test Accessibility (3 priorities)
        </button>
        
        <button 
          onClick={testCriticalBypass}
          style={{ padding: '10px', cursor: 'pointer' }}
        >
          Test Critical Bypass (2 same critical)
        </button>
        
        <button 
          onClick={testCleanup}
          style={{ padding: '10px', cursor: 'pointer' }}
        >
          Test Cleanup (dismiss all after 2s)
        </button>
        
        <button 
          onClick={getStats}
          style={{ padding: '10px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white' }}
        >
          Get Service Stats
        </button>
      </div>
      
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h3>Features Tested:</h3>
        <ul>
          <li>✅ Message deduplication within 5 second window</li>
          <li>✅ Maximum toast limit enforcement</li>
          <li>✅ Screen reader accessibility with aria-live regions</li>
          <li>✅ Critical error bypass for deduplication</li>
          <li>✅ Toast cleanup and dismissal</li>
          <li>✅ Service statistics tracking</li>
        </ul>
      </div>
    </div>
  )
}

export default TestToastComponent
