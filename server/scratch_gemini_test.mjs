import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });
import { askFarmCopilot } from './dist/server/src/services/ai/gemini.service.js';

async function main() {
  try {
    const res = await askFarmCopilot('What happens if I reduce my irrigation by 20%?', 'en');
    console.log('Result citations:', res.message.groundingCitations);
    console.log('Result content:\n', res.message.content);
  } catch (e) {
    console.error('Error:', e);
  }
}
main();
