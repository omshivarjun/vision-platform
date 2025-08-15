import { useState, useEffect } from 'react'
import { ClockIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { translationApi } from '../services/api'
import toast from 'react-hot-toast'

export function TranslationHistory() {
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: historyData, isLoading } = useQuery({
    queryKey: ['translationHistory', page],
    queryFn: () => translationApi.getHistory({ page, limit: 10 }),
    enabled: !!localStorage.getItem('authToken'),
  })

  const deleteHistoryMutation = useMutation({
    mutationFn: translationApi.deleteHistoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationHistory'] })
      toast.success('Translation deleted from history')
    },
    onError: () => {
      toast.error('Failed to delete translation')
    }
  })

  const favoriteHistoryMutation = useMutation({
    mutationFn: translationApi.favoriteHistoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['translationHistory'] })
      toast.success('Translation added to favorites')
    }
  })

  if (!localStorage.getItem('authToken')) {
    return (
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Translation History
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          Please log in to view your translation history
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          <ClockIcon className="w-5 h-5 inline mr-2" />
          Translation History
        </h3>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
          View All
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (historyData as any)?.data?.translations?.length > 0 ? (
        <div className="space-y-3">
          {(historyData as any).data.translations.map((translation: any) => (
            <div
              key={translation.id}
              className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                      {translation.sourceLanguage} → {translation.targetLanguage}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(translation.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium truncate">
                    {translation.sourceText}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                    {translation.translatedText}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => favoriteHistoryMutation.mutate(translation.id)}
                    className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                    title="Add to favorites"
                  >
                    <StarIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteHistoryMutation.mutate(translation.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete from history"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {(historyData as any).data.pagination.pages > 1 && (
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-outline text-sm py-1 px-3 disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {(historyData as any).data.pagination.pages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= (historyData as any).data.pagination.pages}
                className="btn-outline text-sm py-1 px-3 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-gray-600 dark:text-gray-400 text-center py-8">
          No translation history yet. Start translating to see your history here.
        </p>
      )}
    </div>
  )
}