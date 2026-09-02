/**
 * AI Coach Assistant & Practice Plan Generator
 * Provides interactive youth sports coaching advice, scheme counters, and customized practice plans.
 */
(function (root) {
  "use strict";

  var COACH_SYSTEM_PROMPT = [
    "You are an elite, highly encouraging youth sports coaching AI assistant.",
    "Your coaching philosophy: Safety first (two-point stances, eyes up, head out of contact), positive reinforcement, high-reps, extreme simplicity for 5-8 year old kids.",
    "Be concise, clear, and direct. Use bullet points and action cues that coaches can shout on the grass."
  ].join("\n");

  async function askCoachAi(userQuestion, context) {
    var apiKey = (root.AiIngest && root.AiIngest.getApiKey()) || "";
    context = context || "";

    if (!apiKey) {
      return getFallbackCoachingAnswer(userQuestion);
    }

    var endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;
    var promptText = COACH_SYSTEM_PROMPT + "\n\nContext: " + context + "\n\nCoach's Question: " + userQuestion;

    var payload = {
      contents: [{ parts: [{ text: promptText }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 }
    };

    var response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Gemini API Error (" + response.status + ")");
    }

    var data = await response.json();
    return data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text;
  }

  function getFallbackCoachingAnswer(q) {
    var lower = q.toLowerCase();
    if (lower.indexOf("practice") !== -1 || lower.indexOf("plan") !== -1) {
      return "📋 **60-Minute Youth Practice Plan (High-Rep Station Format)**\n\n" +
        "• **00–10m**: Dynamic Warmup & Flag Tag (Keep hips low, quick feet)\n" +
        "• **10–25m**: Station 1: Hand-offs & Ball Security ('See it, Catch it, Tuck it')\n" +
        "• **25–40m**: Station 2: 5v4 Blocking & Pursuit Drill (2-point stance, hands inside)\n" +
        "• **40–55m**: Team Scrimmage / Live Play Calls (3 plays offense, 3 plays defense)\n" +
        "• **55–60m**: Team Huddle & 1-2-3 Seahawks Cheer!";
    }
    if (lower.indexOf("flag") !== -1 || lower.indexOf("pull") !== -1) {
      return "🚩 **Top 3 Flag Pulling Cues for Kids:**\n\n" +
        "1. **'Eyes on the Belt'** — Never look at their eyes or feet; watch the belt buckle.\n" +
        "2. **'Short Choppy Feet'** — Don't lunge or dive; breakdown into athletic stance.\n" +
        "3. **'Grab & Pop'** — Grab with two hands if close, pull straight down and hold the flag high!";
    }
    if (lower.indexOf("defense") !== -1 || lower.indexOf("zone") !== -1) {
      return "🛡️ **Youth Flag Defense Rule:**\n\n" +
        "• **Stay Home, Then Flag**: Never chase fakes. Keep outside contain.\n" +
        "• **Corner Rule**: Nothing gets outside your shoulder.\n" +
        "• **Safety**: Stay deep, hash to hash, fit the run after the cut.";
    }
    return "💡 **Youth Coaching Tip:** Keep explanations under 20 seconds. Kids learn by running reps, not hearing lectures. Line them up and blow the whistle!";
  }

  function openAiCoachModal() {
    var existing = document.getElementById("ai-coach-modal-overlay");
    if (existing) { existing.style.display = "flex"; return; }

    var overlay = document.createElement("div");
    overlay.className = "modal-overlay no-print";
    overlay.id = "ai-coach-modal-overlay";

    overlay.innerHTML = '<div class="modal-card" style="max-width:550px">' +
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">' +
      '<h2 style="margin:0">🤖 AI Coach Assistant</h2>' +
      '<button type="button" class="btn-squad" id="ai-coach-close">✕</button>' +
      '</div>' +
      '<p class="tiny" style="margin-top:-6px">Ask for practice drills, play adjustments, or cues for your age group.</p>' +
      '<div id="ai-chat-history" style="min-height:180px;max-height:300px;overflow-y:auto;background:var(--navy-light);border:1px solid var(--line);border-radius:8px;padding:12px;display:flex;flex-direction:column;gap:8px;font-size:0.9rem"></div>' +
      '<div style="display:flex;gap:6px;margin:10px 0;flex-wrap:wrap">' +
      '<button type="button" class="btn-squad quick-prompt" data-q="Build a 60-min practice plan">📋 60m Practice Plan</button>' +
      '<button type="button" class="btn-squad quick-prompt" data-q="Top flag pulling drill for 5-7 year olds">🚩 Flag Pulling Drill</button>' +
      '<button type="button" class="btn-squad quick-prompt" data-q="How do I adjust this play against a 2-3 defense?">⚡ Scheme Adjustment</button>' +
      '</div>' +
      '<form id="ai-chat-form" style="display:flex;gap:8px">' +
      '<input type="text" id="ai-chat-input" placeholder="Ask AI coach a question..." style="flex:1;padding:10px;border:1px solid var(--line);border-radius:8px;background:var(--navy-light);color:#fff;font-size:0.95rem">' +
      '<button type="submit" class="btn btn-primary" id="ai-chat-send">Ask</button>' +
      '</form>' +
      '</div>';

    document.body.appendChild(overlay);

    var history = overlay.querySelector("#ai-chat-history");
    var form = overlay.querySelector("#ai-chat-form");
    var input = overlay.querySelector("#ai-chat-input");

    function addMsg(sender, text) {
      var msg = document.createElement("div");
      msg.style.padding = "8px 12px";
      msg.style.borderRadius = "8px";
      msg.style.lineHeight = "1.4";
      if (sender === "user") {
        msg.style.background = "rgba(47,111,224,0.3)";
        msg.style.alignSelf = "flex-end";
        msg.innerHTML = "<strong>You:</strong> " + text;
      } else {
        msg.style.background = "rgba(246,195,68,0.1)";
        msg.style.alignSelf = "flex-start";
        msg.innerHTML = "<strong>Coach AI:</strong><br>" + text.replace(/\n/g, "<br>");
      }
      history.appendChild(msg);
      history.scrollTop = history.scrollHeight;
    }

    addMsg("ai", "Hello Coach! How can I help with your practice or playbook today?");

    async function handleSend(q) {
      if (!q) return;
      addMsg("user", q);
      input.value = "";
      addMsg("ai", "Thinking...");
      var loading = history.lastChild;
      try {
        var reply = await askCoachAi(q);
        if (loading && loading.parentNode) loading.remove();
        addMsg("ai", reply);
      } catch (err) {
        if (loading && loading.parentNode) loading.remove();
        addMsg("ai", "Error: " + err.message);
      }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      handleSend(input.value.trim());
    });

    overlay.querySelectorAll(".quick-prompt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        handleSend(btn.getAttribute("data-q"));
      });
    });

    overlay.querySelector("#ai-coach-close").addEventListener("click", function () { overlay.style.display = "none"; });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) overlay.style.display = "none"; });
  }

  root.AiCoach = {
    askCoachAi: askCoachAi,
    openAiCoachModal: openAiCoachModal
  };
})(typeof window !== "undefined" ? window : globalThis);
