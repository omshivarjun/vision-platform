import { useState, useRef } from 'react'
import { speechApi } from '../services/api'
import toast from 'react-hot-toast'

const VOICES = [
  'alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'
]

export function TTSComponent() {
  const [text, setText] = useState('')
  const [voice, setVoice] = useState('alloy')
  const [isGenerating, setIsGenerating] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const generateSpeech = async () => {
    setIsGenerating(true)
    try {
      const response = await speechApi.textToSpeech({
        text,
        language: 'en',
        voice
      })
      if (response.audio_url) {
        if (audioRef.current) {
          audioRef.current.src = response.audio_url
          audioRef.current.play()
        }
        toast.success('Speech generated!')
      } else {
        toast.error('No audio returned')
      }
    } catch (error) {
      toast.error('TTS failed')
      console.error('TTS Error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Text-to-Speech</h3>
      <textarea
        className="input-field w-full"
        rows={4}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter text to convert to speech..."
      />
      <div>
        <label className="form-label mr-2">Voice:</label>
        <select value={voice} onChange={e => setVoice(e.target.value)} className="input-field">
          {VOICES.map(v => (
            <option key={v} value={v}>{v.charAt(0).toUpperCase() + v.slice(1)}</option>
          ))}
        </select>
      </div>
      <button
        className="btn-primary px-6 py-2"
        onClick={generateSpeech}
        disabled={isGenerating || !text.trim()}
      >
        {isGenerating ? 'Generating...' : 'Generate Speech'}
      </button>
      <audio ref={audioRef} controls className="w-full mt-2" />
    </div>
  )
}
