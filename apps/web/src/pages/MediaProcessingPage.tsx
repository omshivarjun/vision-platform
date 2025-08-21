import React from 'react';
import { motion } from 'framer-motion';


import { useState } from 'react';

export default function MediaProcessingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      // Try backend Node.js API first, fallback to FastAPI if needed
      let response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        // Try FastAPI endpoint if Node.js fails
        response = await fetch('/media/upload', {
          method: 'POST',
          body: formData,
        });
      }
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            🎬 Media Processing Pipeline
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Upload video or audio files for advanced processing: speech-to-text, audio extraction, and more.
          </p>
        </motion.div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <input
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileChange}
            className="mb-4"
            disabled={uploading}
          />
          <br />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload & Process'}
          </button>
          {error && <div className="mt-4 text-red-600">{error}</div>}
          {result && (
            <div className="mt-8 text-left max-w-xl mx-auto">
              <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Processing Result</h2>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4">
                <div><b>File Name:</b> {result.fileName}</div>
                <div><b>File Size:</b> {result.fileSize} bytes</div>
                <div><b>File Type:</b> {result.fileType}</div>
                {result.audioPath && (
                  <div><b>Audio Extracted:</b> {result.audioPath}</div>
                )}
                {result.transcript && (
                  <div className="mt-4">
                    <b>Transcript:</b>
                    <pre className="bg-gray-200 dark:bg-gray-800 rounded p-2 mt-1 whitespace-pre-wrap text-sm">{result.transcript}</pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
