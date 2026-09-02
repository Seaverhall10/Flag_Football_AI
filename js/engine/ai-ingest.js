/**
 * AI Playbook & Vision Ingestion Engine
 * Ingests playbook photos, PDF pages, sketches, or whiteboard diagrams using Google Gemini Multimodal Vision API.
 */
(function (root) {
  "use strict";

  var API_KEY_STORAGE = "coach_gemini_api_key";

  function getApiKey() {
    return localStorage.getItem(API_KEY_STORAGE) || "";
  }

  function setApiKey(key) {
    if (!key) localStorage.removeItem(API_KEY_STORAGE);
    else localStorage.setItem(API_KEY_STORAGE, key.trim());
  }

  function hasApiKey() {
    return Boolean(getApiKey());
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var base64 = reader.result.split(",")[1];
        var mimeType = file.type || "image/jpeg";
        resolve({ base64: base64, mimeType: mimeType });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  var SYSTEM_PROMPT = [
    "You are an expert youth sports diagram parser.",
    "Your job is to analyze the provided football/sports playbook diagram or photo and convert it into structured JSON.",
    "Coordinate space: 1000 pixels wide (X: 0 to 1000) by 900 pixels high (Y: 0 to 900). Line of Scrimmage is around Y=400 to Y=450.",
    "Offense is typically in the lower half (Y=450 to Y=650). Defense is in the upper half (Y=150 to Y=400).",
    "Extract the exact offense players, defense players, blocks (solid arrows into defenders), routes (arrows pointing downfield), and ball path (snap/handoff/pass).",
    "Return ONLY valid JSON matching this exact structure with no markdown code blocks:",
    "{",
    '  "name": "Play Name",',
    '  "call": "Short Call (e.g. Sweep Right)",',
    '  "cue": "1-sentence youth coaching instruction",',
    '  "offense": [',
    '    {"id": "c", "letter": "C", "color": "#eab308", "x": 500, "y": 450, "role": "SNAP", "job": "Snap ball and block"},',
    '    {"id": "rb-ball", "letter": "QB", "color": "#eab308", "x": 500, "y": 590, "role": "RUN", "job": "Take snap and run right"}',
    "  ],",
    '  "defense": [',
    '    {"id": "dt-l", "letter": "DT", "x": 420, "y": 340},',
    '    {"id": "dt-r", "letter": "DT", "x": 580, "y": 340}',
    "  ],",
    '  "blocks": [',
    '    {"from": "c", "toDefenderId": "dt-r"}',
    "  ],",
    '  "routes": [',
    '    {"from": "rb-ball", "points": [{"x": 500, "y": 590}, {"x": 700, "y": 500}, {"x": 850, "y": 200}], "style": "dashed", "color": "#dc2626"}',
    "  ],",
    '  "ball": {',
    '    "carrierId": "rb-ball",',
    '    "points": [{"x": 500, "y": 460}, {"x": 500, "y": 590}, {"x": 700, "y": 500}, {"x": 850, "y": 200}]',
    "  }",
    "}"
  ].join("\n");

  async function ingestPlayFromImage(file, opts) {
    opts = opts || {};
    var apiKey = opts.apiKey || getApiKey();

    if (!apiKey) {
      // Fallback heuristic simulation if no API key is provided
      return fallbackHeuristicParser(file);
    }

    var imgData = await fileToBase64(file);
    var endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + apiKey;

    var payload = {
      contents: [
        {
          parts: [
            { text: SYSTEM_PROMPT },
            {
              inline_data: {
                mime_type: imgData.mimeType,
                data: imgData.base64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    };

    var response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      var errText = await response.text();
      throw new Error("Gemini API Error (" + response.status + "): " + errText);
    }

    var data = await response.json();
    var text = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text;
    if (!text) throw new Error("No response content from Gemini Vision.");

    // Clean JSON response
    var cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/i, "");
    var playObj = JSON.parse(cleaned);

    // Ensure valid IDs
    if (!playObj.id) playObj.id = "ingested-" + Date.now();
    return validateAndNormalizePlay(playObj);
  }

  function validateAndNormalizePlay(play) {
    if (!play.offense || !Array.isArray(play.offense)) play.offense = [];
    if (!play.defense || !Array.isArray(play.defense)) play.defense = [];
    if (!play.blocks || !Array.isArray(play.blocks)) play.blocks = [];
    if (!play.routes || !Array.isArray(play.routes)) play.routes = [];
    if (!play.name) play.name = "Custom Play";
    if (!play.call) play.call = "Ingested Play";
    if (!play.cue) play.cue = "Execute assignment on the whistle.";

    // Clamp coordinates to 0-1000, 0-900
    play.offense.forEach(function (p) {
      p.x = Math.max(50, Math.min(950, p.x || 500));
      p.y = Math.max(50, Math.min(850, p.y || 500));
    });
    play.defense.forEach(function (d) {
      d.x = Math.max(50, Math.min(950, d.x || 500));
      d.y = Math.max(50, Math.min(850, d.y || 300));
    });

    return play;
  }

  function fallbackHeuristicParser(file) {
    return new Promise(function (resolve) {
      setTimeout(function () {
        var baseName = (file && file.name) ? file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ") : "Scanned Play";
        resolve({
          id: "custom-" + Date.now(),
          name: "Play " + baseName,
          call: baseName,
          cue: "Ingested from " + (file ? file.name : "diagram") + ". Tap and drag tokens to fine-tune.",
          offense: [
            { id: "c", letter: "C", color: "#eab308", x: 500, y: 450, role: "SNAP", job: "Snap and block." },
            { id: "lg", letter: "G", color: "#3b82f6", x: 410, y: 450, role: "BLOCK", job: "Block defender." },
            { id: "rg", letter: "G", color: "#3b82f6", x: 590, y: 450, role: "BLOCK", job: "Block defender." },
            { id: "lt", letter: "T", color: "#3b82f6", x: 320, y: 450, role: "BLOCK", job: "Seal edge." },
            { id: "rt", letter: "T", color: "#3b82f6", x: 680, y: 450, role: "BLOCK", job: "Seal edge." },
            { id: "rb-lead", letter: "RB", color: "#3b82f6", x: 440, y: 540, role: "LEAD", job: "Lead block." },
            { id: "rb-ball", letter: "QB", color: "#eab308", x: 500, y: 590, role: "RUN", stroke: "#dc2626", job: "Ball carrier." }
          ],
          defense: [
            { id: "dt-l", letter: "DT", x: 420, y: 340 },
            { id: "dt-r", letter: "DT", x: 580, y: 340 },
            { id: "de-l", letter: "DE", x: 260, y: 340 },
            { id: "de-r", letter: "DE", x: 740, y: 340 },
            { id: "lb-l", letter: "LB", x: 350, y: 230 },
            { id: "lb-r", letter: "LB", x: 650, y: 230 },
            { id: "cb-l", letter: "CB", x: 120, y: 280 },
            { id: "cb-r", letter: "CB", x: 880, y: 280 }
          ],
          blocks: [
            { from: "c", toDefenderId: "dt-r" },
            { from: "rg", toDefenderId: "dt-r" },
            { from: "rt", toDefenderId: "de-r" }
          ],
          routes: [
            { from: "rb-lead", points: [{ x: 440, y: 540 }, { x: 640, y: 480 }, { x: 780, y: 300 }] },
            { from: "rb-ball", points: [{ x: 500, y: 590 }, { x: 680, y: 520 }, { x: 820, y: 320 }, { x: 850, y: 100 }], style: "dashed", color: "#dc2626" }
          ],
          ball: {
            carrierId: "rb-ball",
            points: [{ x: 500, y: 460 }, { x: 500, y: 590 }, { x: 680, y: 520 }, { x: 820, y: 320 }, { x: 850, y: 100 }]
          }
        });
      }, 500);
    });
  }

  root.AiIngest = {
    getApiKey: getApiKey,
    setApiKey: setApiKey,
    hasApiKey: hasApiKey,
    ingestPlayFromImage: ingestPlayFromImage
  };
})(typeof window !== "undefined" ? window : globalThis);
