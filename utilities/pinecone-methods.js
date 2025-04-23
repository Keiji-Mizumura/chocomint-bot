require('dotenv').config();

const axios = require('axios');

// Load Pinecone configuration from env
const PINECONE_API_KEY = process.env.PINECONE_API_KEY;
const USE_DUMMY_EMBEDDING = true;

function getDummyEmbedding(text) {
    const hash = [...text].reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return Array(1024)
      .fill()
      .map((_, i) => Math.sin(hash + i) % 1);
  }
  
  async function getEmbedding(text) {
    if (USE_DUMMY_EMBEDDING) return getDummyEmbedding(text);
    const res = await openai.embeddings.create({ model: 'text-embedding-ada-002', input: text });
    return res.data[0].embedding;
  }
  
  async function addToPinecone(userId, username, topic, memory, url) {
    if (!PINECONE_API_KEY || !url) return;
    const vector = await getEmbedding(memory);
    const vectorId = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const body = { vectors: [{ id: vectorId, values: vector, metadata: { userId, username, topic, text: memory.slice(0, 500) } }] };
    try {
      await axios.post(
        `${url}/vectors/upsert`,
        body,
        { headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' } }
      );
    } catch (err) {
      console.error('[Pinecone Upsert Error]', err.response?.data?.message || err.message);
    }
  }
  
  async function queryPinecone(queryText, options = {}, url) {
    if (!PINECONE_API_KEY || !url) return [];
    const { userId = null, includeGlobal = true, targetUsername = null } = options;
    const vector = await getEmbedding(queryText);
    let filter = {};
    if (targetUsername) filter.username = { $eq: targetUsername };
    else if (userId && !includeGlobal) filter.userId = userId;
    else if (userId) filter = { $or: [{ userId }, { userId: { $exists: true } }] };
    try {
      const res = await axios.post(
        `${url}/query`,
        { vector, topK: 5, includeMetadata: true, filter },
        { headers: { 'Api-Key': PINECONE_API_KEY, 'Content-Type': 'application/json' } }
      );
      return res.data.matches.map(m => ({ text: m.metadata.text, userId: m.metadata.userId, username: m.metadata.username, topic: m.metadata.topic }));
    } catch (err) {
      console.error('[Pinecone Query Error]', err.response?.data?.message || err.message);
      return [];
    }
  }

module.exports = { addToPinecone, queryPinecone };
