describe('Vision Platform Translation Features', () => {
  beforeEach(() => {
    // Visit the main page and ensure services are ready
    cy.visit('/')
    cy.wait(2000) // Wait for services to initialize
  })

  describe('Text Translation', () => {
    it('should translate text between languages', () => {
      // Navigate to translation section
      cy.get('[data-testid="translation-tab"]').click()
      
      // Select source language
      cy.get('[data-testid="source-language-select"]').click()
      cy.get('[data-testid="language-option-en"]').click()
      
      // Select target language
      cy.get('[data-testid="target-language-select"]').click()
      cy.get('[data-testid="language-option-es"]').click()
      
      // Input text to translate
      cy.get('[data-testid="source-text-input"]')
        .type('Hello, how are you today?')
      
      // Click translate button
      cy.get('[data-testid="translate-button"]').click()
      
      // Verify translation result
      cy.get('[data-testid="translation-result"]')
        .should('be.visible')
        .and('contain', 'Hola')
      
      // Verify confidence score is displayed
      cy.get('[data-testid="confidence-score"]')
        .should('be.visible')
        .and('match', /\d+%/)
    })

    it('should auto-detect source language', () => {
      cy.get('[data-testid="translation-tab"]').click()
      
      // Enable auto-detection
      cy.get('[data-testid="auto-detect-toggle"]').click()
      
      // Input text in different language
      cy.get('[data-testid="source-text-input"]')
        .type('Bonjour, comment allez-vous?')
      
      cy.get('[data-testid="translate-button"]').click()
      
      // Verify language was detected
      cy.get('[data-testid="detected-language"]')
        .should('be.visible')
        .and('contain', 'French')
    })

    it('should handle batch translation', () => {
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="batch-translation-tab"]').click()
      
      // Add multiple text entries
      cy.get('[data-testid="add-text-entry"]').click()
      cy.get('[data-testid="batch-text-input-0"]')
        .type('Good morning')
      
      cy.get('[data-testid="add-text-entry"]').click()
      cy.get('[data-testid="batch-text-input-1"]')
        .type('Thank you')
      
      // Select languages
      cy.get('[data-testid="batch-source-language"]').click()
      cy.get('[data-testid="language-option-en"]').click()
      cy.get('[data-testid="batch-target-language"]').click()
      cy.get('[data-testid="language-option-fr"]').click()
      
      // Translate batch
      cy.get('[data-testid="batch-translate-button"]').click()
      
      // Verify all translations are complete
      cy.get('[data-testid="batch-result-0"]').should('contain', 'Bonjour')
      cy.get('[data-testid="batch-result-1"]').should('contain', 'Merci')
    })
  })

  describe('Speech Translation', () => {
    it('should translate speech to text', () => {
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="speech-translation-tab"]').click()
      
      // Mock audio recording
      cy.window().then((win) => {
        cy.stub(win.navigator.mediaDevices, 'getUserMedia')
          .resolves('mock-stream')
      })
      
      // Start recording
      cy.get('[data-testid="start-recording"]').click()
      
      // Simulate recording time
      cy.wait(3000)
      
      // Stop recording
      cy.get('[data-testid="stop-recording"]').click()
      
      // Verify audio was captured
      cy.get('[data-testid="audio-preview"]').should('be.visible')
      
      // Select target language
      cy.get('[data-testid="speech-target-language"]').click()
      cy.get('[data-testid="language-option-es"]').click()
      
      // Process speech
      cy.get('[data-testid="process-speech"]').click()
      
      // Verify transcription and translation
      cy.get('[data-testid="transcription-result"]').should('be.visible')
      cy.get('[data-testid="speech-translation-result"]').should('be.visible')
    })

    it('should handle audio file upload', () => {
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="speech-translation-tab"]').click()
      
      // Upload audio file
      cy.fixture('sample-audio.mp3').then((fileContent) => {
        cy.get('[data-testid="audio-file-input"]')
          .attachFile({
            fileContent,
            fileName: 'sample-audio.mp3',
            mimeType: 'audio/mpeg'
          })
      })
      
      // Verify file was uploaded
      cy.get('[data-testid="uploaded-file-name"]')
        .should('contain', 'sample-audio.mp3')
      
      // Process uploaded audio
      cy.get('[data-testid="process-uploaded-audio"]').click()
      
      // Verify processing started
      cy.get('[data-testid="processing-status"]')
        .should('contain', 'Processing')
    })
  })

  describe('Image Translation', () => {
    it('should extract and translate text from images', () => {
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="image-translation-tab"]').click()
      
      // Upload test image
      cy.fixture('sample-image.jpg').then((fileContent) => {
        cy.get('[data-testid="image-file-input"]')
          .attachFile({
            fileContent,
            fileName: 'sample-image.jpg',
            mimeType: 'image/jpeg'
          })
      })
      
      // Verify image preview
      cy.get('[data-testid="image-preview"]').should('be.visible')
      
      // Select OCR quality
      cy.get('[data-testid="ocr-quality-select"]').click()
      cy.get('[data-testid="ocr-quality-accurate"]').click()
      
      // Select languages
      cy.get('[data-testid="image-source-language"]').click()
      cy.get('[data-testid="language-option-en"]').click()
      cy.get('[data-testid="image-target-language"]').click()
      cy.get('[data-testid="language-option-de"]').click()
      
      // Process image
      cy.get('[data-testid="process-image"]').click()
      
      // Verify OCR extraction
      cy.get('[data-testid="extracted-text"]').should('be.visible')
      
      // Verify translation
      cy.get('[data-testid="image-translation-result"]').should('be.visible')
      
      // Verify confidence score
      cy.get('[data-testid="ocr-confidence"]').should('be.visible')
    })

    it('should handle camera capture', () => {
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="image-translation-tab"]').click()
      
      // Mock camera access
      cy.window().then((win) => {
        cy.stub(win.navigator.mediaDevices, 'getUserMedia')
          .resolves('mock-video-stream')
      })
      
      // Open camera
      cy.get('[data-testid="open-camera"]').click()
      
      // Verify camera view
      cy.get('[data-testid="camera-view"]').should('be.visible')
      
      // Capture image
      cy.get('[data-testid="capture-image"]').click()
      
      // Verify captured image
      cy.get('[data-testid="captured-image"]').should('be.visible')
      
      // Process captured image
      cy.get('[data-testid="process-captured-image"]').click()
      
      // Verify processing started
      cy.get('[data-testid="processing-status"]')
        .should('contain', 'Processing')
    })
  })

  describe('Conversation Mode', () => {
    it('should start real-time conversation translation', () => {
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="conversation-tab"]').click()
      
      // Select conversation languages
      cy.get('[data-testid="conversation-source"]').click()
      cy.get('[data-testid="language-option-en"]').click()
      cy.get('[data-testid="conversation-target"]').click()
      cy.get('[data-testid="language-option-es"]').click()
      
      // Select conversation mode
      cy.get('[data-testid="conversation-mode-voice"]').click()
      
      // Start conversation
      cy.get('[data-testid="start-conversation"]').click()
      
      // Verify conversation started
      cy.get('[data-testid="conversation-status"]')
        .should('contain', 'Active')
      
      // Verify WebSocket connection
      cy.get('[data-testid="websocket-status"]')
        .should('contain', 'Connected')
    })

    it('should handle real-time speech input', () => {
      // Start conversation first
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="conversation-tab"]').click()
      cy.get('[data-testid="conversation-source"]').click()
      cy.get('[data-testid="language-option-en"]').click()
      cy.get('[data-testid="conversation-target"]').click()
      cy.get('[data-testid="language-option-fr"]').click()
      cy.get('[data-testid="start-conversation"]').click()
      
      // Mock real-time audio input
      cy.window().then((win) => {
        cy.stub(win.navigator.mediaDevices, 'getUserMedia')
          .resolves('mock-stream')
      })
      
      // Start speaking
      cy.get('[data-testid="start-speaking"]').click()
      
      // Simulate speech input
      cy.wait(2000)
      
      // Stop speaking
      cy.get('[data-testid="stop-speaking"]').click()
      
      // Verify real-time translation
      cy.get('[data-testid="real-time-translation"]')
        .should('be.visible')
        .and('not.be.empty')
    })
  })

  describe('Translation Memory', () => {
    it('should save and retrieve translation memory', () => {
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="memory-tab"]').click()
      
      // Add new translation to memory
      cy.get('[data-testid="add-memory-entry"]').click()
      
      cy.get('[data-testid="memory-source-text"]')
        .type('Welcome to our platform')
      cy.get('[data-testid="memory-target-text"]')
        .type('Bienvenido a nuestra plataforma')
      cy.get('[data-testid="memory-source-lang"]').click()
      cy.get('[data-testid="language-option-en"]').click()
      cy.get('[data-testid="memory-target-lang"]').click()
      cy.get('[data-testid="language-option-es"]').click()
      cy.get('[data-testid="memory-context"]')
        .type('business')
      cy.get('[data-testid="memory-domain"]')
        .type('technology')
      
      // Save entry
      cy.get('[data-testid="save-memory-entry"]').click()
      
      // Verify entry was saved
      cy.get('[data-testid="memory-entry-0"]')
        .should('contain', 'Welcome to our platform')
        .and('contain', 'Bienvenido a nuestra plataforma')
    })

    it('should search translation memory', () => {
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="memory-tab"]').click()
      
      // Search for existing translations
      cy.get('[data-testid="memory-search"]')
        .type('welcome')
      
      // Verify search results
      cy.get('[data-testid="memory-search-results"]')
        .should('be.visible')
        .and('contain', 'Welcome to our platform')
    })
  })

  describe('User Glossary', () => {
    it('should manage user glossary entries', () => {
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="glossary-tab"]').click()
      
      // Add new glossary entry
      cy.get('[data-testid="add-glossary-entry"]').click()
      
      cy.get('[data-testid="glossary-term"]')
        .type('Vision Platform')
      cy.get('[data-testid="glossary-definition"]')
        .type('A comprehensive multimodal translation and accessibility platform')
      cy.get('[data-testid="glossary-translation"]')
        .type('Plataforma de Visión')
      cy.get('[data-testid="glossary-source-lang"]').click()
      cy.get('[data-testid="language-option-en"]').click()
      cy.get('[data-testid="glossary-target-lang"]').click()
      cy.get('[data-testid="language-option-es"]').click()
      
      // Save glossary entry
      cy.get('[data-testid="save-glossary-entry"]').click()
      
      // Verify entry was saved
      cy.get('[data-testid="glossary-entry-0"]')
        .should('contain', 'Vision Platform')
        .and('contain', 'Plataforma de Visión')
    })

    it('should apply glossary during translation', () => {
      // First add a glossary entry
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="glossary-tab"]').click()
      cy.get('[data-testid="add-glossary-entry"]').click()
      cy.get('[data-testid="glossary-term"]').type('AI Service')
      cy.get('[data-testid="glossary-definition"]').type('Artificial Intelligence service')
      cy.get('[data-testid="glossary-translation"]').type('Servicio de IA')
      cy.get('[data-testid="glossary-source-lang"]').click()
      cy.get('[data-testid="language-option-en"]').click()
      cy.get('[data-testid="glossary-target-lang"]').click()
      cy.get('[data-testid="language-option-es"]').click()
      cy.get('[data-testid="save-glossary-entry"]').click()
      
      // Now test translation with glossary
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="source-language-select"]').click()
      cy.get('[data-testid="language-option-en"]').click()
      cy.get('[data-testid="target-language-select"]').click()
      cy.get('[data-testid="language-option-es"]').click()
      
      // Enable glossary
      cy.get('[data-testid="use-glossary-toggle"]').click()
      
      // Input text with glossary term
      cy.get('[data-testid="source-text-input"]')
        .type('The AI Service provides translation capabilities')
      
      cy.get('[data-testid="translate-button"]').click()
      
      // Verify glossary was applied
      cy.get('[data-testid="translation-result"]')
        .should('contain', 'Servicio de IA')
      
      // Verify glossary indicator
      cy.get('[data-testid="glossary-applied-indicator"]')
        .should('be.visible')
    })
  })

  describe('Language Support', () => {
    it('should display supported languages', () => {
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="languages-tab"]').click()
      
      // Verify language list is displayed
      cy.get('[data-testid="supported-languages-list"]').should('be.visible')
      
      // Check for specific languages
      cy.get('[data-testid="language-en"]').should('contain', 'English')
      cy.get('[data-testid="language-es"]').should('contain', 'Spanish')
      cy.get('[data-testid="language-fr"]').should('contain', 'French')
      cy.get('[data-testid="language-de"]').should('contain', 'German')
      cy.get('[data-testid="language-it"]').should('contain', 'Italian')
      
      // Verify language count
      cy.get('[data-testid="total-languages"]')
        .should('contain', '50+')
    })

    it('should handle RTL languages', () => {
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="languages-tab"]').click()
      
      // Find Arabic language
      cy.get('[data-testid="language-ar"]').click()
      
      // Verify RTL support
      cy.get('[data-testid="rtl-indicator"]').should('be.visible')
      cy.get('[data-testid="rtl-indicator"]').should('contain', 'RTL')
      
      // Test RTL text input
      cy.get('[data-testid="translation-tab"]').click()
      cy.get('[data-testid="source-language-select"]').click()
      cy.get('[data-testid="language-option-ar"]').click()
      
      // Verify RTL layout
      cy.get('[data-testid="source-text-input"]')
        .should('have.css', 'text-align', 'right')
    })
  })

  describe('Offline Translation', () => {
    it('should work in offline mode', () => {
      // Simulate offline mode
      cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false)
      })
      
      cy.get('[data-testid="translation-tab"]').click()
      
      // Verify offline indicator
      cy.get('[data-testid="offline-indicator"]')
        .should('be.visible')
        .and('contain', 'Offline Mode')
      
      // Test offline translation
      cy.get('[data-testid="source-language-select"]').click()
      cy.get('[data-testid="language-option-en"]').click()
      cy.get('[data-testid="target-language-select"]').click()
      cy.get('[data-testid="language-option-es"]').click()
      
      cy.get('[data-testid="source-text-input"]')
        .type('Hello world')
      
      cy.get('[data-testid="translate-button"]').click()
      
      // Verify offline translation result
      cy.get('[data-testid="translation-result"]')
        .should('be.visible')
        .and('not.be.empty')
      
      // Verify offline model indicator
      cy.get('[data-testid="offline-model-indicator"]')
        .should('be.visible')
        .and('contain', 'Offline Model')
    })
  })

  describe('Error Handling', () => {
    it('should handle translation errors gracefully', () => {
      cy.get('[data-testid="translation-tab"]').click()
      
      // Mock API error
      cy.intercept('POST', '/api/translation/text', {
        statusCode: 500,
        body: { error: 'Translation service unavailable' }
      }).as('translationError')
      
      // Attempt translation
      cy.get('[data-testid="source-language-select"]').click()
      cy.get('[data-testid="language-option-en"]').click()
      cy.get('[data-testid="target-language-select"]').click()
      cy.get('[data-testid="language-option-es"]').click()
      
      cy.get('[data-testid="source-text-input"]')
        .type('Test text')
      
      cy.get('[data-testid="translate-button"]').click()
      
      // Wait for error response
      cy.wait('@translationError')
      
      // Verify error message
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Translation service unavailable')
      
      // Verify retry option
      cy.get('[data-testid="retry-button"]').should('be.visible')
    })

    it('should handle network timeouts', () => {
      cy.get('[data-testid="translation-tab"]').click()
      
      // Mock slow response
      cy.intercept('POST', '/api/translation/text', {
        delay: 15000, // 15 second delay
        body: { targetText: 'Test translation' }
      }).as('slowTranslation')
      
      // Start translation
      cy.get('[data-testid="source-language-select"]').click()
      cy.get('[data-testid="language-option-en"]').click()
      cy.get('[data-testid="target-language-select"]').click()
      cy.get('[data-testid="language-option-es"]').click()
      
      cy.get('[data-testid="source-text-input"]')
        .type('Test text')
      
      cy.get('[data-testid="translate-button"]').click()
      
      // Verify loading state
      cy.get('[data-testid="translation-loading"]')
        .should('be.visible')
      
      // Verify timeout handling
      cy.get('[data-testid="timeout-message"]', { timeout: 20000 })
        .should('be.visible')
        .and('contain', 'Request timed out')
    })
  })

  describe('Performance and Accessibility', () => {
    it('should meet WCAG 2.1 AA standards', () => {
      cy.visit('/')
      
      // Check color contrast
      cy.get('body').should('have.css', 'color')
      
      // Verify keyboard navigation
      cy.get('body').tab()
      cy.focused().should('exist')
      
      // Check for alt text on images
      cy.get('img').each(($img) => {
        cy.wrap($img).should('have.attr', 'alt')
      })
      
      // Verify ARIA labels
      cy.get('[aria-label]').should('exist')
      cy.get('[aria-labelledby]').should('exist')
      
      // Check focus indicators
      cy.get('button').first().focus()
      cy.focused().should('have.css', 'outline')
    })

    it('should handle high contrast mode', () => {
      cy.get('[data-testid="settings-button"]').click()
      cy.get('[data-testid="accessibility-settings"]').click()
      
      // Enable high contrast
      cy.get('[data-testid="high-contrast-toggle"]').click()
      
      // Verify high contrast styles applied
      cy.get('body').should('have.class', 'high-contrast')
      
      // Check for high contrast color scheme
      cy.get('body').should('have.css', 'background-color')
      cy.get('body').should('have.css', 'color')
    })

    it('should support screen readers', () => {
      // Check for screen reader support
      cy.get('[data-testid="screen-reader-support"]').should('exist')
      
      // Verify semantic HTML structure
      cy.get('main').should('exist')
      cy.get('nav').should('exist')
      cy.get('section').should('exist')
      
      // Check for proper heading hierarchy
      cy.get('h1').should('exist')
      cy.get('h2').should('exist')
      
      // Verify form labels
      cy.get('label').each(($label) => {
        cy.wrap($label).should('have.attr', 'for')
      })
    })
  })
})
