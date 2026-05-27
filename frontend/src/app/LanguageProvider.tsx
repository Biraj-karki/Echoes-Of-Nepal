"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Language = "en" | "ne";

type TranslationValue = string | string[];

type TranslationDictionary = {
  [key: string]: TranslationValue;
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
};

const STORAGE_KEY = "echoes-language";

const translations: Record<Language, TranslationDictionary> = {
  en: {
    "brand.name": "Echoes of Nepal",
    "brand.tagline": "Routes, rides and stories",
    "nav.home": "Home",
    "nav.explore": "Explore",
    "nav.stays": "Stays",
    "nav.feed": "Feed",
    "nav.assistant": "AI Assistant",
    "nav.forVendors": "For Vendors",
    "nav.listBusiness": "List Your Business",
    "nav.vendorLogin": "Vendor Login",
    "nav.vendorHub": "Vendor Hub",
    "nav.profile": "Profile",
    "nav.myBookings": "My Bookings",
    "nav.myStories": "My Stories",
    "nav.saved": "Saved",
    "nav.settings": "Settings",
    "nav.logout": "Logout",
    "nav.signOut": "Sign Out",
    "nav.login": "Login",
    "nav.signUp": "Sign Up",
    "nav.language": "Language",
    "hero.badge": "Nepal travel, unified",
    "hero.title":
      "Discover Nepal with stories, stays and treks that feel connected.",
    "hero.subtitle":
      "Echoes of Nepal brings destinations, vendor stays, traveler stories and rescue support into one polished experience.",
    "hero.ctaExplore": "Explore the map",
    "hero.ctaStories": "Browse stories",
    "hero.verified": "Verified travel ecosystem",
    "hero.meta": "Districts, treks and vendors in one place",
    "hero.cardEyebrow": "Live travel platform",
    "hero.cardTitle": "Maps, stays, stories and bookings.",
    "stats.districts": "Districts",
    "stats.destinations": "Destinations",
    "stats.stories": "Travel Stories",
    "stats.treks": "Treks & Hikes",
    "destinations.badge": "Highlights",
    "destinations.title": "Popular destinations",
    "destinations.subtitle":
      "A curated snapshot of the places travelers keep coming back to.",
    "destinations.error": "Failed to load featured places.",
    "destinations.connectionError": "Connection error.",
    "destinations.districtSuffix": "District",
    "treks.badge": "Adventures",
    "treks.title": "Iconic Treks & Trails",
    "treks.subtitle":
      "Embark on legendary routes into the heart of the Himalayas. Chosen by explorers worldwide.",
    "treks.error": "Failed to load featured treks.",
    "treks.connectionError": "Connection error.",
    "treks.defaultDistrict": "Nepal",
    "treks.viewDetails": "Explore Trek Details",
    "map.title": "Explore Nepal on the Map",
    "map.subtitle":
      "Use our interactive map to explore Nepal district by district. Discover hidden destinations, epic trekking routes, and read inspiring travel stories from across the country.",
    "map.cta": "Open Interactive Map",
    "stories.badge": "Community",
    "stories.title": "Latest Travel Stories",
    "stories.unknownTraveler": "Unknown Traveler",
    "stories.by": "By",
    "vendor.badge": "For Businesses",
    "vendor.titlePrefix": "List Your Business on",
    "vendor.titleBrand": "Echoes of Nepal",
    "vendor.subtitle":
      "Own a hotel, homestay, guide service, trekking agency, transport service, or local tourism business? Join Echoes of Nepal as a verified vendor and connect with travelers exploring the Himalayas across 77 districts.",
    "vendor.applyNow": "Apply Now",
    "vendor.vendorLogin": "Vendor Login",
    "vendor.feature1Title": "Verified Partner Status",
    "vendor.feature1Body":
      "Gain trust instantly. Our admin verification ensures that travelers know your business is legitimate and highly rated.",
    "vendor.feature2Title": "District & Trek Targeting",
    "vendor.feature2Body":
      "Pinpoint your services directly to the districts, destinations, and trekking routes that travelers are actively searching for.",
    "vendor.feature3Title": "Direct Booking Requests",
    "vendor.feature3Body":
      "Manage your capacity. Receive inquiries directly to your Vendor Dashboard and confirm bookings on your own terms.",
    "cta.badge": "Share your journey",
    "cta.title": "Share your travel story with the Echoes community.",
    "cta.subtitle":
      "Add your photos, write about the places you loved, and help other travelers discover Nepal through your eyes.",
    "cta.button": "Create Story",
  },
  ne: {
    "brand.name": "इकोज अफ नेपाल",
    "brand.tagline": "मार्ग, यात्रा र कथाहरू",
    "nav.home": "होम",
    "nav.explore": "अन्वेषण",
    "nav.stays": "बसाइ",
    "nav.feed": "फिड",
    "nav.assistant": "एआई सहायक",
    "nav.forVendors": "व्यवसायका लागि",
    "nav.listBusiness": "तपाईंको व्यवसाय सूचीकृत गर्नुहोस्",
    "nav.vendorLogin": "विक्रेता लगइन",
    "nav.vendorHub": "विक्रेता हब",
    "nav.profile": "प्रोफाइल",
    "nav.myBookings": "मेरा बुकिङ",
    "nav.myStories": "मेरा कथाहरू",
    "nav.saved": "सेभ गरिएका",
    "nav.settings": "सेटिङ्स",
    "nav.logout": "लगआउट",
    "nav.signOut": "साइन आउट",
    "nav.login": "लगइन",
    "nav.signUp": "साइन अप",
    "nav.language": "भाषा",
    "hero.badge": "नेपाल यात्रा, एउटै ठाउँमा",
    "hero.title":
      "कथाहरू, बसाइ र ट्रेकसँग जोडिएको अनुभवसहित नेपाल खोज्नुहोस्।",
    "hero.subtitle":
      "इकोज अफ नेपालले गन्तव्य, विक्रेता बसाइ, यात्रुका कथाहरू र उद्धार सहयोगलाई एउटै आकर्षक अनुभवमा जोड्छ।",
    "hero.ctaExplore": "नक्सा हेर्नुहोस्",
    "hero.ctaStories": "कथाहरू हेर्नुहोस्",
    "hero.verified": "प्रमाणित यात्रा प्रणाली",
    "hero.meta": "जिल्ला, ट्रेक र विक्रेता एउटै ठाउँमा",
    "hero.cardEyebrow": "सक्रिय यात्रा प्लेटफर्म",
    "hero.cardTitle": "नक्सा, बसाइ, कथाहरू र बुकिङ।",
    "stats.districts": "जिल्लाहरू",
    "stats.destinations": "गन्तव्यहरू",
    "stats.stories": "यात्रा कथाहरू",
    "stats.treks": "ट्रेक र हाइक",
    "destinations.badge": "विशेष छनोट",
    "destinations.title": "लोकप्रिय गन्तव्यहरू",
    "destinations.subtitle":
      "यात्रुहरू बारम्बार फर्किने ठाउँहरूको छनोट गरिएको झलक।",
    "destinations.error": "विशेष स्थानहरू लोड गर्न सकिएन।",
    "destinations.connectionError": "जडान त्रुटि।",
    "destinations.districtSuffix": "जिल्ला",
    "treks.badge": "रोमाञ्चक यात्रा",
    "treks.title": "प्रसिद्ध ट्रेक र पदमार्ग",
    "treks.subtitle":
      "हिमालयको मुटुसम्म पुग्ने चर्चित मार्गहरूमा यात्रा गर्नुहोस्। विश्वभरका अन्वेषकहरूले रोजेका ट्रेलहरू।",
    "treks.error": "विशेष ट्रेकहरू लोड गर्न सकिएन।",
    "treks.connectionError": "जडान त्रुटि।",
    "treks.defaultDistrict": "नेपाल",
    "treks.viewDetails": "ट्रेक विवरण हेर्नुहोस्",
    "map.title": "नक्सामा नेपाल अन्वेषण गर्नुहोस्",
    "map.subtitle":
      "हाम्रो अन्तरक्रियात्मक नक्साबाट जिल्ला–जिल्ला नेपाल घुम्नुहोस्। लुकेका गन्तव्य, उत्कृष्ट ट्रेक मार्ग र देशभरका प्रेरणादायी यात्रा कथाहरू पत्ता लगाउनुहोस्।",
    "map.cta": "अन्तरक्रियात्मक नक्सा खोल्नुहोस्",
    "stories.badge": "समुदाय",
    "stories.title": "नवीनतम यात्रा कथाहरू",
    "stories.unknownTraveler": "अपरिचित यात्री",
    "stories.by": "लेखक",
    "vendor.badge": "व्यवसायका लागि",
    "vendor.titlePrefix": "तपाईंको व्यवसाय सूचीबद्ध गर्नुहोस्",
    "vendor.titleBrand": "इकोज अफ नेपालमा",
    "vendor.subtitle":
      "होटल, होमस्टे, गाइड सेवा, ट्रेकिङ एजेन्सी, यातायात सेवा वा स्थानीय पर्यटन व्यवसाय छ? प्रमाणित विक्रेताका रूपमा इकोज अफ नेपालमा सामेल हुनुहोस् र ७७ जिल्लामा यात्रा गरिरहेका यात्रुसँग जोडिनुहोस्।",
    "vendor.applyNow": "अहिले आवेदन दिनुहोस्",
    "vendor.vendorLogin": "विक्रेता लगइन",
    "vendor.feature1Title": "प्रमाणित साझेदार स्थिति",
    "vendor.feature1Body":
      "तुरुन्त विश्वास जित्नुहोस्। हाम्रो प्रशासनिक प्रमाणीकरणले यात्रुलाई तपाईंको व्यवसाय वैध र भरपर्दो छ भन्ने देखाउँछ।",
    "vendor.feature2Title": "जिल्ला र ट्रेक लक्ष्यीकरण",
    "vendor.feature2Body":
      "यात्रुहरूले सक्रिय रूपमा खोजिरहेका जिल्ला, गन्तव्य र ट्रेक मार्गहरूमा आफ्नो सेवा सिधै जोड्नुहोस्।",
    "vendor.feature3Title": "प्रत्यक्ष बुकिङ अनुरोध",
    "vendor.feature3Body":
      "आफ्नो क्षमता व्यवस्थित गर्नुहोस्। अनुरोधहरू सीधै विक्रेता ड्यासबोर्डमा पाउनुहोस् र आफ्नै सर्तमा बुकिङ पुष्टि गर्नुहोस्।",
    "cta.badge": "आफ्नो यात्रा साझा गर्नुहोस्",
    "cta.title": "इकोज समुदायसँग आफ्नो यात्रा कथा साझा गर्नुहोस्।",
    "cta.subtitle":
      "आफ्ना तस्बिर थप्नुहोस्, मन परेको ठाउँबारे लेख्नुहोस्, र अरू यात्रुलाई आफ्नै दृष्टिबाट नेपाल चिन्न सहयोग गर्नुहोस्।",
    "cta.button": "कथा बनाउनुहोस्",
  },
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const storedLanguage = window.localStorage.getItem(STORAGE_KEY);
    return storedLanguage === "en" || storedLanguage === "ne"
      ? storedLanguage
      : "en";
  });

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const value = useMemo<LanguageContextValue>(() => {
    const dictionary = translations[language];

    return {
      language,
      setLanguage,
      toggleLanguage: () =>
        setLanguage((current) => (current === "en" ? "ne" : "en")),
      t: (key: string) => {
        const value = dictionary[key] ?? translations.en[key] ?? key;
        return Array.isArray(value) ? value.join(" ") : value;
      },
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
