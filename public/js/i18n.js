// ==========================================================================
// VIP PARTY (विकासशील इंसान पार्टी) - BILINGUAL TRANSLATION ENGINE (i18n)
// Translates all navbar items, forms, contact, sections, and whole site data
// Supports both Instant UI Dictionary + Real-time Google Translate
// ==========================================================================

const VIP_TRANSLATIONS = {
  hi: {
    // Top Ticker & Helpline
    'ticker.upcoming': 'आगामी कार्यक्रम',
    'ticker.helpline': 'हेल्पलाइन: 0612-2506830',
    'ticker.t1': '🎯 विशाल निषाद आरक्षण महासम्मेलन | 📅 दिनांक: 15 नवम्बर 2026 | 📍 स्थान: गांधी मैदान, पटना ➔ विवरण देखने के लिए यहाँ क्लिक करें',
    'ticker.t2': "★ 'सन ऑफ मल्लाह' श्री मुकेश सहनी का जनसंवाद कार्यक्रम | 📍 मुजफ्फरपुर | ➔ पार्टी से जुड़ने के लिए ऑनलाइन आवेदन करें",
    'ticker.t3': '🎓 अमर शहीद जुब्बा सहनी मेधा छात्रवृत्ति के लिए ऑनलाइन आवेदन शुरू ➔ अभी आवेदन करें',

    // Branding
    'brand.name': 'VIP',
    'brand.tagline': 'विकासशील इंसान पार्टी',

    // Navigation Menu 1
    'nav.home': 'होम',
    'nav.about': 'हमारे बारे में',
    'nav.about_vip': 'वीआईपी के बारे में',
    'nav.journey_mukesh': 'मुकेश सहनी का सफर',
    'nav.mission_vision': 'मिशन एवं विज़न',
    'nav.ideology': 'हमारी विचारधारा',
    'nav.major_issues': 'प्रमुख मुद्दे',
    'nav.nvs': '(NVS) निषाद विकास संघ',
    'nav.gallery': 'गैलरी',
    'nav.photo': 'फोटो',
    'nav.video': 'वीडियो',
    'nav.press': 'प्रेस',
    'nav.news': 'समाचार',
    'nav.interview': 'इंटरव्यू',
    'nav.press_release': 'प्रेस विज्ञप्ति',
    'nav.download': 'डाउनलोड',
    'nav.leaders_photo': 'नेताओं की तस्वीरें',
    'nav.infographics_banner': 'इन्फोग्राफिक्स और बैनर',
    'nav.quotes': 'सुविचार एवं उद्धरण',
    'nav.mobile_wallpaper': 'मोबाइल वॉलपेपर',

    // Download Section UI
    'download.hero_badge': 'VIP डिजिटल मीडिया व डाउनलोड सेन्टर',
    'download.h_hub': 'पार्टी प्रचार सामग्री एवं आधिकारिक डाउनलोड्स',
    'download.h_leaders': 'नेताओं की तस्वीरें (Leaders Photo)',
    'download.h_banners': 'अभियान बैनर और इन्फोग्राफिक्स (Infographics & Banner)',
    'download.h_quotes': 'सुविचार एवं प्रेरक उद्धरण (Quotes)',
    'download.h_wallpapers': 'आधिकारिक 4K मोबाइल वॉलपेपर (Mobile Wallpaper)',
    'download.hero_subtitle': 'विकासशील इंसान पार्टी के राष्ट्रीय नेतृत्व, चुनाव अभियान बैनर, प्रेरक विचार और मोबाइल वॉलपेपर उच्च गुणवत्ता (HD) में निःशुल्क डाउनलोड करें और सोशल मीडिया पर साझा करें।',
    'download.search_placeholder': 'खोजें: मुकेश सहनी, आरक्षण रैली, सुविचार, वॉलपेपर...',
    'download.search_btn': 'खोजें',
    'download.tab_all': 'सभी सामग्री (All)',
    'download.tab_leaders': 'नेताओं की तस्वीरें',
    'download.tab_banners': 'इन्फोग्राफिक्स और बैनर',
    'download.tab_quotes': 'सुविचार एवं उद्धरण',
    'download.tab_wallpaper': 'मोबाइल वॉलपेपर',
    'download.cat_leaders_title': 'नेताओं की तस्वीरें',
    'download.cat_leaders_desc': 'राष्ट्रीय अध्यक्ष मुकेश सहनी, अमर शहीद जुब्बा सहनी और पार्टी नेतृत्व की हाई-रेजोल्यूशन पोर्ट्रेट्स।',
    'download.cat_banners_title': 'अभियान बैनर',
    'download.cat_banners_desc': 'निषाद आरक्षण संकल्प रैली, पार्टी चुनाव चिह्न नाव और सोशल मीडिया हेतु 16:9 व चौकोर डिजिटल बैनर।',
    'download.cat_quotes_title': 'सुविचार एवं उद्धरण',
    'download.cat_quotes_desc': 'सामाजिक न्याय, समान अधिकार और स्वाभिमान के प्रेरक विचार WhatsApp व Facebook पर साझा करने हेतु।',
    'download.cat_wallpapers_title': 'मोबाइल वॉलपेपर',
    'download.cat_wallpapers_desc': 'स्मार्टफोन लॉकस्क्रीन और होमस्क्रीन के लिए तैयार 1080x1920 9:16 अल्ट्रा HD 4K पार्टी वॉलपेपर्स।',
    'download.btn_download': 'डाउनलोड करें (Download HD)',
    'download.guide_title': 'आधिकारिक उपयोग मार्गदर्शिका (Usage Guidelines)',
    'download.guide_subtitle': 'पार्टी कार्यकर्ताओं, मीडिया एवं समर्थकों हेतु महत्वपूर्ण निर्देश',
    'nav.forms': 'फॉर्म',
    'nav.join_party': 'वीआईपी पार्टी से जुड़ें',
    'nav.join_volunteer': 'वालंटियर के रूप में जुड़ें',
    'nav.scholarship': 'जुब्बा सहनी छात्रवृत्ति योजना',
    'nav.candidature_up': 'यूपी 2027 उम्मीदवारी आवेदन',
    'nav.contact': 'संपर्क करें',

    // Navigation Menu 2
    'nav.login_signup': 'लॉगिन / साइनअप',
    'nav.support_us': 'सहयोग करें',
    'nav.join_vip': 'सदस्य बनें',

    // Quick Action Cards
    'quick.member_title': 'सदस्य बनें',
    'quick.member_desc': 'VIP परिवार से जुड़ें और बिहार के नवनिर्माण व सामाजिक न्याय के आंदोलन में अपना बहुमूल्य योगदान दें।',
    'quick.active_title': 'सक्रिय सदस्य बनें',
    'quick.active_desc': 'पार्टी के संगठनात्मक अभियानों और सामाजिक कार्यों में जमीनी स्तर पर बढ़-चढ़कर सक्रिय हिस्सा लें।',
    'quick.support_title': 'सहयोग करें',
    'quick.support_desc': 'पार्टी को मजबूत बनाने के लिए अपना आर्थिक सहयोग प्रदान कर सामाजिक न्याय के संघर्ष को सशक्त करें।',
    'quick.join_now': 'अभी जुड़ें',
    'quick.register_now': 'रजिस्टर करें',
    'quick.donate_now': 'दान दें',

    // Vision Section
    'vision.badge': 'हमारा संकल्प',
    'vision.title': 'बिहार के नवनिर्माण का दृष्टिकोण',
    'vision.subtitle': 'हम एक ऐसे बिहार के निर्माण के लिए प्रतिबद्ध हैं जहाँ हर युवा को रोजगार, हर किसान-मजदूर को सम्मान और हर नागरिक को न्याय मिले।',
    'vision.p1_title': 'जन उत्थान',
    'vision.p1_desc': 'बिहार के हर नागरिक, विशेषकर युवाओं और वंचितों को प्रगति के समान अवसर प्रदान करना। हमारी नीतियां जमीनी स्तर पर विकास सुनिश्चित कर एक आत्मनिर्भर और सशक्त समाज के निर्माण के लिए प्रतिबद्ध हैं।',
    'vision.p2_title': 'जन कल्याण',
    'vision.p2_desc': 'किसानों, मत्स्यपालकों, मजदूरों और आम जनता के जीवन को खुशहाल बनाने के लिए समर्पित। बेहतर स्वास्थ्य, गुणवत्तापूर्ण शिक्षा और सर्वसुलभ बुनियादी सुविधाएं प्रदान कर हर चेहरे पर मुस्कान लाना ही हमारा संकल्प है।',
    'vision.p3_title': 'जन-सम्मान',
    'vision.p3_desc': 'सामाजिक न्याय की अडिग विचारधारा के साथ, समाज के अंतिम पायदान पर खड़े हर व्यक्ति को उसका वास्तविक अधिकार दिलाना। हम एक ऐसे समतामूलक समाज के पैरोकार हैं जहाँ हर नागरिक स्वाभिमान से जिए।',

    // Important Pages Section
    'pages.badge': 'महत्वपूर्ण जानकारी',
    'pages.title': 'विकासशील इंसान पार्टी के प्रमुख पृष्ठ',
    'pages.subtitle': 'वीआईपी के इतिहास, नेतृत्व, संगठन, प्रमुख योजनाओं, समाचार और कार्यक्रमों की आधिकारिक जानकारी सीधे प्राप्त करें।',

    // Contact Page (like rjd.co.in/contact)
    'contact.page_title': 'संपर्क करें | VIP Party',
    'contact.heading': 'संपर्क करें',
    'contact.subheading': 'आपके सुझाव और विचार हमारे लिए महत्वपूर्ण हैं। फ़ोन, ईमेल या नीचे दिए गए फॉर्म के माध्यम से हमसे संपर्क करें।',
    'contact.office_heading': 'कार्यालय से संपर्क करें',
    'contact.hq_label': 'मुख्यालय का पता',
    'contact.hq_val': 'वीआईपी केन्द्रीय कार्यालय, 2, वीरचंद पटेल पथ, पटना, बिहार - 800001',
    'contact.phone_label': 'फ़ोन नंबर',
    'contact.email_label': 'ईमेल आईडी',
    'contact.hours_label': 'कार्यालय समय',
    'contact.hours_val': 'सोमवार - शनिवार: 10:00 AM - 06:00 PM',
    'contact.social_label': 'सोशल मीडिया पर जुड़ें',
    'contact.form_title': 'हमें संदेश भेजें',
    'contact.form_subtitle': 'अपना विवरण और संदेश दर्ज करें, हमारी टीम जल्द ही आपसे संपर्क करेगी।',
    'contact.name': 'पूरा नाम',
    'contact.name_ph': 'आपका नाम दर्ज करें',
    'contact.phone': 'फ़ोन नंबर',
    'contact.phone_ph': '10 अंकों का मोबाइल नंबर',
    'contact.email': 'ईमेल आईडी (वैकल्पिक)',
    'contact.email_ph': 'email@example.com',
    'contact.subject': 'विषय / श्रेणी',
    'contact.subject_default': 'सामान्य पूछताछ',
    'contact.subject_membership': 'पार्टी सदस्यता सम्बन्धी',
    'contact.subject_grievance': 'शिकायत व समस्या निवारण',
    'contact.subject_suggestion': 'सुझाव एवं विचार',
    'contact.subject_media': 'मीडिया व प्रेस संबंधित',
    'contact.message': 'संदेश',
    'contact.message_ph': 'अपना संदेश यहाँ विस्तार से लिखें...',
    'contact.send_btn': 'संदेश भेजें',
    'contact.sending_btn': 'संदेश भेजा जा रहा है...',
    'contact.success_title': 'बधाई हो!',
    'contact.success_msg': 'आपका संदेश सफलतापूर्वक दर्ज कर लिया गया है। हमारी टीम शीघ्र आपसे संपर्क करेगी।',

    // Callout / Pre-Footer
    'callout.title': 'हमसे जुड़ें, बदलाव लाएं',
    'callout.desc': 'विकासशील इंसान पार्टी (VIP) के साथ जुड़ें और स्वाभिमानी, शिक्षित और समृद्ध बिहार के निर्माण में भागीदार बनें।',
    'callout.btn': 'सदस्य बनें (Join VIP)',
    'callout.follow': 'हमें फॉलो करें:',

    // Footer
    'footer.about_heading': 'VIP',
    'footer.about_sub': 'विकासशील इंसान पार्टी',
    'footer.about_desc': 'सामाजिक न्याय, समान अधिकार और समृद्ध बिहार के लिए हमारा संघर्ष जारी है। विकासशील इंसान पार्टी (VIP) का मुख्य उद्देश्य शोषित, वंचित, अति-पिछड़े और निषाद समाज का संवैधानिक अधिकार और सशक्तीकरण है। "सन ऑफ मल्लाह" श्री मुकेश सहनी के नेतृत्व में शिक्षित, विकसित, रोजगारयुक्त और समृद्ध बिहार बनाने के हमारे विजन, नेतृत्व, समाचार और कार्यक्रमों के बारे में जानें।',
    'footer.quote': '"जिसकी जितनी संख्या भारी, उसकी उतनी हिस्सेदारी।"',
    'footer.quick_links': 'त्वरित लिंक',
    'footer.key_links': 'महत्वपूर्ण लिंक',
    'footer.contact_info': 'संपर्क सूत्र',
    'footer.rights': 'सर्वाधिकार सुरक्षित।',
    'footer.privacy': 'गोपनीयता नीति',
    'footer.terms': 'नियम एवं शर्तें',
    'footer.sitemap': 'साइटमैप',

    // Auth Modal
    'auth.title': 'वीआईपी डिजिटल पोर्टल',
    'auth.subtitle': 'लॉगिन करें या नया सदस्य खाता बनाएं',
    'auth.tab_login': 'लॉगिन करें',
    'auth.tab_signup': 'नया खाता बनाएं',
    'auth.mobile_label': 'मोबाइल नंबर दर्ज करें',
    'auth.mobile_ph': '10 अंकों का मोबाइल नंबर',
    'auth.name_label': 'पूरा नाम',
    'auth.name_ph': 'आपका पूरा नाम',
    'auth.send_otp': 'ओटीपी प्राप्त करें',
    'auth.close': 'बंद करें'
  },

  en: {
    // Top Ticker & Helpline
    'ticker.upcoming': 'Upcoming Events',
    'ticker.helpline': 'Helpline: 0612-2506830',
    'ticker.t1': '🎯 Grand Nishad Reservation Conference | 📅 Date: Nov 15, 2026 | 📍 Gandhi Maidan, Patna ➔ Click for details',
    'ticker.t2': "★ 'Son of Mallah' Shri Mukesh Sahani's Public Dialogue | 📍 Muzaffarpur | ➔ Apply online to join party",
    'ticker.t3': '🎓 Amar Shaheed Jubba Sahani Merit Scholarship Open ➔ Apply Now',

    // Branding
    'brand.name': 'VIP',
    'brand.tagline': 'Vikassheel Insaan Party',

    // Navigation Menu 1 (Matching User Photo Exact English Names)
    'nav.home': 'Home',
    'nav.about': 'About Us',
    'nav.about_vip': 'About VIP',
    'nav.journey_mukesh': 'Journey of Mukesh Sahani',
    'nav.mission_vision': 'Mission & Vision',
    'nav.ideology': 'Our Ideology',
    'nav.major_issues': 'Major Issue',
    'nav.nvs': '(NVS) Nishad Vikash Sangh',
    'nav.gallery': 'Gallery',
    'nav.photo': 'Photo',
    'nav.video': 'Video',
    'nav.press': 'Press',
    'nav.news': 'News',
    'nav.interview': 'Interview',
    'nav.press_release': 'Press Release',
    'nav.download': 'Download',
    'nav.leaders_photo': 'Leaders Photo',
    'nav.infographics_banner': 'Infographics & Banner',
    'nav.quotes': 'Quotes',
    'nav.mobile_wallpaper': 'Mobile Wallpaper',

    // Download Section UI
    'download.hero_badge': 'VIP Digital Media & Download Centre',
    'download.h_hub': 'Official Party Campaign Media & Downloads',
    'download.h_leaders': 'Leaders Photo (Official High-Res Portraits)',
    'download.h_banners': 'Campaign Banners & Infographics',
    'download.h_quotes': 'Inspirational Quotes & Thoughts',
    'download.h_wallpapers': 'Official 4K Mobile Wallpapers',
    'download.hero_subtitle': 'Download high-resolution official portraits of VIP leadership, election campaign banners, inspirational quotes, and 4K mobile wallpapers free to use and share on social media.',
    'download.search_placeholder': 'Search: Mukesh Sahani, Reservation Rally, Quotes, Wallpapers...',
    'download.search_btn': 'Search',
    'download.tab_all': 'All Items',
    'download.tab_leaders': 'Leaders Photo',
    'download.tab_banners': 'Infographics & Banner',
    'download.tab_quotes': 'Quotes & Thoughts',
    'download.tab_wallpaper': 'Mobile Wallpaper',
    'download.cat_leaders_title': 'Leaders Photo',
    'download.cat_leaders_desc': 'High-resolution official portraits of National President Mukesh Sahani, Amar Shaheed Jubba Sahani, and leadership.',
    'download.cat_banners_title': 'Campaign Banners',
    'download.cat_banners_desc': 'Official Nishad Aarakshan Sankalp Rally posters, party boat symbol banners, and 16:9 digital assets.',
    'download.cat_quotes_title': 'Quotes & Thoughts',
    'download.cat_quotes_desc': 'Inspirational thoughts on social justice, equal rights, and self-respect ready to share on WhatsApp and social media.',
    'download.cat_wallpapers_title': 'Mobile Wallpapers',
    'download.cat_wallpapers_desc': 'Ultra HD 4K 1080x1920 9:16 mobile lockscreen and homescreen wallpapers for smartphones.',
    'download.btn_download': 'Download HD',
    'download.guide_title': 'Official Usage Guidelines',
    'download.guide_subtitle': 'Essential instructions for party karyakartas, media, and supporters',
    'nav.forms': 'Forms',
    'nav.join_party': 'Join VIP Party',
    'nav.join_volunteer': 'Join as a Volunteer',
    'nav.scholarship': 'Jubba Sahani Scholarship Scheme',
    'nav.candidature_up': 'Application for UP 2027 Candidature',
    'nav.contact': 'Contact Us',

    // Navigation Menu 2 (Matching User Photo Exact English Names)
    'nav.login_signup': 'Login / SignUp',
    'nav.support_us': 'Support Us',
    'nav.join_vip': 'Join VIP',

    // Quick Action Cards
    'quick.member_title': 'Join as Member',
    'quick.member_desc': 'Join the VIP family and make your valuable contribution to the movement for Bihar’s resurgence and social justice.',
    'quick.active_title': 'Become Active Member',
    'quick.active_desc': 'Actively participate at the grassroots level in party organizational campaigns and social welfare initiatives.',
    'quick.support_title': 'Support Us',
    'quick.support_desc': 'Contribute financially to strengthen the party and empower our collective fight for social justice.',
    'quick.join_now': 'Join Now',
    'quick.register_now': 'Register Now',
    'quick.donate_now': 'Donate Now',

    // Vision Section
    'vision.badge': 'Our Resolve',
    'vision.title': 'Vision for Bihar’s Reconstruction',
    'vision.subtitle': 'We are committed to building a Bihar where every youth gets employment, every farmer and worker gets dignity, and every citizen gets justice.',
    'vision.p1_title': 'Public Upliftment',
    'vision.p1_desc': 'Providing equal opportunities for progress to every citizen of Bihar, especially youth and underprivileged communities.',
    'vision.p2_title': 'Public Welfare',
    'vision.p2_desc': 'Dedicated to improving the lives of farmers, fishermen, laborers, and the general public with healthcare and quality education.',
    'vision.p3_title': 'Public Dignity',
    'vision.p3_desc': 'With unwavering faith in social justice, securing rightful constitutional rights for every person at the final rung of society.',

    // Important Pages Section
    'pages.badge': 'Important Information',
    'pages.title': 'Key Pages of Vikassheel Insaan Party',
    'pages.subtitle': 'Get official information directly on VIP history, leadership, organization, flagship welfare schemes, news, and events.',

    // Contact Page (like rjd.co.in/contact)
    'contact.page_title': 'Contact Us | VIP Party',
    'contact.heading': 'Contact Us',
    'contact.subheading': 'Your suggestions and feedback are invaluable to us. Reach out via phone, email or the contact form below.',
    'contact.office_heading': 'Contact Office',
    'contact.hq_label': 'Headquarters Address',
    'contact.hq_val': 'VIP Central Office, 2, Veerchand Patel Path, Patna, Bihar - 800001',
    'contact.phone_label': 'Phone Number',
    'contact.email_label': 'Email Address',
    'contact.hours_label': 'Office Working Hours',
    'contact.hours_val': 'Monday - Saturday: 10:00 AM - 06:00 PM',
    'contact.social_label': 'Follow Us on Social Media',
    'contact.form_title': 'Send Us a Message',
    'contact.form_subtitle': 'Enter your details and message, our team will get in touch with you shortly.',
    'contact.name': 'Full Name',
    'contact.name_ph': 'Enter your full name',
    'contact.phone': 'Phone Number',
    'contact.phone_ph': '10-digit mobile number',
    'contact.email': 'Email Address (Optional)',
    'contact.email_ph': 'email@example.com',
    'contact.subject': 'Subject / Category',
    'contact.subject_default': 'General Inquiry',
    'contact.subject_membership': 'Party Membership Inquiry',
    'contact.subject_grievance': 'Grievance Redressal',
    'contact.subject_suggestion': 'Suggestions & Feedback',
    'contact.subject_media': 'Media & Press Inquiry',
    'contact.message': 'Message',
    'contact.message_ph': 'Write your message or inquiry here...',
    'contact.send_btn': 'Send Message',
    'contact.sending_btn': 'Sending Message...',
    'contact.success_title': 'Thank You!',
    'contact.success_msg': 'Your message has been sent successfully. Our team will get back to you shortly.',

    // Callout / Pre-Footer
    'callout.title': 'Join Us, Bring Change',
    'callout.desc': 'Join Vikassheel Insaan Party (VIP) and be a partner in building an educated, self-reliant, and prosperous Bihar.',
    'callout.btn': 'Join VIP',
    'callout.follow': 'Follow Us:',

    // Footer
    'footer.about_heading': 'VIP',
    'footer.about_sub': 'Vikassheel Insaan Party',
    'footer.about_desc': 'Our struggle for social justice, equal rights, and a prosperous Bihar continues. Vikassheel Insaan Party (VIP) stands for constitutional rights and empowerment of the underprivileged and Nishad community under the visionary leadership of Shri Mukesh Sahani.',
    'footer.quote': '"Proportionate representation according to demographic strength."',
    'footer.quick_links': 'Quick Links',
    'footer.key_links': 'Important Links',
    'footer.contact_info': 'Contact Info',
    'footer.rights': 'All Rights Reserved.',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
    'footer.sitemap': 'Sitemap',

    // Auth Modal
    'auth.title': 'VIP Digital Portal',
    'auth.subtitle': 'Login or create a new member account',
    'auth.tab_login': 'Login',
    'auth.tab_signup': 'Sign Up',
    'auth.mobile_label': 'Enter Mobile Number',
    'auth.mobile_ph': '10-digit mobile number',
    'auth.name_label': 'Full Name',
    'auth.name_ph': 'Your full name',
    'auth.send_otp': 'Send OTP',
    'auth.close': 'Close'
  }
};

// Global Language Controller
window.VIP_LANG = {
  currentLang: 'hi',

  init() {
    // 1. Check saved language or default to Hindi
    const saved = localStorage.getItem('vip_language') || 'hi';
    this.setLanguage(saved, false);
    this.bindButtons();
    this.initGoogleTranslate();
  },

  setLanguage(lang, triggerGoogle = true) {
    if (lang !== 'hi' && lang !== 'en') lang = 'hi';
    this.currentLang = lang;
    localStorage.setItem('vip_language', lang);
    document.documentElement.lang = lang === 'hi' ? 'hi-IN' : 'en-US';

    // 2. Update UI translation dictionary
    const dict = VIP_TRANSLATIONS[lang] || VIP_TRANSLATIONS.hi;

    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach((el) => {
      const key = el.getAttribute('data-i18n-ph');
      if (dict[key]) {
        el.setAttribute('placeholder', dict[key]);
      }
    });

    // Translate titles / aria-labels
    document.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (dict[key]) {
        el.setAttribute('title', dict[key]);
        el.setAttribute('aria-label', dict[key]);
      }
    });

    // 3. Update active state of language toggle buttons
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      const btnLang = btn.getAttribute('data-lang');
      if (btnLang === lang) {
        btn.classList.add('bg-primary', 'text-white', 'shadow-sm');
        btn.classList.remove('text-gray-700', 'hover:text-primary');
      } else {
        btn.classList.remove('bg-primary', 'text-white', 'shadow-sm');
        btn.classList.add('text-gray-700', 'hover:text-primary');
      }
    });

    // 4. Trigger Google Translate for dynamic body content
    if (triggerGoogle) {
      this.triggerGoogleTranslate(lang);
    }
  },

  bindButtons() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedLang = btn.getAttribute('data-lang');
        this.setLanguage(selectedLang, true);
      });
    });
  },

  initGoogleTranslate() {
    // Hidden Google Translate script inclusion
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);

      window.googleTranslateElementInit = () => {
        if (window.google && window.google.translate) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'hi',
              includedLanguages: 'hi,en',
              autoDisplay: false
            },
            'google_translate_element'
          );

          // Apply saved language if English was selected
          const saved = localStorage.getItem('vip_language');
          if (saved === 'en') {
            setTimeout(() => {
              this.triggerGoogleTranslate('en');
            }, 600);
          }
        }
      };
    }
  },

  triggerGoogleTranslate(lang) {
    try {
      const select = document.querySelector('#google_translate_element select');
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
      } else {
        // Set cookies as fallback
        const host = window.location.hostname;
        const target = lang === 'en' ? '/hi/en' : '/en/hi';
        document.cookie = `googtrans=${target}; path=/; domain=${host}`;
        document.cookie = `googtrans=${target}; path=/;`;
      }
    } catch (e) {
      console.warn('Google translate note:', e);
    }
  }
};

// Auto-run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => VIP_LANG.init());
} else {
  VIP_LANG.init();
}
