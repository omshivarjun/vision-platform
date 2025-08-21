import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export function SentimentAnalysis() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<null | { sentiment: string; score: number }>(null)
  const [isLoading, setIsLoading] = useState(false)

  const analyzeSentiment = async () => {
    setIsLoading(true)
    setResult(null)
    try {
      const response = await axios.post('/api/sentiment/analyze', { text })
      setResult(response.data)
      toast.success('Sentiment analyzed!')
    } catch (error) {
      toast.error('Failed to analyze sentiment')
      setResult(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sentiment Analysis</h3>
      <textarea
        className="input-field w-full"
        rows={3}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter text to analyze sentiment..."
      />
      <button
        className="btn-primary px-6 py-2"
        onClick={analyzeSentiment}
        disabled={isLoading || !text.trim()}
      >
        {isLoading ? 'Analyzing...' : 'Analyze Sentiment'}
      </button>
      {result && (
        <div className="mt-2">
          <div className="font-medium">Sentiment: <span className="capitalize">{result.sentiment}</span></div>
          <div className="text-sm text-gray-500">Score: {result.score}</div>
        </div>
      )}
    </div>
  )
}
