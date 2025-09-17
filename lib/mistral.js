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
  if (!API_KEY) {
    return { 
      status: "error", 
      message: "MISTRAL_API_KEY environment variable is not set" 
    };
  }

  try {
    const body = {
      model: "codestral-latest",
      messages: [
        { 
          role: "system", 
          content: "You are GenDevCli, an AI coding assistant. Always reply in valid JSON format. You can suggest code changes, create files, or provide analysis." 
        },
        { 
          role: "user", 
          content: JSON.stringify(jsonPrompt) 
        }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    };

    const res = await fetch(`${MISTRAL_API}/chat/completions`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`API error: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || "{}";
    
    try {
      const parsed = JSON.parse(content);
      return { status: "ok", ...parsed };
    } catch (err) {
      return { 
        status: "error", 
        message: "Invalid JSON response from model", 
        raw: content 
      };
    }
  } catch (err) {
    return { 
      status: "error", 
      message: `API request failed: ${err.message}` 
    };
  }
}

export async function askAgent(agentId, jsonPrompt) {
  if (!API_KEY) {
    return { 
      status: "error", 
      message: "MISTRAL_API_KEY environment variable is not set" 
    };
  }

  if (!agentId) {
    return { 
      status: "error", 
      message: "MISTRAL_AGENT_ID environment variable is not set" 
    };
  }

  try {
    const body = { 
      agent_id: agentId, 
      input: JSON.stringify(jsonPrompt) 
    };
    
    const res = await fetch(`${MISTRAL_API}/agents/completions`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Agent API error: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const data = await res.json();
    const raw = data?.output?.[0]?.content?.[0]?.text || "{}";
    
    try {
      const parsed = JSON.parse(raw);
      return { status: "ok", ...parsed };
    } catch (err) {
      return { 
        status: "error", 
        message: "Invalid JSON response from agent", 
        raw 
      };
    }
  } catch (err) {
    return { 
      status: "error", 
      message: `Agent API request failed: ${err.message}` 
    };
  }
}

export async function listModels() {
  if (!API_KEY) {
    return { 
      status: "error", 
      message: "MISTRAL_API_KEY environment variable is not set" 
    };
  }

  try {
    const res = await fetch(`${MISTRAL_API}/models`, {
      method: "GET",
      headers: headers(),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Models API error: ${res.status} ${res.statusText} - ${errorText}`);
    }
    
    const data = await res.json();
    return { status: "ok", models: data.data };
  } catch (err) {
    return { 
      status: "error", 
      message: `Models API request failed: ${err.message}` 
    };
  }
  }
