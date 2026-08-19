import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

type Language = 'en' | 'my' | 'th';
type Intent =
  | 'greeting'
  | 'documents'
  | 'curriculum'
  | 'fees'
  | 'dormitory'
  | 'meals'
  | 'ageGroups'
  | 'preschoolEssentials'
  | 'unknown';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const detectLanguage = (text: string): Language => {
  if (/[\u1000-\u109F\uAA60-\uAA7F]/.test(text)) return 'my';
  if (/[\u0E00-\u0E7F]/.test(text)) return 'th';
  return 'en';
};

const extractAge = (text: string): number | null => {
  const patterns = [
    /age[:\s]+(\d+)/i,
    /(\d+)\s*(?:years?\s*old|yrs?\s*old|year)/i,
    /(\d+)\s*(?:နှစ်|နှစ်သား)/,
    /(\d+)\s*(?:ปี|ขวบ)/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const n = parseInt(m[1]);
      if (n >= 1 && n <= 25) return n;
    }
  }
  const bare = text.match(/\b([5-9]|1\d|20)\b/);
  if (bare) return parseInt(bare[1]);
  return null;
};

const detectIntent = (text: string): Intent => {
  const t = text.toLowerCase();

  if (/^(hi|hello|hey|help|start|begin|မင်္ဂလာ|sawasdee|สวัสดี|ဟဲ့)/.test(t.trim())) return 'greeting';

  if (/document|passport|photo|birth.cert|vaccin|id.card|permit|enroll|admission|register|apply|စာရွက်|မွေးစာ|ဓာတ်ပုံ|ကာကွယ်|မှတ်ပုံ|ကျောင်းအပ်|လျှောက်|เอกสาร|สูติ|รูปถ่าย|วัคซีน|บัตร|สมัคร|ลงทะเบียน/.test(t)) return 'documents';

  if (/subject|curriculum|syllabus|class|lesson|teach|study|english|math|science|social|ict|montessori|eyfs|ဘာသာ|သင်ကြား|ဘာသာရပ်|วิชา|หลักสูตร|เรียน|สอน/.test(t)) return 'curriculum';

  if (/fee|cost|price|pay|money|tuition|charge|baht|how.?much|expensive|ကြေး|စရိတ်|ငွေ|ဘယ်လောက်|ဘတ်|ค่า|ราคา|เงิน|บาท|เท่าไหร่/.test(t)) return 'fees';

  if (/dorm|hostel|room|stay|accommodat|residen|live|board|sleep|wifi|shuttle|tutor|hall|အဆောင်|ခန်း|နေ|အိပ်|หอพัก|ห้อง|พัก|อยู่|รถรับ/.test(t)) return 'dormitory';

  if (/meal|food|eat|lunch|dinner|breakfast|canteen|snack|အစားအသောက်|ထမင်း|နပ်|စားသောက်|อาหาร|กิน|ข้าว|มื้อ|กลางวัน/.test(t)) return 'meals';

  if (/age|how.?old|year.?old|grade|level|primary|secondary|nursery|preschool|kindergarten|daycare|ged|placement|class.?level|အသက်|တန်း|မည်သည့်|ကျောင်း|อายุ|ชั้น|ระดับ|อนุบาล|ประถม|มัธยม|จัด/.test(t)) return 'ageGroups';

  if (/bring|prepare|essential|need|supply|bedding|pillow|blanket|snack|toothbrush|cloth|pack|item|what.?to|ယူ|ပြင်|ဆင်|ဘာများ|ဘာ.?ဆောင်|นำ|เตรียม|ของ|เครื่องนอน|ต้องเอา/.test(t)) return 'preschoolEssentials';

  return 'unknown';
};

const KB: Record<Intent, Record<Language, string>> = {
  greeting: {
    en: `👋 Hello! Welcome to **IGK Learning Centre**.\n\nI'm your school assistant. I can help you with:\n\n📋 Enrollment Documents\n📚 Curriculum & Subjects\n💰 Fees & Expenses\n🏠 Dormitory & Meals\n🎂 Age Groups & Placement\n🎒 Preschool Essentials\n\nWhat would you like to know?`,
    my: `👋 မင်္ဂလာပါ! **IGK Learning Centre** မှ ကြိုဆိုပါသည်။\n\nကျွန်ုပ်သည် ကျောင်းဆိုင်ရာ မေးခွန်းများကို ဖြေကြားပေးမည့် လမ်းညွှန်ဖြစ်ပါသည်။\n\n📋 ကျောင်းအပ် စာရွက်စာတမ်းများ\n📚 သင်ကြားရေးဘာသာရပ်များ\n💰 ကျောင်းစရိတ်များ\n🏠 အဆောင်နှင့် အစားအသောက်\n🎂 အသက်အလိုက်တန်းခွဲများ\n🎒 Preschool အတွက် ပြင်ဆင်ရန်\n\nဘာသိချင်ပါသလဲ?`,
    th: `👋 สวัสดีค่ะ! ยินดีต้อนรับสู่ **IGK Learning Centre**\n\nฉันคือผู้ช่วยด้านข้อมูลของโรงเรียน ช่วยตอบคำถามเกี่ยวกับ:\n\n📋 เอกสารการสมัครเรียน\n📚 หลักสูตรและวิชาเรียน\n💰 ค่าใช้จ่ายต่างๆ\n🏠 หอพักและอาหาร\n🎂 กลุ่มอายุและการจัดชั้น\n🎒 ของที่ต้องเตรียมสำหรับเด็กเล็ก\n\nต้องการทราบเรื่องอะไรคะ?`,
  },
  documents: {
    en: `📋 **Required Enrollment Documents**\n\n**Student's Documents:**\n• 2 passport-sized photos of the student\n• Birth Certificate (one of the following):\n  ◦ Thai birth certificate\n  ◦ Myanmar birth certificate + Thai translation\n  ◦ Thai residency document\n• Vaccination records\n\n**Parent / Guardian's Documents:**\n• National ID card, OR\n• Thai residency permit\n\nFor further details, please contact the school administration.`,
    my: `📋 **ကျောင်းအပ်ရန် လိုအပ်သော စာရွက်စာတမ်းများ**\n\n**ကျောင်းသား/သူ၏ စာရွက်များ:**\n• လိုင်စင်ဓာတ်ပုံ (၂) ပုံ\n• မွေးစာရင်း (အောက်ပါတစ်ခုခု):\n  ◦ ထိုင်းမွေးစာရင်း\n  ◦ မြန်မာမွေးစာရင်း + ထိုင်းဘာသာပြန်\n  ◦ ထိုင်းနေထိုင်ခွင့် အထောက်အထား\n• ကာကွယ်ဆေးထိုးနှံပြီးကြောင်း မှတ်တမ်း\n\n**မိဘ / အုပ်ထိန်းသူ၏ စာရွက်များ:**\n• မှတ်ပုံတင် (သို့မဟုတ်)\n• ထိုင်းနေထိုင်ခွင့် ကတ်\n\nအသေးစိတ်သိလိုပါက ကျောင်းအုပ်ချုပ်ရေးထံ ဆက်သွယ်ပါ။`,
    th: `📋 **เอกสารที่ต้องใช้ในการสมัครเรียน**\n\n**เอกสารของนักเรียน:**\n• รูปถ่ายขนาดนิ้วครึ่ง 2 รูป\n• สูติบัตร (อย่างใดอย่างหนึ่ง):\n  ◦ สูติบัตรไทย\n  ◦ สูติบัตรพม่า + คำแปลภาษาไทย\n  ◦ เอกสารที่พักอาศัยในไทย\n• สมุดบันทึกการรับวัคซีน\n\n**เอกสารของผู้ปกครอง:**\n• บัตรประชาชน หรือ\n• เอกสารที่พักอาศัยในไทย\n\nหากต้องการข้อมูลเพิ่มเติม กรุณาติดต่อฝ่ายบริหารของโรงเรียนค่ะ`,
  },
  curriculum: {
    en: `📚 **Curriculum & Subjects**\n\n**🏫 Primary & Secondary (Years 1–3):**\n• English\n• Mathematics\n• Science\n• Social Studies\n• ICT\n• Thai Language\n• Myanmar Language\n• Sports\n• Music & Dance\n• Moral & Civics\n\n**🌱 Preschool / EYFS:**\n• English, Math, Science, PSHE\n• Thai, Myanmar, Sports\n• Music & Dance, Moral & Civics\n• Taught using **Montessori + Play & Learn** method\n\nFor further details, please contact the school administration.`,
    my: `📚 **သင်ကြားရေးဘာသာရပ်များ**\n\n**🏫 Primary & Secondary (တန်း ၁–၃):**\n• အင်္ဂလိပ်စာ\n• သင်္ချာ\n• သိပ္ပံ\n• လူမှုရေး\n• ICT\n• ထိုင်းစာ\n• မြန်မာစာ\n• အားကစား\n• ဂီတနှင့် အက\n• ကိုယ်ကျင့်တရားနှင့် နိုင်ငံသားနီတိ\n\n**🌱 Preschool / EYFS:**\n• အင်္ဂလိပ်၊ သင်္ချာ၊ သိပ္ပံ၊ PSHE\n• ထိုင်းစာ၊ မြန်မာစာ၊ အားကစား\n• ဂီတနှင့် အက၊ ကိုယ်ကျင့်တရား\n• **Montessori + Play & Learn** စနစ်ဖြင့် သင်ကြားပေးသည်\n\nအသေးစိတ်သိလိုပါက ကျောင်းအုပ်ချုပ်ရေးထံ ဆက်သွယ်ပါ။`,
    th: `📚 **หลักสูตรและวิชาเรียน**\n\n**🏫 ประถม & มัธยม (ปีที่ 1–3):**\n• ภาษาอังกฤษ\n• คณิตศาสตร์\n• วิทยาศาสตร์\n• สังคมศึกษา\n• ICT\n• ภาษาไทย\n• ภาษาพม่า\n• กีฬา\n• ดนตรีและนาฏศิลป์\n• ศีลธรรมและหน้าที่พลเมือง\n\n**🌱 ก่อนวัยเรียน / EYFS:**\n• ภาษาอังกฤษ, คณิต, วิทยาศาสตร์, PSHE\n• ไทย, พม่า, กีฬา, ดนตรี\n• สอนด้วยระบบ **Montessori + Play & Learn**\n\nหากต้องการข้อมูลเพิ่มเติม กรุณาติดต่อฝ่ายบริหารของโรงเรียนค่ะ`,
  },
  fees: {
    en: `💰 **Fees & Expenses**\n_(Primary / Secondary / GED)_\n\n📝 Registration Fee — **10,000 ฿**\n🎒 Supplies & Tools — **5,000 ฿**\n📖 Books — **3,500 ฿**\n👕 Sports T-Shirt — **1,000 ฿**\n⚽ Sports Fee (monthly) — **500 ฿**\n🏫 Monthly Tuition — **3,500 ฿**\n\nFor further details, please contact the school administration.`,
    my: `💰 **ကျောင်းစရိတ်များ**\n_(Primary / Secondary / GED)_\n\n📝 မှတ်ပုံတင်ကြေး — **10,000 ฿**\n🎒 ပစ္စည်းကိရိယာကြေး — **5,000 ฿**\n📖 စာအုပ်ကြေး — **3,500 ฿**\n👕 အားကစားဝတ်စုံ — **1,000 ฿**\n⚽ အားကစားကြေး (တစ်လ) — **500 ฿**\n🏫 လစဉ်သင်တန်းကြေး — **3,500 ฿**\n\nအသေးစိတ်သိလိုပါက ကျောင်းအုပ်ချုပ်ရေးထံ ဆက်သွယ်ပါ။`,
    th: `💰 **ค่าใช้จ่ายต่างๆ**\n_(ประถม / มัธยม / GED)_\n\n📝 ค่าลงทะเบียน — **10,000 บาท**\n🎒 ค่าอุปกรณ์การเรียน — **5,000 บาท**\n📖 ค่าหนังสือ — **3,500 บาท**\n👕 เสื้อกีฬา — **1,000 บาท**\n⚽ ค่ากีฬา (รายเดือน) — **500 บาท**\n🏫 ค่าเรียนรายเดือน — **3,500 บาท**\n\nหากต้องการข้อมูลเพิ่มเติม กรุณาติดต่อฝ่ายบริหารของโรงเรียนค่ะ`,
  },
  dormitory: {
    en: `🏠 **Dormitory & Meals**\n\n**Dormitory:**\n• Room rent: **2,500 ฿/month**\n• Utility bills: shared\n• ✅ Free Wifi\n• ✅ Free school shuttle\n• ✅ Free Hall Tutor during study hours\n\n**Meal Plan:**\n• 3 meals/day — breakfast, lunch, dinner\n• Cost: **3,000 ฿/month**\n\nFor further details, please contact the school administration.`,
    my: `🏠 **အဆောင်နှင့် အစားအသောက်**\n\n**အဆောင်:**\n• တစ်လ ခန်းငှားကြေး: **2,500 ฿**\n• ရေ/မီးဖိုး: မျှဝေပေးဆောင်ရန်\n• ✅ Free Wifi\n• ✅ ကျောင်းအကြိုအပို့ အခမဲ့\n• ✅ Hall Tutor ဝန်ဆောင်မှု အခမဲ့\n\n**အစားအသောက်:**\n• တစ်နေ့ ၃ နပ် — မနက်၊ နေ့လယ်၊ ည\n• တစ်လ: **3,000 ฿**\n\nအသေးစိတ်သိလိုပါက ကျောင်းအုပ်ချုပ်ရေးထံ ဆက်သွယ်ပါ။`,
    th: `🏠 **หอพักและอาหาร**\n\n**หอพัก:**\n• ค่าหอพัก: **2,500 บาท/เดือน**\n• ค่าน้ำ/ไฟ: หารกัน\n• ✅ ฟรี Wifi\n• ✅ บริการรถรับส่งนักเรียนฟรี\n• ✅ ติวเตอร์ดูแลช่วงเวลาอ่านหนังสือฟรี\n\n**อาหาร:**\n• 3 มื้อ/วัน — เช้า, กลางวัน, เย็น\n• ค่าใช้จ่าย: **3,000 บาท/เดือน**\n\nหากต้องการข้อมูลเพิ่มเติม กรุณาติดต่อฝ่ายบริหารของโรงเรียนค่ะ`,
  },
  meals: {
    en: `🍽️ **Meal Plan**\n\n• Full meal plan: **3 meals/day**\n  ◦ 🌅 Breakfast\n  ◦ ☀️ Lunch\n  ◦ 🌙 Dinner\n• Cost: **3,000 ฿/month**\n\nFor further details, please contact the school administration.`,
    my: `🍽️ **အစားအသောက်**\n\n• တစ်နေ့ **၃ နပ်**\n  ◦ 🌅 မနက်စာ\n  ◦ ☀️ နေ့လယ်စာ\n  ◦ 🌙 ညစာ\n• တစ်လ: **3,000 ฿**\n\nအသေးစိတ်သိလိုပါက ကျောင်းအုပ်ချုပ်ရေးထံ ဆက်သွယ်ပါ။`,
    th: `🍽️ **อาหาร**\n\n• **3 มื้อ/วัน**\n  ◦ 🌅 อาหารเช้า\n  ◦ ☀️ อาหารกลางวัน\n  ◦ 🌙 อาหารเย็น\n• ราคา: **3,000 บาท/เดือน**\n\nหากต้องการข้อมูลเพิ่มเติม กรุณาติดต่อฝ่ายบริหารของโรงเรียนค่ะ`,
  },
  ageGroups: {
    en: `🎂 **Age Groups & Class Placement**\n\n• 1–2 yrs → Day Care\n• 2–3 yrs → Pre-Nursery\n• 3–5 yrs → Nursery / KG1 / KG2\n• 6–12 yrs → Primary 1–6\n• 12–15 yrs → Secondary 1–3\n• 15–16+ yrs → Pre-GED / GED\n\n⚠️ **Important:** Students aged **6 and above** must take a **Placement Test** before enrollment.\n\nFor further details, please contact the school administration.`,
    my: `🎂 **အသက်အလိုက်တန်းခွဲများ**\n\n• အသက် ၁–၂ → Day Care\n• အသက် ၂–၃ → Pre-Nursery\n• အသက် ၃–၅ → Nursery / KG1 / KG2\n• အသက် ၆–၁၂ → Primary 1–6\n• အသက် ၁၂–၁၅ → Secondary 1–3\n• အသက် ၁၅–၁၆+ → Pre-GED / GED\n\n⚠️ **အရေးကြီး:** အသက် **၆ နှစ်နှင့် အထက်** ကျောင်းသားများသည် ကျောင်းအပ်မတိုင်မီ **Placement Test** ဖြေဆိုရမည်ဖြစ်သည်။\n\nအသေးစိတ်သိလိုပါက ကျောင်းအုပ်ချုပ်ရေးထံ ဆက်သွယ်ပါ။`,
    th: `🎂 **กลุ่มอายุและการจัดชั้นเรียน**\n\n• อายุ 1–2 ปี → Day Care\n• อายุ 2–3 ปี → Pre-Nursery\n• อายุ 3–5 ปี → Nursery / KG1 / KG2\n• อายุ 6–12 ปี → ประถม 1–6\n• อายุ 12–15 ปี → มัธยม 1–3\n• อายุ 15–16+ ปี → Pre-GED / GED\n\n⚠️ **สำคัญ:** นักเรียนที่มีอายุ **6 ปีขึ้นไป** ต้องสอบ **Placement Test** ก่อนเข้าเรียน\n\nหากต้องการข้อมูลเพิ่มเติม กรุณาติดต่อฝ่ายบริหารของโรงเรียนค่ะ`,
  },
  preschoolEssentials: {
    en: `🎒 **Preschool Essentials — What to Bring**\n\n• 🛏️ Bedding set (sheet, pillow, blanket)\n• 🍱 Lunch box\n• 🍪 Snacks\n• 🪥 Toothbrush & toothpaste\n• 👕 Spare set of clothes (1 set)\n\nFor further details, please contact the school administration.`,
    my: `🎒 **Preschool ကလေးများ ယူဆောင်လာရန်**\n\n• 🛏️ အိပ်ရာခင်း၊ ခေါင်းအုံး၊ စောင်\n• 🍱 ထမင်းဘူး\n• 🍪 မုန့်\n• 🪥 သွားတိုက်ဆေး/တံ\n• 👕 လဲလှယ်ရန် အဝတ်အစားတစ်စုံ\n\nအသေးစိတ်သိလိုပါက ကျောင်းအုပ်ချုပ်ရေးထံ ဆက်သွယ်ပါ။`,
    th: `🎒 **ของที่ต้องเตรียมสำหรับเด็กก่อนวัยเรียน**\n\n• 🛏️ ชุดเครื่องนอน (ผ้าปูที่นอน, หมอน, ผ้าห่ม)\n• 🍱 กล่องข้าว\n• 🍪 ขนม\n• 🪥 แปรงสีฟัน & ยาสีฟัน\n• 👕 ชุดเปลี่ยนสำรอง 1 ชุด\n\nหากต้องการข้อมูลเพิ่มเติม กรุณาติดต่อฝ่ายบริหารของโรงเรียนค่ะ`,
  },
  unknown: {
    en: `For further details, please contact the school administration.\n\n📞 082-354-5362 / 082-465-3236\n📧 info@igklearningcentre.com\n🕐 Mon–Sun  8:00 AM – 5:00 PM`,
    my: `အသေးစိတ်သိလိုပါက ကျောင်းအုပ်ချုပ်ရေးထံ ဆက်သွယ်ပါ။\n\n📞 082-354-5362 / 082-465-3236\n📧 info@igklearningcentre.com\n🕐 တနင်္လာ–တနင်္ဂနွေ  နံနက် ၈:၀၀ – ညနေ ၅:၀၀`,
    th: `หากต้องการข้อมูลเพิ่มเติม กรุณาติดต่อฝ่ายบริหารของโรงเรียนค่ะ\n\n📞 082-354-5362 / 082-465-3236\n📧 info@igklearningcentre.com\n🕐 จันทร์–อาทิตย์  8:00–17:00 น.`,
  },
};

const placementNote: Record<Language, string> = {
  en: `\n\n⚠️ **Placement Test Required:** Since the student is age 6 or above, a Placement Test is required before enrollment. Please contact the school to schedule one.`,
  my: `\n\n⚠️ **Placement Test လိုအပ်သည်:** ကျောင်းသား/သူ အသက် ၆ နှစ်နှင့် အထက်ဖြစ်သောကြောင့် ကျောင်းအပ်မတိုင်မီ Placement Test ဖြေဆိုရမည်ဖြစ်သည်။ ကျောင်းထံ ဆက်သွယ်ဆောင်ရွက်ပါ။`,
  th: `\n\n⚠️ **ต้องสอบ Placement Test:** เนื่องจากนักเรียนมีอายุ 6 ปีขึ้นไป จึงต้องสอบ Placement Test ก่อนเข้าเรียน กรุณาติดต่อโรงเรียนเพื่อนัดหมายค่ะ`,
};

const QUICK_REPLIES: Record<Language, string[]> = {
  en: ['📋 Documents', '💰 Fees', '📚 Subjects', '🏠 Dorm & Meals', '🎂 Age Groups', '🎒 Preschool Needs'],
  my: ['📋 စာရွက်များ', '💰 ကြေးနှုန်း', '📚 ဘာသာရပ်', '🏠 အဆောင်', '🎂 အသက်တန်း', '🎒 Preschool ပြင်ဆင်'],
  th: ['📋 เอกสาร', '💰 ค่าใช้จ่าย', '📚 วิชาเรียน', '🏠 หอพักและอาหาร', '🎂 กลุ่มอายุ', '🎒 ของที่ต้องเตรียม'],
};

const QUICK_INTENTS: Intent[] = [
  'documents', 'fees', 'curriculum', 'dormitory', 'ageGroups', 'preschoolEssentials',
];

const getResponse = (userText: string, lang: Language): string => {
  const intent = detectIntent(userText);
  let response = KB[intent][lang];
  if (intent !== 'ageGroups') {
    const age = extractAge(userText);
    if (age !== null && age >= 6) response += placementNote[lang];
  }
  return response;
};

const renderLine = (line: string, i: number) => {
  if (!line) return <br key={i} />;
  if (line.startsWith('**') && line.endsWith('**'))
    return <p key={i} className="font-bold text-amber-300 mt-2 mb-0.5">{line.slice(2, -2)}</p>;
  if (line.startsWith('• '))
    return <p key={i} className="pl-3">• {inlineBold(line.slice(2))}</p>;
  if (line.startsWith('  ◦ ') || line.startsWith('◦ '))
    return <p key={i} className="pl-6 text-sm text-gray-300">{inlineBold(line.replace(/^\s*◦\s/, ''))}</p>;
  if (line.startsWith('⚠️'))
    return <p key={i} className="text-amber-300 font-semibold mt-2">{inlineBold(line)}</p>;
  if (line.startsWith('_(') && line.endsWith(')_'))
    return <p key={i} className="text-gray-400 italic text-sm">{line.slice(2, -2)}</p>;
  return <p key={i}>{inlineBold(line)}</p>;
};

const inlineBold = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? <strong key={i} className="text-white">{part}</strong> : part
  );
};

const ChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [lang, setLang] = useState<Language>('en');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && messages.length === 0) pushBot(KB.greeting.en);
  }, [isOpen]);

  const pushBot = (text: string) =>
    setMessages(prev => [...prev, { id: Date.now().toString(), text, sender: 'bot', timestamp: new Date() }]);

  const pushUser = (text: string) =>
    setMessages(prev => [...prev, { id: Date.now().toString() + 'u', text, sender: 'user', timestamp: new Date() }]);

  const respond = async (userText: string, detectedLang: Language) => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 600));
    setIsTyping(false);
    pushBot(getResponse(userText, detectedLang));
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    pushUser(text);
    const detected = detectLanguage(text);
    setLang(detected);
    await respond(text, detected);
  };

  const handleQuickReply = async (idx: number) => {
    const label = QUICK_REPLIES[lang][idx];
    const intent = QUICK_INTENTS[idx];
    pushUser(label);
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 500));
    setIsTyping(false);
    pushBot(KB[intent][lang]);
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-red-700 to-red-600 text-white p-4 rounded-full shadow-2xl hover:from-red-600 hover:to-red-500 transition-all duration-300 transform hover:scale-110 z-50 animate-pulse"
          aria-label="Open chat"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 flex flex-col z-50 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-700 to-red-600 px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <img src="/public_582d_8769138177dc4f61b94ad786acaa8d4a.png" alt="IGK" className="w-10 h-10 rounded-full ring-2 ring-white object-cover" />
              <div>
                <p className="font-bold text-white text-sm leading-tight">IGK Learning Centre</p>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                  <span className="text-white/80 text-xs">School Assistant</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-white/20 p-1.5 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-red-700 flex items-center justify-center flex-shrink-0 text-sm">🎓</div>
                )}
                <div className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed space-y-0.5 ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-amber-500 to-amber-400 text-gray-900 rounded-br-none'
                    : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-bl-none'
                }`}>
                  {msg.text.split('\n').map((line, i) =>
                    msg.sender === 'bot' ? renderLine(line, i) : <span key={i}>{line}</span>
                  )}
                  <p className="text-[10px] opacity-50 text-right pt-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-red-700 flex items-center justify-center text-sm">🎓</div>
                <div className="bg-gray-800 border border-gray-700 px-4 py-3 rounded-2xl rounded-bl-none">
                  <div className="flex gap-1">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-4 pb-2 flex-shrink-0">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REPLIES[lang].map((label, i) => (
                <button key={i} onClick={() => handleQuickReply(i)} className="text-xs px-2.5 py-1.5 bg-gray-800 border border-gray-600 text-amber-400 rounded-full hover:bg-gray-700 hover:border-amber-500 transition-all">
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-gray-700 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={
                  lang === 'my' ? 'မေးလိုသည်ကို ရိုက်ထည့်ပါ...' :
                  lang === 'th' ? 'พิมพ์คำถามของคุณ...' :
                  'Type your question...'
                }
                className="flex-1 px-4 py-2.5 bg-gray-800 border border-gray-600 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none text-gray-200 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className="bg-gradient-to-r from-red-700 to-red-600 text-white px-4 py-2.5 rounded-xl hover:from-red-600 hover:to-red-500 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;