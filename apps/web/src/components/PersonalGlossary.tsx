import { useState } from 'react'
import { BookOpenIcon, PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { translationApi } from '../services/api'
import { LanguageSelector } from './LanguageSelector'
import toast from 'react-hot-toast'

export function PersonalGlossary() {
  const [isAddingEntry, setIsAddingEntry] = useState(false)
  const [newEntry, setNewEntry] = useState({
    sourceText: '',
    translatedText: '',
    sourceLanguage: 'en',
    targetLanguage: 'es',
    context: ''
  })
  const queryClient = useQueryClient()

  const { data: glossaryData, isLoading } = useQuery({
    queryKey: ['translationMemory'],
    queryFn: () => translationApi.getTranslationMemory({ page: 1, limit: 20 }),
    enabled: !!localStorage.getItem('authToken'),
  })

  const addEntryMutation = useMutation({
    mutationFn: translationApi.addTranslationMemory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationMemory'] })
      setIsAddingEntry(false)
      setNewEntry({
        sourceText: '',
        translatedText: '',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        context: ''
      })
      toast.success('Entry added to glossary')
    },
    onError: () => {
      toast.error('Failed to add entry')
    }
  })

  const deleteEntryMutation = useMutation({
    mutationFn: translationApi.deleteTranslationMemory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationMemory'] })
      toast.success('Entry deleted from glossary')
    }
  })

  const handleAddEntry = () => {
    if (!newEntry.sourceText.trim() || !newEntry.translatedText.trim()) {
      toast.error('Please fill in both source and translated text')
      return
    }

    addEntryMutation.mutate(newEntry)
  }

  if (!localStorage.getItem('authToken')) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Personal Glossary
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          Please log in to manage your personal glossary
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          <BookOpenIcon className="w-5 h-5 inline mr-2" />
          Personal Glossary
        </h3>
        <button
          onClick={() => setIsAddingEntry(!isAddingEntry)}
          className="btn-outline text-sm py-1 px-3"
        >
          <PlusIcon className="w-4 h-4 mr-1" />
          Add Term
        </button>
      </div>

      {/* Add Entry Form */}
      {isAddingEntry && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From
                </label>
                <LanguageSelector
                  value={newEntry.sourceLanguage}
                  onChange={(lang) => setNewEntry({ ...newEntry, sourceLanguage: lang })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To
                </label>
                <LanguageSelector
                  value={newEntry.targetLanguage}
                  onChange={(lang) => setNewEntry({ ...newEntry, targetLanguage: lang })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Source Text
              </label>
              <input
                type="text"
                value={newEntry.sourceText}
                onChange={(e) => setNewEntry({ ...newEntry, sourceText: e.target.value })}
                placeholder="Enter original text"
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Translation
              </label>
              <input
                type="text"
                value={newEntry.translatedText}
                onChange={(e) => setNewEntry({ ...newEntry, translatedText: e.target.value })}
                placeholder="Enter translation"
                className="input-field text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Context (optional)
              </label>
              <input
                type="text"
                value={newEntry.context}
                onChange={(e) => setNewEntry({ ...newEntry, context: e.target.value })}
                placeholder="e.g., business, medical, casual"
                className="input-field text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddEntry}
                disabled={addEntryMutation.isPending}
                className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
              >
                {addEntryMutation.isPending ? 'Adding...' : 'Add Entry'}
              </button>
              <button
                onClick={() => setIsAddingEntry(false)}
                className="btn-secondary text-sm py-2 px-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glossary Entries */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : glossaryData?.data?.entries?.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {glossaryData.data.entries.map((entry: any, index: number) => (
            <div
              key={index}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {entry.sourceLang} → {entry.targetLang}
                    </span>
                    {entry.context && (
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
                        {entry.context}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {entry.sourceText}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {entry.translatedText}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => {/* TODO: Edit functionality */}}
                    className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Edit entry"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteEntryMutation.mutate(index)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete entry"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <BookOpenIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your personal glossary is empty
          </p>
          <button
            onClick={() => setIsAddingEntry(true)}
            className="btn-primary text-sm"
          >
            Add Your First Term
          </button>
        </div>
      )}
    </div>
  )
}