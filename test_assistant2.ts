import { runAssistantPrompt } from './src/server/agent';

async function main() {
  try {
    const result = await runAssistantPrompt('add google meet event for 20 jun 10pm to 11pm named Sync on this gmail knagpal119@gmail.com');
    console.log(result);
  } catch (e) {
    console.error(e);
  }
}

main();
