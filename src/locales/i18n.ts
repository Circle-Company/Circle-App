import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './languages/en.json'
import pt from './languages/pt.json'

export const languageResources = {
    en: { translation: en},
    pt: {translation: pt}
}

i18next.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    lng: 'en',
    fallbackLng: 'en',
    resources: languageResources
})

export default i18next
