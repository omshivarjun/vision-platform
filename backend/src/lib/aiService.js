const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

async function post(path, data, config) {
  if ((process.env.TRANSLATION_PROVIDER || 'mock') === 'mock') {
    if (path.includes('scene-description')) {
      return { data: { description: 'Mock scene description', objects: [], confidence: 0.99 } };
    }
    if (path.includes('object-detection')) {
      return { data: { objects: [], confidence: 0.9 } };
    }
    if (path.includes('translate')) {
      // simple mock translation
      if (data && data.text) {
        return { data: { translated_text: `[MOCK ${data.target_lang || 'tgt'}] ${data.text}`, source_lang: data.source_lang || 'auto', target_lang: data.target_lang || 'tgt', model_used: 'mock', confidence: 0.9 } };
      }
      if (data && data.texts) {
        return { data: { translations: data.texts.map((t) => ({ translated_text: `[MOCK ${data.target_lang || 'tgt'}] ${t}`, source_lang: data.source_lang || 'auto', target_lang: data.target_lang || 'tgt', model_used: 'mock', confidence: 0.9 })), total_processing_time: 100 } };
      }
    }
  }

  const resp = await axios.post(`${AI_SERVICE_URL}${path}`, data, config);
  return resp;
}

async function get(path, config) {
  if ((process.env.TRANSLATION_PROVIDER || 'mock') === 'mock') {
    if (path.includes('supported-languages')) {
      return { data: { languages: [ { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' } ] } };
    }
  }

  const resp = await axios.get(`${AI_SERVICE_URL}${path}`, config);
  return resp;
}

module.exports = { post, get };
