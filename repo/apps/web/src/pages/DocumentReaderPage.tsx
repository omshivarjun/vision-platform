@@ .. @@
 import React, { useState, useRef } from 'react'
 import { motion } from 'framer-motion'
+import { useDropzone } from 'react-dropzone'
+import { useDocumentReader } from '../hooks/useDocumentReader'
 import { 
   DocumentArrowUpIcon,
   DocumentTextIcon,
   PlayIcon,
   PauseIcon,
   SpeakerWaveIcon,
-  SpeakerXMarkIcon
+  SpeakerXMarkIcon,
+  ArrowUpTrayIcon,
+  DocumentIcon,
+  ExclamationTriangleIcon
 } from '@heroicons/react/24/outline'
 import toast from 'react-hot-toast'

 export function DocumentReaderPage() {
-  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
-  const [isReading, setIsReading] = useState(false)
-  const [isProcessing, setIsProcessing] = useState(false)
   const [readingSpeed, setReadingSpeed] = useState(1)
-  const [documentText, setDocumentText] = useState('')
+  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
+  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])

-  const fileInputRef = useRef<HTMLInputElement>(null)
-  const synthesisRef = useRef<SpeechSynthesis | null>(null)
+  const {
+    documentContent,
+    isProcessing,
+    error,
+    processDocument,
+    clearDocument,
+    readAloud,
+    stopReading,
+    isReading,
+  } = useDocumentReader()

   React.useEffect(() => {
-    synthesisRef.current = window.speechSynthesis
-    setDocumentText('Welcome to the Vision Platform Document Reader. This AI-powered tool can read PDFs, Word documents, and other text files aloud with natural voice synthesis. Simply upload a document and click the play button to start reading.')
+    // Load available voices
+    const loadVoices = () => {
+      const voices = speechSynthesis.getVoices()
+      setAvailableVoices(voices)
+      
+      // Set default voice (prefer English voices)
+      const englishVoice = voices.find(voice => voice.lang.startsWith('en'))
+      setSelectedVoice(englishVoice || voices[0] || null)
+    }
+
+    loadVoices()
+    speechSynthesis.onvoiceschanged = loadVoices
   }, [])

-  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
-    const file = event.target.files?.[0]
-    if (!file) return
-
-    setIsProcessing(true)
-    setUploadedFile(file)
-
-    try {
-      await new Promise(resolve => setTimeout(resolve, 2000))
-      setDocumentText('Document processed successfully! This is a sample text that demonstrates the document reading capabilities. The system can handle various file formats and provide natural-sounding speech synthesis.')
-      toast.success(`Successfully processed ${file.name}`)
-    } catch (error) {
-      toast.error('Error processing document. Please try again.')
-    } finally {
-      setIsProcessing(false)
+  const onDrop = useCallback((acceptedFiles: File[]) => {
+    const file = acceptedFiles[0]
+    if (file) {
+      processDocument(file)
     }
-  }
+  }, [processDocument])

+  const { getRootProps, getInputProps, isDragActive } = useDropzone({
+    onDrop,
+    accept: {
+      'application/pdf': ['.pdf'],
+      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
+      'application/msword': ['.doc'],
+      'text/plain': ['.txt'],
+    },
+    maxFiles: 1,
+    maxSize: 10 * 1024 * 1024, // 10MB
+  })

   const startReading = () => {
-    if (!synthesisRef.current || !documentText) return
-
-    synthesisRef.current.cancel()
-    const utterance = new SpeechSynthesisUtterance(documentText)
-    utterance.rate = readingSpeed
-    utterance.volume = 1
-
-    utterance.onstart = () => {
-      setIsReading(true)
-      toast.success('Started reading document')
+    if (!documentContent?.text) {
+      toast.error('No document loaded to read')
+      return
     }

-    utterance.onend = () => {
-      setIsReading(false)
-    }
-
-    synthesisRef.current.speak(utterance)
+    readAloud(documentContent.text, {
+      rate: readingSpeed,
+      voice: selectedVoice,
+    })
   }

-  const stopReading = () => {
-    if (synthesisRef.current) {
-      synthesisRef.current.cancel()
-      setIsReading(false)
-    }
-  }
+  const formatFileSize = (bytes: number) => {
+    if (bytes === 0) return '0 Bytes'
+    const k = 1024
+    const sizes = ['Bytes', 'KB', 'MB', 'GB']
+    const i = Math.floor(Math.log(bytes) / Math.log(k))
+    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
+  }

   return (
@@ .. @@
             <motion.div
               initial={{ x: -50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ duration: 0.5 }}
               className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
             >
               <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                 <DocumentArrowUpIcon className="w-5 h-5 mr-2 text-green-600" />
                 Upload Document
               </h2>
               
-              <div className="space-y-4">
-                <input
-                  ref={fileInputRef}
-                  type="file"
-                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
-                  onChange={handleFileUpload}
-                  className="hidden"
-                />
-                
-                <button
-                  onClick={() => fileInputRef.current?.click()}
-                  disabled={isProcessing}
-                  className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-blue-600 text-white rounded-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50"
-                >
-                  {isProcessing ? 'Processing...' : 'Choose File'}
-                </button>
-                
-                {uploadedFile && (
-                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
-                    <p className="text-sm text-green-800 dark:text-green-200">
-                      📄 {uploadedFile.name}
-                    </p>
-                  </div>
-                )}
+              <div className="space-y-6">
+                {/* File Upload Area */}
+                <div
+                  {...getRootProps()}
+                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
+                    isDragActive
+                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
+                      : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
+                  }`}
+                >
+                  <input {...getInputProps()} />
+                  <ArrowUpTrayIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
+                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
+                    {isDragActive ? 'Drop your document here' : 'Upload Document'}
+                  </p>
+                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
+                    Drag and drop or click to select
+                  </p>
+                  <p className="text-xs text-gray-500 dark:text-gray-400">
+                    Supports PDF, DOCX, DOC, TXT files up to 10MB
+                  </p>
+                </div>

+                {/* Document Info */}
+                {documentContent && (
+                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
+                    <div className="flex items-start justify-between">
+                      <div className="flex items-center">
+                        <DocumentIcon className="w-5 h-5 text-green-600 mr-2" />
+                        <div>
+                          <p className="text-sm font-medium text-green-800 dark:text-green-200">
+                            {documentContent.metadata?.title || 'Document'}
+                          </p>
+                          <p className="text-xs text-green-600 dark:text-green-300">
+                            {documentContent.metadata?.pageCount} page(s) • {' '}
+                            {documentContent.metadata?.fileSize && formatFileSize(documentContent.metadata.fileSize)} • {' '}
+                            {documentContent.text.split(' ').length} words
+                          </p>
+                        </div>
+                      </div>
+                      <button
+                        onClick={clearDocument}
+                        className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
+                      >
+                        ✕
+                      </button>
+                    </div>
+                  </div>
+                )}

+                {/* Error Display */}
+                {error && (
+                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
+                    <div className="flex items-center">
+                      <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
+                      <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
+                    </div>
+                  </div>
+                )}
               </div>
             </motion.div>

             {/* Reading Controls */}
             <motion.div
               initial={{ x: -50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ duration: 0.5, delay: 0.1 }}
               className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
             >
               <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                 <SpeakerWaveIcon className="w-5 h-5 mr-2 text-blue-600" />
                 Reading Controls
               </h3>
               
               <div className="space-y-4">
                 <button
                   onClick={isReading ? stopReading : startReading}
-                  disabled={!documentText}
+                  disabled={!documentContent?.text || isProcessing}
                   className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                 >
                   {isReading ? (
                     <>
                       <PauseIcon className="w-4 h-4 mr-2" />
                       Pause Reading
                     </>
                   ) : (
                     <>
                       <PlayIcon className="w-4 h-4 mr-2" />
-                      Start Reading
+                      {documentContent ? 'Start Reading' : 'Upload Document First'}
                     </>
                   )}
                 </button>
                 
+                {/* Voice Selection */}
+                <div>
+                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
+                    Voice: {selectedVoice?.name || 'Default'}
+                  </label>
+                  <select
+                    value={selectedVoice?.name || ''}
+                    onChange={(e) => {
+                      const voice = availableVoices.find(v => v.name === e.target.value)
+                      setSelectedVoice(voice || null)
+                    }}
+                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
+                  >
+                    {availableVoices.map((voice) => (
+                      <option key={voice.name} value={voice.name}>
+                        {voice.name} ({voice.lang})
+                      </option>
+                    ))}
+                  </select>
+                </div>
+
                 <div>
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                     Reading Speed: {readingSpeed}x
                   </label>
                   <input
                     type="range"
                     min="0.5"
                     max="2"
                     step="0.1"
                     value={readingSpeed}
                     onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                     className="w-full"
                   />
                 </div>
               </div>
             </motion.div>
           </div>

           {/* Document Content */}
           <div className="lg:col-span-2">
             <motion.div
               initial={{ x: 50, opacity: 0 }}
               animate={{ x: 0, opacity: 1 }}
               transition={{ duration: 0.5 }}
-              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl h-[500px] flex flex-col"
+              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl min-h-[500px] flex flex-col"
             >
               <div className="p-6 border-b border-gray-200 dark:border-gray-700">
-                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
-                  Document Content
-                </h3>
+                <div className="flex items-center justify-between">
+                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
+                    Document Content
+                  </h3>
+                  {documentContent && (
+                    <div className="text-sm text-gray-600 dark:text-gray-400">
+                      {documentContent.metadata?.pageCount} page(s) • {documentContent.text.split(' ').length} words
+                    </div>
+                  )}
+                </div>
               </div>

-              <div className="flex-1 overflow-y-auto p-6">
-                <div className="prose prose-lg max-w-none dark:prose-invert">
-                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
-                    {documentText}
-                  </p>
+              <div className="flex-1 overflow-y-auto p-6 min-h-[400px]">
+                {isProcessing ? (
+                  <div className="flex items-center justify-center h-full">
+                    <div className="text-center">
+                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
+                      <p className="text-gray-600 dark:text-gray-400">Processing document...</p>
+                    </div>
+                  </div>
+                ) : documentContent ? (
+                  <div className="prose prose-lg max-w-none dark:prose-invert">
+                    {documentContent.pages ? (
+                      /* Multi-page document */
+                      documentContent.pages.map((pageText, index) => (
+                        <div key={index} className="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
+                          <div className="flex items-center justify-between mb-4">
+                            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">
+                              Page {index + 1}
+                            </h4>
+                            <button
+                              onClick={() => readAloud(pageText, { rate: readingSpeed, voice: selectedVoice })}
+                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm"
+                            >
+                              🔊 Read Page
+                            </button>
+                          </div>
+                          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
+                            {pageText}
+                          </p>
+                        </div>
+                      ))
+                    ) : (
+                      /* Single page document */
+                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
+                        {documentContent.text}
+                      </p>
+                    )}
+                  </div>
+                ) : (
+                  <div className="flex items-center justify-center h-full">
+                    <div className="text-center">
+                      <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
+                      <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
+                        No Document Loaded
+                      </h3>
+                      <p className="text-gray-600 dark:text-gray-400 mb-6">
+                        Upload a PDF, Word document, or text file to get started
+                      </p>
+                      <div className="text-sm text-gray-500 dark:text-gray-400">
+                        <p>Supported formats:</p>
+                        <ul className="mt-2 space-y-1">
+                          <li>📄 PDF documents (.pdf)</li>
+                          <li>📝 Word documents (.docx, .doc)</li>
+                          <li>📃 Text files (.txt)</li>
+                        </ul>
+                      </div>
+                    </div>
+                  </div>
+                )}
               </div>
             </motion.div>
           </div>
         </div>
+
+        {/* Features Info */}
+        <motion.div
+          initial={{ y: 50, opacity: 0 }}
+          animate={{ y: 0, opacity: 1 }}
+          transition={{ duration: 0.5, delay: 0.3 }}
+          className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
+        >
+          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
+            Document Reader Features
+          </h2>
+          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
+            {[
+              {
+                icon: DocumentIcon,
+                title: 'Multiple Formats',
+                description: 'Support for PDF, Word, and text documents',
+                color: 'from-blue-500 to-cyan-500'
+              },
+              {
+                icon: SpeakerWaveIcon,
+                title: 'Natural Voice',
+                description: 'High-quality text-to-speech with multiple voices',
+                color: 'from-green-500 to-emerald-500'
+              },
+              {
+                icon: PlayIcon,
+                title: 'Playback Control',
+                description: 'Adjustable speed, pause, resume, and voice selection',
+                color: 'from-purple-500 to-pink-500'
+              },
+              {
+                icon: DocumentTextIcon,
+                title: 'Page Navigation',
+                description: 'Read entire document or individual pages',
+                color: 'from-orange-500 to-red-500'
+              }
+            ].map((feature, index) => (
+              <motion.div
+                key={feature.title}
+                initial={{ y: 20, opacity: 0 }}
+                animate={{ y: 0, opacity: 1 }}
+                transition={{ duration: 0.3, delay: index * 0.1 }}
+                className="text-center"
+              >
+                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 mx-auto`}>
+                  <feature.icon className="w-6 h-6 text-white" />
+                </div>
+                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
+                  {feature.title}
+                </h3>
+                <p className="text-sm text-gray-600 dark:text-gray-400">
+                  {feature.description}
+                </p>
+              </motion.div>
+            ))}
+          </div>
+        </motion.div>
       </div>
     </div>
   )
 }