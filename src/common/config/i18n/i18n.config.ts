

import { createI18n } from 'vue-i18n'

// Load all JSON files inside the `locales/**` folders
function loadLocaleMessages() {
  const locales = import.meta.glob('../../locales/**/**/*.json', { eager: true })
  const messages: Record<string, any> = {}

  for (const path in locales) {
    const match = path.match(/locales\/([^/]+)\/([^/]+)\.json$/)
    if (match) {
      const [, locale, filename] = match
      if (!messages[locale]) {
        messages[locale] = {}
      }
      messages[locale][filename] = (locales[path] as any).default
    }
  }

  return messages
}

const locale = localStorage.getItem("locale") || "en"

const i18nConfig = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  messages: loadLocaleMessages(),
})

export default i18nConfig
