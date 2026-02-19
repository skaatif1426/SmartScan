import type { Language } from './types';

type Translations = {
  [key: string]: { [lang in Language]: string };
};

export const translations: Translations = {
  // Bottom Nav
  navScan: {
    English: 'Scan',
    Hindi: 'स्कैन',
    Marathi: 'स्कॅन',
    Hinglish: 'Scan',
  },
  navHistory: {
    English: 'History',
    Hindi: 'इतिहास',
    Marathi: 'इतिहास',
    Hinglish: 'History',
  },
  navDashboard: {
    English: 'Dashboard',
    Hindi: 'डैशबोर्ड',
    Marathi: 'डॅशबोर्ड',
    Hinglish: 'Dashboard',
  },
  navSettings: {
    English: 'Settings',
    Hindi: 'सेटिंग्स',
    Marathi: 'सेटिंग्ज',
    Hinglish: 'Settings',
  },
  // Scanner Page
  scannerTitle: {
    English: 'NutriScan AI',
    Hindi: 'न्यूट्रीस्कैन AI',
    Marathi: 'न्यूट्रीस्कॅन AI',
    Hinglish: 'NutriScan AI',
  },
  scannerPrompt: {
    English: 'Point your camera at a barcode to start.',
    Hindi: 'शुरू करने के लिए अपने कैमरे को बारकोड पर इंगित करें।',
    Marathi: 'सुरू करण्यासाठी तुमचा कॅमेरा बारकोडवर निर्देशित करा।',
    Hinglish: 'Start karne ke liye camera barcode pe rakho.',
  },
  startScanning: {
    English: 'Start Scanning',
    Hindi: 'स्कैनिंग शुरू करें',
    Marathi: 'स्कॅनिंग सुरू करा',
    Hinglish: 'Scanning chalu karo',
  },
  stopScanning: {
    English: 'Stop Scanning',
    Hindi: 'स्कैनिंग बंद करें',
    Marathi: 'स्कॅनिंग थांबवा',
    Hinglish: 'Scanning band karo',
  },
  or: {
    English: 'OR',
    Hindi: 'या',
    Marathi: 'किंवा',
    Hinglish: 'YA',
  },
  manualBarcodePlaceholder: {
    English: 'Enter barcode manually',
    Hindi: 'बारकोड मैन्युअल रूप से दर्ज करें',
    Marathi: 'बारकोड मॅन्युअली प्रविष्ट करा',
    Hinglish: 'Barcode haath se daalo',
  },
  searchProduct: {
    English: 'Search Product',
    Hindi: 'उत्पाद खोजें',
    Marathi: 'उत्पादन शोधा',
    Hinglish: 'Product dhoondo',
  },
  scanErrorTitle: {
    English: 'Scan Failed',
    Hindi: 'स्कैन विफल',
    Marathi: 'स्कॅन अयशस्वी',
    Hinglish: 'Scan fail ho gaya',
  },
  scanErrorDescription: {
    English: 'Could not read barcode. Please try again.',
    Hindi: 'बारकोड नहीं पढ़ा जा सका। कृपया पुनः प्रयास करें।',
    Marathi: 'बारकोड वाचता आला नाही. कृपया पुन्हा प्रयत्न करा.',
    Hinglish: 'Barcode read nahi hua. Phir se try karo.',
  },
  cameraPermissionErrorTitle: {
    English: 'Camera Permission Denied',
    Hindi: 'कैमरा अनुमति अस्वीकृत',
    Marathi: 'कॅमेरा परवानगी नाकारली',
    Hinglish: 'Camera permission deny ho gaya',
  },
  cameraPermissionErrorDescription: {
    English: 'To scan barcodes, please allow camera access in your browser settings.',
    Hindi: 'बारकोड स्कैन करने के लिए, कृपया अपने ब्राउज़र सेटिंग्स में कैमरा एक्सेस की अनुमति दें।',
    Marathi: 'बारकोड स्कॅन करण्यासाठी, कृपया तुमच्या ब्राउझर सेटिंग्जमध्ये कॅमेरा प्रवेशास अनुमती द्या।',
    Hinglish: 'Scan karne ke liye, browser settings me camera access allow karo.',
  },
  retry: {
    English: 'Retry',
    Hindi: 'पुनः प्रयास करें',
    Marathi: 'पुन्हा प्रयत्न करा',
    Hinglish: 'Phir se try karo',
  },
  uploadImage: {
    English: 'Upload Image',
    Hindi: 'छवि अपलोड करें',
    Marathi: 'प्रतिमा अपलोड करा',
    Hinglish: 'Image upload karo',
  },
  uploading: {
    English: 'Processing...',
    Hindi: 'प्रोसेस हो रहा है...',
    Marathi: 'प्रक्रिया होत आहे...',
    Hinglish: 'Processing...',
  },
  noBarcodeInImage: {
    English: 'No barcode was found in the uploaded image.',
    Hindi: 'अपलोड की गई छवि में कोई बारकोड नहीं मिला।',
    Marathi: 'अपलोड केलेल्या प्रतिमेमध्ये कोणताही बारकोड आढळला नाही।',
    Hinglish: 'Uploaded image mein barcode nahi mila.',
  },
  uploadError: {
    English: 'Could not read barcode from the image file.',
    Hindi: 'छवि फ़ाइल से बारकोड नहीं पढ़ा जा सका।',
    Marathi: 'प्रतिमा फाइलमधून बारकोड वाचता आला नाही।',
    Hinglish: 'Image file se barcode nahi padha jaa saka.',
  },
  // Product Page
  productNotFoundTitle: {
    English: 'Product Not Found',
    Hindi: 'उत्पाद नहीं मिला',
    Marathi: 'उत्पादन सापडले नाही',
    Hinglish: 'Product nahi mila',
  },
  productNotFoundDescription: {
    English: "We couldn't find a product with this barcode.",
    Hindi: 'हमें इस बारकोड वाला कोई उत्पाद नहीं मिला।',
    Marathi: 'आम्हाला या बारकोडचे उत्पादन सापडले नाही।',
    Hinglish: 'Yeh barcode ka product nahi mila.',
  },
  nutritionInsightsTitle: {
    English: 'AI Nutrition Insights',
    Hindi: 'AI पोषण संबंधी जानकारी',
    Marathi: 'AI पोषण अंतर्दृष्टी',
    Hinglish: 'AI Nutrition Insights',
  },
  generatingInsight: {
    English: 'Generating insight...',
    Hindi: 'अंतर्दृष्टि उत्पन्न हो रही है...',
    Marathi: 'अंतर्दृष्टी तयार होत आहे...',
    Hinglish: 'Insight generate ho raha hai...',
  },
  generatingInsightError: {
    English: 'Could not generate AI insight. Please try again later.',
    Hindi: 'AI अंतर्दृष्टि उत्पन्न नहीं हो सकी। कृपया बाद में पुनः प्रयास करें।',
    Marathi: 'AI अंतर्दृष्टी तयार करता आली नाही. कृपया नंतर पुन्हा प्रयत्न करा.',
    Hinglish: 'AI insight generate nahi ho saka. Please try again later.',
  },
  nutritionFacts: {
    English: 'Nutrition Facts',
    Hindi: 'पोषण तथ्य',
    Marathi: 'पोषण तथ्य',
    Hinglish: 'Nutrition Facts',
  },
  per100g: {
    English: 'Per 100g',
    Hindi: 'प्रति 100 ग्राम',
    Marathi: 'प्रति 100 ग्रॅम',
    Hinglish: 'Per 100g',
  },
  ingredients: {
    English: 'Ingredients',
    Hindi: 'सामग्री',
    Marathi: 'घटक',
    Hinglish: 'Ingredients',
  },
  chatbotTitle: {
    English: 'AI Assistant',
    Hindi: 'AI सहायक',
    Marathi: 'AI सहाय्यक',
    Hinglish: 'AI Assistant',
  },
  chatbotPlaceholder: {
    English: 'Ask about this product...',
    Hindi: 'इस उत्पाद के बारे में पूछें...',
    Marathi: 'या उत्पादनाबद्दल विचारा...',
    Hinglish: 'Iss product ke baare me pucho...',
  },
  // History Page
  historyTitle: {
    English: 'Scan History',
    Hindi: 'स्कैन इतिहास',
    Marathi: 'स्कॅन इतिहास',
    Hinglish: 'Scan History',
  },
  historyEmpty: {
    English: 'No products scanned yet.',
    Hindi: 'अभी तक कोई उत्पाद स्कैन नहीं किया गया है।',
    Marathi: 'अद्याप कोणतेही उत्पादन स्कॅन केलेले नाही।',
    Hinglish: 'Abhi tak kuch scan nahi kiya.',
  },
  // Dashboard Page
  dashboardTitle: {
    English: 'My Dashboard',
    Hindi: 'मेरा डैशबोर्ड',
    Marathi: 'माझा डॅशबोर्ड',
    Hinglish: 'Mera Dashboard',
  },
  totalScans: {
    English: 'Total Scans',
    Hindi: 'कुल स्कैन',
    Marathi: 'एकूण स्कॅन',
    Hinglish: 'Total Scans',
  },
  scanStreak: {
    English: 'Scan Streak',
    Hindi: 'स्कैन स्ट्रीक',
    Marathi: 'स्कॅन स्ट्रीक',
    Hinglish: 'Scan Streak',
  },
  days: {
    English: 'days',
    Hindi: 'दिन',
    Marathi: 'दिवस',
    Hinglish: 'din',
  },
  achievements: {
    English: 'Achievements',
    Hindi: 'उपलब्धियां',
    Marathi: 'उपलब्धी',
    Hinglish: 'Achievements',
  },
  scannedCategories: {
    English: 'Scanned Categories',
    Hindi: 'स्कैन की गई श्रेणियां',
    Marathi: 'स्कॅन केलेल्या श्रेणी',
    Hinglish: 'Scanned Categories',
  },
  // Settings Page
  settingsTitle: {
    English: 'Settings',
    Hindi: 'सेटिंग्स',
    Marathi: 'सेटिंग्ज',
    Hinglish: 'Settings',
  },
  language: {
    English: 'Language',
    Hindi: 'भाषा',
    Marathi: 'भाषा',
    Hinglish: 'Language',
  },
  preferences: {
    English: 'Preferences',
    Hindi: 'वरीयताएँ',
    Marathi: 'प्राधान्ये',
    Hinglish: 'Preferences',
  },
  vegetarian: {
    English: 'Vegetarian',
    Hindi: 'शाकाहारी',
    Marathi: 'शाकाहारी',
    Hinglish: 'Vegetarian',
  },
  nonVegetarian: {
    English: 'Non-Vegetarian',
    Hindi: 'मांसाहारी',
    Marathi: 'मांसाहारी',
    Hinglish: 'Non-Vegetarian',
  },
  allergies: {
    English: 'Allergies',
    Hindi: 'एलर्जी',
    Marathi: 'ऍलर्जी',
    Hinglish: 'Allergies',
  },
  allergiesPlaceholder: {
    English: 'e.g., nuts, gluten, soy',
    Hindi: 'जैसे, नट्स, ग्लूटेन, सोया',
    Marathi: 'उदा. नट्स, ग्लूटेन, सोया',
    Hinglish: 'jaise, nuts, gluten, soy',
  },
  advancedSettings: {
    English: 'Advanced',
    Hindi: 'उन्नत',
    Marathi: 'प्रगत',
    Hinglish: 'Advanced',
  },
  advancedUiMode: {
    English: 'Advanced UI Mode',
    Hindi: 'उन्नत यूआई मोड',
    Marathi: 'प्रगत UI मोड',
    Hinglish: 'Advanced UI Mode',
  },
  advancedUiModeDescription: {
    English: 'Show extra details and analytics.',
    Hindi: 'अतिरिक्त विवरण और विश्लेषण दिखाएं।',
    Marathi: 'अतिरिक्त तपशील आणि विश्लेषण दर्शवा।',
    Hinglish: 'Extra details aur analytics dikhao.',
  },
  aiUsage: {
    English: 'AI Usage',
    Hindi: 'एआई उपयोग',
    Marathi: 'एआय वापर',
    Hinglish: 'AI Usage',
  },
  aiApiCalls: {
    English: 'AI Calls',
    Hindi: 'एआई कॉल्स',
    Marathi: 'एआय कॉल्स',
    Hinglish: 'AI Calls',
  },
  aiUsageDescription: {
    English: 'Tracks the number of calls made to the AI model.',
    Hindi: 'एआई मॉडल पर किए गए कॉल्स की संख्या को ट्रैक करता है।',
    Marathi: 'एआय मॉडेलवर केलेल्या कॉल्सची संख्या ट्रॅक करते।',
    Hinglish: 'AI model pe kiye gaye calls ko track karta hai.',
  },
  reset: {
    English: 'Reset',
    Hindi: 'रीसेट',
    Marathi: 'रीसेट',
    Hinglish: 'Reset',
  },
  aiChat: {
    English: 'AI Chat',
    Hindi: 'एआई चैट',
    Marathi: 'एआय चॅट',
    Hinglish: 'AI Chat',
  },
  aiInsights: {
    English: 'AI Insights',
    Hindi: 'एआई अंतर्दृष्टि',
    Marathi: 'एआय अंतर्दृष्टी',
    Hinglish: 'AI Insights',
  },
  analytics: {
    English: 'Analytics',
    Hindi: 'विश्लेषण',
    Marathi: 'विश्लेषण',
    Hinglish: 'Analytics',
  },
  analyticsDescription: {
    English: 'Client-side usage statistics.',
    Hindi: 'क्लाइंट-साइड उपयोग के आँकड़े।',
    Marathi: 'क्लाइंट-साइड वापर आकडेवारी.',
    Hinglish: 'Client-side usage statistics.',
  },
  resetErrors: {
    English: 'Reset Errors',
    Hindi: 'त्रुटियां रीसेट करें',
    Marathi: 'त्रुटी रीसेट करा',
    Hinglish: 'Errors Reset Karo',
  },
  errorsTracked: {
    English: 'Errors',
    Hindi: 'त्रुटियां',
    Marathi: 'त्रुटी',
    Hinglish: 'Errors',
  },
};
