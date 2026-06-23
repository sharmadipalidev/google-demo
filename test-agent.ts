import { runAssistantPrompt } from "./src/server/agent";

async function main() {
    try {
        const result = await runAssistantPrompt("hello", {} as any, []);
        console.log("Success:", result);
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
