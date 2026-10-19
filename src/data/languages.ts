import { Language } from '../types';

export const languages: Language[] = [
  {
    id: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
    voiceCode: 'es-ES',
    family: 'Romance',
    greeting: '¡Hola! ¿Cómo estás?',
    accentColor: '#f59e0b',
    popularTopics: ['Tapas & Ordering', 'Airport & Travel', 'Meeting Friends', 'Directions']
  },
  {
    id: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵',
    voiceCode: 'ja-JP',
    family: 'Japonic',
    greeting: 'こんにちは！よろしくお願いします。',
    accentColor: '#ec4899',
    popularTopics: ['Izakaya Dining', 'Tokyo Train Transit', 'Polite Greetings', 'Anime & Slang']
  },
  {
    id: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷',
    voiceCode: 'fr-FR',
    family: 'Romance',
    greeting: 'Bonjour ! Comment allez-vous ?',
    accentColor: '#3b82f6',
    popularTopics: ['Parisian Café', 'Asking Directions', 'Boulangerie Treats', 'Polite Etiquette']
  },
  {
    id: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    voiceCode: 'de-DE',
    family: 'Germanic',
    greeting: 'Guten Tag! Wie geht es dir?',
    accentColor: '#eab308',
    popularTopics: ['Train Stations', 'Biergarten Orders', 'Work & Tech', 'Shopping']
  },
  {
    id: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    voiceCode: 'it-IT',
    family: 'Romance',
    greeting: 'Ciao! Piacere di conoscerti!',
    accentColor: '#10b981',
    popularTopics: ['Espresso & Bakery', 'Gelato Orders', 'Asking for Check', 'Italian Gestures']
  },
  {
    id: 'zh',
    name: 'Mandarin Chinese',
    nativeName: '中文 (普通话)',
    flag: '🇨🇳',
    voiceCode: 'zh-CN',
    family: 'Sino-Tibetan',
    greeting: '你好！很高兴认识你。',
    accentColor: '#ef4444',
    popularTopics: ['Street Food Markets', 'Bargaining & Prices', 'Tones Mastery', 'Haggling']
  },
  {
    id: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    voiceCode: 'ko-KR',
    family: 'Koreanic',
    greeting: '안녕하세요! 만나서 반갑습니다.',
    accentColor: '#8b5cf6',
    popularTopics: ['K-BBQ Ordering', 'Subway & T-Money', 'Honorifics & Age', 'K-Drama Phrases']
  },
  {
    id: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇧🇷',
    voiceCode: 'pt-BR',
    family: 'Romance',
    greeting: 'Olá! Tudo bem com você?',
    accentColor: '#14b8a6',
    popularTopics: ['Rio Beach Chat', 'Ordering Açaí', 'Music & Samba', 'Friendly Slang']
  },
  {
    id: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺',
    voiceCode: 'ru-RU',
    family: 'Slavic',
    greeting: 'Здравствуйте! Рад познакомиться.',
    accentColor: '#6366f1',
    popularTopics: ['Metro Navigation', 'Warm Hospitality', 'Cyrillic Alphabet', 'Tea Traditions']
  },
  {
    id: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦',
    voiceCode: 'ar-SA',
    family: 'Afroasiatic',
    greeting: 'مرحباً! أهلاً وسهلاً بك.',
    accentColor: '#d97706',
    popularTopics: ['Hospitality & Tea', 'Market Souks', 'Formal Greetings', 'Travel Essentials']
  },
  {
    id: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    voiceCode: 'hi-IN',
    family: 'Indo-Aryan',
    greeting: 'नमस्ते! आप कैसे हैं?',
    accentColor: '#f97316',
    popularTopics: ['Chai & Street Food', 'Auto Rickshaw Bargaining', 'Family Respect', 'Festivals']
  },
  {
    id: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    voiceCode: 'nl-NL',
    family: 'Germanic',
    greeting: 'Hallo! Hoe gaat het ermee?',
    accentColor: '#fb923c',
    popularTopics: ['Bicycle Commute', 'Gezellig Vibes', 'Coffee Bars', 'Direct Conversation']
  },
  {
    id: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    voiceCode: 'sv-SE',
    family: 'Germanic',
    greeting: 'Hej! Trevligt att träffas!',
    accentColor: '#0ea5e9',
    popularTopics: ['Fika Coffee Break', 'Lagom Philosophy', 'Public Transport', 'Nature & Outdoors']
  },
  {
    id: 'tl',
    name: 'Tagalog (Filipino)',
    nativeName: 'Wikang Tagalog',
    flag: '🇵🇭',
    voiceCode: 'fil-PH',
    family: 'Austronesian',
    greeting: 'Kamusta ka! Masaya akong makilala ka.',
    accentColor: '#06b6d4',
    popularTopics: ['Jeepney Fare & Stops', 'Salo-salo Meals', 'Polite Po at Opo', 'Island Travel']
  },
  {
    id: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    voiceCode: 'tr-TR',
    family: 'Turkic',
    greeting: 'Merhaba! Tanıştığımıza memnun oldum.',
    accentColor: '#e11d48',
    popularTopics: ['Grand Bazaar Shopping', 'Turkish Tea & Coffee', 'Ferry Commute', 'Polite Courtesy']
  },
  {
    id: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    flag: '🇵🇱',
    voiceCode: 'pl-PL',
    family: 'Slavic',
    greeting: 'Cześć! Miło cię poznać.',
    accentColor: '#be123c',
    popularTopics: ['Pierogi Orders', 'Krakow Old Town', 'Consonant Clusters', 'Daily Greetings']
  },
  {
    id: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    voiceCode: 'vi-VN',
    family: 'Austroasiatic',
    greeting: 'Xin chào! Rất vui được gặp bạn.',
    accentColor: '#eab308',
    popularTopics: ['Phở & Bánh Mì', 'Six Tone Mastery', 'Scooter Commuting', 'Night Markets']
  },
  {
    id: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    flag: '🇬🇷',
    voiceCode: 'el-GR',
    family: 'Hellenic',
    greeting: 'Γεια σας! Χάρηκα για τη γνωριμία.',
    accentColor: '#0284c7',
    popularTopics: ['Taverna Feast', 'Island Hopping', 'Greek Alphabet', 'Philoxenia Warmth']
  }
];

export const defaultLanguage = languages[0];
