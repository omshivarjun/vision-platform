import { Fragment } from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline'
import { SUPPORTED_LANGUAGES } from '@shared/utils/constants'

interface LanguageSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function LanguageSelector({ value, onChange, placeholder, disabled }: LanguageSelectorProps) {
  const languages = Object.entries(SUPPORTED_LANGUAGES).map(([code, info]) => ({
    code,
    ...info
  }))

  const selectedLanguage = languages.find(lang => lang.code === value)

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      <div className="relative">
        <Listbox.Button className="input-field flex items-center justify-between">
          <span className="flex items-center gap-2">
            {selectedLanguage ? (
              <>
                <span className="text-lg">{selectedLanguage.flag}</span>
                <span>{selectedLanguage.name}</span>
              </>
            ) : (
              <span className="text-gray-500">{placeholder || 'Select language'}</span>
            )}
          </span>
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {languages.map((language) => (
              <Listbox.Option
                key={language.code}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                    active ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                  }`
                }
                value={language.code}
              >
                {({ selected }) => (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{language.flag}</span>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {language.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {language.native_name}
                      </span>
                    </div>
                    {selected ? (
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    ) : null}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  )
}