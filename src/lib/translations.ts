import type { Language } from './types';

type Translations = {
  [key: string]: { [lang in Language]: string };
};

export const translations: Translations = {
  // Navigation
  navScan: { English: 'Scan', Hindi: 'स्कैन', Marathi: 'स्कॅन', Hinglish: 'Scan' },
  navHistory: { English: 'History', Hindi: 'इतिहास', Marathi: 'इतिहास', Hinglish: 'History' },
  navDashboard: { English: 'Dashboard', Hindi: 'डैशबोर्ड', Marathi: 'डॅशबोर्ड', Hinglish: 'Dashboard' },
  navProfile: { English: 'Profile', Hindi: 'प्रोफ़ाइल', Marathi: 'प्रोफाइल', Hinglish: 'Profile' },

  // Dashboard
  goodMorning: { English: 'Good Morning', Hindi: 'सुप्रभात', Marathi: 'सुप्रभात', Hinglish: 'Good Morning' },
  goodAfternoon: { English: 'Good Afternoon', Hindi: 'नमस्कार', Marathi: 'नमस्कार', Hinglish: 'Good Afternoon' },
  goodEvening: { English: 'Good Evening', Hindi: 'शुभ संध्या', Marathi: 'शुभ संध्या', Hinglish: 'Good Evening' },
  healthIndex: { English: 'Health Index', Hindi: 'स्वास्थ्य सूचकांक', Marathi: 'आरोग्य निर्देशांक', Hinglish: 'Health Index' },
  scans: { English: 'Scans', Hindi: 'स्कैन', Marathi: 'स्कॅन', Hinglish: 'Scans' },
  streak: { English: 'Streak', Hindi: 'स्ट्रीक', Marathi: 'स्ट्रीक', Hinglish: 'Streak' },
  found: { English: 'Found', Hindi: 'मिले', Marathi: 'सापडले', Hinglish: 'Found' },
  latestAnalysis: { English: 'Latest Analysis', Hindi: 'नवीनतम विश्लेषण', Marathi: 'नवीनतम विश्लेषण', Hinglish: 'Latest Analysis' },
  readyToStart: { English: 'Ready to Start?', Hindi: 'शुरू करने के लिए तैयार हैं?', Marathi: 'सुरू करण्यास तयार आहात का?', Hinglish: 'Tayyar ho?' },
  dashboardWelcome: { English: 'Scan your first product to unlock AI-powered health insights.', Hindi: 'एआई-संचालित स्वास्थ्य जानकारी अनलॉक करने के लिए अपना पहला उत्पाद स्कैन करें।', Marathi: 'AI-आधारित आरोग्य अंतर्दृष्टी अनलॉक करण्यासाठी तुमचे पहिले उत्पादन स्कॅन करा।', Hinglish: 'Pehla product scan karo AI insights ke liye.' },
  analyzeProduct: { English: 'Analyze Product', Hindi: 'उत्पाद का विश्लेषण करें', Marathi: 'उत्पादनाचे विश्लेषण करा', Hinglish: 'Product Analyze Karo' },
  smartChoiceMsg: { English: "You're making consistently smart choices! ✨", Hindi: "आप लगातार समझदारी भरे विकल्प चुन रहे हैं! ✨", Marathi: "तुम्ही सतत हुशार निवडी करत आहात! ✨", Hinglish: "Aap sahi choices kar rahe ho! ✨" },
  lowScoreMsg: { English: "Let's aim for healthier options today.", Hindi: "आइए आज स्वस्थ विकल्पों का लक्ष्य रखें।", Marathi: "आज निरोगी पर्यायांचे ध्येय ठेवूया।", Hinglish: "Aaj thoda healthy options dekhte hain." },
  trackingMsg: { English: "Tracking your progress beautifully.", Hindi: "आपकी प्रगति पर अच्छी नज़र रखी जा रही है।", Marathi: "तुमच्या प्रगतीचा मागोवा घेतला जात आहे।", Hinglish: "Aapki progress track ho rahi hai." },
  startScanMsg: { English: "Start scanning to unlock personalized insights.", Hindi: "व्यक्तिगत जानकारी अनलॉक करने के लिए स्कैनिंग शुरू करें।", Marathi: "वैयक्तिक अंतर्दृष्टी अनलॉक करण्यासाठी स्कॅनिंग सुरू करा।", Hinglish: "Insights ke liye scan shuru karo." },

  // Scanner
  barcodeMode: { English: 'Barcode', Hindi: 'बारकोड', Marathi: 'बारकोड', Hinglish: 'Barcode' },
  photoMode: { English: 'Photo', Hindi: 'फोटो', Marathi: 'फोटो', Hinglish: 'Photo' },
  barcodeEntry: { English: 'Barcode Entry', Hindi: 'बारकोड प्रविष्टि', Marathi: 'बारकोड नोंदणी', Hinglish: 'Barcode Entry' },
  photoAnalysis: { English: 'Photo Analysis', Hindi: 'फोटो विश्लेषण', Marathi: 'फोटो विश्लेषण', Hinglish: 'Photo Analysis' },
  barcodeDesc: { English: 'Scan a product barcode via camera or upload an image.', Hindi: 'कैमरे के माध्यम से उत्पाद बारकोड स्कैन करें या छवि अपलोड करें।', Marathi: 'कॅमेराद्वारे उत्पादन बारकोड स्कॅन करा किंवा प्रतिमा अपलोड करा।', Hinglish: 'Barcode scan karo ya image upload karo.' },
  photoDesc: { English: 'Upload or capture a product image to analyze details using AI.', Hindi: 'एआई का उपयोग करके विवरणों का विश्लेषण करने के लिए उत्पाद छवि अपलोड या कैप्चर करें।', Marathi: 'AI वापरून तपशीलांचे विश्लेषण करण्यासाठी उत्पादन प्रतिमा अपलोड किंवा कॅप्चर करा।', Hinglish: 'AI analysis ke liye photo click karo ya upload karo.' },
  capturePhoto: { English: 'Capture Photo', Hindi: 'फोटो खींचे', Marathi: 'फोटो काढा', Hinglish: 'Photo Kheecho' },
  uploadImage: { English: 'Upload Image', Hindi: 'छवि अपलोड करें', Marathi: 'प्रतिमा अपलोड करा', Hinglish: 'Image Upload Karo' },
  processingScan: { English: 'Processing Scan...', Hindi: 'स्कैन प्रोसेस हो रहा है...', Marathi: 'स्कॅन प्रक्रिया होत आहे...', Hinglish: 'Scan process ho raha hai...' },
  aiPhotoAnalysis: { English: 'AI Photo Analysis...', Hindi: 'AI फोटो विश्लेषण...', Marathi: 'AI फोटो विश्लेषण...', Hinglish: 'AI Photo Analysis...' },

  // Product Details
  grade: { English: 'Grade', Hindi: 'ग्रेड', Marathi: 'ग्रेड', Hinglish: 'Grade' },
  nova: { English: 'NOVA', Hindi: 'NOVA', Marathi: 'NOVA', Hinglish: 'NOVA' },
  allergensAlert: { English: 'Allergens', Hindi: 'एलर्जीकारक', Marathi: 'ऍलर्जीकारक', Hinglish: 'Allergens' },
  fullNutrition: { English: 'Full Nutrition', Hindi: 'पूर्ण पोषण', Marathi: 'पूर्ण पोषण', Hinglish: 'Full Nutrition' },
  fullIngredients: { English: 'Full Ingredients', Hindi: 'पूर्ण सामग्री', Marathi: 'पूर्ण साहित्य', Hinglish: 'Full Ingredients' },
  askAiAssistant: { English: 'Ask AI Assistant', Hindi: 'एआई सहायक से पूछें', Marathi: 'AI सहाय्यकाला विचारा', Hinglish: 'AI se pucho' },
  dietSafetyAnalysis: { English: 'Diet safety and expert analysis.', Hindi: 'आहार सुरक्षा और विशेषज्ञ विश्लेषण।', Marathi: 'आहार सुरक्षा आणि तज्ञ विश्लेषण।', Hinglish: 'Diet safety aur expert analysis.' },
  scanAgain: { English: 'Scan Again', Hindi: 'फिर से स्कैन करें', Marathi: 'पुन्हा स्कॅन करा', Hinglish: 'Scan Phir Se' },
  shareResult: { English: 'Share Result', Hindi: 'परिणाम साझा करें', Marathi: 'निकाल शेअर करा', Hinglish: 'Result Share Karo' },
  noPreview: { English: 'No Preview', Hindi: 'कोई पूर्वावलोकन नहीं', Marathi: 'कोणतेही पूर्वावलोकन नाही', Hinglish: 'No Preview' },

  // Analysis Display
  nutritionAlerts: { English: 'Nutrition Alerts', Hindi: 'पोषण संबंधी अलर्ट', Marathi: 'पोषण सूचना', Hinglish: 'Nutrition Alerts' },
  expertTake: { English: 'Expert Take', Hindi: 'विशेषज्ञ की राय', Marathi: 'तज्ञांचे मत', Hinglish: 'Expert Take' },
  calories: { English: 'Calories', Hindi: 'कैलोरी', Marathi: 'कॅलरीज', Hinglish: 'Calories' },
  sugar: { English: 'Sugar', Hindi: 'चीनी', Marathi: 'साखर', Hinglish: 'Sugar' },
  fat: { English: 'Fat', Hindi: 'वसा', Marathi: 'चरबी', Hinglish: 'Fat' },
  protein: { English: 'Protein', Hindi: 'प्रोटीन', Marathi: 'प्रथिने', Hinglish: 'Protein' },
  healthChoice: { English: 'Choice', Hindi: 'विकल्प', Marathi: 'निवड', Hinglish: 'Choice' },

  // History
  historyTitle: { English: 'Scan History', Hindi: 'स्कैन इतिहास', Marathi: 'स्कॅन इतिहास', Hinglish: 'Scan History' },
  historyDescription: { English: 'View, sort, and get insights from your scanned products.', Hindi: 'अपने स्कैन किए गए उत्पादों को देखें, सॉर्ट करें और जानकारी प्राप्त करें।', Marathi: 'तुमची स्कॅन केलेली उत्पादने पहा, क्रमवारी लावा आणि माहिती मिळवा।', Hinglish: 'Apne scanned products dekho aur insights lo.' },
  historyEmpty: { English: 'No products scanned yet.', Hindi: 'अभी तक कोई उत्पाद स्कैन नहीं किया गया है।', Marathi: 'अद्याप कोणतेही उत्पादन स्कॅन केलेले नाही।', Hinglish: 'Abhi tak kuch scan nahi kiya.' },
  scanFirstProduct: { English: 'Scan Your First Product', Hindi: 'अपना पहला उत्पाद स्कैन करें', Marathi: 'तुमचे पहिले उत्पादन स्कॅन करा', Hinglish: 'Pehla product scan karo' },
  discoveredByYou: { English: 'Discovered by you', Hindi: 'आपके द्वारा खोजा गया', Marathi: 'तुम्ही शोधलेले', Hinglish: 'Aapne dhoonda hai' },

  // Profile
  contributorRank: { English: 'Contributor Rank', Hindi: 'योगदानकर्ता रैंक', Marathi: 'योगदानकर्ता रँक', Hinglish: 'Contributor Rank' },
  xpLevel: { English: 'XP Level', Hindi: 'XP लेवल', Marathi: 'XP लेव्हल', Hinglish: 'XP Level' },
  scanItemsLevelUp: { English: 'Scan items to level up. Level {next} is next!', Hindi: 'लेवल बढ़ाने के लिए आइटम स्कैन करें। अगला लेवल {next} है!', Marathi: 'लेव्हल वाढवण्यासाठी आयटम स्कॅन करा. पुढची लेव्हल {next} आहे!', Hinglish: 'Level up ke liye scan karo. Agla level {next} hai!' },
  achievements: { English: 'Achievements', Hindi: 'उपलब्धियां', Marathi: 'उपलब्धी', Hinglish: 'Achievements' },
  yourCollection: { English: 'Your Collection', Hindi: 'आपका संग्रह', Marathi: 'तुमचा संग्रह', Hinglish: 'Aapka Collection' },
  settingsPreferences: { English: 'Settings & Preferences', Hindi: 'सेटिंग्स और प्राथमिकताएं', Marathi: 'सेटिंग्ज आणि प्राधान्ये', Hinglish: 'Settings & Preferences' },

  // Settings
  account: { English: 'Account', Hindi: 'खाता', Marathi: 'खाते', Hinglish: 'Account' },
  dietaryGoals: { English: 'Dietary & Goals', Hindi: 'आहार और लक्ष्य', Marathi: 'आहार आणि ध्येय', Hinglish: 'Dietary & Goals' },
  appStyle: { English: 'App Style', Hindi: 'ऐप स्टाइल', Marathi: 'अॅप स्टाईल', Hinglish: 'App Style' },
  aiSettings: { English: 'AI Settings', Hindi: 'AI सेटिंग्स', Marathi: 'AI सेटिंग्ज', Hinglish: 'AI Settings' },
  privacy: { English: 'Privacy', Hindi: 'गोपनीयता', Marathi: 'गोपनीयता', Hinglish: 'Privacy' },
  support: { English: 'Support', Hindi: 'सहायता', Marathi: 'आधार', Hinglish: 'Support' },
  name: { English: 'Name', Hindi: 'नाम', Marathi: 'नाव', Hinglish: 'Naam' },
  email: { English: 'Email', Hindi: 'ईमेल', Marathi: 'ईमेल', Hinglish: 'Email' },
  logout: { English: 'Logout', Hindi: 'लॉगआउट', Marathi: 'लॉगआउट', Hinglish: 'Logout' },
  healthGoal: { English: 'Health Goal', Hindi: 'स्वास्थ्य लक्ष्य', Marathi: 'आरोग्य ध्येय', Hinglish: 'Health Goal' },
  dietType: { English: 'Diet Type', Hindi: 'आहार का प्रकार', Marathi: 'आहाराचा प्रकार', Hinglish: 'Diet Type' },
  specificFocus: { English: 'Specific Focus', Hindi: 'विशिष्ट ध्यान', Marathi: 'विशिष्ट लक्ष', Hinglish: 'Specific Focus' },
  strictMode: { English: 'Strict Mode', Hindi: 'सख्त मोड', Marathi: 'कठोर मोड', Hinglish: 'Strict Mode' },
  theme: { English: 'Theme', Hindi: 'थीम', Marathi: 'थीम', Hinglish: 'Theme' },
  language: { English: 'Language', Hindi: 'भाषा', Marathi: 'भाषा', Hinglish: 'Language' },
  responseStyle: { English: 'Response Style', Hindi: 'प्रतिक्रिया शैली', Marathi: 'प्रतिसाद शैली', Hinglish: 'Response Style' },
  analysisPriority: { English: 'Analysis Priority', Hindi: 'विश्लेषण प्राथमिकता', Marathi: 'विश्लेषण प्राथमिकता', Hinglish: 'Analysis Priority' },

  // AI & Discovery
  newDiscovery: { English: 'New Discovery!', Hindi: 'नई खोज!', Marathi: 'नवीन शोध!', Hinglish: 'Nayi Discovery!' },
  thanksDiscovery: { English: "Thanks for discovering something new!", Hindi: "कुछ नया खोजने के लिए धन्यवाद!", Marathi: "काहीतरी नवीन शोधल्याबद्दल धन्यवाद!", Hinglish: "Kuch naya dhoondne ke liye thanks!" },
  getAiEstimate: { English: 'Get AI Estimate', Hindi: 'एआई अनुमान प्राप्त करें', Marathi: 'AI अंदाज मिळवा', Hinglish: 'AI Estimate lo' },
  aiEstimatedAnalysis: { English: 'AI Estimated Analysis', Hindi: 'एआई अनुमानित विश्लेषण', Marathi: 'AI अंदाजित विश्लेषण', Hinglish: 'AI Estimated Analysis' },
};
