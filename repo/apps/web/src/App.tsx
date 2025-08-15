@@ .. @@
 import { GeminiAssistantPage } from './pages/GeminiAssistantPage'
 import { DocumentReaderPage } from './pages/DocumentReaderPage'
 import { VoiceAssistantPage } from './pages/VoiceAssistantPage'
 import AnalyticsPage from './pages/AnalyticsPage'
 import LoginPage from './pages/LoginPage'
+import PaymentPage from './pages/PaymentPage'

 // Create Query Client for data fetching
@@ .. @@
             <Route path="/voice-assistant" element={<VoiceAssistantPage />} />
             <Route path="/analytics" element={<AnalyticsPage />} />
             <Route path="/login" element={<LoginPage />} />
+            <Route path="/payment" element={<PaymentPage />} />
+            <Route path="/pricing" element={<PaymentPage />} />
           </Routes>
         </main>
@@ .. @@