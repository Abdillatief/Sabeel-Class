export interface AnimeVoiceDef {
  id: string;
  characterName: string;
  japanese: string;
  romaji: string;
  arabicShout: string;
  series: string;
  pitch: number;
  rate: number;
  vocalVibe: 'fierce' | 'cool' | 'deep' | 'energetic' | 'mystical' | 'noble';
}

export const ANIME_VOICE_DEFS: Record<string, AnimeVoiceDef> = {
  domain_expansion: {
    id: 'domain_expansion',
    characterName: 'غوجو ساتورو (Gojo Satoru)',
    japanese: '領域展開、無量空処！',
    romaji: 'Ryōiki Tenkai, Muryōkūsho!',
    arabicShout: 'توسيع النطاق: الفراغ اللانهائي!',
    series: 'جوجيتسو كايسن (Jujutsu Kaisen)',
    pitch: 1.05,
    rate: 1.0,
    vocalVibe: 'cool'
  },
  malevolent_shrine: {
    id: 'malevolent_shrine',
    characterName: 'ريومن سوكونا (Ryomen Sukuna)',
    japanese: '領域展開、伏魔御廚子！',
    romaji: 'Ryōiki Tenkai, Fukuma Mizushi!',
    arabicShout: 'توسيع النطاق: الضريح الخبيث!',
    series: 'جوجيتسو كايسن (Jujutsu Kaisen)',
    pitch: 0.78,
    rate: 0.95,
    vocalVibe: 'deep'
  },
  uchiha_sharingan: {
    id: 'uchiha_sharingan',
    characterName: 'ساسكي / إيتاتشي أوتشيها (Sasuke & Itachi)',
    japanese: '写輪眼！',
    romaji: 'Sharingan!',
    arabicShout: 'الشارينغان!',
    series: 'ناروتو (Naruto)',
    pitch: 1.15,
    rate: 1.1,
    vocalVibe: 'fierce'
  },
  mangekyo_sharingan: {
    id: 'mangekyo_sharingan',
    characterName: 'إيتاتشي أوتشيها (Itachi Uchiha)',
    japanese: '万華鏡写輪眼！',
    romaji: 'Mangekyō Sharingan!',
    arabicShout: 'المانغيكيو شارينغان!',
    series: 'ناروتو (Naruto)',
    pitch: 0.95,
    rate: 1.0,
    vocalVibe: 'mystical'
  },
  kamui_sharingan: {
    id: 'kamui_sharingan',
    characterName: 'أوبيتو / كاكاشي (Obito & Kakashi)',
    japanese: '神威！',
    romaji: 'Kamui!',
    arabicShout: 'كاموي! (دوامة الزمكان)',
    series: 'ناروتو (Naruto)',
    pitch: 1.02,
    rate: 1.15,
    vocalVibe: 'mystical'
  },
  rasengan: {
    id: 'rasengan',
    characterName: 'ناروتو أوزوماكي (Naruto Uzumaki)',
    japanese: '螺旋丸ーっ！',
    romaji: 'Rasengan!',
    arabicShout: 'راسينغان!',
    series: 'ناروتو (Naruto)',
    pitch: 1.32,
    rate: 1.22,
    vocalVibe: 'energetic'
  },
  chidori: {
    id: 'chidori',
    characterName: 'ساسكي أوتشيها (Sasuke Uchiha)',
    japanese: '千鳥！',
    romaji: 'Chidori!',
    arabicShout: 'تشيدوري!',
    series: 'ناروتو (Naruto)',
    pitch: 1.12,
    rate: 1.25,
    vocalVibe: 'fierce'
  },
  amaterasu: {
    id: 'amaterasu',
    characterName: 'إيتاتشي أوتشيها (Itachi Uchiha)',
    japanese: '天照！',
    romaji: 'Amaterasu!',
    arabicShout: 'أماتيراسو! (اللهب الأسود)',
    series: 'ناروتو (Naruto)',
    pitch: 0.92,
    rate: 0.92,
    vocalVibe: 'deep'
  },
  eight_gates: {
    id: 'eight_gates',
    characterName: 'مايت غاي (Might Guy)',
    japanese: '八門遁甲、開！夜凱！',
    romaji: 'Hachimon Tonkō, Kai! Yagai!',
    arabicShout: 'البوابات الثمانية: افتح! تنين الليل!',
    series: 'ناروتو (Naruto)',
    pitch: 1.2,
    rate: 1.25,
    vocalVibe: 'fierce'
  },
  kamehameha: {
    id: 'kamehameha',
    characterName: 'سون غوكو (Son Goku)',
    japanese: 'かめはめ波ーっ！',
    romaji: 'Kamehamehaaa!',
    arabicShout: 'كاميهاميها!',
    series: 'دراغون بول (Dragon Ball)',
    pitch: 1.22,
    rate: 1.15,
    vocalVibe: 'energetic'
  },
  super_saiyan: {
    id: 'super_saiyan',
    characterName: 'سون غوكو (Super Saiyan)',
    japanese: 'スーパーサイヤ人！',
    romaji: 'Super Saiyajin!',
    arabicShout: 'السوبر سايان الذهبي!',
    series: 'دراغون بول (Dragon Ball)',
    pitch: 1.28,
    rate: 1.2,
    vocalVibe: 'energetic'
  },
  spirit_bomb: {
    id: 'spirit_bomb',
    characterName: 'سون غوكو (Son Goku)',
    japanese: '元気玉！オラに元気を分けてくれ！',
    romaji: 'Genki Dama!',
    arabicShout: 'جينكي داما (كرة طاقة الكون)!',
    series: 'دراغون بول (Dragon Ball)',
    pitch: 1.1,
    rate: 1.05,
    vocalVibe: 'noble'
  },
  gear_fifth: {
    id: 'gear_fifth',
    characterName: 'مونكي دي لوفي (Luffy Nika)',
    japanese: 'ギア５！あはははは！',
    romaji: 'Gear Fifth! Ahahahaha!',
    arabicShout: 'جير فيفث: إله الشمس نيكا!',
    series: 'ون بيس (One Piece)',
    pitch: 1.35,
    rate: 1.25,
    vocalVibe: 'energetic'
  },
  conquerors_haki: {
    id: 'conquerors_haki',
    characterName: 'شانكس / لوفي (Shanks & Luffy)',
    japanese: '覇王色の覇気！',
    romaji: 'Haōshoku no Haki!',
    arabicShout: 'هاكي الملوك الأسطوري!',
    series: 'ون بيس (One Piece)',
    pitch: 0.88,
    rate: 1.0,
    vocalVibe: 'deep'
  },
  three_sword_style: {
    id: 'three_sword_style',
    characterName: 'رورونوا زورو (Roronoa Zoro)',
    japanese: '三刀流奥義、三千世界！',
    romaji: 'Santōryū Ōgi: Sanzen Sekai!',
    arabicShout: 'أسلوب الثلاثة سيوف: ثلاثة آلاف عالم!',
    series: 'ون بيس (One Piece)',
    pitch: 0.9,
    rate: 1.15,
    vocalVibe: 'fierce'
  },
  water_breathing: {
    id: 'water_breathing',
    characterName: 'تانجيرو كامادو (Tanjiro Kamado)',
    japanese: '全集中、水の呼吸！',
    romaji: 'Zen Shūchū, Mizu no Kokyū!',
    arabicShout: 'التركيز الكامل: تنفس الماء!',
    series: 'قاتل الشياطين (Demon Slayer)',
    pitch: 1.18,
    rate: 1.18,
    vocalVibe: 'noble'
  },
  flame_breathing: {
    id: 'flame_breathing',
    characterName: 'كيوجورو رينغوكو (Kyojuro Rengoku)',
    japanese: '炎の呼吸、心を燃やせ！',
    romaji: 'Honō no Kokyū, Kokoro o Moyase!',
    arabicShout: 'تنفس اللهب: أشعل قلبك حماساً!',
    series: 'قاتل الشياطين (Demon Slayer)',
    pitch: 1.12,
    rate: 1.15,
    vocalVibe: 'noble'
  },
  thunder_breathing: {
    id: 'thunder_breathing',
    characterName: 'زينيتسو أغاتسوما (Zenitsu Agatsuma)',
    japanese: '雷の呼吸、壱ノ型、霹靂一閃！',
    romaji: 'Kaminari no Kokyū: Hekireki Issen!',
    arabicShout: 'تنفس الرعد: الوميض الخاطف!',
    series: 'قاتل الشياطين (Demon Slayer)',
    pitch: 1.24,
    rate: 1.35,
    vocalVibe: 'energetic'
  },
  sun_breathing: {
    id: 'sun_breathing',
    characterName: 'تانجيرو كامادو (Tanjiro Kamado)',
    japanese: 'ヒノカミ神楽、円舞！',
    romaji: 'Hinokami Kagura, Enbu!',
    arabicShout: 'رقصة إله النار: هينوكامي كاغورا!',
    series: 'قاتل الشياطين (Demon Slayer)',
    pitch: 1.15,
    rate: 1.12,
    vocalVibe: 'mystical'
  },
  hollow_bankai: {
    id: 'hollow_bankai',
    characterName: 'إيتشيغو كوروساكي (Ichigo Kurosaki)',
    japanese: '卍解！月牙天衝！',
    romaji: 'Bankai! Getsuga Tenshō!',
    arabicShout: 'بانكاي! غيتسوغا تينشو!',
    series: 'بليتش (Bleach)',
    pitch: 1.02,
    rate: 1.18,
    vocalVibe: 'fierce'
  },
  titan_transformation: {
    id: 'titan_transformation',
    characterName: 'إيرين ييغر (Eren Yeager)',
    japanese: '戦え！戦え！',
    romaji: 'Tatakae! Tatakae!',
    arabicShout: 'قاتل! تاتاكاي!',
    series: 'هجوم العمالقة (Attack on Titan)',
    pitch: 1.05,
    rate: 1.2,
    vocalVibe: 'fierce'
  },
  titan_lightning: {
    id: 'titan_lightning',
    characterName: 'إيرين ييغر (Eren Yeager)',
    japanese: '戦え！戦え！',
    romaji: 'Tatakae! Tatakae!',
    arabicShout: 'قاتل! تاتاكاي!',
    series: 'هجوم العمالقة (Attack on Titan)',
    pitch: 1.05,
    rate: 1.2,
    vocalVibe: 'fierce'
  }
};

export function getAnimeVoiceDef(animType: string): AnimeVoiceDef {
  return (
    ANIME_VOICE_DEFS[animType] ||
    ANIME_VOICE_DEFS['rasengan'] || {
      id: animType,
      characterName: 'البطل',
      japanese: '必殺技！',
      romaji: 'Hissatsuwaza!',
      arabicShout: 'مهارة فائقة!',
      series: 'أنمي',
      pitch: 1.1,
      rate: 1.1,
      vocalVibe: 'energetic'
    }
  );
}
