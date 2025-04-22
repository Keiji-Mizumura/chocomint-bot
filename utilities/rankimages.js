const rank_images = [
  // Standard (std)
  [
    'https://i.postimg.cc/jdSRMG4b/stdiron1.png',
    'https://i.postimg.cc/bNVpW3m2/stdiron2.png',
    'https://i.postimg.cc/mgcBsCnp/stdiron3.png',
    'https://i.postimg.cc/N030Vpfx/stdbronze1.png',
    'https://i.postimg.cc/rm5pLxD2/stdbronze2.png',
    'https://i.postimg.cc/0jxy5jSM/stdbronze3.png',
    'https://i.postimg.cc/26xfwwqy/stdsilver1.png',
    'https://i.postimg.cc/rsn26wNL/stdsilver2.png',
    'https://i.postimg.cc/QN03KfGn/stdsilver3.png',
    'https://i.postimg.cc/13TRnJ6Z/stdgold1.png',
    'https://i.postimg.cc/wBmqhLcR/stdgold2.png',
    'https://i.postimg.cc/76rxXhms/stdgold3.png',
    'https://i.postimg.cc/CxWYLdTh/stdplatinum1.png',
    'https://i.postimg.cc/W4gVDjTM/stdplatinum2.png',
    'https://i.postimg.cc/W3VvgK1x/stdplatinum3.png',
    'https://i.postimg.cc/6q058KVH/stddiamond1.png',
    'https://i.postimg.cc/MZbGP0ky/stddiamond2.png',
    'https://i.postimg.cc/qM1v0kvq/stddiamond3.png',
    'https://i.postimg.cc/5Ng60Bnx/stdascendant1.png',
    'https://i.postimg.cc/nhLMQXPq/stdascendant2.png',
    'https://i.postimg.cc/XYDqKnRm/stdascendant3.png',
    'https://i.postimg.cc/bJ0q5P5z/stdimmortal1.png',
    'https://i.postimg.cc/hvSKWwFV/stdimmortal2.png',
    'https://i.postimg.cc/qqj4kL0S/stdimmortal3.png',
    'https://i.postimg.cc/5yNWkCv3/stdradiant.png',
  ],
  // Taiko
  [
    'https://i.postimg.cc/T2HsXFXG/taikoiron1.png',
    'https://i.postimg.cc/Nf9zGDgX/taikoiron2.png',
    'https://i.postimg.cc/hPk3Xmj5/taikoiron3.png',
    'https://i.postimg.cc/Bv99fyHt/taikobronze1.png',
    'https://i.postimg.cc/zfCmzjF7/taikobronze2.png',
    'https://i.postimg.cc/26GPvSJB/taikobronze3.png',
    'https://i.postimg.cc/KcV0WTn8/taikosilver1.png',
    'https://i.postimg.cc/pLMqWtcN/taikosilver2.png',
    'https://i.postimg.cc/fR75kg1V/taikosilver3.png',
    'https://i.postimg.cc/dtLzkv9L/taikogold1.png',
    'https://i.postimg.cc/HsRFbKS3/taikogold2.png',
    'https://i.postimg.cc/yNX54N7r/taikogold3.png',
    'https://i.postimg.cc/LsRCTMjk/taikoplatinum1.png',
    'https://i.postimg.cc/tT4BKtSY/taikoplatinum2.png',
    'https://i.postimg.cc/pTcsRh4k/taikoplatinum3.png',
    'https://i.postimg.cc/Qth2HT63/taikodiamond1.png',
    'https://i.postimg.cc/hv36y3KD/taikodiamond2.png',
    'https://i.postimg.cc/Y2X5CjY5/taikodiamond3.png',
    'https://i.postimg.cc/3JNHX23r/taikoascendant1.png',
    'https://i.postimg.cc/0241crNY/taikoascendant2.png',
    'https://i.postimg.cc/x1bD7YkW/taikoascendant3.png',
    'https://i.postimg.cc/NMdzFP96/taikoimmortal1.png',
    'https://i.postimg.cc/2y3XZFhP/taikoimmortal2.png',
    'https://i.postimg.cc/yx5pXgTW/taikoimmortal3.png',
    'https://i.postimg.cc/4yKBd4TG/taikoradiant.png',
  ],
  // Catch
  [
    'https://i.postimg.cc/Y0JLxMLt/catchiron1.png',
    'https://i.postimg.cc/HWKMm4ZF/catchiron2.png',
    'https://i.postimg.cc/rw2t0yLJ/catchiron3.png',
    'https://i.postimg.cc/J4v5TWCD/catchbronze1.png',
    'https://i.postimg.cc/QMkgx991/catchbronze2.png',
    'https://i.postimg.cc/pryKZs0J/catchbronze3.png',
    'https://i.postimg.cc/vT6cTkqk/catchsilver1.png',
    'https://i.postimg.cc/fLPVwDKY/catchsilver2.png',
    'https://i.postimg.cc/5jdjCgD0/catchsilver3.png',
    'https://i.postimg.cc/bv8bMyCJ/catchgold1.png',
    'https://i.postimg.cc/zXsTCSTT/catchgold2.png',
    'https://i.postimg.cc/kgWKf6yz/catchgold3.png',
    'https://i.postimg.cc/W1mqMRNP/catchplatinum1.png',
    'https://i.postimg.cc/W42F89zq/catchplatinum2.png',
    'https://i.postimg.cc/VNDSVj0G/catchplatinum3.png',
    'https://i.postimg.cc/ZngpD62t/catchdiamond1.png',
    'https://i.postimg.cc/MZr7T8TP/catchdiamond2.png',
    'https://i.postimg.cc/yYgF3r3V/catchdiamond3.png',
    'https://i.postimg.cc/Wp9nkk97/catchascendant1.png',
    'https://i.postimg.cc/7YfNMZdr/catchascendant2.png',
    'https://i.postimg.cc/mg9NJ6Td/catchascendant3.png',
    'https://i.postimg.cc/N04Tv3Sx/catchimmortal1.png',
    'https://i.postimg.cc/ydpZkFVg/catchimmortal2.png',
    'https://i.postimg.cc/wMtsJ7vW/catchimmortal3.png',
    'https://i.postimg.cc/Y904Kh1p/catchradiant.png',
  ],

  // Mania
  [
    'https://i.postimg.cc/4yzHwj6t/maniairon1.png',
    'https://i.postimg.cc/sfSWVGkX/maniairon2.png',
    'https://i.postimg.cc/dtYyDtF9/maniairon3.png',
    'https://i.postimg.cc/dtrjSxs5/maniabronze1.png',
    'https://i.postimg.cc/R0V1hCcY/maniabronze2.png',
    'https://i.postimg.cc/Zq78dkH5/maniabronze3.png',
    'https://i.postimg.cc/JnXs4Sdg/maniasilver1.png',
    'https://i.postimg.cc/D0K8W59z/maniasilver2.png',
    'https://i.postimg.cc/9FCDC8P8/maniasilver3.png',
    'https://i.postimg.cc/7Y8g7n30/maniagold1.png',
    'https://i.postimg.cc/cLdwk15J/maniagold2.png',
    'https://i.postimg.cc/0yZmTgL0/maniagold3.png',
    'https://i.postimg.cc/T325q7pL/maniaplatinum1.png',
    'https://i.postimg.cc/wTQsN8TY/maniaplatinum2.png',
    'https://i.postimg.cc/N05yZK8Q/maniaplatinum3.png',
    'https://i.postimg.cc/k4LWTxkr/maniadiamond1.png',
    'https://i.postimg.cc/3RkgjLfC/maniadiamond2.png',
    'https://i.postimg.cc/nVQ4CPDn/maniadiamond3.png',
    'https://i.postimg.cc/L4rVDppq/maniaascendant1.png',
    'https://i.postimg.cc/pV9ZKdgb/maniaascendant2.png',
    'https://i.postimg.cc/qvrxfxg4/maniaascendant3.png',
    'https://i.postimg.cc/FKRcmWv5/maniaimmortal1.png',
    'https://i.postimg.cc/d1ZyZhD5/maniaimmortal2.png',
    'https://i.postimg.cc/6qsGrBvt/maniaimmortal3.png',
    'https://i.postimg.cc/43qKGXwV/maniaradiant.png',
  ],
];

const newRankImages = [
    "https://i.postimg.cc/7PBk3N0Y/iron.png",
    "https://i.postimg.cc/NMBc4JdL/bronze.png",
    "https://i.postimg.cc/pX4M7Xsw/silver.png",
    "https://i.postimg.cc/gjBbGYm6/gold.png",
    "https://i.postimg.cc/tCYH2VNd/platinum.png",
    "https://i.postimg.cc/HxzCPwNz/diamond.png",
    "https://i.postimg.cc/BnP4Q18Z/ascendant.png",
    "https://i.postimg.cc/T1PX8yM6/immortal.png",
    "https://i.postimg.cc/2SWNfRJV/radiant.png"
];



const rankedBadges = [
  // Iron ranks
  {img: "https://i.postimg.cc/SKrPWthD/Iron-1-Rank.png" , title_jp: "アイアン 1", title_en: "Iron 1"}, // Iron 1
  {img: "https://i.postimg.cc/DZpYNJmG/Iron-2-Rank.png", title_jp: "アイアン 2", title_en: "Iron 2"}, // Iron 2
  {img: "https://i.postimg.cc/T1ZNRzVY/Iron-3-Rank.png", title_jp: "アイアン 3", title_en: "Iron 3"}, // Iron 3

  // Bronze ranks
  {img: "https://i.postimg.cc/MZPSkHgd/Bronze-1-Rank.png", title_jp: "ブロンズ 1", title_en: "Bronze 1"}, // Bronze 1
  {img: "https://i.postimg.cc/281fCmDm/Bronze-2-Rank.png", title_jp: "ブロンズ 2", title_en: "Bronze 2"}, // Bronze 2
  {img: "https://i.postimg.cc/CL9p1th8/Bronze-3-Rank.png", title_jp: "ブロンズ 3", title_en: "Bronze 3"}, // Bronze 3

  // Silver ranks
  {img: "https://i.postimg.cc/jS63bkLt/Silver-1-Rank.png", title_jp: "シルバー 1", title_en: "Silver 1"}, // Silver 1
  {img: "https://i.postimg.cc/Y90dQr8C/Silver-2-Rank.png", title_jp: "シルバー 2", title_en: "Silver 2"}, // Silver 2
  {img: "https://i.postimg.cc/d1f4BbSm/Silver-3-Rank.png", title_jp: "シルバー 3", title_en: "Silver 3"}, // Silver 3

  // Gold ranks
  {img: "https://i.postimg.cc/0jrh5GhZ/Gold-1-Rank.png", title_jp: "ゴールド 1", title_en: "Gold 1"}, // Gold 1
  {img: "https://i.postimg.cc/J0gvsDL8/Gold-2-Rank.png", title_jp: "ゴールド 2", title_en: "Gold 2"}, // Gold 2
  {img: "https://i.postimg.cc/DfYtjDbN/Gold-3-Rank.png", title_jp: "ゴールド 3", title_en: "Gold 3"}, // Gold 3

  // Platinum ranks
  {img: "https://i.postimg.cc/dQXxmybP/Platinum-1-Rank.png", title_jp: "プラチナ 1", title_en: "Platinum 1"}, // Platinum 1
  {img: "https://i.postimg.cc/vHVSPmy1/Platinum-2-Rank.png", title_jp: "プラチナ 2", title_en: "Platinum 2"}, // Platinum 2
  {img: "https://i.postimg.cc/52WKDM9s/Platinum-3-Rank.png", title_jp: "プラチナ 3", title_en: "Platinum 3"}, // Platinum 3

  // Diamond ranks
  {img: "https://i.postimg.cc/y894SPxb/Diamond-1-Rank.png", title_jp: "ダイヤモンド 1", title_en: "Diamond 1"}, // Diamond 1
  {img: "https://i.postimg.cc/6QXsVvG5/Diamond-2-Rank.png", title_jp: "ダイヤモンド 2", title_en: "Diamond 2"}, // Diamond 2
  {img: "https://i.postimg.cc/W3NQCcnB/Diamond-3-Rank.png", title_jp: "ダイヤモンド 3", title_en: "Diamond 3"}, // Diamond 3

  // Ascendant ranks
  {img: "https://i.postimg.cc/6QrXF0Nv/Ascendant-1-Rank.png", title_jp: "アセンダント 1", title_en: "Ascendant 1"}, // Ascendant 1
  {img: "https://i.postimg.cc/2y6NbNLQ/Ascendant-2-Rank.png", title_jp: "アセンダント 2", title_en: "Ascendant 2"}, // Ascendant 2
  {img: "https://i.postimg.cc/MHF2131h/Ascendant-3-Rank.png", title_jp: "アセンダント 3", title_en: "Ascendant 3"}, // Ascendant 3

  // Immortal ranks
  {img: "https://i.postimg.cc/bND4KTxw/Immortal-1-Rank.png", title_jp: "イモータル 1", title_en: "Immortal 1"}, // Immortal 1
  {img: "https://i.postimg.cc/XY9mvYDM/Immortal-2-Rank.png", title_jp: "イモータル 2", title_en: "Immortal 2"}, // Immortal 2
  {img: "https://i.postimg.cc/YSkVLBJv/Immortal-3-Rank.png", title_jp: "イモータル 3", title_en: "Immortal 3"}, // Immortal 3

  // Radiant rank
  {img: "https://i.postimg.cc/fbw2Tj9X/Radiant-Rank.png", title_jp: "レディアント", title_en: "Radiant"} // Radiant
];

const getRankBadge = (pp_rank) => {
    if (pp_rank === 0) return rankedBadges[0];
    if (pp_rank <= 500) return rankedBadges[24]; // Radiant
    if (pp_rank <= 750) return rankedBadges[23];  // Immortal
    if (pp_rank <= 1500) return rankedBadges[22];
    if (pp_rank <= 2500) return rankedBadges[21];
    if (pp_rank <= 5000) return rankedBadges[20]; // Ascendant
    if (pp_rank <= 7500) return rankedBadges[19];
    if (pp_rank <= 10000) return rankedBadges[18];
    if (pp_rank <= 12500) return rankedBadges[17]; // Diamond
    if (pp_rank <= 15000) return rankedBadges[16];
    if (pp_rank <= 17500) return rankedBadges[15];
    if (pp_rank <= 20000) return rankedBadges[14]; // Platinum
    if (pp_rank <= 22500) return rankedBadges[13];
    if (pp_rank <= 25000) return rankedBadges[12];
    if (pp_rank <= 30000) return rankedBadges[11]; // Gold
    if (pp_rank <= 35000) return rankedBadges[10];
    if (pp_rank <= 40000) return rankedBadges[9];
    if (pp_rank <= 50000) return rankedBadges[8]; // Silver
    if (pp_rank <= 60000) return rankedBadges[7];
    if (pp_rank <= 75000) return rankedBadges[6];
    if (pp_rank <= 100000) return rankedBadges[5];  // Bronze
    if (pp_rank <= 150000) return rankedBadges[4]; 
    if (pp_rank <= 200000) return rankedBadges[3];
    if (pp_rank <= 300000) return rankedBadges[2]; // Iron
    if (pp_rank <= 500000) return rankedBadges[1];
    return rankedBadges[0];Iron
}



const getNewRankTierImage = (pp_rank) => {
  if(pp_rank === 0) return newRankImages[0];  // Unranked/Iron
  if(pp_rank <= 500) return newRankImages[8]; // Radiant
  if(pp_rank <= 2500) return newRankImages[7]; // Immortal
  if(pp_rank <= 10000) return newRankImages[6]; // Ascendant
  if(pp_rank <= 17500) return newRankImages[5]; // Diamond
  if(pp_rank <= 25000) return newRankImages[4]; // Platinum
  if(pp_rank <= 40000) return newRankImages[3]; // Gold
  if(pp_rank <= 75000) return newRankImages[2]; // Silver
  if(pp_rank <= 200000) return newRankImages[1]; // Bronze
  if(pp_rank <= 500000) return newRankImages[0]; // Iron
  return newRankImages[0];
}


const getRankTierImage = (pp_rank, mode = 0) => {
    const ranks = rank_images[mode];
    if (pp_rank === 0) return ranks[0];
    if (pp_rank <= 500) return ranks[24];
    if (pp_rank <= 750) return ranks[23];
    if (pp_rank <= 1500) return ranks[22];
    if (pp_rank <= 2500) return ranks[21];
    if (pp_rank <= 5000) return ranks[20];
    if (pp_rank <= 7500) return ranks[19];
    if (pp_rank <= 10000) return ranks[18];
    if (pp_rank <= 12500) return ranks[17];
    if (pp_rank <= 15000) return ranks[16];
    if (pp_rank <= 17500) return ranks[15];
    if (pp_rank <= 20000) return ranks[14];
    if (pp_rank <= 22500) return ranks[13];
    if (pp_rank <= 25000) return ranks[12];
    if (pp_rank <= 30000) return ranks[11];
    if (pp_rank <= 35000) return ranks[10];
    if (pp_rank <= 40000) return ranks[9];
    if (pp_rank <= 50000) return ranks[8];
    if (pp_rank <= 60000) return ranks[7];
    if (pp_rank <= 75000) return ranks[6];
    if (pp_rank <= 100000) return ranks[5];
    if (pp_rank <= 150000) return ranks[4];
    if (pp_rank <= 200000) return ranks[3];
    if (pp_rank <= 300000) return ranks[2];
    if (pp_rank <= 500000) return ranks[1];
    return ranks[0];
}

module.exports = { getRankTierImage, getNewRankTierImage, getRankBadge };