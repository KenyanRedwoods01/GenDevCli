import fetch from "node-fetch";


const MISTRAL_API = process.env.MISTRAL_API_URL || "https://api.mistral.ai/v1";
const API_KEY = process.env.MISTRAL_API_KEY || "vkeweLQIDCMCgqNLKTzHTXIBVooDQ1oY";


function headers() {
return {
"Content-Type": "application/json",
Authorization: `Bearer ${API_KEY}`,
};
}


export async function askCodestral(jsonPrompt) {
// Uses Codestral/chat completion endpoint; expects the model to reply in JSON
const body = {
model: "codestral-latest",
messages: [
{ role: "system", content: "You are GenDevCli. Always reply in valid JSON." },
{ role: "user", content: JSON.stringify(jsonPrompt) }
],
temperature: 0.2
};


const res = await fetch(`${MISTRAL_API}/chat/completions`, {
method: "POST",
headers: headers(),
body: JSON.stringify(body),
});
const data = await res.json();
const content = data?.choices?.[0]?.message?.content || "{}";
try { return JSON.parse(content); } catch (err) { return { status: "error", message: "Invalid JSON from model", raw: content }; }
}


export async function askAgent(agentId, jsonPrompt) {
const body = { agent_id: agentId, input: JSON.stringify(jsonPrompt) };
const res = await fetch(`${MISTRAL_API}/agents/completions`, {
method: "POST",
headers: headers(),
body: JSON.stringify(body),
});
const data = await res.json();
// Attempt to parse JSON from the agent response
const raw = data?.output?.[0]?.content?.[0]?.text || "{}";
try { return JSON.parse(raw); } catch (err) { return { status: "error", message: "Invalid JSON from agent", raw }; }
              }
