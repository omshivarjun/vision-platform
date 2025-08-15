import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { useMediaProcessor } from '../../hooks/useMediaProcessor';
import {
  VideoCameraIcon,
  SpeakerWaveIcon,
  ScissorsIcon,
  AdjustmentsHorizontalIcon,
  ChatBubbleBottomCenterTextIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  PauseIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface MediaProcessorProps {
  onProcessingComplete?: (result: any) => void;
}

export function MediaProcessor({ onProcessingComplete }: MediaProcessorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processingOptions, setProcessingOptions] = useState({
    denoise: false,
    normalize: false,
    generateCaptions: false,
    extractAudio: false,
    quality: 'medium' as 'low' | 'medium' | 'high',
  });
  const [isPlaying, setIsPlaying] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const {
    processMedia,
    isProcessing,
    progress,
    processedMedia,
    error,
    clearProcessedMedia,
  } = useMediaProcessor();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Clear previous results
      clearProcessedMedia();
    }
  }, [clearProcessedMedia]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.ogg', '.avi', '.mov'],
      'audio/*': ['.mp3', '.wav', '.ogg', '.m4a', '.aac'],
    },
    maxFiles: 1,
    maxSize: 100 * 1024 * 1024, // 100MB
  });

  const handleProcess = async () => {
    if (!selectedFile) {
      toast.error('Please select a media file first');
      return;
    }

    const result = await processMedia(selectedFile, processingOptions);
    
    if (result) {
      onProcessingComplete?.(result);
    }
  };

  const togglePlayback = () => {
    if (selectedFile?.type.startsWith('video/') && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } else if (selectedFile?.type.startsWith('audio/') && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
          <VideoCameraIcon className="w-6 h-6 mr-2 text-purple-600" />
          Media Processor
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload and Preview */}
          <div className="space-y-6">
            {/* File Upload */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
              }`}
            >
              <input {...getInputProps()} />
              <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {isDragActive ? 'Drop your media file here' : 'Upload Media File'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supports video (MP4, WebM, AVI, MOV) and audio (MP3, WAV, OGG, M4A) up to 100MB
              </p>
            </div>

            {/* File Info */}
            {selectedFile && (
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {selectedFile.type.startsWith('video/') ? (
                      <VideoCameraIcon className="w-5 h-5 text-purple-600 mr-2" />
                    ) : (
                      <SpeakerWaveIcon className="w-5 h-5 text-blue-600 mr-2" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      clearProcessedMedia();
                    }}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    ✕
                  </button>
                </div>

                {/* Media Preview */}
                {previewUrl && (
                  <div className="relative">
                    {selectedFile.type.startsWith('video/') ? (
                      <video
                        ref={videoRef}
                        src={previewUrl}
                        className="w-full rounded-lg"
                        controls
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    ) : (
                      <audio
                        ref={audioRef}
                        src={previewUrl}
                        className="w-full"
                        controls
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-2" />
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            )}
          </div>

          {/* Processing Options */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Processing Options
              </h3>
              
              <div className="space-y-4">
                {/* Quality Setting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quality
                  </label>
                  <select
                    value={processingOptions.quality}
                    onChange={(e) => setProcessingOptions({
                      ...processingOptions,
                      quality: e.target.value as 'low' | 'medium' | 'high'
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="low">Low (Fast processing)</option>
                    <option value="medium">Medium (Balanced)</option>
                    <option value="high">High (Best quality)</option>
                  </select>
                </div>

                {/* Processing Options */}
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={processingOptions.denoise}
                      onChange={(e) => setProcessingOptions({
                        ...processingOptions,
                        denoise: e.target.checked
                      })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Denoise Audio
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={processingOptions.normalize}
                      onChange={(e) => setProcessingOptions({
                        ...processingOptions,
                        normalize: e.target.checked
                      })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Normalize Audio Levels
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={processingOptions.generateCaptions}
                      onChange={(e) => setProcessingOptions({
                        ...processingOptions,
                        generateCaptions: e.target.checked
                      })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Generate Captions
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={processingOptions.extractAudio}
                      onChange={(e) => setProcessingOptions({
                        ...processingOptions,
                        extractAudio: e.target.checked
                      })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Extract Audio Track
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Process Button */}
            <button
              onClick={handleProcess}
              disabled={!selectedFile || isProcessing}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing... {Math.round(progress)}%
                </div>
              ) : (
                'Process Media'
              )}
            </button>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Processed Results */}
        {processedMedia && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 rounded-lg"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Processing Results
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Processed Media */}
              {processedMedia.processedUrl && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Processed Media
                  </h4>
                  {selectedFile?.type.startsWith('video/') ? (
                    <video
                      src={processedMedia.processedUrl}
                      className="w-full rounded-lg"
                      controls
                    />
                  ) : (
                    <audio
                      src={processedMedia.processedUrl}
                      className="w-full"
                      controls
                    />
                  )}
                  <button
                    onClick={() => window.open(processedMedia.processedUrl, '_blank')}
                    className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                    Download Processed File
                  </button>
                </div>
              )}

              {/* Extracted Audio */}
              {processedMedia.audioUrl && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Extracted Audio
                  </h4>
                  <audio
                    src={processedMedia.audioUrl}
                    className="w-full"
                    controls
                  />
                  <button
                    onClick={() => window.open(processedMedia.audioUrl, '_blank')}
                    className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    <ArrowDownTrayIcon className="w-4 h-4 mr-1" />
                    Download Audio
                  </button>
                </div>
              )}

              {/* Generated Captions */}
              {processedMedia.captions && (
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Generated Captions
                  </h4>
                  <div className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <pre className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {processedMedia.captions}
                    </pre>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(processedMedia.captions || '');
                      toast.success('Captions copied to clipboard');
                    }}
                    className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                  >
                    📋 Copy Captions
                  </button>
                </div>
              )}
            </div>

            {/* Metadata */}
            <div className="mt-6 p-4 bg-white dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Media Information
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {processedMedia.metadata.duration ? formatDuration(processedMedia.metadata.duration) : 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Size:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatFileSize(processedMedia.metadata.fileSize)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Format:</span>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {processedMedia.metadata.format}
                  </p>
                </div>
                {processedMedia.metadata.dimensions && (
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Dimensions:</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {processedMedia.metadata.dimensions.width} × {processedMedia.metadata.dimensions.height}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Features Info */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">
            🎬 Media Processing Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-800 dark:text-blue-200">Audio denoising and normalization</span>
            </div>
            <div className="flex items-center">
              <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-800 dark:text-blue-200">Automatic caption generation</span>
            </div>
            <div className="flex items-center">
              <ScissorsIcon className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-800 dark:text-blue-200">Video cropping and trimming</span>
            </div>
            <div className="flex items-center">
              <SpeakerWaveIcon className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-blue-800 dark:text-blue-200">Audio track extraction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}