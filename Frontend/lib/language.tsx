'use client'

import React, { useCallback, useEffect, useState } from 'react'

export type Language = 'en' | 'mr'

export const translations = {
  en: {
    // Header & Announcement
    freeDeliveryBanner: 'Bring Home Nature · Grow Something Beautiful',
    shopPlants: 'Shop plants',
    collections: 'Collections',
    ourStory: 'Our story',
    plantCare: 'Plant care',
    searchPlaceholder: 'Search plants...',
    searchResults: 'Search Results',
    close: 'Close',

    // Hero Section
    grownInPune: 'Grown with care in Pune',
    heroTitleLine1: 'Bring a little ',
    heroTitleItalic: 'green',
    heroTitleLine2: ' into your everyday.',
    heroSubtitle: 'Healthy, happy plants for every kind of home. Thoughtfully grown, beautifully packed, and delivered to your doorstep.',
    exploreCollections: 'Explore collections',
    statParents: '10k+ plant parents',
    statReviews: '4.9/5 happy reviews',
    plantOfTheWeek: 'Plant of the week',
    fromPrice: 'From',

    // Homepage Sections
    lovedByParents: 'Loved by plant parents',
    popularRightNow: 'Popular right now',
    viewAll: 'View all',
    greenerWayToLive: 'A greener way to live',
    storyHeading: "Plants are more than decor. They're a daily ritual.",
    storyText: 'We started Pragati Nursery with a simple idea: bringing home a plant should feel as good as watching it grow. Every plant is nurtured in our nursery and sent with the knowledge to keep it thriving.',
    meetOurGrowers: 'Meet our growers',
    needHelp: 'Need a little help?',
    expertHeading: "Your plant's new best friend is just a message away.",
    expertSubtitle: 'Connect directly with our Pune nursery specialists for personalized tips on watering, light, and soil.',
    talkToExpert: 'Talk to a plant expert: 9822101088',
    copyright: '© 2026 Pragati Nursery. Grown with care.',

    // Catalog & Shop
    allPlants: 'All Plants',
    growYourCollection: 'Grow your collection',
    shopPlantsDesc: 'Find the perfect plants to bring more life to your home and garden.',
    filters: 'Filters',
    filterTitle: 'Filter plants',
    priceRange: 'Price range',
    anyPrice: 'Any price',
    under300: 'Under ₹300',
    range300to600: '₹300–₹600',
    above600: 'Above ₹600',
    availability: 'Availability',
    allStock: 'All stock',
    inStock: 'In Stock',
    lowStock: 'Low Stock',
    outOfStock: 'Out of Stock',
    sortBy: 'Sort by',
    popular: 'Popular',
    newest: 'Newest',
    priceLowHigh: 'Price: Low to High',
    priceHighLow: 'Price: High to Low',
    plantsFound: 'plants found',
    noPlantsFound: 'No plants found',
    noPlantsDesc: 'Try searching for another plant or category.',
    showPlantsBtn: 'Show plants',

    // Product Card & Detail
    bestseller: 'Bestseller',
    easyCare: 'Easy care',
    newArrival: 'New arrival',
    addToCart: 'Add to cart',
    addedToCart: 'Added to cart',
    buyNow: 'Buy now',
    goBack: '← Go back',
    plantVideo: 'Plant Video',
    watchVideo: 'Watch plant video',
    freeDeliveryDetail: 'Doorstep delivery available · Delivery charges determined separately',
    deliveryToBeDetermined: 'To be determined',
    deliveryCharges: 'Delivery charges',
    deliveryNotice: 'Delivery charges will be determined separately after your order is received. The final delivery cost depends on your location, number and size of plants, distance, and transportation requirements.',
    doorstepDeliveryAvailable: 'Doorstep delivery available',
    deliveryChargesDeterminedSeparately: 'Delivery charges determined separately',
    totalPayableNow: 'Total payable now',
    plantInformation: 'Plant information',
    description: 'Description',
    careGuide: 'Care guide',
    keepGrowing: 'Keep growing',
    youMayAlsoLike: 'You May Also Like',
    viewCategory: 'View category',
    plantNotFoundTitle: "We couldn't find this plant.",
    plantNotFoundDesc: 'The plant may have moved, but there are plenty more waiting.',

    // Cart & Bag
    yourBag: 'Your bag',
    yourBagWaiting: 'Your bag is waiting',
    bagEmptyDesc: 'Add a few leafy friends to get started.',
    continueShopping: 'Continue shopping',
    total: 'Total',
    subtotal: 'Subtotal',
    continueToCheckout: 'Continue to checkout',
    maxLimit: 'Max limit',
    itemRemoved: 'Item removed from cart',

    // Checkout
    checkoutTitle: 'Checkout',
    shippingAddress: 'Shipping Address',
    fullName: 'Full Name',
    mobileNumber: 'Mobile Number',
    emailAddress: 'Email Address',
    streetAddress: 'Street Address',
    areaColony: 'Area / Colony',
    city: 'City',
    district: 'District',
    state: 'State',
    pincode: 'Pincode',
    landmark: 'Landmark',
    paymentMethod: 'Payment Method',
    onlinePayment: 'Online Payment (UPI/Cards/Netbanking)',
    cashOnDelivery: 'Cash on Delivery',
    orderSummary: 'Order Summary',
    deliveryFee: 'Delivery Fee',
    freeDeliveryText: 'To be determined',
    placeOrder: 'Place Order',
    processing: 'Processing...',
    savedAddresses: 'Saved Addresses',
    useNewAddress: 'Use a new address',
    nameRequired: 'Please enter your full name.',
    mobileRequired: 'Please enter a valid 10-digit Indian mobile number.',
    emailRequired: 'Please enter a valid email address.',
    addressRequired: 'Please enter your delivery address.',
    cityRequired: 'Please enter your city.',
    stateRequired: 'Please enter your state.',
    pincodeRequired: 'Please enter a 6-digit pincode.',
    pincodeLoading: 'Looking up pincode...',
    pincodeNotFound: 'Pincode not found. Please enter your location manually.',
    selectLocality: 'Select locality',

    // Order Success
    orderConfirmed: 'Order Confirmed!',
    thankYouPurchase: 'Thank you for your purchase.',
    orderId: 'Order ID',
    estimatedDelivery: 'Estimated Delivery',
    orderSuccessDesc: 'We have received your order and are preparing your healthy plants with care.',

    // About Us
    aboutUs: 'About Us',
    aboutSubtitle: 'A greener way to live',
    aboutHeadline: "Plants are more than decor. They're a daily ritual.",
    aboutBody: 'We started Pragati Nursery with a simple idea: bringing home a plant should feel as good as watching it grow. Every plant is nurtured in our nursery and sent with the knowledge to keep it thriving.',

    // Contact Us
    contactUs: 'Contact Us',
    getInTouch: 'Get in touch',
    contactDesc: 'Have questions about our plants, your orders, or plant care advice? Reach out to our nursery team directly. We are always happy to help.',
    addressTitle: 'Address',
    emailUsTitle: 'Email Us',
    phoneTitle: 'Call or WhatsApp',
    businessHoursTitle: 'Business Hours',
    businessHoursText: '8:00 AM – 10:00 PM\nMonday – Sunday',
    customerSupportTitle: 'Customer Support Information',
    customerSupportDesc: 'For any inquiries regarding your online orders, delivery status, or payment queries, please send us an email or call our support line. Please mention your Order ID (e.g., PN-XXXXX) for faster resolution.',

    // Account & Login
    welcomeBack: 'Welcome back',
    createAccount: 'Create an account',
    signInDesc: 'Sign in to access checkout and your orders.',
    signUpDesc: 'Sign up to bring nature closer to your home.',
    password: 'Password',
    loginBtn: 'Sign In',
    registerBtn: 'Create Account',
    dontHaveAccount: "Don't have an account? Sign up",
    alreadyHaveAccount: 'Already have an account? Sign in',
    myAccount: 'My Account',
    myOrders: 'My Orders',
    myAddresses: 'My Addresses',
    wishlist: 'Wishlist',

    // Policies
    shippingPolicy: 'Shipping Policy',
    privacyPolicy: 'Privacy Policy',
    termsAndConditions: 'Terms & Conditions',
    cancellationPolicy: 'Cancellation & Refund Policy',
    lastUpdated: 'Last updated: August 2026',

    // Footer
    footerBrandDesc: 'Thoughtfully grown plants for homes that feel alive.',
    explore: 'Explore',
    contact: 'Contact',
    addressLocation: 'Pune, Maharashtra',

    // Care Labels
    careLight: 'Light',
    careWater: 'Water',
    carePet: 'Pet Friendly',

    // Your Orders
    backToShop: 'Back to Shop',
    yourOrdersTitle: 'Your Orders',
    yourDeviceOrders: 'YOUR DEVICE ORDERS',
    yourOrdersDesc: 'Orders placed on this browser are automatically remembered and displayed below.',
    loadingRememberedOrders: 'Loading your remembered orders...',
    noOrdersOnDevice: 'No orders found on this device',
    noOrdersOnDeviceDesc: 'Orders placed using this browser will appear here automatically.',
    explorePlants: 'Explore Plants',
    viewOrderDetails: 'View Order Details',
    placedOn: 'Placed on',
    orderItems: 'Order Items',
    deliveryAddress: 'Delivery Address',
    closeOrderDetails: 'Close Order Details',
    totalAmountLabel: 'Total Amount',
    paymentLabel: 'Payment',
    dateLabel: 'Date',

    // Order Statuses
    statusPlaced: 'Placed',
    statusConfirmed: 'Confirmed',
    statusShipped: 'Shipped',
    statusDelivered: 'Delivered',
    statusCancelled: 'Cancelled',

    // Payment Methods
    paymentMethodCod: 'COD',
    paymentMethodOnline: 'Online Payment',

    // Payment Statuses
    paymentStatusPending: 'PENDING',
    paymentStatusPaid: 'PAID',
    paymentStatusFailed: 'FAILED',
  },

  mr: {
    // Header & Announcement
    freeDeliveryBanner: 'निसर्ग घरी आणा · सुंदर काहीतरी फुलवा',
    shopPlants: 'झाडे खरेदी करा',
    collections: 'कलेक्शन',
    ourStory: 'आमची कथा',
    plantCare: 'झाडांची काळजी',
    searchPlaceholder: 'झाडे शोधा...',
    searchResults: 'शोध निकाल',
    close: 'बंद करा',

    // Hero Section
    grownInPune: 'पुण्यात प्रेमाने वाढवलेली रोपे',
    heroTitleLine1: 'तुमच्या रोजच्या आयुष्यात थोडा ',
    heroTitleItalic: 'हिरवा आनंद',
    heroTitleLine2: ' आणा.',
    heroSubtitle: 'प्रत्येक प्रकारच्या घरासाठी सुदृढ, आनंदी रोपे. काळजीपूर्वक वाढवलेली, सुंदर पॅक केलेली आणि तुमच्या दारापर्यंत पोहोचवलेली.',
    exploreCollections: 'कलेक्शन पहा',
    statParents: '१० हजार+ आनंदी ग्राहक',
    statReviews: '४.९/५ उत्तम रिव्ह्यू',
    plantOfTheWeek: 'या आठवड्याचे खास रोप',
    fromPrice: 'पासून',

    // Homepage Sections
    lovedByParents: 'ग्राहकांची आवडती रोपे',
    popularRightNow: 'सध्या लोकप्रिय',
    viewAll: 'सर्व पहा',
    greenerWayToLive: 'हिरवागार आयुष्य जगण्याचा मार्ग',
    storyHeading: 'झाडे ही केवळ सजावट नाहीत. ती रोजची सवय आहे.',
    storyText: 'आम्ही एका सोप्या कल्पनेने प्रगती नर्सरी सुरू केली: घरात रोप आणणे हे ते वाढताना पाहण्याइतकेच छान वाटले पाहिजे. प्रत्येक रोप आमच्या नर्सरीमध्ये संगोपित केले जाते.',
    meetOurGrowers: 'आमच्या टीमला भेटा',
    needHelp: 'थोडी मदत हवी आहे?',
    expertHeading: 'तुमच्या रोपाचा नवीन मित्र फक्त एका मेसेजच्या अंतरावर आहे.',
    expertSubtitle: 'पाणी देणे, प्रकाश आणि माती याबद्दल वैयक्तिक टिप्ससाठी आमच्या पुणे नर्सरी तज्ञांशी थेट संपर्क साधा.',
    talkToExpert: 'तज्ञांशी बोला: 9822101088',
    copyright: '© २०२६ प्रगती नर्सरी. प्रेमाने वाढवलेली.',

    // Catalog & Shop
    allPlants: 'सर्व रोपे',
    growYourCollection: 'तुमचे कलेक्शन वाढवा',
    shopPlantsDesc: 'तुमच्या घरासाठी आणि बगिच्यासाठी योग्य रोपे शोधा.',
    filters: 'फिल्टर्स',
    filterTitle: 'फिल्टर',
    priceRange: 'किंमत श्रेणी',
    anyPrice: 'कोणतीही किंमत',
    under300: '₹३०० पेक्षा कमी',
    range300to600: '₹३००–₹६००',
    above600: '₹६०० पेक्षा जास्त',
    availability: 'उपलब्धता',
    allStock: 'सर्व साठा',
    inStock: 'उपलब्ध',
    lowStock: 'कमी साठा',
    outOfStock: 'स्टॉक संपला',
    sortBy: 'क्रमवारी लावा',
    popular: 'लोकप्रिय',
    newest: 'नवीनतम',
    priceLowHigh: 'किंमत: कमी ते जास्त',
    priceHighLow: 'किंमत: जास्त ते कमी',
    plantsFound: 'रोपे सापडली',
    noPlantsFound: 'कोणतीही रोपे आढळली नाहीत',
    noPlantsDesc: 'दुसरे रोप किंवा वर्गवारी शोधण्याचा प्रयत्न करा.',
    showPlantsBtn: 'रोपे दाखवा',

    // Product Card & Detail
    bestseller: 'बेस्टसेलर',
    easyCare: 'सोपी काळजी',
    newArrival: 'नवीन आगमन',
    addToCart: 'कार्टमध्ये जोडा',
    addedToCart: 'कार्टमध्ये जोडले',
    buyNow: 'आत्ताच खरेदी करा',
    goBack: '← मागे जा',
    plantVideo: 'झाडाचा व्हिडिओ',
    watchVideo: 'झाडाचा व्हिडिओ पहा',
    freeDeliveryDetail: 'घरपोच डिलिव्हरी उपलब्ध · डिलिव्हरी शुल्क स्वतंत्रपणे ठरवले जाईल',
    deliveryToBeDetermined: 'नंतर ठरवले जाईल',
    deliveryCharges: 'डिलिव्हरी शुल्क',
    deliveryNotice: 'तुमची ऑर्डर मिळाल्यानंतर डिलिव्हरी शुल्क स्वतंत्रपणे ठरवले जाईल. अंतिम डिलिव्हरी शुल्क तुमचा पत्ता, रोपांची संख्या व आकार, अंतर आणि वाहतुकीच्या आवश्यकतेनुसार ठरवले जाईल.',
    doorstepDeliveryAvailable: 'घरपोच डिलिव्हरी उपलब्ध',
    deliveryChargesDeterminedSeparately: 'डिलिव्हरी शुल्क स्वतंत्रपणे ठरवले जाईल',
    totalPayableNow: 'आत्ता देय एकूण रक्कम',
    plantInformation: 'झाडाबद्दल माहिती',
    description: 'वर्णन',
    careGuide: 'काळजी मार्गदर्शक',
    keepGrowing: 'वाढवत राहा',
    youMayAlsoLike: 'तुम्हाला हे देखील आवडू शकते',
    viewCategory: 'वर्गवारी पहा',
    plantNotFoundTitle: 'आम्हाला हे रोप सापडले नाही.',
    plantNotFoundDesc: 'हे रोप कदाचित हलवले गेले असावे.',

    // Cart & Bag
    yourBag: 'तुमची बॅग',
    yourBagWaiting: 'तुमची बॅग वाट पाहत आहे',
    bagEmptyDesc: 'सुरू करण्यासाठी काही सुंदर रोपे जोडा.',
    continueShopping: 'खरेदी सुरू ठेवा',
    total: 'एकूण',
    subtotal: 'उपएकूण',
    continueToCheckout: 'चेकआउटवर जा',
    maxLimit: 'कमाल मर्यादा',
    itemRemoved: 'वस्तू कार्टमधून काढली',

    // Checkout
    checkoutTitle: 'चेकआउट',
    shippingAddress: 'शिपिंग पत्ता',
    fullName: 'पूर्ण नाव',
    mobileNumber: 'मोबाईल नंबर',
    emailAddress: 'ईमेल पत्ता',
    streetAddress: 'रस्त्याचा पत्ता',
    areaColony: 'भाग / कॉलनी',
    city: 'शहर',
    district: 'जिल्हा',
    state: 'राज्य',
    pincode: 'पिनकोड',
    landmark: 'लँडमार्क',
    paymentMethod: 'पेमेंट पद्धत',
    onlinePayment: 'ऑनलाइन पेमेंट (UPI/कार्ड्स/नेटबँकिंग)',
    cashOnDelivery: 'कॅश ऑन डिलिव्हरी',
    orderSummary: 'ऑर्डर सारांश',
    deliveryFee: 'डिलिव्हरी शुल्क',
    freeDeliveryText: 'नंतर ठरवले जाईल',
    placeOrder: 'ऑर्डर निश्चित करा',
    processing: 'प्रक्रिया सुरू आहे...',
    savedAddresses: 'जतन केलेले पत्ते',
    useNewAddress: 'नवीन पत्ता वापरा',
    nameRequired: 'कृपया तुमचे पूर्ण नाव प्रविष्ट करा.',
    mobileRequired: 'कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा.',
    emailRequired: 'कृपया वैध ईमेल पत्ता प्रविष्ट करा.',
    addressRequired: 'कृपया डिलिव्हरीचा पत्ता प्रविष्ट करा.',
    cityRequired: 'कृपया तुमचे शहर प्रविष्ट करा.',
    stateRequired: 'कृपया तुमचे राज्य प्रविष्ट करा.',
    pincodeRequired: 'कृपया ६ अंकी पिनकोड प्रविष्ट करा.',
    pincodeLoading: 'पिनकोड शोधत आहे...',
    pincodeNotFound: 'पिनकोड सापडला नाही. कृपया तुमचा पत्ता मॅन्युअली प्रविष्ट करा.',
    selectLocality: 'भाग/परिसर निवडा',

    // Order Success
    orderConfirmed: 'ऑर्डर यशस्वीपणे नोंदवली!',
    thankYouPurchase: 'खरेदीबद्दल मनापासून धन्यवाद.',
    orderId: 'ऑर्डर आयडी',
    estimatedDelivery: 'अपेक्षित वितरण वेळ',
    orderSuccessDesc: 'आम्हाला तुमची ऑर्डर मिळाली आहे आणि आम्ही तुमची रोपे काळजीपूर्वक तयार करत आहोत.',

    // About Us
    aboutUs: 'आमच्याबद्दल',
    aboutSubtitle: 'एक हिरवागार जीवनमार्ग',
    aboutHeadline: 'रोपे फक्त सजावट नाहीत, ती रोजच्या जीवनाचा भाग आहेत.',
    aboutBody: 'आम्ही एका सोप्या कल्पनेने प्रगति नर्सरी सुरू केली: घरी रोप आणताना ते मोठे होताना पाहण्याइतकाच आनंद मिळाला पाहिजे. प्रत्येक रोप आमच्या नर्सरीमध्ये प्रेमाने वाढवले जाते.',

    // Contact Us
    contactUs: 'संपर्क साधा',
    getInTouch: 'संपर्कात रहा',
    contactDesc: 'आमच्या रोपांबद्दल, तुमच्या ऑर्डर्सबद्दल किंवा काळजीविषयी प्रश्न आहेत? आमच्या नर्सरी टीमशी थेट संपर्क साधा. मदत करण्यास आम्हाला आनंद होईल.',
    addressTitle: 'पत्ता',
    emailUsTitle: 'ईमेल करा',
    phoneTitle: 'फोन किंवा व्हॉट्सअॅप',
    businessHoursTitle: 'कामकाजाची वेळ',
    businessHoursText: 'सकाळी ८:०० ते रात्री १०:००\nसोमवार – रविवार',
    customerSupportTitle: 'ग्राहक मदत माहिती',
    customerSupportDesc: 'तुमच्या ऑनलाइन ऑर्डर्स, डिलिव्हरी स्थिती किंवा पेमेंट प्रश्नांसाठी कृपया आम्हाला ईमेल पाठवा किंवा फोन करा. जलद निवारणासाठी तुमचा ऑर्डर आयडी सांगा.',

    // Account & Login
    welcomeBack: 'पुन्हा स्वागत आहे',
    createAccount: 'खाते तयार करा',
    signInDesc: 'चेकआउट आणि ऑर्डर्स पाहण्यासाठी साइन इन करा.',
    signUpDesc: 'निसर्गाला तुमच्या घराच्या जवळ आणण्यासाठी साइन अप करा.',
    password: 'पासवर्ड',
    loginBtn: 'साइन इन करा',
    registerBtn: 'खाते तयार करा',
    dontHaveAccount: 'खाते नाही? साइन अप करा',
    alreadyHaveAccount: 'आधीच खाते आहे? साइन इन करा',
    myAccount: 'माझे खाते',
    myOrders: 'माझ्या ऑर्डर्स',
    myAddresses: 'माझे पत्ते',
    wishlist: 'आवडलेली रोपे',

    // Policies
    shippingPolicy: 'शिपिंग धोरण',
    privacyPolicy: 'गोपनीयता धोरण',
    termsAndConditions: 'नियम आणि अटी',
    cancellationPolicy: 'रद्दीकरण आणि परतावा धोरण',
    lastUpdated: 'अंतिम अद्यतन: ऑगस्ट २०२६',

    // Footer
    footerBrandDesc: 'तुमच्या घराला जिवंतपणा देणारी प्रेमाने वाढवलेली रोपे.',
    explore: 'एक्सप्लोर करा',
    contact: 'संपर्क',
    addressLocation: 'पुणे, महाराष्ट्र',

    // Care Labels
    careLight: 'सूर्यप्रकाश',
    careWater: 'पाणी',
    carePet: 'पालतू प्राण्यांसाठी सुरक्षित',

    // Your Orders
    backToShop: 'दुकानाकडे परत जा',
    yourOrdersTitle: 'तुमच्या ऑर्डर्स',
    yourDeviceOrders: 'या डिव्हाइसवरील ऑर्डर्स',
    yourOrdersDesc: 'या ब्राउझरवर केलेल्या ऑर्डर्स आपोआप जतन केल्या जातात आणि खाली दाखवल्या जातात.',
    loadingRememberedOrders: 'तुमच्या जतन केलेल्या ऑर्डर्स लोड करत आहे...',
    noOrdersOnDevice: 'या डिव्हाइसवर कोणत्याही ऑर्डर्स आढळल्या नाहीत',
    noOrdersOnDeviceDesc: 'या ब्राउझरवर केलेल्या ऑर्डर्स येथे आपोआप दिसतील.',
    explorePlants: 'झाडे पहा',
    viewOrderDetails: 'ऑर्डर तपशील पहा',
    placedOn: 'दिनांक',
    orderItems: 'ऑर्डर केलेले साहित्य',
    deliveryAddress: 'वितरणाचा पत्ता',
    closeOrderDetails: 'तपशील बंद करा',
    totalAmountLabel: 'एकूण रक्कम',
    paymentLabel: 'पेमेंट',
    dateLabel: 'तारीख',

    // Order Statuses
    statusPlaced: 'ऑर्डर दिली',
    statusConfirmed: 'निश्चित झाली',
    statusShipped: 'रवाना झाली',
    statusDelivered: 'पोहोचवली',
    statusCancelled: 'रद्द झाली',

    // Payment Methods
    paymentMethodCod: 'कॅश ऑन डिलिव्हरी (COD)',
    paymentMethodOnline: 'ऑनलाइन पेमेंट',

    // Payment Statuses
    paymentStatusPending: 'प्रलंबित',
    paymentStatusPaid: 'पूर्ण झाले',
    paymentStatusFailed: 'अयशस्वी',
  },
} as const

export type TranslationKey = keyof typeof translations['en']

const STORAGE_KEY = 'pragati_lang'

export function useLanguage() {
  const [lang, setLang] = useState<Language>('en')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language
    if (saved === 'en' || saved === 'mr') {
      setLang(saved)
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'en' || e.newValue === 'mr')) {
        setLang(e.newValue as Language)
      }
    }
    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Language>
      if (customEvent.detail === 'en' || customEvent.detail === 'mr') {
        setLang(customEvent.detail)
      }
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener('pragati-lang-changed', handleCustomEvent)
    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener('pragati-lang-changed', handleCustomEvent)
    }
  }, [])

  const setLanguage = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem(STORAGE_KEY, newLang)
    window.dispatchEvent(new CustomEvent('pragati-lang-changed', { detail: newLang }))
  }

  const t = useCallback(
    (key: TranslationKey | string): string => {
      if (key in translations[lang]) {
        return translations[lang][key as TranslationKey]
      }
      // Dynamic mapping fallbacks for categories and stock
      if (lang === 'mr') {
        if (key === 'Indoor plants' || key === 'Indoor Plants') return 'घरातील रोपे'
        if (key === 'Outdoor plants' || key === 'Outdoor Plants') return 'बाहेरील रोपे'
        if (key === 'Flowering plants' || key === 'Flowering Plants') return 'फुलझाडे'
        if (key === 'Fruit plants' || key === 'Fruit Plants') return 'फळझाडे'
        if (key === 'Shop plants' || key === 'Shop Plants') return 'झाडे खरेदी करा'
        if (key === 'Collections') return 'कलेक्शन'
        if (key === 'Our story') return 'आमची कथा'
        if (key === 'Plant care') return 'झाडांची काळजी'
        if (key === 'In Stock') return 'उपलब्ध'
        if (key === 'Low Stock') return 'कमी साठा'
        if (key === 'Out of Stock') return 'स्टॉक संपला'
      }
      return String(key)
    },
    [lang]
  )

  return { lang, setLanguage, t }
}

export function LanguageSwitcher() {
  const { lang, setLanguage } = useLanguage()

  const toggle = () => {
    setLanguage(lang === 'en' ? 'mr' : 'en')
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch language"
      title={lang === 'en' ? 'Switch to Marathi' : 'Switch to English'}
      className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-medium tracking-wide transition-colors hover:border-primary/50 hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary/20 shrink-0"
    >
      <span className={lang === 'en' ? 'font-bold text-primary' : 'text-muted-foreground'}>EN</span>
      <span className="text-muted-foreground/40 text-[10px]">|</span>
      <span className={lang === 'mr' ? 'font-bold text-primary' : 'text-muted-foreground'}>मराठी</span>
    </button>
  )
}
