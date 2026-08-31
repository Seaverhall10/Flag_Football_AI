/**
 * Universal Drill Engine & Multi-Sport Practice Simulator
 * Supports: Flag Football 5v4 blocking/contain drill, Soccer 3v2 build-up, Basketball 2v1 break, and Custom Drills.
 */
(function (root) {
  "use strict";

  var DRILL_PRESETS = {
    "flag-football-8v8": [
      {
        id: "flag-half-team",
        name: "5-on-4 Half-Team Blocking & Contain",
        sportId: "flag-football-8v8",
        description: "Five-player half offense versus four-player half defense for blocking jobs, lanes, shedding, and pursuit.",
        offensePositions: ["C", "G", "T", "RUN", "LEAD"],
        defensePositions: ["DL", "LB", "CB", "FLEX"],
        variants: {
          lane: ["inside", "outside"],
          side: ["left", "right"],
          front: ["two-dl", "two-lb"]
        },
        beats: [
          { name: "LINE UP", cue: "Two-point stance. Eyes up. Point to your job." },
          { name: "SNAP", cue: "Center snaps. Clean angle. First step on your mark." },
          { name: "FIRST STEP", cue: "Lead takes the path. Linemen fire out with head out." },
          { name: "FIT", cue: "Open hands inside legal frame. Controlled feet." },
          { name: "LANE", cue: "Lane opens up. Runner hits the seam." },
          { name: "SHED / FLAG", cue: "Defender separates and pursues flag. Blocker stays square." },
          { name: "FINISH", cue: "Whistle blows. Balanced stop. Flag pull." }
        ]
      }
    ],

    "soccer-7v7": [
      {
        id: "soccer-3v2-buildup",
        name: "3v2 Build-Up & Defensive Pressure",
        sportId: "soccer-7v7",
        description: "Three attackers work to create passing triangles against two pressing defenders.",
        offensePositions: ["CB", "CM", "ST"],
        defensePositions: ["D1", "D2"],
        beats: [
          { name: "SHAPE", cue: "Make the pitch wide! Form a passing triangle." },
          { name: "FIRST PASS", cue: "Firm pass to feet. Defender steps to press." },
          { name: "SUPPORT", cue: "Supporting player moves into open passing lane." },
          { name: "THROUGH BALL", cue: "Slip pass into space for the striker." },
          { name: "FINISH", cue: "First touch out of feet, low shot into the corner." }
        ]
      }
    ],

    "basketball-5v5": [
      {
        id: "bball-2v1-fastbreak",
        name: "2-on-1 Fast Break & Help Defense",
        sportId: "basketball-5v5",
        description: "Two offensive players execute a fast break against one retreating rim protector.",
        offensePositions: ["PG", "SG"],
        defensePositions: ["D1"],
        beats: [
          { name: "OUTLET", cue: "Push the ball with speed up the court." },
          { name: "COMMIT DEFENDER", cue: "Ball handler attacks the paint until defender commits." },
          { name: "DISH OR FINISH", cue: "Pass to open cutter or take the layup." },
          { name: "REBOUND", cue: "Follow the shot for put-back." }
        ]
      }
    ]
  };

  function getDrillsForSport(sportId) {
    return DRILL_PRESETS[sportId] || DRILL_PRESETS["flag-football-8v8"];
  }

  root.DrillEngine = {
    DRILL_PRESETS: DRILL_PRESETS,
    getDrillsForSport: getDrillsForSport
  };
})(typeof window !== "undefined" ? window : globalThis);
