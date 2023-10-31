/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Internationalized messages for Blockly's DevSite demo.
 */
'use strict';

/**
 * Lookup for names of languages.  Keys should be in ISO 639 format.
 */
var LANGUAGE_NAME = {
//  'ace': 'بهسا اچيه',  // RTL
//  'af': 'Afrikaans',
  'am': 'አማርኛ',
  'ar': 'العربية',  // RTL
//  'az': 'Azərbaycanca',
  'be': 'беларускі',
  'be-tarask': 'Taraškievica',
  'bg': 'български език',
  'bn': 'বাংলা',
  'br': 'Brezhoneg',
  'ca': 'Català',
//  'cdo': '閩東語',
  'cs': 'Česky',
  'da': 'Dansk',
  'de': 'Deutsch',
  'el': 'Ελληνικά',
  'en': 'English',
  'eo': 'Esperanto',
  'es': 'Español',
  'eu': 'Euskara',
  'fa': 'فارسی',  // RTL
  'fi': 'Suomi',
  'fo': 'Føroyskt',
  'fr': 'Français',
//  'frr': 'Frasch',
  'gl': 'Galego',
  'ha': 'Hausa',
//  'hak': '客家話',
  'he': 'עברית',  // RTL
  'hi': 'हिन्दी',
  'hr': 'Hrvatski',
//  'hrx': 'Hunsrik',
  'hu': 'Magyar',
  'hy': 'հայերէն',
  'ia': 'Interlingua',
  'id': 'Bahasa Indonesia',
  'ig': 'Asụsụ Igbo',
  'is': 'Íslenska',
  'it': 'Italiano',
  'ja': '日本語',
//  'ka': 'ქართული',
  'kab': 'Taqbaylit',
//  'km': 'ភាសាខ្មែរ',
  'kn': 'ಕನ್ನಡ',
  'ko': '한국어',
//  'ksh': 'Ripoarėsch',
//  'ky': 'Кыргызча',
//  'la': 'Latine',
//  'lb': 'Lëtzebuergesch',
  'lt': 'Lietuvių',
  'lv': 'Latviešu',
//  'mg': 'Malagasy',
//  'ml': 'മലയാളം',
//  'mk': 'Македонски',
//  'mr': 'मराठी',
  'ms': 'Bahasa Melayu',
  'my': 'မြန်မာစာ',
//  'mzn': 'مازِرونی',  // RTL
  'nb': 'Norsk (bokmål)',
  'nl': 'Nederlands, Vlaams',
//  'oc': 'Lenga d\'òc',
//  'pa': 'पंजाबी',
  'pl': 'Polski',
  'pms': 'Piemontèis',
//  'ps': 'پښتو',  // RTL
  'pt': 'Português',
  'pt-br': 'Português Brasileiro',
  'ro': 'Română',
  'ru': 'Русский',
  'sc': 'Sardu',
//  'sco': 'Scots',
//  'si': 'සිංහල',
  'sk': 'Slovenčina',
  'sl': 'Slovenščina',
//  'smn': 'Anarâškielâ',
  'sq': 'Shqip',
  'sr': 'Српски',
  'sr-latn': 'Srpski',
  'sv': 'Svenska',
//  'sw': 'Kishwahili',
//  'ta': 'தமிழ்',
  'th': 'ภาษาไทย',
  'ti': 'ትግርኛ',
//  'tl': 'Tagalog',
  'tr': 'Türkçe',
  'uk': 'Українська',
  'ur': 'اُردُو‬',  // RTL
  'vi': 'Tiếng Việt',
  'yo': 'Èdè Yorùbá',
  'zh-hans': '简体中文',
  'zh-hant': '正體中文',
};


/**
 * List of RTL languages.
 */
var LANGUAGE_RTL = [/*'ace',*/ 'ar', 'fa', 'he', /*'mzn', 'ps',*/ 'ur'];


/**
 * Category names in every language.
 */
var msgs = {
  "ab": {
    "Logic": "Алогика",
    "Loops": "Ациклқәа",
    "Math": "Аматематика",
    "Text": "Атеқст",
    "Lists": "Ахьӡынҵақәа",
    "Colour": "Аԥштәы",
    "Variables": "Аҽеиҭакқәа",
    "Procedures": "Афункциақәа"
  },
  "ace": {
    "Logic": "Logis",
    "Loops": "Kuwien",
    "Math": "Matematik",
    "Text": "Haraih",
    "Lists": "Dapeuta",
    "Colour": "Wareuna",
    "Variables": "Meumacam",
    "Procedures": "Prosedur"
  },
  "am": {
    "Logic": "የሁኔታዊ መገንቢያ ብሎኮች",
    "Loops": "የዙሮች መገንቢያ ብሎኮች",
    "Math": "የሂሳብ መገንቢያ ብሎኮች",
    "Text": "የጽሕፈት መገንቢያ ብሎኮች",
    "Lists": "የዝርዝር መገንቢያ ብሎኮች",
    "Colour": "የቀለም መገንቢያ ብሎኮች",
    "Variables": "የተላውጠ ቃላት መገንቢያ ብሎኮች",
    "Procedures": "የመላዎች መገንቢያ ብሎኮች"
  },
  "ar": {
    "Logic": "منطق",
    "Loops": "الحلقات",
    "Math": "رياضيات",
    "Text": "نص",
    "Lists": "قوائم",
    "Colour": "لون",
    "Variables": "متغيرات",
    "Procedures": "إجراءات"
  },
  "ast": {
    "Logic": "Lóxica",
    "Loops": "Bucles",
    "Math": "Matemátiques",
    "Text": "Testu",
    "Lists": "Llistes",
    "Colour": "Color",
    "Variables": "Variables",
    "Procedures": "Funciones"
  },
  "az": {
    "Logic": "Məntiq",
    "Loops": "Dövrə",
    "Math": "Riyazi",
    "Text": "Mətn",
    "Lists": "Siyahılar",
    "Colour": "Rəng",
    "Variables": "Dəyişənlər",
    "Procedures": "Funksiyalar"
  },
  "ba": {
    "Logic": " Танылыу",
    "Loops": " Циклдар",
    "Math": "Математика",
    "Text": "Текст",
    "Lists": "Исемлектәр",
    "Colour": "Төҫ",
    "Variables": " Үҙгәреүсән дәүмәлдәр",
    "Procedures": " Функциялар"
  },
  "be-tarask": {
    "Logic": "Лёгіка",
    "Loops": "Петлі",
    "Math": "Матэматычныя формулы",
    "Text": "Тэкст",
    "Lists": "Сьпісы",
    "Colour": "Колер",
    "Variables": "Зьменныя",
    "Procedures": "Функцыі"
  },
  "be": {
    "Logic": "Логіка",
    "Loops": "Цыклы",
    "Math": "Матэматыка",
    "Text": "Тэкст",
    "Lists": "Спісы",
    "Colour": "Колер",
    "Variables": "Пераменныя",
    "Procedures": "Функцыі"
  },
  "bg": {
    "Logic": "Логика",
    "Loops": "Цикли",
    "Math": "Математика",
    "Text": "Текст",
    "Lists": "Списъци",
    "Colour": "Цвят",
    "Variables": "Променливи",
    "Procedures": "Функции"
  },
  "bn": {
    "Logic": "যুক্তি",
    "Loops": "লুপসমূহ",
    "Math": "গণিত",
    "Text": "লেখা",
    "Lists": "তালিকাসমূহ",
    "Colour": "রং",
    "Variables": "চলকগুলো",
    "Procedures": "ক্রিয়া"
  },
  "br": {
    "Logic": "Poell",
    "Loops": "Rodelloù",
    "Math": "Matematik",
    "Text": "Testenn",
    "Lists": "Rolloù",
    "Colour": "Liv",
    "Variables": "Argemmennoù",
    "Procedures": "Arc'hwelioù"
  },
  "ca": {
    "Logic": "Lògica",
    "Loops": "Bucles",
    "Math": "Matemàtiques",
    "Text": "Text",
    "Lists": "Llistes",
    "Colour": "Color",
    "Variables": "Variables",
    "Procedures": "Procediments"
  },
  "cs": {
    "Logic": "Logika",
    "Loops": "Smyčky",
    "Math": "Matika",
    "Text": "Text",
    "Lists": "Seznamy",
    "Colour": "Barva",
    "Variables": "Proměnné",
    "Procedures": "Procedury"
  },
  "da": {
    "Logic": "Logik",
    "Loops": "Løkker",
    "Math": "Matematik",
    "Text": "Tekst",
    "Lists": "Lister",
    "Colour": "Farve",
    "Variables": "Variabler",
    "Procedures": "Funktioner"
  },
  "de": {
    "Logic": "Logik",
    "Loops": "Schleifen",
    "Math": "Mathematik",
    "Text": "Text",
    "Lists": "Listen",
    "Colour": "Farbe",
    "Variables": "Variablen",
    "Procedures": "Funktionen"
  },
  "diq": {
    "Logic": "Mentıq",
    "Loops": "Dingeki",
    "Math": "Matematik",
    "Text": "Metın",
    "Lists": "Listeyi",
    "Colour": "Reng",
    "Variables": "Vırneyeni",
    "Procedures": "Fonksiyoni"
  },
  "el": {
    "Logic": "Λογική",
    "Loops": "Επαναλήψεις",
    "Math": "Μαθηματικά",
    "Text": "Κείμενο",
    "Lists": "Λίστες",
    "Colour": "Χρώμα",
    "Variables": "Μεταβλητές",
    "Procedures": "Συναρτήσεις"
  },
  "en": {
    "Logic": "Logic",
    "Loops": "Loops",
    "Math": "Math",
    "Text": "Text",
    "Lists": "Lists",
    "Colour": "Colour",
    "Variables": "Variables",
    "Procedures": "Functions"
  },
  "eo": {
    "Logic": "Logika",
    "Loops": "Cikloj",
    "Math": "Matematika",
    "Text": "Teksto",
    "Lists": "Listoj",
    "Colour": "Koloro",
    "Variables": "Variabloj",
    "Procedures": "Funkcioj"
  },
  "es": {
    "Logic": "Lógica",
    "Loops": "Bucles",
    "Math": "Matemáticas",
    "Text": "Texto",
    "Lists": "Listas",
    "Colour": "Color",
    "Variables": "Variables",
    "Procedures": "Funciones"
  },
  "et": {
    "Logic": "Loogika",
    "Loops": "Silmad",
    "Math": "Matemaatika",
    "Text": "Tekst",
    "Lists": "Loendid",
    "Colour": "Värv",
    "Variables": "Muutujad",
    "Procedures": "Funktsioonid"
  },
  "eu": {
    "Logic": "Logika",
    "Loops": "Begiztak",
    "Math": "Matematika",
    "Text": "Testua",
    "Lists": "Zerrendak",
    "Colour": "Kolorea",
    "Variables": "Aldagaiak",
    "Procedures": "Prozedurak"
  },
  "fa": {
    "Logic": "منطق",
    "Loops": "حلقه‌ها",
    "Math": "ریاضی",
    "Text": "متن",
    "Lists": "فهرست‌ها",
    "Colour": "رنگ",
    "Variables": "متغییرها",
    "Procedures": "توابع"
  },
  "fi": {
    "Logic": "Logiikka",
    "Loops": "Silmukat",
    "Math": "Matematiikka",
    "Text": "Teksti",
    "Lists": "Listat",
    "Colour": "Väri",
    "Variables": "Muuttujat",
    "Procedures": "Funktiot"
  },
  "fo": {
    "Logic": "Logikkur",
    "Loops": "Lykkjur",
    "Math": "Støddfrøði",
    "Text": "Tekstur",
    "Lists": "Listar",
    "Colour": "Litur",
    "Variables": "Variablar",
    "Procedures": "Funktiónir"
  },
  "fr": {
    "Logic": "Logique",
    "Loops": "Boucles",
    "Math": "Mathématiques",
    "Text": "Texte",
    "Lists": "Listes",
    "Colour": "Couleur",
    "Variables": "Variables",
    "Procedures": "Fonctions"
  },
  "gl": {
    "Logic": "Lóxica",
    "Loops": "Bucles",
    "Math": "Matemáticas",
    "Text": "Texto",
    "Lists": "Listas",
    "Colour": "Cor",
    "Variables": "Variables",
    "Procedures": "Funcións"
  },
  "gn": {
    "Logic": "Kuaarape",
    "Loops": "Tapykuegua",
    "Math": "Papapykuaa",
    "Text": "Jehaipy",
    "Lists": "Tysýi",
    "Colour": "Sa'y",
    "Variables": "Ñemoambuéva",
    "Procedures": "Aporeko"
  },
  "ha": {
    "Logic": "Dabara",
    "Loops": "Tsallake-tsallake",
    "Math": "Lissafi",
    "Text": "Rubutu",
    "Lists": "Jeri",
    "Colour": "Launi",
    "Variables": "Siffofi",
    "Procedures": "Aikace-aikace"
  },
  "hak": {
    "Math": "Sṳ-ho̍k kûng-sṳt",
    "Text": "文字",
    "Lists": "列表",
    "Colour": "顏色",
    "Variables": "變量",
    "Procedures": "函數"
  },
  "he": {
    "Logic": "לוגיקה",
    "Loops": "לולאות",
    "Math": "מתמטיקה",
    "Text": "טקסט",
    "Lists": "רשימות",
    "Colour": "צבע",
    "Variables": "משתנים",
    "Procedures": "פונקציות"
  },
  "hi": {
    "Logic": "तर्क",
    "Loops": "लूप",
    "Math": "गणित",
    "Text": "टेक्स्ट",
    "Lists": "सूचियाँ",
    "Colour": "रंग",
    "Variables": "चर",
    "Procedures": "प्रोसीजर"
  },
  "hr": {
    "Logic": "Logika",
    "Loops": "Petlje",
    "Math": "Matematika",
    "Text": "Tekst",
    "Lists": "Liste",
    "Colour": "Boja",
    "Variables": "Varijable",
    "Procedures": "Funkcije"
  },
  "hrx": {
    "Logic": "Logik",
    "Loops": "Schleife",
    "Math": "Mathematik",
    "Text": "Text",
    "Lists": "Liste",
    "Colour": "Farreb",
    "Variables": "Variable",
    "Procedures": "Funktione"
  },
  "hu": {
    "Logic": "Logika",
    "Loops": "Ciklusok",
    "Math": "Matek",
    "Text": "Szövegkezelés",
    "Lists": "Listakezelés",
    "Colour": "Színek",
    "Variables": "Változók",
    "Procedures": "Eljárások"
  },
  "hy": {
    "Logic": "Տրամաբանական",
    "Loops": "Կրկնող հանգույցներ",
    "Math": "Մաթեմատիկա",
    "Text": "Տեքստ",
    "Lists": "Ցանկեր",
    "Colour": "Գույն",
    "Variables": "Փոփոխականներ",
    "Procedures": "Գործառույթներ"
  },
  "ia": {
    "Logic": "Logica",
    "Loops": "Buclas",
    "Math": "Mathematica",
    "Text": "Texto",
    "Lists": "Listas",
    "Colour": "Color",
    "Variables": "Variabiles",
    "Procedures": "Functiones"
  },
  "id": {
    "Logic": "Logika",
    "Loops": "Perulangan",
    "Math": "Matematika",
    "Text": "Teks",
    "Lists": "Daftar",
    "Colour": "Warna",
    "Variables": "Variabel",
    "Procedures": "Fungsi"
  },
  "ig": {
    "Logic": "Lọgịk",
    "Loops": "Meghachi",
    "Math": "Mgbakọ na mwepụ",
    "Text": "Ederede",
    "Lists": "Ndepụta",
    "Colour": "Agba",
    "Variables": "Agbanwe",
    "Procedures": "Ọrụ"
  },
  "inh": {
    "Logic": "Логика",
    "Loops": "Циклаш",
    "Math": "Математика",
    "Text": "Текст",
    "Lists": "Спискаш",
    "Colour": "Бoс",
    "Variables": "Хувцалушъяраш",
    "Procedures": "Функцеш"
  },
  "is": {
    "Logic": "Rökvísi",
    "Loops": "Lykkjur",
    "Math": "Reikningur",
    "Text": "Texti",
    "Lists": "Listar",
    "Colour": "Litir",
    "Variables": "Breytur",
    "Procedures": "Föll"
  },
  "it": {
    "Logic": "Logica",
    "Loops": "Cicli",
    "Math": "Matematica",
    "Text": "Testo",
    "Lists": "Elenchi",
    "Colour": "Colore",
    "Variables": "Variabili",
    "Procedures": "Funzioni"
  },
  "ja": {
    "Logic": "論理",
    "Loops": "繰り返し",
    "Math": "数学",
    "Text": "テキスト",
    "Lists": "リスト",
    "Colour": "色",
    "Variables": "変数",
    "Procedures": "関数"
  },
  "kab": {
    "Logic": "Tameẓla",
    "Loops": "Tiyerrisin",
    "Math": "Tusnakt",
    "Text": "Aḍris",
    "Lists": "Tibdarin",
    "Colour": "Ini",
    "Variables": "Imuttiyen",
    "Procedures": "Tiwuriwin"
  },
  "kbd-cyrl": {
    "Math": "Математикэ",
    "Text": "Тхыгъэ",
    "Lists": "КъебжэкI",
    "Colour": "Плъыфэ"
  },
  "kn": {
    "Logic": "ತರ್ಕ",
    "Loops": "ಸುತ್ತುಗಳು",
    "Math": "ಗಣಿತ",
    "Text": "ಪಠ್ಯ",
    "Lists": "ಪಟ್ಟಿಗಳು",
    "Colour": "ಬಣ್ಣ",
    "Variables": "ಚರಾಂಶಗಳು",
    "Procedures": "ಕಾರ್ಯಘಟಕಗಳು"
  },
  "ko": {
    "Logic": "논리",
    "Loops": "반복",
    "Math": "수학",
    "Text": "문자열",
    "Lists": "목록",
    "Colour": "색",
    "Variables": "변수",
    "Procedures": "함수"
  },
  "ku-latn": {
    "Text": "Nivîs",
    "Lists": "Lîste",
    "Colour": "Reng"
  },
  "lb": {
    "Logic": "Logik",
    "Loops": "Schleefen",
    "Math": "Mathematik",
    "Text": "Text",
    "Lists": "Lëschten",
    "Colour": "Faarf",
    "Variables": "Variabelen",
    "Procedures": "Funktiounen"
  },
  "lki": {
    "Logic": "منطق",
    "Loops": "حلقه‌ها",
    "Math": "ریاضی",
    "Text": "متن",
    "Lists": "لیستةل",
    "Colour": "رةنگ",
    "Variables": "متغییرها",
    "Procedures": "توابع"
  },
  "lrc": {
    "Logic": "عٱقلمٱنی",
    "Loops": "هٱلقٱیا",
    "Math": "هساو کتاو",
    "Text": "مٱتن",
    "Lists": "نومگٱیا",
    "Colour": "رٱنڳ",
    "Variables": "آلشتؽا",
    "Procedures": "رویٱیا"
  },
  "lt": {
    "Logic": "Logika",
    "Loops": "Kartojimas",
    "Math": "Matematika",
    "Text": "Tekstas",
    "Lists": "Sąrašai",
    "Colour": "Spalva",
    "Variables": "Kintamieji",
    "Procedures": "Funkcijos"
  },
  "lv": {
    "Logic": "Loģika",
    "Loops": "Cikli",
    "Math": "Matemātika",
    "Text": "Teksts",
    "Lists": "Saraksti",
    "Colour": "Krāsa",
    "Variables": "Mainīgie",
    "Procedures": "Funkcijas"
  },
  "mg": {
    "Logic": "Lôjika",
    "Loops": "Tondro mifolaka",
    "Math": "Matematika",
    "Text": "Soratra",
    "Lists": "Lisitra",
    "Colour": "Loko",
    "Variables": "Ova",
    "Procedures": "Paika"
  },
  "mk": {
    "Logic": "Логика",
    "Loops": "Јамки",
    "Math": "Математика",
    "Text": "Текст",
    "Lists": "Списоци",
    "Colour": "Боја",
    "Variables": "Променливи",
    "Procedures": "Функции"
  },
  "mr": {
    "Loops": "वेटोळ्या(लूप्स)",
    "Text": "मजकूर",
    "Colour": "रंग",
    "Variables": "अस्थिरके"
  },
  "ms": {
    "Logic": "Logik",
    "Loops": "Gelung",
    "Math": "Matematik",
    "Text": "Teks",
    "Lists": "Senarai",
    "Colour": "Warna",
    "Variables": "Pemboleh ubah",
    "Procedures": "Fungsi"
  },
  "my": {
    "Logic": "ယုတ္တိ",
    "Loops": "ကွင်း",
    "Math": "သင်္ချာ",
    "Text": "စာသား",
    "Lists": "စာရင်းများ",
    "Colour": "အရောင်",
    "Variables": "အမျိုးမျိုးပြောင်းလဲနိုင်သော",
    "Procedures": "လုပ်ဆောင်ချက်များ"
  },
  "nb": {
    "Logic": "Logikk",
    "Loops": "Løkker",
    "Math": "Matte",
    "Text": "Tekst",
    "Lists": "Lister",
    "Colour": "Farge",
    "Variables": "Variabler",
    "Procedures": "Funksjoner"
  },
  "ne": {
    "Logic": "लजिक",
    "Loops": "लुपहरू",
    "Math": "गणित",
    "Text": "पाठ",
    "Lists": "सूची",
    "Colour": "रंग",
    "Variables": "चल राशी(variables)",
    "Procedures": "अनुक्रियाहरु"
  },
  "nl": {
    "Logic": "Logica",
    "Loops": "Lussen",
    "Math": "Formules",
    "Text": "Tekst",
    "Lists": "Lijsten",
    "Colour": "Kleur",
    "Variables": "Variabelen",
    "Procedures": "Functies"
  },
  "oc": {
    "Logic": "Logic",
    "Loops": "Boclas",
    "Math": "Math",
    "Text": "Tèxte",
    "Lists": "Listas",
    "Colour": "Color",
    "Variables": "Variablas",
    "Procedures": "Foncions"
  },
  "olo": {
    "Logic": "Lougiekku",
    "Loops": "Čiepit",
    "Math": "Matemuatiekku",
    "Text": "Tekstu",
    "Lists": "Listat",
    "Colour": "Väri",
    "Variables": "Variantat"
  },
  "pa": {
    "Math": "ਹਿਸਾਬ",
    "Text": "ਲਿਖਤ",
    "Lists": "ਸੂਚੀਆਂ",
    "Colour": "ਰੰਗ",
    "Variables": "ਬਦਲਣਹਾਰ"
  },
  "pl": {
    "Logic": "Logika",
    "Loops": "Pętle",
    "Math": "Matematyka",
    "Text": "Tekst",
    "Lists": "Listy",
    "Colour": "Kolor",
    "Variables": "Zmienne",
    "Procedures": "Funkcje"
  },
  "pms": {
    "Logic": "Lògica",
    "Loops": "Liasse",
    "Math": "Matemàtica",
    "Text": "Test",
    "Lists": "Liste",
    "Colour": "Color",
    "Variables": "Variàbij",
    "Procedures": "Fonsion"
  },
  "ps": {
    "Logic": "منطق",
    "Math": "شمېرپوهنه",
    "Text": "متن",
    "Lists": "لړليکونه",
    "Colour": "رنگ"
  },
  "pt-br": {
    "Logic": "Lógica",
    "Loops": "Laços",
    "Math": "Matemática",
    "Text": "Texto",
    "Lists": "Listas",
    "Colour": "Cor",
    "Variables": "Variáveis",
    "Procedures": "Funções"
  },
  "pt": {
    "Logic": "Lógica",
    "Loops": "Ciclos",
    "Math": "Matemática",
    "Text": "Texto",
    "Lists": "Listas",
    "Colour": "Cor",
    "Variables": "Variáveis",
    "Procedures": "Funções"
  },
  "ro": {
    "Logic": "Logic",
    "Loops": "Bucle",
    "Math": "Matematică",
    "Text": "Text",
    "Lists": "Liste",
    "Colour": "Culoare",
    "Variables": "Variabile",
    "Procedures": "Funcții"
  },
  "ru": {
    "Logic": "Логика",
    "Loops": "Циклы",
    "Math": "Математика",
    "Text": "Текст",
    "Lists": "Списки",
    "Colour": "Цвет",
    "Variables": "Переменные",
    "Procedures": "Функции"
  },
  "sc": {
    "Logic": "Lògica",
    "Loops": "Lòrigas",
    "Math": "Matemàtica",
    "Text": "Testu",
    "Lists": "Lista",
    "Colour": "Colori",
    "Variables": "Variabilis",
    "Procedures": "Funtzionis"
  },
  "sco": {
    "Logic": "Logeec",
    "Loops": "Luips",
    "Math": "Maths",
    "Text": "Tex",
    "Lists": "Leets",
    "Colour": "Colour",
    "Variables": "Variables",
    "Procedures": "Functions"
  },
  "sd": {
    "Logic": "منطق",
    "Loops": "چڪر",
    "Math": "رياضي",
    "Text": "اکر",
    "Lists": "فھرست",
    "Colour": "رنگ",
    "Variables": "ڦرڻا",
    "Procedures": "عمل"
  },
  "si": {
    "Logic": "තර්කය",
    "Math": "ගණිතමය",
    "Text": "පෙළ",
    "Lists": "ලැයිස්තු",
    "Colour": "පාට",
    "Variables": "විචල්‍යයන්",
    "Procedures": "ශ්‍රිත"
  },
  "sk": {
    "Logic": "Logické",
    "Loops": "Slučky",
    "Math": "Matematika",
    "Text": "Textové",
    "Lists": "Zoznamy",
    "Colour": "Farba",
    "Variables": "Premenné",
    "Procedures": "Funkcie"
  },
  "skr-arab": {
    "Logic": "منطق",
    "Loops": "لوپاں",
    "Math": "ریاضی",
    "Text": "ٹیکسٹ",
    "Lists": "فہرستاں",
    "Colour": "رنگ",
    "Variables": "متغیرات",
    "Procedures": "فنکشن"
  },
  "sl": {
    "Logic": "Logika",
    "Loops": "Zanke",
    "Math": "Matematika",
    "Text": "Besedilo",
    "Lists": "Seznami",
    "Colour": "Barva",
    "Variables": "Spremenljivke",
    "Procedures": "Funkcije"
  },
  "smn": {
    "Logic": "Loogiik",
    "Loops": "Váárvuh",
    "Math": "Matematiik",
    "Text": "Tekstâ",
    "Lists": "Listoh",
    "Colour": "Ivne",
    "Variables": "Muttojeijee",
    "Procedures": "Funktioh"
  },
  "sq": {
    "Logic": "Logjikë",
    "Loops": "Qark",
    "Math": "Matematikë",
    "Text": "Tekst",
    "Lists": "Listat",
    "Colour": "Ngjyrë",
    "Variables": "Variablat",
    "Procedures": "Funksionet"
  },
  "sr-latn": {
    "Logic": "Logika",
    "Loops": "Petlje",
    "Math": "Matematika",
    "Text": "Tekst",
    "Lists": "Spiskovi",
    "Colour": "Boja",
    "Variables": "Promenljive",
    "Procedures": "Funkcije"
  },
  "sr": {
    "Logic": "Логика",
    "Loops": "Петље",
    "Math": "Математика",
    "Text": "Текст",
    "Lists": "Спискови",
    "Colour": "Боја",
    "Variables": "Променљиве",
    "Procedures": "Функције"
  },
  "sv": {
    "Logic": "Logik",
    "Loops": "Loopar",
    "Math": "Matematik",
    "Text": "Text",
    "Lists": "Listor",
    "Colour": "Färg",
    "Variables": "Variabler",
    "Procedures": "Funktioner"
  },
  "ta": {
    "Logic": "தர்க்கம்",
    "Loops": "மடக்குக்கட்டளை",
    "Math": "கணிதம்",
    "Text": "உரை",
    "Lists": "பட்டியல்",
    "Colour": "நிறம்",
    "Variables": "மாறி",
    "Procedures": "செயலாற்றிகள்"
  },
  "tcy": {
    "Logic": "ವಾದೊ",
    "Loops": "ಲೂಪ್‍ಲು",
    "Math": "ಲೆಕ್ಕೊ",
    "Text": "ಪಟ್ಯೊ",
    "Lists": "ಪಟ್ಟಿಲು",
    "Colour": "ಬನ್ನೊ",
    "Variables": "ವ್ಯತ್ಯಯೊಲು",
    "Procedures": "ಲೇಸ್‍ಲು"
  },
  "te": {
    "Logic": "తర్కం",
    "Loops": "లూప్స్",
    "Math": "గణితం",
    "Text": "పాఠ్యం",
    "Lists": "జాబితాలు",
    "Colour": "రంగు",
    "Variables": "చరరాశులు",
    "Procedures": "ప్రమేయాలు"
  },
  "th": {
    "Logic": "ตรรกะ",
    "Loops": "การวนซ้ำ",
    "Math": "คณิตศาสตร์",
    "Text": "ข้อความ",
    "Lists": "รายการ",
    "Colour": "สี",
    "Variables": "ตัวแปร",
    "Procedures": "ฟังก์ชัน"
  },
  "ti": {
    "Logic": "ሎጂክ",
    "Loops": "ኣዝዋሪታት",
    "Math": "ሒሳብ",
    "Text": "ጽሑፍ",
    "Lists": "ዝርዝር",
    "Colour": "ሕብሪ",
    "Variables": "ተተካእቲ",
    "Procedures": "ፋንክሽናት"
  },
  "tr": {
    "Logic": "Mantık",
    "Loops": "Döngüler",
    "Math": "Matematik",
    "Text": "Metin",
    "Lists": "Listeler",
    "Colour": "Renk",
    "Variables": "Değişkenler",
    "Procedures": "İşlevler"
  },
  "uk": {
    "Logic": "Логіка",
    "Loops": "Цикли",
    "Math": "Математика",
    "Text": "Текст",
    "Lists": "Списки",
    "Colour": "Колір",
    "Variables": "Змінні",
    "Procedures": "Функції"
  },
  "ur": {
    "Logic": "منطق",
    "Loops": "لوپیں",
    "Math": "ریاضی",
    "Text": "متن",
    "Lists": "فہرستیں",
    "Colour": "رنگ",
    "Variables": "متغیرات",
    "Procedures": "افعال"
  },
  "uz": {
    "Logic": "Mantiq",
    "Loops": "Tsikllar",
    "Math": "Matematika",
    "Text": "Matn",
    "Lists": "Roʻyxatlar",
    "Colour": "Rang",
    "Variables": "O'zgaruvchilar",
    "Procedures": "Funksiyalar"
  },
  "vi": {
    "Logic": "Logic",
    "Loops": "Vòng lặp",
    "Math": "Công thức toán",
    "Text": "Văn bản",
    "Lists": "Danh sách",
    "Colour": "Màu",
    "Variables": "Biến",
    "Procedures": "Hàm"
  },
  "yo": {
    "Logic": "Irogun",
    "Loops": "Ilosiwaju losehin",
    "Math": "Isiro",
    "Text": "Ọrọ",
    "Lists": "Akojọ",
    "Colour": "Awọ",
    "Variables": "Oniruru",
    "Procedures": "Iṣe"
  },
  "yue": {
    "Logic": "邏輯",
    "Loops": "循環",
    "Math": "數學",
    "Text": "發短信",
    "Lists": "一覽",
    "Colour": "顏色",
    "Variables": "變數",
    "Procedures": "功能"
  },
  "zh-hans": {
    "Logic": "逻辑",
    "Loops": "循环",
    "Math": "数学",
    "Text": "文本",
    "Lists": "列表",
    "Colour": "颜色",
    "Variables": "变量",
    "Procedures": "函数"
  },
  "zh-hant": {
    "Logic": "邏輯",
    "Loops": "迴圈",
    "Math": "運算",
    "Text": "文字",
    "Lists": "清單",
    "Colour": "顏色",
    "Variables": "變數",
    "Procedures": "函式"
  }
};
