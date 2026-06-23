import { runAssistantPrompt } from "./src/server/agent";

async function main() {
    try {
        const history = [
            { role: "user" as const, content: "hi" },
            { role: "assistant" as const, content: "hello" }
        ];
        const result = await runAssistantPrompt("how are you", {} as any, history);
        console.log("Success:", result);
    } catch (e) {
        console.error("Error:", e);
    }
}

main();
