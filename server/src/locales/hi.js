export default {
  // ─── Auth ───────────────────────────────────────────────────────────────────
  'auth.login.success': 'लॉगिन सफल',
  'auth.login.invalid': 'अमान्य क्रेडेंशियल',
  'auth.login.locked': 'खाता लॉक है। बाद में पुनः प्रयास करें',
  'auth.login.suspended': 'खाता निलंबित है। सहायता से संपर्क करें',
  'auth.logout.success': 'सफलतापूर्वक लॉगआउट हुआ',
  'auth.token.expired': 'एक्सेस टोकन समाप्त हो गया',
  'auth.token.invalid': 'अमान्य एक्सेस टोकन',
  'auth.token.required': 'एक्सेस टोकन आवश्यक है',
  'auth.token.refreshed': 'टोकन रिफ्रेश हुआ',
  'auth.otp.sent': 'यदि खाता मौजूद है, तो OTP भेजा गया है',
  'auth.otp.invalid': 'अमान्य या समाप्त OTP',
  'auth.password.reset': 'पासवर्ड सफलतापूर्वक रीसेट हुआ',
  'auth.password.changed': 'पासवर्ड सफलतापूर्वक बदला गया',
  'auth.password.weak': 'पासवर्ड कम से कम 8 अक्षर, 1 बड़ा अक्षर, 1 अंक और 1 विशेष अक्षर होना चाहिए',
  'auth.password.incorrect': 'वर्तमान पासवर्ड गलत है',
  'auth.permission.denied': 'अपर्याप्त अनुमतियाँ',

  // ─── Registration ──────────────────────────────────────────────────────────
  'registration.success': 'पंजीकरण सफल। खाता सक्रियण लंबित है',
  'registration.activated': 'सहयोगी सफलतापूर्वक सक्रिय हुआ',
  'registration.sponsor.valid': 'प्रायोजक मान्य है',
  'registration.sponsor.notFound': 'प्रायोजक नहीं मिला',
  'registration.sponsor.inactive': 'प्रायोजक सक्रिय नहीं है',
  'registration.phone.exists': 'फ़ोन नंबर पहले से पंजीकृत है',
  'registration.email.exists': 'ईमेल पता पहले से पंजीकृत है',

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  'dashboard.fetched': 'डैशबोर्ड डेटा प्राप्त हुआ',
  'dashboard.advancePayment': 'अग्रिम भुगतान डेटा प्राप्त हुआ',
  'dashboard.referralLink': 'रेफरल लिंक प्राप्त हुआ',
  'dashboard.referralQR': 'रेफरल QR कोड बनाया गया',

  // ─── Profile ───────────────────────────────────────────────────────────────
  'profile.fetched': 'प्रोफ़ाइल प्राप्त हुई',
  'profile.updated': 'प्रोफ़ाइल अपडेट हुई',
  'profile.photo.updated': 'प्रोफ़ाइल फ़ोटो अपडेट हुई',
  'profile.notFound': 'सहयोगी नहीं मिला',

  // ─── KYC ───────────────────────────────────────────────────────────────────
  'kyc.pan.submitted': 'PAN दस्तावेज़ जमा किया गया',
  'kyc.aadhaar.submitted': 'आधार दस्तावेज़ जमा किया गया',
  'kyc.bank.submitted': 'बैंक विवरण जमा किया गया',
  'kyc.approved': 'आपका {type} दस्तावेज़ स्वीकृत हो गया है',
  'kyc.rejected': 'आपका {type} दस्तावेज़ अस्वीकृत हुआ। कारण: {reason}',
  'kyc.documents.fetched': 'KYC दस्तावेज़ प्राप्त हुए',

  // ─── Settings ──────────────────────────────────────────────────────────────
  'settings.fetched': 'सेटिंग्स प्राप्त हुईं',
  'settings.updated': 'सेटिंग्स अपडेट हुईं',

  // ─── Genealogy ─────────────────────────────────────────────────────────────
  'genealogy.tree.fetched': 'ट्री डेटा प्राप्त हुआ',
  'genealogy.downline.fetched': 'डाउनलाइन डेटा प्राप्त हुआ',
  'genealogy.sponsor.fetched': 'प्रायोजक विवरण प्राप्त हुआ',
  'genealogy.teamSummary.fetched': 'टीम सारांश प्राप्त हुआ',

  // ─── Income ────────────────────────────────────────────────────────────────
  'income.summary.fetched': 'आय सारांश प्राप्त हुआ',
  'income.history.fetched': 'आय इतिहास प्राप्त हुआ',
  'income.calculator.result': 'कमीशन अनुमान गणना हुई',

  // ─── Wallet ────────────────────────────────────────────────────────────────
  'wallet.balance.fetched': 'वॉलेट बैलेंस प्राप्त हुआ',
  'wallet.transfer.success': 'ट्रांसफर सफलतापूर्वक पूरा हुआ',
  'wallet.transfer.sent': '₹{amount} {recipient} को सफलतापूर्वक भेजा गया',
  'wallet.transfer.received': '₹{amount} {sender} से प्राप्त हुआ',
  'wallet.transfer.insufficient': 'अपर्याप्त वॉलेट बैलेंस',
  'wallet.transactions.fetched': 'लेनदेन प्राप्त हुए',
  'wallet.withdrawal.submitted': 'निकासी अनुरोध जमा हुआ',
  'wallet.withdrawal.insufficient': 'अपर्याप्त वॉलेट बैलेंस',
  'wallet.withdrawals.fetched': 'निकासी अनुरोध प्राप्त हुए',

  // ─── Properties ────────────────────────────────────────────────────────────
  'property.list.fetched': 'संपत्तियाँ प्राप्त हुईं',
  'property.detail.fetched': 'संपत्ति प्राप्त हुई',
  'property.inquiry.submitted': 'पूछताछ सफलतापूर्वक जमा हुई',
  'property.notFound': 'संपत्ति नहीं मिली',
  'property.unavailable': 'संपत्ति बुकिंग के लिए उपलब्ध नहीं है',

  // ─── Booking ───────────────────────────────────────────────────────────────
  'booking.created': 'बुकिंग सफलतापूर्वक बनाई गई',
  'booking.confirmed': '{property} के लिए आपकी बुकिंग की पुष्टि हो गई है',
  'booking.cancelled': '{property} के लिए आपकी बुकिंग रद्द कर दी गई है',
  'booking.list.fetched': 'बुकिंग प्राप्त हुईं',

  // ─── Notifications ─────────────────────────────────────────────────────────
  'notification.deviceToken.registered': 'डिवाइस टोकन पंजीकृत',
  'notification.deviceToken.removed': 'डिवाइस टोकन हटाया गया',
  'notification.list.fetched': 'सूचनाएँ प्राप्त हुईं',
  'notification.read': 'सूचना पढ़ी गई के रूप में चिह्नित',
  'notification.payout.approved': 'आपका ₹{amount} का भुगतान स्वीकृत हो गया है',
  'notification.payout.rejected': 'आपका ₹{amount} का भुगतान अस्वीकृत हो गया है',
  'notification.income.credit': 'आपने {type} आय के रूप में ₹{amount} अर्जित किया',

  // ─── Documents ─────────────────────────────────────────────────────────────
  'document.welcomeLetter': 'स्वागत पत्र बनाया गया',
  'document.receipt': 'भुगतान रसीद बनाई गई',
  'document.agreement': 'सदस्यता समझौता बनाया गया',

  // ─── Support ───────────────────────────────────────────────────────────────
  'support.ticket.created': 'सहायता टिकट बनाया गया',
  'support.ticket.list.fetched': 'टिकट प्राप्त हुए',
  'support.ticket.fetched': 'टिकट प्राप्त हुआ',
  'support.ticket.replied': 'उत्तर भेजा गया',
  'support.ticket.closed': 'बंद या हल किए गए टिकट पर उत्तर नहीं दे सकते',

  // ─── General ───────────────────────────────────────────────────────────────
  'general.success': 'सफल',
  'general.error': 'एक त्रुटि हुई',
  'general.notFound': 'संसाधन नहीं मिला',
  'general.routeNotFound': 'रूट नहीं मिला',
  'general.rateLimited': 'बहुत अधिक अनुरोध, कृपया बाद में पुनः प्रयास करें',
  'general.validation': 'सत्यापन त्रुटि',
  'general.serverError': 'एक अप्रत्याशित त्रुटि हुई',
};
