import type { SiteLocale } from "@/lib/i18n/site-locale";
import type { LeadershipMember } from "@/lib/site/leadership";

export type ResolutionDecisionItem = {
  label: string;
  body: string;
};

export type ResolutionExecutiveRow = {
  sl: string;
  name: string;
  fathersName: string;
  designation: string;
};

export type ResolutionDocumentContent = {
  documentTitle: string;
  documentSubtitle: string;
  formationDate: string;
  formationVenue: string;
  formationChair: string;
  proposalTitle: string;
  proposalBody: string;
  agendaTitle: string;
  agendaItems: string[];
  decisionsTitle: string;
  decisions: ResolutionDecisionItem[];
  objectivesTitle: string;
  objectives: string[];
  policiesTitle: string;
  policies: string[];
  advisorsTitle: string;
  advisorNames: string[];
  executivesTitle: string;
  executiveRows: ResolutionExecutiveRow[];
  tableSl: string;
  tableName: string;
  tableFathersName: string;
  tableDesignation: string;
  signatureChair: string;
  signatureSecretary: string;
  signatureCashier: string;
};

const BN: ResolutionDocumentContent = {
  documentTitle: "কমিটি রেজ্যুলেশন",
  documentSubtitle: "সভার কার্যবিবরণী ও রেজ্যুলেশন",
  formationDate: "তারিখ: ২৪ এপ্রিল জুম্মাবার, ২০২৬ খ্রি.",
  formationVenue: "স্থান: তালেরতল জামে মসজিদ",
  formationChair: "সভাপতি: মাওলানা মো: আ: কাদির (ইমাম ও খতিব অত্র মসজিদ)",
  proposalTitle: "১. প্রস্তাবনা",
  proposalBody:
    "অদ্যকার সভায় তালেরতল গ্রামের গণ্যমান্য ব্যক্তিবর্গের উপস্থিতিতে সামাজিক কল্যাণ ও ধর্মীয় মূল্যবোধ প্রসারের লক্ষ্যে একটি স্থায়ী সংগঠন ও তহবিল গঠনের প্রস্তাব সর্বসম্মতিক্রমে গৃহীত হয়। উপস্থিত সকলে একমত হন যে, ‘হিলফুল ফুজুল মানবকল্যাণ তহবিল’ একটি অরাজনৈতিক ও অলাভজনক সেবামূলক প্রতিষ্ঠান হিসেবে তালেরতল গ্রামের উন্নয়ন ও আর্তমানবতার সেবায় কাজ করবে।",
  agendaTitle: "২. আলোচ্য বিষয়সমূহ",
  agendaItems: [
    "'হিলফুল ফুজুল মানবকল্যাণ তহবিল' গঠন এবং এর কমিটি প্রণয়ন।",
    "সংগঠনের লক্ষ্য, উদ্দেশ্য ও নীতিমালা নির্ধারণ।",
    "সংগঠনের তহবিল সংগ্রহ ও পরিচালনা পদ্ধতি।",
  ],
  decisionsTitle: "৩. গৃহীত সিদ্ধান্ত",
  decisions: [
    {
      label: "২ নং প্রস্তাব (সভাপতি নির্বাচন):",
      body: "জনাব মো: মোহাম্মদ আলী সাহেব প্রস্তাব করেন যে, **মো: শামসুদ্দিন** সাহেবকে অত্র তহবিলের সভাপতি পদে মনোনীত করা হোক। উপস্থিত সকলে সমস্বরে তা সমর্থন করেন এবং তিনি সভাপতি হিসেবে নির্বাচিত হন।",
    },
    {
      label: "৩ নং প্রস্তাব (সেক্রেটারি নির্বাচন):",
      body: "জনাব মো: সুলেমান মিয়া সাহেব প্রস্তাব করেন যে, **মো: দেলোয়ার হোসেন** সাহেবকে সেক্রেটারি পদে দায়িত্ব দেওয়া হোক। সর্বসম্মতিক্রমে উক্ত প্রস্তাবটি গৃহীত হয়।",
    },
    {
      label: "৪ নং প্রস্তাব (ক্যাশিয়ার নির্বাচন):",
      body: "জনাব মো: জামাল ট্রেইলার সাহেব প্রস্তাব করেন যে, **মো: শাহীন আলম** সাহেবকে ক্যাশিয়ার পদে দায়িত্ব প্রদান করা হোক। এই প্রস্তাবটিও সভায় গৃহীত হয়।",
    },
  ],
  objectivesTitle: "৪. সংগঠনের লক্ষ্য, উদ্দেশ্য ও বৈশিষ্ট্যসমূহ",
  objectives: [
    "**ধর্মীয় সংস্কার ও আদর্শ সমাজ গঠন:** দ্বীনি অনুষ্ঠানের মাধ্যমে মানুষকে মসজিদমুখী করা এবং ইসলামের সুমহান আদর্শের আলোকে তালেরতল গ্রামকে একটি আদর্শ ও মডেল সমাজ হিসেবে গড়ে তোলা।",
    "**দারিদ্র্য বিমোচন ও কুসংস্কার দূরীকরণ:** সমাজ থেকে দারিদ্র্য ও সকল প্রকার অন্ধ কুসংস্কার পুরোপুরি দূর করার লক্ষ্যে টেকসই পরিকল্পনা গ্রহণ করা এবং সাধারণ মানুষের আত্মসামাজিক উন্নয়নে কাজ করা।",
    "**সামাজিক প্রতিরোধ ও ন্যায়বিচার:** তালেরতল গ্রামবাসীদের প্রত্যক্ষ সহযোগিতায় সমাজ থেকে সকল প্রকার অন্যায়, অবিচার ও জুলুমের বিরুদ্ধে চাক্ষুষ প্রতিরোধ গড়ে তোলা এবং সামাজিক অসংগতি ও অনৈতিক কর্মকাণ্ড নির্মূলে কঠোর ভূমিকা পালন করা।",
    "**আর্তমানবতার সেবা:** অসহায় পরিবারের পাশে দাঁড়ানো, বিবাহে সহায়তা এবং অসহায় ও মুমূর্ষু রোগীদের চিকিৎসায় তহবিল থেকে সর্বোচ্চ সহযোগিতা প্রদান করা।",
    "**শিক্ষা প্রসার:** গ্রামের বয়স্ক ব্যক্তিদের জন্য দ্বীনি ও কোরআন শিক্ষার ব্যবস্থা করা।",
    "**আর্থিক স্বচ্ছতা:** দান সংগ্রহ ও ব্যয়ের প্রতিটি হিসাব যথাযথভাবে পৃথক রেজিস্টার খাতায় ক্যাশিয়ার কর্তৃক সংরক্ষিত থাকবে এবং মাসিক সভায় তা পেশ করা হবে।",
  ],
  policiesTitle: "৫. বিশেষ নীতিমালা",
  policies: [
    'এই সংগঠনের সকল অনুদান সম্পূর্ণ "অফেরতযোগ্য" এবং এটি শুধুমাত্র জনকল্যাণে ব্যয় হবে।',
    "উপস্থিত তালেরতল গ্রামবাসী ও দাতা সদস্যগণ সকলেই এই সংগঠনের সাধারণ সদস্য হিসেবে গণ্য হবেন।",
  ],
  advisorsTitle: "৬. উপদেষ্টা মণ্ডলী",
  advisorNames: [
    "জনাব মো: মইজ উদ্দিন",
    "জনাব মোঃ মোহাম্মদ আলী",
    "জনাব মোঃ অলি মেম্বার",
    "জনাব মোঃ শহিদুল ইসলাম",
    "জনাব মোঃ জামাল উদ্দিন",
    "জনাব মোঃ নিজাম উদ্দীন",
    "জনাব মোঃ শাহজাহান",
    "জনাব মোঃ আব্দুল মান্নান",
    "জনাব মোঃ নুরুল ইসলাম",
    "জনাব মোঃ আরমান আলী",
    "জনাব মোঃ দ্বীন ইসলাম",
    "জনাব মোঃ সুরত আলী",
    "জনাব মোঃ আমিরুল ইসলাম",
    "জনাব মোঃ আব্দুল আলী",
  ],
  executivesTitle: "৭. কার্যনির্বাহী কমিটি",
  executiveRows: [
    {
      sl: "০১",
      name: "মো: শামসুদ্দিন",
      fathersName: "—",
      designation: "সভাপতি",
    },
    {
      sl: "০২",
      name: "মো: দেলোয়ার হোসেন",
      fathersName: "—",
      designation: "সেক্রেটারি",
    },
    {
      sl: "০৩",
      name: "মো: শাহীন আলম",
      fathersName: "—",
      designation: "ক্যাশিয়ার",
    },
  ],
  tableSl: "ক্রমিক",
  tableName: "নাম",
  tableFathersName: "পিতার নাম",
  tableDesignation: "পদবী",
  signatureChair: "সভাপতির স্বাক্ষর",
  signatureSecretary: "সেক্রেটারির স্বাক্ষর",
  signatureCashier: "ক্যাশিয়ারের স্বাক্ষর",
};

const EN: ResolutionDocumentContent = {
  documentTitle: "Final resolution",
  documentSubtitle: "Meeting minutes & resolution",
  formationDate: "Date: Friday, 24 April 2026",
  formationVenue: "Venue: Taleratal Jame Mosque",
  formationChair: "Chair: Mawlana Md. A. Kadir (Imam & Khatib of the mosque)",
  proposalTitle: "1. Opening",
  proposalBody:
    "An emergency meeting was held today with respected villagers and devout youth of Taleratal. The meeting was convened to form an orderly fund and organisation for social development and service to the poor and needy. After recitation from the Holy Quran, the chair opened the session with a welcome address.",
  agendaTitle: "2. Agenda",
  agendaItems: [
    "Formation of “Hilful Fuzul Manobkallyan Organisation” and appointment of its committees.",
    "Determination of aims, objectives, and policies.",
    "Methods of fund collection and management.",
  ],
  decisionsTitle: "3. Resolutions adopted",
  decisions: [
    {
      label: "Resolution 1:",
      body: 'By unanimous consent, **"Hilful Fuzul Manobkallyan Organisation"** was formally established as a non-political welfare body to stand beside the poor and needy of the village.',
    },
    {
      label: "Resolution 2 (Chair):",
      body: "Mr. Md. Mohammad Ali proposed that **Md. Shamsuddin** be appointed chair. All present supported this and he was elected chair.",
    },
    {
      label: "Resolution 3 (Secretary):",
      body: "Mr. Md. Suleman Mia proposed that **Md. Delowar Hosen** be appointed secretary. The proposal was adopted unanimously.",
    },
    {
      label: "Resolution 4 (Cashier):",
      body: "Mr. Md. Jamal Trailer proposed that **Md. Shahin Alam** be appointed cashier. This proposal was also adopted.",
    },
  ],
  objectivesTitle: "4. Aims, objectives & characteristics",
  objectives: [
    "**Religious reform & model society:** Religious programmes to draw people to the mosque and build Taleratal as an exemplary community in the light of Islam.",
    "**Poverty alleviation:** Sustainable plans to remove poverty and superstition and support social uplift.",
    "**Social justice:** Collective resistance to injustice, oppression, and immoral conduct in the village.",
    "**Humanitarian service:** Support for needy families, marriage assistance, and medical aid from the fund.",
    "**Education:** Religious and Quranic education for elderly villagers.",
    "**Financial transparency:** All donations and expenses recorded in separate registers by the cashier and presented at monthly meetings.",
  ],
  policiesTitle: "5. Special policies",
  policies: [
    "All grants are non-refundable and spent only for public welfare.",
    "Residents of Taleratal and donor members present are general members of the organisation.",
  ],
  advisorsTitle: "6. Advisory council",
  advisorNames: BN.advisorNames.map((name) => name.replace(/^জনাব\s+/, "Mr. ")),
  executivesTitle: "7. Executive committee",
  executiveRows: [
    {
      sl: "01",
      name: "Md. Shamsuddin",
      fathersName: "—",
      designation: "Chair",
    },
    {
      sl: "02",
      name: "Md. Delowar Hosen",
      fathersName: "—",
      designation: "Secretary",
    },
    {
      sl: "03",
      name: "Md. Shahin Alam",
      fathersName: "—",
      designation: "Cashier",
    },
  ],
  tableSl: "Sl.",
  tableName: "Name",
  tableFathersName: "Father's name",
  tableDesignation: "Role",
  signatureChair: "Chair’s signature",
  signatureSecretary: "Secretary’s signature",
  signatureCashier: "Cashier’s signature",
};

const BN_SL = [
  "০১",
  "০২",
  "০৩",
  "০৪",
  "০৫",
  "০৬",
  "০৭",
  "০৮",
  "০৯",
  "১০",
  "১১",
  "১২",
  "১৩",
  "১৪",
  "১৫",
];

function formatAdvisorLabel(
  name: string,
  locale: SiteLocale,
  index: number,
): string {
  const sl =
    locale === "bn" ? (BN_SL[index] ?? String(index + 1)) : String(index + 1);
  if (locale === "bn") {
    const trimmed = name.trim();
    if (/^জনাব/.test(trimmed)) return `${sl}. ${trimmed}`;
    return `${sl}. জনাব ${trimmed}`;
  }
  const trimmed = name.replace(/^জনাব\s+/, "").trim();
  return `${sl}. Mr. ${trimmed}`;
}

function executiveRowsFromDb(
  members: LeadershipMember[],
  fallback: ResolutionExecutiveRow[],
  locale: SiteLocale,
): ResolutionExecutiveRow[] {
  if (members.length === 0) return fallback;
  const slFmt = (i: number) =>
    locale === "bn"
      ? (["০১", "০২", "০৩", "০৪", "০৫"][i] ?? String(i + 1))
      : String(i + 1).padStart(2, "0");
  return members.map((m, i) => ({
    sl: slFmt(i),
    name: m.full_name,
    fathersName: m.fathers_name?.trim() || "—",
    designation: m.designation?.trim() || "—",
  }));
}

function advisorNamesFromDb(
  members: LeadershipMember[],
  fallback: string[],
  locale: SiteLocale,
): string[] {
  if (members.length === 0) {
    return fallback.map((name, i) => formatAdvisorLabel(name, locale, i));
  }
  return members.map((m, i) => formatAdvisorLabel(m.full_name, locale, i));
}

export function getResolutionDocument(
  locale: SiteLocale,
  executives: LeadershipMember[],
  advisors: LeadershipMember[],
): ResolutionDocumentContent {
  const base = locale === "bn" ? BN : EN;
  return {
    ...base,
    executiveRows: executiveRowsFromDb(executives, base.executiveRows, locale),
    advisorNames: advisorNamesFromDb(advisors, base.advisorNames, locale),
  };
}
