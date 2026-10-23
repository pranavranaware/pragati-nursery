export interface PolicyTranslationContent {
  privacyPolicy: {
    breadcrumb: string
    category: string
    title: string
    lastUpdated: string
    introHeading: string
    introText: string
    infoHeading: string
    infoIntro: string
    infoContactLabel: string
    infoContactText: string
    infoOrderLabel: string
    infoOrderText: string
    infoTechLabel: string
    infoTechText: string
    useHeading: string
    useIntro: string
    usePoint1: string
    usePoint2: string
    usePoint3: string
    usePoint4: string
    paymentHeading: string
    paymentP1: string
    paymentP2: string
    securityHeading: string
    securityText: string
    cookiesHeading: string
    cookiesText: string
    rightsHeading: string
    rightsText: string
  }
  termsAndConditions: {
    breadcrumb: string
    category: string
    title: string
    lastUpdated: string
    overviewHeading: string
    overviewText: string
    variationsHeading: string
    variationsText: string
    pricingHeading: string
    pricingText: string
    ordersHeading: string
    ordersText: string
    paymentsHeading: string
    paymentsText: string
    responsibilitiesHeading: string
    responsibilitiesText: string
    liabilityHeading: string
    liabilityText: string
    contactHeading: string
    contactText: string
  }
  shippingPolicy: {
    breadcrumb: string
    category: string
    title: string
    lastUpdated: string
    freeDeliveryTitle: string
    freeDeliveryDesc: string
    packagingTitle: string
    packagingDesc: string
    chargesHeading: string
    chargesIntro: string
    above999Label: string
    above999Value: string
    below999Label: string
    below999Value: string
    locationsHeading: string
    locationsText: string
    timelinesHeading: string
    timelinesP1: string
    timelinesP2: string
    receivingHeading: string
    receivingText: string
    supportHeading: string
    supportText: string
    supportBoxTitle: string
  }
  cancellationRefundPolicy: {
    breadcrumb: string
    category: string
    title: string
    lastUpdated: string
    cancellationHeading: string
    cancellationP1: string
    cancellationP2: string
    damagedHeading: string
    damagedP1: string
    damagedP2: string
    conditionHeading: string
    conditionText: string
    refundProcessHeading: string
    refundProcessText: string
    supportHeading: string
    supportText: string
    supportBoxTitle: string
    orderIdNotice: string
  }
}

export const policyTranslations: Record<'en' | 'mr', PolicyTranslationContent> = {
  en: {
    privacyPolicy: {
      breadcrumb: 'Privacy Policy',
      category: 'Legal & Transparency',
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: August 2026',
      introHeading: '1. Introduction',
      introText:
        'Welcome to Pragati Nursery ("we", "our", or "us"). We value the trust you place in us when purchasing plants and nursery products from our website. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal information when you visit or make a purchase on our website.',
      infoHeading: '2. Information We Collect',
      infoIntro: 'We collect personal details necessary to fulfill your orders and improve your shopping experience:',
      infoContactLabel: 'Contact Information:',
      infoContactText: ' Full name, email address, phone number, and delivery address.',
      infoOrderLabel: 'Order Information:',
      infoOrderText: ' Items purchased, order numbers, delivery instructions, and transaction history.',
      infoTechLabel: 'Technical Data:',
      infoTechText: ' IP address, browser type, device information, and site usage data collected via cookies for optimal site functioning.',
      useHeading: '3. How We Use Your Information',
      useIntro: 'Your information is used strictly for legitimate business purposes:',
      usePoint1: 'To process, confirm, ship, and deliver your plant orders.',
      usePoint2: 'To send order status updates, delivery notifications, and invoices.',
      usePoint3: 'To provide customer support and answer plant care or order queries.',
      usePoint4: 'To prevent fraudulent transactions and maintain website security.',
      paymentHeading: '4. Payment Information Handling',
      paymentP1:
        'All online payments on Pragati Nursery are processed securely through Razorpay, an RBI-authorized PCI-DSS compliant third-party payment gateway.',
      paymentP2:
        'Pragati Nursery does NOT collect, store, or process any sensitive payment credentials such as credit/debit card numbers, CVVs, net banking passwords, or UPI PINs on our servers. All payment card details and banking authentication are handled directly and securely by Razorpay.',
      securityHeading: '5. Data Sharing & Security',
      securityText:
        'We do not sell, rent, or trade your personal information to third parties. We only share necessary delivery details (name, address, phone number) with trusted logistics partners strictly for shipping your orders. We maintain physical, electronic, and procedural safeguards to protect your personal information.',
      cookiesHeading: '6. Cookies',
      cookiesText:
        'We use essential cookies to maintain your shopping bag items, remember user session preferences, and ensure seamless navigation across our store. You can manage cookie settings through your browser options.',
      rightsHeading: '7. Your Rights & Contact Information',
      rightsText:
        'You have the right to request access to, correction, or deletion of your personal data stored with us. For any privacy-related questions or data requests, please contact us:',
    },
    termsAndConditions: {
      breadcrumb: 'Terms & Conditions',
      category: 'Agreement',
      title: 'Terms & Conditions',
      lastUpdated: 'Last updated: August 2026',
      overviewHeading: '1. Overview',
      overviewText:
        'By accessing or purchasing from Pragati Nursery ("Website"), you agree to be bound by these Terms and Conditions. Please read them carefully before placing an order.',
      variationsHeading: '2. Products & Natural Plant Variations',
      variationsText:
        'Plants are living organisms. While we make every effort to display accurate product photos, actual plants delivered may vary slightly in height, leaf density, branch arrangement, color, or bloom stage depending on seasonal growth. Product images are representative of mature, healthy specimens grown in nursery conditions.',
      pricingHeading: '3. Pricing & Availability',
      pricingText:
        'All prices listed on the website are in Indian Rupees (INR, ₹) and include applicable taxes unless specified otherwise. Prices and stock availability are subject to change without prior notice. In the event a product is listed at an incorrect price due to technical error, we reserve the right to decline or cancel any orders placed for that item.',
      ordersHeading: '4. Orders & Acceptance',
      ordersText:
        'Placing an order constitutes an offer to purchase. Order confirmation is subject to stock availability and payment verification. We reserve the right to refuse or cancel any order for reasons including limited stock, incorrect delivery information, or payment authorization issues.',
      paymentsHeading: '5. Payments',
      paymentsText:
        'We accept online payments via Credit/Debit Cards, Net Banking, UPI, and Digital Wallets powered by Razorpay. Orders will be processed for dispatch once full payment has been confirmed or cash-on-delivery validation is completed.',
      responsibilitiesHeading: '6. Customer Responsibilities',
      responsibilitiesText:
        'Customers are responsible for providing complete and accurate delivery addresses, pin codes, and contact numbers. Customers are also expected to unbox living plants promptly upon receipt and follow basic plant care guidelines (watering, light placement) appropriate for each variety.',
      liabilityHeading: '7. Limitation of Liability',
      liabilityText:
        'Pragati Nursery shall not be liable for any indirect, incidental, or consequential damages resulting from improper plant care after delivery, extreme weather conditions during transit beyond our control, or customer absence at the time of courier delivery.',
      contactHeading: '8. Contact Information',
      contactText: 'If you have questions regarding these terms, please contact us:',
    },
    shippingPolicy: {
      breadcrumb: 'Shipping Policy',
      category: 'Fulfillment',
      title: 'Shipping & Delivery Policy',
      lastUpdated: 'Last updated: August 2026',
      freeDeliveryTitle: 'Doorstep Delivery Available',
      freeDeliveryDesc:
        'Delivery charges will be determined separately after your order is received. The final delivery cost depends on your location, number and size of plants, distance, and transportation requirements.',
      packagingTitle: 'Protective Plant Packaging',
      packagingDesc:
        'Plants are hydrated, potted securely, and packed in specially designed breathable boxes to arrive fresh.',
      chargesHeading: '1. Shipping & Delivery Charges',
      chargesIntro: 'Pragati Nursery does not automatically calculate or charge delivery fees online at checkout:',
      above999Label: 'Checkout Amount Payable Now:',
      above999Value: 'Product Subtotal Only',
      below999Label: 'Delivery Charge:',
      below999Value: 'To be determined separately after order receipt',
      locationsHeading: '2. Delivery Locations',
      locationsText:
        'Pragati Nursery delivers healthy plants directly from our nursery in Maharashtra to serviceable pin codes across India. Delivery availability may vary based on courier reachability for live plant transit in your location.',
      timelinesHeading: '3. Dispatch & Delivery Timelines',
      timelinesP1:
        'Delivery availability and estimated delivery time may vary depending on the delivery location, weather conditions, and plant dispatch preparation. Live plants require careful inspection and moisture preparation prior to packing.',
      timelinesP2:
        'Once your order is dispatched, tracking updates will be communicated to your email and phone number.',
      receivingHeading: '4. Receiving Your Package',
      receivingText:
        'Because live plants are perishable items, please ensure someone is available at the provided delivery address to receive the package on the delivery date. We recommend opening the package immediately upon arrival, inspecting the plant, giving it light water if needed, and placing it in indirect sunlight.',
      supportHeading: '5. Customer Support',
      supportText: 'For any questions regarding your shipment or delivery status, please contact us:',
      supportBoxTitle: 'Pragati Nursery Support',
    },
    cancellationRefundPolicy: {
      breadcrumb: 'Cancellation & Refund Policy',
      category: 'Customer Protection',
      title: 'Cancellation & Refund Policy',
      lastUpdated: 'Last updated: August 2026',
      cancellationHeading: '1. Order Cancellation Requests',
      cancellationP1:
        'Customers may request cancellation of their order prior to order dispatch by contacting our customer support team at info@pragatinursery.com or +91 9822101088.',
      cancellationP2:
        'Once an order has been prepared, packed, and handed over to our courier partner for dispatch, cancellations can no longer be processed due to the perishable nature of live plants.',
      damagedHeading: '2. Damaged or Incorrect Products',
      damagedP1:
        'We take immense care in packing plants to withstand transit. However, if your plant or pot arrives damaged, broken, or if an incorrect item was delivered, please notify our team within 48 hours of delivery with photos of the damaged item and original packaging.',
      damagedP2:
        'Upon verification of damaged or incorrect items, we will offer a replacement or store refund as appropriate.',
      conditionHeading: '3. Plant Condition Considerations',
      conditionText:
        'Please note that minor leaf shedding, temporary wilting, or bent stems during transit are natural responses for live plants adapting to dark transit conditions. Living plants typically recover within a few days when placed in indirect sunlight and lightly watered. These minor natural transit adjustments do not constitute product damage.',
      refundProcessHeading: '4. Refund Processing Process',
      refundProcessText:
        'Approved refunds will be processed back to the original payment source (Credit Card, Debit Card, Net Banking, UPI, or Razorpay Wallet) used during checkout. Refund processing timelines depend on the issuing bank and payment gateway guidelines.',
      supportHeading: '5. How to Reach Support',
      supportText: 'For any cancellation, refund, or damage inquiries, please reach out to our team:',
      supportBoxTitle: 'Pragati Nursery Customer Care',
      orderIdNotice: 'Please include your Order ID for prompt assistance.',
    },
  },
  mr: {
    privacyPolicy: {
      breadcrumb: 'गोपनीयता धोरण',
      category: 'कायदेशीर आणि पारदर्शकता',
      title: 'गोपनीयता धोरण',
      lastUpdated: 'अंतिम अद्यतन: ऑगस्ट २०२६',
      introHeading: '१. परिचय (Introduction)',
      introText:
        'प्रगती नर्सरी ("आम्ही", "आमचे" किंवा "आपले") मध्ये आपले स्वागत आहे. आमच्या वेबसाइटवरून वनस्पती आणि नर्सरी उत्पादने खरेदी करताना आपण आमच्यावर ठेवलेल्या विश्वासाला आम्ही महत्त्व देतो. आपण आमच्या वेबसाइटला भेट देता किंवा खरेदी करता तेव्हा आम्ही आपली वैयक्तिक माहिती कशी गोळा करतो, वापरतो, उघड करतो आणि सुरक्षित ठेवतो हे हे गोपनीयता धोरण (Privacy Policy) स्पष्ट करते.',
      infoHeading: '२. आम्ही गोळा करतो ती माहिती (Information We Collect)',
      infoIntro: 'तुमच्या ऑर्डर्स पूर्ण करण्यासाठी आणि तुमचा खरेदीचा अनुभव सुधारण्यासाठी आम्ही आवश्यक वैयक्तिक तपशील गोळा करतो:',
      infoContactLabel: 'संपर्क माहिती (Contact Information):',
      infoContactText: ' पूर्ण नाव, ईमेल पत्ता, फोन नंबर आणि वितरणाचा (delivery) पत्ता.',
      infoOrderLabel: 'ऑर्डर माहिती (Order Information):',
      infoOrderText: ' खरेदी केलेल्या वस्तू, ऑर्डर क्रमांक, वितरण सूचना आणि व्यवहारांचा इतिहास.',
      infoTechLabel: 'तांत्रिक डेटा (Technical Data):',
      infoTechText: ' उत्तम वेबसाइट कार्यान्वयनासाठी कुकीजद्वारे गोळा केलेला IP पत्ता, ब्राउझर प्रकार (browser type), डिव्हाइस माहिती आणि साइट वापर डेटा.',
      useHeading: '३. आम्ही तुमच्या माहितीचा वापर कसा करतो (How We Use Your Information)',
      useIntro: 'तुमच्या माहितीचा वापर केवळ अधिकृत व्यावसायिक उद्देशांसाठी केला जातो:',
      usePoint1: 'तुमच्या रोपांच्या ऑर्डर्सवर प्रक्रिया करणे, पुष्टी करणे, पाठवणे आणि वितरीत करणे.',
      usePoint2: 'ऑर्डर स्थिती अद्यतने (order status updates), वितरण सूचना आणि इनव्हॉइस (invoices) पाठवण्यासाठी.',
      usePoint3: 'ग्राहक सहाय्य (customer support) पुरवण्यासाठी आणि रोपांची काळजी किंवा ऑर्डरशी संबंधित प्रश्नांची उत्तरे देण्यासाठी.',
      usePoint4: 'फसवणुकीचे व्यवहार रोखण्यासाठी आणि वेबसाइट सुरक्षा राखण्यासाठी.',
      paymentHeading: '४. पेमेंट माहिती हाताळणी (Payment Information Handling)',
      paymentP1:
        'प्रगती नर्सरीवरील सर्व ऑनलाइन पेमेंट्स Razorpay द्वारे सुरक्षितपणे प्रक्रियेत आणले जातात, जे आरबीआय (RBI) द्वारे अधिकृत आणि PCI-DSS सुसंगत थर्ड-पार्टी पेमेंट गेटवे (third-party payment gateway) आहे.',
      paymentP2:
        'प्रगती नर्सरी आमच्या सर्व्हरवर क्रेडिट/डेबिट कार्ड नंबर, CVV, नेट बँकिंग पासवर्ड किंवा UPI PIN यांसारखे कोणतेही संवेदनशील पेमेंट तपशील (sensitive payment credentials) गोळा, संग्रहित किंवा प्रक्रियेत आणत नाही. सर्व पेमेंट कार्ड तपशील आणि बँकिंग प्रमाणीकरण (authentication) थेट आणि सुरक्षितपणे Razorpay द्वारे हाताळले जाते.',
      securityHeading: '५. डेटा शेअरिंग आणि सुरक्षा (Data Sharing & Security)',
      securityText:
        'आम्ही तुमची वैयक्तिक माहिती तृतीय पक्षांना (third parties) विकत नाही, भाड्याने देत नाही किंवा व्यापार करत नाही. आम्ही केवळ तुमच्या ऑर्डर्स पाठवण्यासाठी आवश्यक असलेले वितरण तपशील (नाव, पत्ता, फोन नंबर) विश्वासू लॉजिस्टिक भागीदारांशी (logistics partners) सामायिक करतो. आम्ही तुमच्या वैयक्तिक माहितीचे संरक्षण करण्यासाठी भौतिक, इलेक्ट्रॉनिक आणि प्रक्रियेत्मक सुरक्षा उपाय राखतो.',
      cookiesHeading: '६. कुकीज (Cookies)',
      cookiesText:
        'आम्ही तुमच्या शॉपिंग बॅगमधील वस्तू राखण्यासाठी, वापरकर्ता सत्र प्राधान्ये (user session preferences) लक्षात ठेवण्यासाठी आणि आमच्या स्टोअरमध्ये अखंड नेव्हिगेशन सुनिश्चित करण्यासाठी आवश्यक कुकीज (essential cookies) वापरतो. तुम्ही तुमच्या ब्राउझर पर्यायांद्वारे कुकी सेटिंग्ज व्यवस्थापित करू शकता.',
      rightsHeading: '७. तुमचे अधिकार आणि संपर्क माहिती (Your Rights & Contact Information)',
      rightsText:
        'आमच्याकडे संग्रहित केलेल्या तुमच्या वैयक्तिक डेटामध्ये प्रवेश मिळवण्याचा, दुरुस्ती करण्याचा किंवा तो हटवण्याची विनंती करण्याचा तुम्हाला अधिकार आहे. कोणत्याही गोपनीयता-संबंधित प्रश्नांसाठी किंवा डेटा विनंत्यांसाठी, कृपया आमच्याशी संपर्क साधा:',
    },
    termsAndConditions: {
      breadcrumb: 'नियम आणि अटी',
      category: 'करार',
      title: 'नियम आणि अटी',
      lastUpdated: 'अंतिम अद्यतन: ऑगस्ट २०२६',
      overviewHeading: '१. विहंगावलोकन (Overview)',
      overviewText:
        'प्रगती नर्सरी ("वेबसाइट") ला भेट देऊन किंवा खरेदी करून, तुम्ही या नियम आणि अटींचे (Terms and Conditions) पालन करण्याचे मान्य करता. कृपया ऑर्डर देण्यापूर्वी त्या काळजीपूर्वक वाचा.',
      variationsHeading: '२. उत्पादने आणि नैसर्गिक रोपांमधील बदल (Products & Natural Plant Variations)',
      variationsText:
        'रोपे हे जिवंत जीव (living organisms) आहेत. आम्ही अचूक उत्पादन फोटो प्रदर्शित करण्याचा प्रत्येक प्रयत्न करत असलो तरी, ऋतूमानानुसार वाढीवर आधारित वितरीत केलेली प्रत्यक्ष रोपे उंची, पानांची घनता, फांद्यांची रचना, रंग किंवा फुलण्याच्या टप्प्यात थोडी भिन्न असू शकतात. उत्पादनांच्या प्रतिमा नर्सरीच्या परिस्थितीत वाढलेल्या परिपक्व, निरोगी रोपांचे प्रतिनिधित्व करतात.',
      pricingHeading: '३. किंमत आणि उपलब्धता (Pricing & Availability)',
      pricingText:
        'अन्यथा निर्दिष्ट केल्याशिवाय वेबसाइटवर सूचीबद्ध केलेल्या सर्व किमती भारतीय रुपयांमध्ये (INR, ₹) आहेत आणि त्यामध्ये लागू कर समाविष्ट आहेत. किमती आणि स्टॉक उपलब्धता पूर्वसूचनेशिवाय बदलू शकते. तांत्रिक त्रुटीमुळे एखादे उत्पादन चुकीच्या किंमतीवर सूचीबद्ध झाल्यास, त्या वस्तूसाठी दिलेल्या कोणत्याही ऑर्डर्स नाकारण्याचा किंवा रद्द करण्याचा अधिकार आम्ही राखून ठेवतो.',
      ordersHeading: '४. ऑर्डर्स आणि स्वीकृती (Orders & Acceptance)',
      ordersText:
        'ऑर्डर देणे हा खरेदीचा प्रस्ताव (offer to purchase) मानला जातो. ऑर्डरची पुष्टी स्टॉकची उपलब्धता आणि पेमेंट पडताळणीच्या (payment verification) अधीन आहे. मर्यादित स्टॉक, चुकीची वितरण माहिती किंवा पेमेंट अधिकृतता समस्या यासह कारणांमुळे कोणतीही ऑर्डर नाकारण्याचा किंवा रद्द करण्याचा अधिकार आम्ही राखून ठेवतो.',
      paymentsHeading: '५. पेमेंट्स (Payments)',
      paymentsText:
        'आम्ही Razorpay द्वारे समर्थित Credit/Debit Cards, Net Banking, UPI आणि डिजिटल वॉलेट्सद्वारे ऑनलाइन पेमेंट्स स्वीकारतो. पूर्ण पेमेंटची पुष्टी झाल्यावर किंवा कॅश-ऑन-डिलीव्हरी (cash-on-delivery) पडताळणी पूर्ण झाल्यावर ऑर्डर्स पाठवण्यासाठी प्रक्रियेत आणल्या जातील.',
      responsibilitiesHeading: '६. ग्राहकांच्या जबाबदाऱ्या (Customer Responsibilities)',
      responsibilitiesText:
        'ग्राहक पूर्ण आणि अचूक वितरण पत्ते (delivery addresses), पिन कोड आणि संपर्क क्रमांक प्रदान करण्यासाठी जबाबदार आहेत. ग्राहकांनी जिवंत रोपे प्राप्त झाल्यावर ती ताबडतोब बॉक्समधून बाहेर काढणे (unbox) आणि प्रत्येक प्रकारासाठी योग्य असलेल्या मूलभूत वनस्पती काळजी मार्गदर्शक तत्त्वांचे (पाणी देणे, प्रकाशाची जागा) पालन करणे अपेक्षित आहे.',
      liabilityHeading: '७. दायित्वाची मर्यादा (Limitation of Liability)',
      liabilityText:
        'प्रगती नर्सरी वितरणांनंतर रोपांची अयोग्य काळजी घेणे, आमच्या नियंत्रणाबाहेर वाहतुकीदरम्यान तीव्र हवामान परिस्थिती, किंवा कूरियर वितरणाच्या वेळी ग्राहकाची गैरहजेरी यामुळे होणाऱ्या कोणत्याही अप्रत्यक्ष, अपरिहार्य किंवा परिणामी नुकसानीसाठी (indirect, incidental, or consequential damages) जबाबदार असणार नाही.',
      contactHeading: '८. संपर्क माहिती (Contact Information)',
      contactText: 'या अटींबद्दल तुमचे काही प्रश्न असल्यास, कृपया आमच्याशी संपर्क साधा:',
    },
    shippingPolicy: {
      breadcrumb: 'शिपिंग आणि वितरण धोरण',
      category: 'ऑर्डरपूर्ती',
      title: 'शिपिंग आणि वितरण धोरण',
      lastUpdated: 'अंतिम अद्यतन: ऑगस्ट २०२६',
      freeDeliveryTitle: 'घरपोच डिलिव्हरी उपलब्ध',
      freeDeliveryDesc:
        'तुमची ऑर्डर मिळाल्यानंतर डिलिव्हरी शुल्क स्वतंत्रपणे ठरवले जाईल. अंतिम डिलिव्हरी शुल्क तुमचा पत्ता, रोपांची संख्या व आकार, अंतर आणि वाहतुकीच्या आवश्यकतेनुसार ठरवले जाईल.',
      packagingTitle: 'सुरक्षित वनस्पती पॅकेजिंग',
      packagingDesc:
        'रोपे ताजी पोहोचण्यासाठी त्यांना पाणी दिले जाते, कुंडीत सुरक्षित केले जाते आणि विशेषतः डिझाइन केलेल्या हवेशीर बॉक्समध्ये पॅक केले जाते.',
      chargesHeading: '१. शिपिंग आणि वितरण शुल्क (Shipping & Delivery Charges)',
      chargesIntro: 'प्रगती नर्सरी चेकआउट दरम्यान ऑनलाइन वितरण शुल्क आपोआप आकारत नाही:',
      above999Label: 'ऑनलाइन चेकआउट देय रक्कम:',
      above999Value: 'फक्त उत्पादनांचे सबटोटल',
      below999Label: 'डिलिव्हरी शुल्क:',
      below999Value: 'ऑर्डर मिळाल्यानंतर स्वतंत्रपणे ठरवले जाईल',
      locationsHeading: '२. वितरण स्थाने (Delivery Locations)',
      locationsText:
        'प्रगती नर्सरी महाराष्ट्रातील आमच्या नर्सरीतून थेट भारतातील सेवायोग्य पिन कोडवर निरोगी रोपे वितरीत करते. तुमच्या स्थानावरील जिवंत रोपांच्या वाहतुकीसाठी कूरियरच्या पोहोचण्यावर आधारित वितरण उपलब्धता भिन्न असू शकते.',
      timelinesHeading: '३. डिस्पॅच आणि वितरण वेळ (Dispatch & Delivery Timelines)',
      timelinesP1:
        'वितरण उपलब्धता आणि अंदाजे वितरणाची वेळ (estimated delivery time) वितरणाचे ठिकाण, हवामान परिस्थिती आणि रोपांच्या डिस्पॅच तयारीवर अवलंबून भिन्न असू शकते. जिवंत रोपांना पॅकिंग करण्यापूर्वी काळजीपूर्वक तपासणी आणि ओलावा तयारी आवश्यक असते.',
      timelinesP2:
        'तुमची ऑर्डर डिस्पॅच झाल्यावर, ट्रॅकिंग अपडेट्स (tracking updates) तुमच्या ईमेल आणि फोन नंबरवर कळवले जातील.',
      receivingHeading: '४. तुमचे पॅकेज प्राप्त करणे (Receiving Your Package)',
      receivingText:
        'जिवंत रोपे ही नाशवंत वस्तू (perishable items) असल्यामुळे, कृपया वितरणाच्या तारखेला पॅकेज प्राप्त करण्यासाठी दिलेल्या वितरणाच्या पत्त्यावर कोणीतरी उपलब्ध असल्याची खात्री करा. आम्ही आगमन झाल्यावर ताबडतोब पॅकेज उघडण्याची, रोपाची पाहणी करण्याची, आवश्यक असल्यास थोडे पाणी देण्याची आणि अप्रत्यक्ष सूर्यप्रकाशात ठेवण्याची शिफारस करतो.',
      supportHeading: '५. ग्राहक मदत (Customer Support)',
      supportText: 'तुमच्या शिपमेंट किंवा वितरण स्थितीबद्दल कोणत्याही प्रश्नांसाठी, कृपया आमच्याशी संपर्क साधा:',
      supportBoxTitle: 'प्रगती नर्सरी सपोर्ट',
    },
    cancellationRefundPolicy: {
      breadcrumb: 'रद्दीकरण आणि परतावा धोरण',
      category: 'ग्राहक संरक्षण',
      title: 'रद्दीकरण आणि परतावा धोरण',
      lastUpdated: 'अंतिम अद्यतन: ऑगस्ट २०२६',
      cancellationHeading: '१. ऑर्डर रद्दीकरण विनंत्या (Order Cancellation Requests)',
      cancellationP1:
        'ग्राहक info@pragatinursery.com किंवा +91 9822101088 वर आमच्या ग्राहक मदत टीमशी संपर्क साधून ऑर्डर डिस्पॅच होण्यापूर्वी त्यांची ऑर्डर रद्द करण्याची विनंती करू शकतात.',
      cancellationP2:
        'एकदा ऑर्डर तयार झाली, पॅक झाली आणि डिस्पॅचसाठी आमच्या कूरियर भागीदाराकडे सोपवली गेली की, जिवंत रोपांच्या नाशवंत स्वरूपामुळे (perishable nature) रद्दीकरणावर प्रक्रियेत आणले जाऊ शकत नाही.',
      damagedHeading: '२. खराब झालेली किंवा चुकीची उत्पादने (Damaged or Incorrect Products)',
      damagedP1:
        'आम्ही वाहतूक सहन करण्यासाठी रोपांचे पॅकिंग करताना खूप काळजी घेतो. तथापि, जर तुमचे रोप किंवा कुंडी खराब झालेली, तुटलेली पोहोचली किंवा चुकीची वस्तू वितरीत केली गेली, तर कृपया खराब झालेल्या वस्तूच्या आणि मूळ पॅकेजिंगच्या फोटोंसह वितरणाच्या ४८ तासांच्या आत (within 48 hours) आमच्या टीमला सूचित करा.',
      damagedP2:
        'खराब झालेल्या किंवा चुकीच्या वस्तूंची पडताळणी (verification) झाल्यावर, आम्ही योग्यतेनुसार रिप्लेसमेंट (बदलून देणे) किंवा स्टोअर रिफंड (परतावा) देऊ.',
      conditionHeading: '३. रोपांच्या स्थितीचा विचार (Plant Condition Considerations)',
      conditionText:
        'कृपया नोंद घ्या की वाहतुकीदरम्यान किरकोळ पाने गळणे, तात्पुरती कोमेजणे किंवा वाकलेले खोड हे अंधाऱ्या वाहतुकीच्या परिस्थितीशी जुळवून घेणाऱ्या जिवंत रोपांचे नैसर्गिक प्रतिसाद आहेत. अप्रत्यक्ष सूर्यप्रकाशात ठेवल्यावर आणि हलके पाणी दिल्यावर जिवंत रोपे साधारणपणे काही दिवसांत पूर्ववत होतात. या किरकोळ नैसर्गिक वाहतूक समायोजनांना (natural transit adjustments) उत्पादनाचे नुकसान (product damage) मानले जात नाही.',
      refundProcessHeading: '४. परतावा प्रक्रियेची पद्धत (Refund Processing Process)',
      refundProcessText:
        'मंजूर झालेले परतावे चेकआउट दरम्यान वापरलेल्या मूळ पेमेंट स्रोताकडे (Credit Card, Debit Card, Net Banking, UPI, किंवा Razorpay Wallet) परत प्रक्रियेत आणले जातील. परतावा प्रक्रियेची वेळ जारी करणारी बँक (issuing bank) आणि पेमेंट गेटवे मार्गदर्शक तत्त्वांवर अवलंबून असते.',
      supportHeading: '५. मदतीसाठी संपर्क कसा साधावा (How to Reach Support)',
      supportText: 'कोणत्याही रद्दीकरण, परतावा किंवा नुकसानीच्या चौकशीसाठी, कृपया आमच्या टीमशी संपर्क साधा:',
      supportBoxTitle: 'प्रगती नर्सरी ग्राहक सेवा',
      orderIdNotice: 'त्वरित मदतीसाठी कृपया तुमचा Order ID समाविष्ट करा.',
    },
  },
}
