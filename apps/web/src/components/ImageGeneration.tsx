import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'

export function ImageGeneration() {
  const [prompt, setPrompt] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const generateImage = async () => {
    setIsLoading(true)
    setImageUrl(null)
    try {
      const response = await axios.post('/api/image-generation/generate-image', {
        prompt,
        size: '1024x1024',
        provider: 'openai',
      })
      setImageUrl(response.data.image_url)
      toast.success('Image generated!')
    } catch (error: any) {
      toast.error('Failed to generate image')
      console.error('Image generation error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="form-label">Image Prompt</label>
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className="input-field w-full"
          placeholder="Describe the image you want to generate..."
        />
      </div>
      <button
        onClick={generateImage}
        className="btn-primary px-8 py-3 disabled:opacity-50"
        disabled={isLoading || !prompt.trim()}
      >
        {isLoading ? 'Generating...' : 'Generate Image'}
      </button>
      {imageUrl && (
        <div>
          <label className="form-label">Generated Image</label>
          <img src={imageUrl} alt="Generated" className="w-full max-w-md rounded-lg border mx-auto" />
        </div>
      )}
    </div>
  )
}
