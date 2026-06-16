import 'dotenv/config'
import { OpenAIAgentsProvider } from '@corsair-dev/mcp';
import { Agent, run, tool } from '@openai/agents';
import { corsair } from 'src/server/corsair';

async function main() {
    const provider = new OpenAIAgentsProvider();
    const tools = provider.build({ corsair, tool });

    const agent = new Agent({
        name: 'corsair-agent',

        instructions:
            'You have access to Corsair tools. Use list_operations to discover ' +
            'available APIs, get_schema to understand arguments, and run_script ' +
            'to execute them.',
        tools,
    });

    await corsair.keys.gmail.set_topic_id("test-user");
    const result = await run(agent, 'Use Corsair to send gmail and add events in my google calendar.');
    console.log(result.finalOutput);
}

main().catch(console.error);