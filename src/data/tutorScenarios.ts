import { TutorScenario } from '../types';

export function getTutorScenarios(languageId: string, languageName: string): TutorScenario[] {
  const isEs = languageId === 'es';
  const isJa = languageId === 'ja';
  const isFr = languageId === 'fr';
  const isDe = languageId === 'de';
  const isIt = languageId === 'it';
  const isZh = languageId === 'zh';
  const isKo = languageId === 'ko';
  const isTl = languageId === 'tl';

  return [
    {
      id: 'job_interview',
      title: 'Job Interview & Career',
      category: 'Professional',
      description: `Practice answering interview questions, introducing your background, and discussing key skills in ${languageName}.`,
      prompt: `Act as a hiring manager conducting a professional job interview in ${languageName}. Ask about background, strengths, and handling challenges.`,
      icon: '💼'
    },
    {
      id: 'presentation',
      title: 'School & University Presentation',
      category: 'Academic',
      description: `Present a research project or school topic and respond to thoughtful audience questions in ${languageName}.`,
      prompt: `Act as an academic professor or classmate listening to a presentation in ${languageName}. Ask questions about the student's project conclusions.`,
      icon: '🎓'
    },
    {
      id: 'travel',
      title: isJa ? 'Tokyo Train & Airport Transit' :
             isEs ? 'Airport Customs & Taxi Navigation' :
             isFr ? 'Parisian Metro & Train Station' :
             isDe ? 'Frankfurt Airport & U-Bahn Navigation' :
             isTl ? 'NAIA Airport & Jeepney Commute' :
             `Airport, Transit & Travel Navigation in ${languageName}`,
      category: 'Travel',
      description: `Navigate airport customs, ask for gate directions, purchase train tickets, and find your hotel in ${languageName}.`,
      prompt: `Act as a friendly airport officer or train station attendant assisting an international traveler in ${languageName}.`,
      icon: '✈️'
    },
    {
      id: 'food_dining',
      title: isEs ? 'Tapas Bar & Churros Order' :
             isJa ? 'Izakaya & Ramen Bar Dining' :
             isFr ? 'Parisian Bistro & Boulangerie' :
             isDe ? 'Biergarten & Bäckerei Treats' :
             isIt ? 'Trattoria & Espresso Ordering' :
             isZh ? 'Dim Sum & Street Market Feast' :
             isKo ? 'K-BBQ & Pocha Diner Order' :
             isTl ? 'Carinderia & Sari-sari Store Dining' :
             `Bistro & Restaurant Dining in ${languageName}`,
      category: 'Dining',
      description: `Order authentic dishes, ask for chef recommendations, clarify ingredients, and ask for the bill in ${languageName}.`,
      prompt: `Act as a warm, welcoming restaurant waiter or barista taking orders in ${languageName}.`,
      icon: '🍽️'
    },
    {
      id: 'everyday',
      title: isEs ? 'Plaza Mayor Casual Meetup' :
             isJa ? 'Shibuya Café Small Talk' :
             isFr ? 'Seine Riverside Social Chat' :
             isDe ? 'Berlin Café Casual Chat' :
             isTl ? 'Salo-salo Friendly Gathering' :
             `Everyday Conversations & Social Meetup in ${languageName}`,
      category: 'Casual',
      description: `Make friends at a local café, discuss weekend plans, hobbies, and family in ${languageName}.`,
      prompt: `Act as a friendly local chatting at a coffee shop in ${languageName}. Make casual, natural small talk.`,
      icon: '☕'
    }
  ];
}

export function getTutorGreeting(languageId: string, greeting: string, languageName: string): {
  text: string;
  translation: string;
  suggested: string[];
} {
  const isEs = languageId === 'es';
  const isJa = languageId === 'ja';
  const isFr = languageId === 'fr';
  const isDe = languageId === 'de';
  const isIt = languageId === 'it';
  const isZh = languageId === 'zh';
  const isKo = languageId === 'ko';
  const isTl = languageId === 'tl';

  let text = greeting;
  let translation = `Hello and welcome! What real-world scenario would you like to practice today in ${languageName}?`;
  let suggested = [greeting, 'Thank you!', 'I am ready to practice!'];

  if (isEs) {
    text = '¡Hola! ¿Qué escenario de conversación te gustaría practicar hoy?';
    translation = 'Hello! What conversation scenario would you like to practice today?';
    suggested = ['¡Hola! Mucho gusto', 'Quiero practicar para una entrevista', '¿Cómo estás hoy?'];
  } else if (isJa) {
    text = 'こんにちは！本日はどのシチュエーションを練習しましょうか？';
    translation = 'Hello! Which conversation situation would you like to practice today?';
    suggested = ['こんにちは、よろしくお願いします！', '面接の練習がしたいです', '注文の練習をしましょう'];
  } else if (isFr) {
    text = "Bonjour ! Quel scénario de conversation souhaitez-vous pratiquer aujourd'hui ?";
    translation = 'Hello! Which conversation scenario would you like to practice today?';
    suggested = ['Bonjour ! Comment allez-vous ?', 'Je voudrais pratiquer un entretien', 'Pouvez-vous me guider ?'];
  } else if (isDe) {
    text = 'Guten Tag! Welches Gesprächsszenario möchten Sie heute auf Deutsch üben?';
    translation = 'Good day! Which conversation scenario would you like to practice in German today?';
    suggested = ['Guten Tag! Wie geht es Ihnen?', 'Ich möchte für ein Bewerbungsgespräch üben', 'Vielen Dank für Ihre Hilfe'];
  } else if (isIt) {
    text = 'Ciao! Quale scenario di conversazione ti piacerebbe esercitare oggi?';
    translation = 'Hello! Which conversation scenario would you like to practice today?';
    suggested = ['Ciao! Piacere di conoscerti', 'Vorrei fare pratica per lavoro', 'Che cosa mi consigli?'];
  } else if (isZh) {
    text = '你好！今天想用中文练习哪种真实场景的对话呢？';
    translation = 'Hello! Which real-life conversation scenario would you like to practice in Chinese today?';
    suggested = ['你好！很高兴认识你', '我想练习工作面试', '你有什么建议吗？'];
  } else if (isKo) {
    text = '안녕하세요! 오늘 어떤 실전 대화 상황을 연습해볼까요?';
    translation = 'Hello! Which real conversation situation shall we practice today?';
    suggested = ['안녕하세요! 반갑습니다', '면접 연습을 하고 싶어요', '주문하는 법을 연습해요'];
  } else if (isTl) {
    text = 'Magandang araw po! Anong totoong sitwasyon ang nais ninyong sanayin ngayon sa Tagalog?';
    translation = 'Good day po! Which real-life situation would you like to practice today in Tagalog?';
    suggested = ['Magandang araw po!', 'Handa na po ako sa interview', 'Maraming salamat po!'];
  }

  return { text, translation, suggested };
}
