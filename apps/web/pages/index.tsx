import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Vision Platform - AI-Powered Accessibility</title>
        <meta name="description" content="Vision Platform - AI-powered translation, OCR, speech processing, and accessibility features" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Vision Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-powered translation, OCR, speech processing, and accessibility features
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Translation</h3>
              <p className="text-gray-600">Multi-language text translation with AI models</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">OCR</h3>
              <p className="text-gray-600">Extract text from images and documents</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Speech</h3>
              <p className="text-gray-600">Speech-to-text and text-to-speech conversion</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Accessibility</h3>
              <p className="text-gray-600">AI-powered accessibility features and analysis</p>
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-sm text-gray-500">
              Status: All services are running and ready
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
