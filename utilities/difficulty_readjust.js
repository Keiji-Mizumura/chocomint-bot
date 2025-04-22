function applyModsToStats(beatmap, mods) {
  const speedMultiplier = mods.includes('DT') || mods.includes('NC') ? 1.5 : mods.includes('HT') ? 0.75 : 1;

  let { ar, accuracy: od, drain: hp, bpm, hit_length, total_length } = beatmap;

  // Adjust BPM and lengths
  bpm = Math.round(bpm * speedMultiplier);
  hit_length = Math.floor(hit_length / speedMultiplier);
  total_length = Math.floor(total_length / speedMultiplier);

  // Adjust AR and OD
  ar = adjustAR(ar, speedMultiplier);
  od = adjustOD(od, speedMultiplier);

  // HR multiplies AR/OD/HP by 1.4 (capped at 10)
  if (mods.includes('HR')) {
    ar = Math.min(ar * 1.4, 10);
    od = Math.min(od * 1.4, 10);
    hp = Math.min(hp * 1.4, 10);
  }

  // HT lowers OD/AR/HP by 0.5 (then speed formula applies after)
  if (mods.includes('HT')) {
    ar = adjustAR(ar, speedMultiplier); // already slowed down above
    od = adjustOD(od, speedMultiplier);
    hp = hp * 0.5;
  }

  return {
    ar: round(ar),
    od: round(od),
    hp: round(hp),
    bpm,
    hit_length,
    total_length,
  };
}

function adjustAR(ar, speedMultiplier) {
  let arMS = ar <= 5 ? 1800 - 120 * ar : 1200 - 150 * (ar - 5);
  arMS /= speedMultiplier;

  return arMS > 1200 ? (1800 - arMS) / 120 : 5 + (1200 - arMS) / 150;
}

function adjustOD(od, speedMultiplier) {
  let odMS = 79.5 - od * 6;
  odMS /= speedMultiplier;
  return (79.5 - odMS) / 6;
}

function round(num) {
  return Math.round(num * 100) / 100;
}

module.exports = { applyModsToStats }