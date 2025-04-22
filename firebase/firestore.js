const { db } = require('./config.js');
const { doc, setDoc, getDoc } = require('firebase/firestore');

const getUserByDiscordId = async (discordId) => {
  const docRef = doc(db, 'users', discordId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

const setUser = async (discordId, osuUsername) => {
  await setDoc(doc(db, 'users', discordId), {
    discord_id: discordId,
    osu_username: osuUsername,
  });
};

module.exports = { getUserByDiscordId, setUser };
