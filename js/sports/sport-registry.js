/**
 * Universal Sports Registry & Schema Definitions
 * Supports: Flag Football (8v8 & 5v5), Soccer (4v4 & 7v7), Basketball (3v3 & 5v5), Baseball/T-Ball, Custom.
 */
(function (root) {
  "use strict";

  var SPORTS = {
    "flag-football-8v8": {
      id: "flag-football-8v8",
      name: "Flag Football (8v8)",
      category: "football",
      defaultPlayers: { offense: 8, defense: 8 },
      periods: { type: "quarters", count: 4, label: "Quarter" },
      field: {
        width: 1000,
        height: 900,
        type: "football-field",
        losY: 400,
        background: "#246b38",
        lineColor: "rgba(255,255,255,0.4)"
      },
      positions: {
        offense: [
          { letter: "C", name: "Center", defaultColor: "#f5e14a", shape: "circle" },
          { letter: "G", name: "Guard", defaultColor: "#6d4ecb", shape: "circle" },
          { letter: "T", name: "Tackle", defaultColor: "#2f6fe0", shape: "circle" },
          { letter: "W", name: "Wing", defaultColor: "#d0d4da", shape: "circle" },
          { letter: "RB", name: "Running Back", defaultColor: "#e8b423", shape: "circle" }
        ],
        defense: [
          { letter: "DT", name: "Defensive Tackle", defaultColor: "#ffffff", shape: "square" },
          { letter: "DE", name: "Defensive End", defaultColor: "#ffffff", shape: "square" },
          { letter: "LB", name: "Linebacker", defaultColor: "#ffffff", shape: "square" },
          { letter: "CB", name: "Cornerback", defaultColor: "#ffffff", shape: "square" }
        ]
      },
      cues: [
        { name: "LINE UP", text: "Find your circle. Two-point stance. Eyes up." },
        { name: "SNAP", text: "Center snaps. Ball to the ballcarrier. See it. Catch it. Tuck it." },
        { name: "FIRST STEP", text: "First step on your arrow. Head out. Hands inside." },
        { name: "FIT", text: "Arrive under control. Open hands inside. No holding." },
        { name: "LANE", text: "Lane is open. Blockers are set. Hit the hole." },
        { name: "CUT", text: "Plant and make one cut north." },
        { name: "FINISH", text: "Run north. Flag only — head out, stay on your feet." }
      ]
    },

    "flag-football-5v5": {
      id: "flag-football-5v5",
      name: "Flag Football (5v5 NFL Flag)",
      category: "football",
      defaultPlayers: { offense: 5, defense: 5 },
      periods: { type: "halves", count: 2, label: "Half" },
      field: {
        width: 1000,
        height: 800,
        type: "football-field",
        losY: 400,
        background: "#246b38",
        lineColor: "rgba(255,255,255,0.4)"
      },
      positions: {
        offense: [
          { letter: "C", name: "Center", defaultColor: "#f5e14a", shape: "circle" },
          { letter: "QB", name: "Quarterback", defaultColor: "#e8b423", shape: "circle" },
          { letter: "RB", name: "Running Back", defaultColor: "#2f6fe0", shape: "circle" },
          { letter: "WR", name: "Wide Receiver (L)", defaultColor: "#6d4ecb", shape: "circle" },
          { letter: "WR", name: "Wide Receiver (R)", defaultColor: "#6d4ecb", shape: "circle" }
        ],
        defense: [
          { letter: "R", name: "Rusher (7yd)", defaultColor: "#ffffff", shape: "square" },
          { letter: "LB", name: "Linebacker", defaultColor: "#ffffff", shape: "square" },
          { letter: "CB", name: "Corner (L)", defaultColor: "#ffffff", shape: "square" },
          { letter: "CB", name: "Corner (R)", defaultColor: "#ffffff", shape: "square" },
          { letter: "S", name: "Safety", defaultColor: "#ffffff", shape: "square" }
        ]
      },
      cues: [
        { name: "SET", text: "Eyes up. Know your route or pass rush rule." },
        { name: "SNAP", text: "Snap to QB. Rusher counts/rushes from 7 yards." },
        { name: "STEM", text: "Run routes with speed. Look for open green grass." },
        { name: "THROW", text: "QB delivers on time. High point the catch." },
        { name: "YAC", text: "Catch, tuck, and turn upfield. Swerve flags." }
      ]
    },

    "soccer-7v7": {
      id: "soccer-7v7",
      name: "Soccer (7v7 U9/U10)",
      category: "soccer",
      defaultPlayers: { offense: 7, defense: 7 },
      periods: { type: "halves", count: 2, label: "Half" },
      field: {
        width: 1000,
        height: 750,
        type: "soccer-pitch",
        background: "#1e6f3b",
        lineColor: "rgba(255,255,255,0.6)"
      },
      positions: {
        offense: [
          { letter: "GK", name: "Goalkeeper", defaultColor: "#f59e0b", shape: "circle" },
          { letter: "CB", name: "Center Back", defaultColor: "#2563eb", shape: "circle" },
          { letter: "LB", name: "Left Back", defaultColor: "#2563eb", shape: "circle" },
          { letter: "RB", name: "Right Back", defaultColor: "#2563eb", shape: "circle" },
          { letter: "CM", name: "Center Mid", defaultColor: "#10b981", shape: "circle" },
          { letter: "LW", name: "Left Wing", defaultColor: "#8b5cf6", shape: "circle" },
          { letter: "ST", name: "Striker", defaultColor: "#ef4444", shape: "circle" }
        ],
        defense: [
          { letter: "GK", name: "Goalkeeper", defaultColor: "#f59e0b", shape: "square" },
          { letter: "D", name: "Defender", defaultColor: "#ffffff", shape: "square" },
          { letter: "M", name: "Midfielder", defaultColor: "#ffffff", shape: "square" },
          { letter: "F", name: "Forward", defaultColor: "#ffffff", shape: "square" }
        ]
      },
      cues: [
        { name: "SHAPE", text: "Spread out! Make the pitch big." },
        { name: "PASS", text: "Pass to feet or into space with good pace." },
        { name: "SUPPORT", text: "Move off the ball to give a passing triangle." },
        { name: "FINISH", text: "Head up, place the shot low and into the corner." }
      ]
    },

    "soccer-4v4": {
      id: "soccer-4v4",
      name: "Soccer (4v4 U6/U8)",
      category: "soccer",
      defaultPlayers: { offense: 4, defense: 4 },
      periods: { type: "quarters", count: 4, label: "Quarter" },
      field: {
        width: 900,
        height: 650,
        type: "soccer-pitch",
        background: "#1e6f3b",
        lineColor: "rgba(255,255,255,0.6)"
      },
      positions: {
        offense: [
          { letter: "B", name: "Back", defaultColor: "#2563eb", shape: "circle" },
          { letter: "LW", name: "Left Wing", defaultColor: "#10b981", shape: "circle" },
          { letter: "RW", name: "Right Wing", defaultColor: "#10b981", shape: "circle" },
          { letter: "F", name: "Forward", defaultColor: "#ef4444", shape: "circle" }
        ],
        defense: [
          { letter: "D", name: "Defender", defaultColor: "#ffffff", shape: "square" },
          { letter: "W", name: "Wing Defender", defaultColor: "#ffffff", shape: "square" },
          { letter: "F", name: "Pressing Forward", defaultColor: "#ffffff", shape: "square" }
        ]
      },
      cues: [
        { name: "DIAMOND", text: "Make the diamond shape!" },
        { name: "DRIBBLE", text: "Keep the ball close with soft touches." },
        { name: "PASS", text: "Look up before kicking." },
        { name: "SCORE", text: "Kick toward the goal." }
      ]
    },

    "basketball-5v5": {
      id: "basketball-5v5",
      name: "Basketball (5v5)",
      category: "basketball",
      defaultPlayers: { offense: 5, defense: 5 },
      periods: { type: "quarters", count: 4, label: "Quarter" },
      field: {
        width: 1000,
        height: 700,
        type: "basketball-court",
        background: "#c2884d",
        lineColor: "rgba(255,255,255,0.8)"
      },
      positions: {
        offense: [
          { letter: "PG", name: "Point Guard (1)", defaultColor: "#e8b423", shape: "circle" },
          { letter: "SG", name: "Shooting Guard (2)", defaultColor: "#3b82f6", shape: "circle" },
          { letter: "SF", name: "Small Forward (3)", defaultColor: "#8b5cf6", shape: "circle" },
          { letter: "PF", name: "Power Forward (4)", defaultColor: "#10b981", shape: "circle" },
          { letter: "C", name: "Center (5)", defaultColor: "#ef4444", shape: "circle" }
        ],
        defense: [
          { letter: "D1", name: "Guard Def", defaultColor: "#ffffff", shape: "square" },
          { letter: "D2", name: "Wing Def", defaultColor: "#ffffff", shape: "square" },
          { letter: "D3", name: "Wing Def", defaultColor: "#ffffff", shape: "square" },
          { letter: "D4", name: "Post Def", defaultColor: "#ffffff", shape: "square" },
          { letter: "D5", name: "Center Def", defaultColor: "#ffffff", shape: "square" }
        ]
      },
      cues: [
        { name: "SPACING", text: "Stay spaced around the 3-point arc." },
        { name: "SCREEN", text: "Set a solid screen, hold your ground." },
        { name: "CUT", text: "Cut hard to the basket with hands ready." },
        { name: "PASS", text: "Hit the open teammate. Chest or bounce pass." },
        { name: "SHOT", text: "Square up, follow through high." }
      ]
    },

    "baseball-youth": {
      id: "baseball-youth",
      name: "Baseball / T-Ball",
      category: "baseball",
      defaultPlayers: { offense: 9, defense: 9 },
      periods: { type: "innings", count: 6, label: "Inning" },
      field: {
        width: 900,
        height: 800,
        type: "baseball-diamond",
        background: "#246b38",
        lineColor: "rgba(255,255,255,0.7)"
      },
      positions: {
        offense: [
          { letter: "BAT", name: "Batter / Runner", defaultColor: "#ef4444", shape: "circle" },
          { letter: "R1", name: "Runner (1st)", defaultColor: "#3b82f6", shape: "circle" },
          { letter: "R2", name: "Runner (2nd)", defaultColor: "#3b82f6", shape: "circle" },
          { letter: "R3", name: "Runner (3rd)", defaultColor: "#3b82f6", shape: "circle" }
        ],
        defense: [
          { letter: "P", name: "Pitcher", defaultColor: "#ffffff", shape: "square" },
          { letter: "C", name: "Catcher", defaultColor: "#ffffff", shape: "square" },
          { letter: "1B", name: "First Base", defaultColor: "#ffffff", shape: "square" },
          { letter: "2B", name: "Second Base", defaultColor: "#ffffff", shape: "square" },
          { letter: "3B", name: "Third Base", defaultColor: "#ffffff", shape: "square" },
          { letter: "SS", name: "Shortstop", defaultColor: "#ffffff", shape: "square" },
          { letter: "LF", name: "Left Field", defaultColor: "#ffffff", shape: "square" },
          { letter: "CF", name: "Center Field", defaultColor: "#ffffff", shape: "square" },
          { letter: "RF", name: "Right Field", defaultColor: "#ffffff", shape: "square" }
        ]
      },
      cues: [
        { name: "READY", text: "Ready stance on balls of your feet." },
        { name: "FIELD", text: "Get in front of the ground ball, two hands." },
        { name: "THROW", text: "Step toward target, make a clean throw." },
        { name: "RUN", text: "Run hard through first base!" }
      ]
    },

    "custom-sport": {
      id: "custom-sport",
      name: "Custom / Freeform Board",
      category: "custom",
      defaultPlayers: { offense: 5, defense: 5 },
      periods: { type: "periods", count: 4, label: "Period" },
      field: {
        width: 1000,
        height: 800,
        type: "generic-canvas",
        background: "#1e293b",
        lineColor: "rgba(255,255,255,0.3)"
      },
      positions: {
        offense: [
          { letter: "O1", name: "Offense 1", defaultColor: "#3b82f6", shape: "circle" },
          { letter: "O2", name: "Offense 2", defaultColor: "#3b82f6", shape: "circle" },
          { letter: "O3", name: "Offense 3", defaultColor: "#3b82f6", shape: "circle" },
          { letter: "O4", name: "Offense 4", defaultColor: "#3b82f6", shape: "circle" },
          { letter: "O5", name: "Offense 5", defaultColor: "#3b82f6", shape: "circle" }
        ],
        defense: [
          { letter: "D1", name: "Defense 1", defaultColor: "#ffffff", shape: "square" },
          { letter: "D2", name: "Defense 2", defaultColor: "#ffffff", shape: "square" },
          { letter: "D3", name: "Defense 3", defaultColor: "#ffffff", shape: "square" },
          { letter: "D4", name: "Defense 4", defaultColor: "#ffffff", shape: "square" },
          { letter: "D5", name: "Defense 5", defaultColor: "#ffffff", shape: "square" }
        ]
      },
      cues: [
        { name: "STEP 1", text: "Starting positions." },
        { name: "STEP 2", text: "Movement phase." },
        { name: "STEP 3", text: "Execution phase." },
        { name: "STEP 4", text: "Finish." }
      ]
    }
  };

  root.SPORTS_REGISTRY = SPORTS;
  root.getSportPreset = function (sportId) {
    return SPORTS[sportId] || SPORTS["flag-football-8v8"];
  };
})(typeof window !== "undefined" ? window : globalThis);
