/**
 * Generic Youth Football Example Plays (6 Core Plays)
 * Clean, standard diagrams with zero team-specific branding or photos.
 * 1. Sweep Right  2. Sweep Left  3. Off-Tackle Right  4. Off-Tackle Left  5. Inside Right  6. Inside Left
 */
(function (root) {
  "use strict";

  function off(id, letter, color, x, y, job, extra) {
    var o = { id: id, letter: letter, color: color || "#3b82f6", x: x, y: y, role: "BLOCK", job: job || "Block your defender." };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    return o;
  }
  function def(id, letter, x, y, extra) {
    var d = { id: id, letter: letter, x: x, y: y };
    if (extra) Object.keys(extra).forEach(function (k) { d[k] = extra[k]; });
    return d;
  }
  function blk(from, to) { return { from: from, toDefenderId: to }; }
  function rte(from, points, style, color) {
    return { from: from, points: points, style: style || "solid", color: color || "#111111" };
  }

  function genericFront() {
    return [
      def("cb-l", "CB", 120, 280),
      def("de-l", "DE", 260, 340),
      def("dt-l", "DT", 420, 340),
      def("dt-r", "DT", 580, 340),
      def("de-r", "DE", 740, 340),
      def("cb-r", "CB", 880, 280),
      def("lb-l", "LB", 350, 230),
      def("lb-r", "LB", 650, 230)
    ];
  }

  var GENERIC_PLAYS = [
    {
      id: "gen-01",
      name: "Play 1",
      call: "Sweep Right",
      cue: "QB takes the snap and sweeps wide right. Lead back seals the edge.",
      offense: [
        off("lt", "T", "#64748b", 320, 450, "Block the left defensive end."),
        off("lg", "G", "#64748b", 410, 450, "Block the left defensive tackle."),
        off("c", "C", "#eab308", 500, 450, "Snap ball, climb to play-side linebacker.", { role: "SNAP" }),
        off("rg", "G", "#3b82f6", 590, 450, "Block the right defensive tackle."),
        off("rt", "T", "#3b82f6", 680, 450, "Seal the right defensive end inside."),
        off("w", "W", "#3b82f6", 780, 470, "Block corner or outside edge."),
        off("rb-lead", "RB", "#3b82f6", 440, 540, "Lead outside right, clear the alley.", { role: "LEAD" }),
        off("rb-ball", "QB", "#eab308", 500, 590, "Catch snap, sweep right, turn upfield.", { role: "RUN", stroke: "#dc2626" })
      ],
      defense: genericFront(),
      blocks: [blk("lt", "de-l"), blk("lg", "dt-l"), blk("c", "lb-r"), blk("rg", "dt-r"), blk("rt", "de-r"), blk("w", "cb-r")],
      routes: [
        rte("c", [{ x: 500, y: 450 }, { x: 580, y: 350 }, { x: 650, y: 240 }]),
        rte("rb-lead", [{ x: 440, y: 540 }, { x: 640, y: 500 }, { x: 820, y: 380 }]),
        rte("rb-ball", [{ x: 500, y: 590 }, { x: 700, y: 540 }, { x: 860, y: 380 }, { x: 890, y: 100 }], "dashed", "#dc2626")
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 460 }, { x: 500, y: 580 }, { x: 700, y: 540 }, { x: 860, y: 380 }, { x: 890, y: 100 }] }
    },

    {
      id: "gen-02",
      name: "Play 2",
      call: "Sweep Left",
      cue: "QB takes the snap and sweeps wide left. Lead back seals the edge.",
      offense: [
        off("w", "W", "#3b82f6", 220, 470, "Block corner or outside edge."),
        off("lt", "T", "#3b82f6", 320, 450, "Seal the left defensive end inside."),
        off("lg", "G", "#3b82f6", 410, 450, "Block the left defensive tackle."),
        off("c", "C", "#eab308", 500, 450, "Snap ball, climb to play-side linebacker.", { role: "SNAP" }),
        off("rg", "G", "#64748b", 590, 450, "Block the right defensive tackle."),
        off("rt", "T", "#64748b", 680, 450, "Block the right defensive end."),
        off("rb-lead", "RB", "#3b82f6", 560, 540, "Lead outside left, clear the alley.", { role: "LEAD" }),
        off("rb-ball", "QB", "#eab308", 500, 590, "Catch snap, sweep left, turn upfield.", { role: "RUN", stroke: "#dc2626" })
      ],
      defense: genericFront(),
      blocks: [blk("w", "cb-l"), blk("lt", "de-l"), blk("lg", "dt-l"), blk("c", "lb-l"), blk("rg", "dt-r"), blk("rt", "de-r")],
      routes: [
        rte("c", [{ x: 500, y: 450 }, { x: 420, y: 350 }, { x: 350, y: 240 }]),
        rte("rb-lead", [{ x: 560, y: 540 }, { x: 360, y: 500 }, { x: 180, y: 380 }]),
        rte("rb-ball", [{ x: 500, y: 590 }, { x: 300, y: 540 }, { x: 140, y: 380 }, { x: 110, y: 100 }], "dashed", "#dc2626")
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 460 }, { x: 500, y: 580 }, { x: 300, y: 540 }, { x: 140, y: 380 }, { x: 110, y: 100 }] }
    },

    {
      id: "gen-03",
      name: "Play 3",
      call: "Off-Tackle Right",
      cue: "Run right off the tackle's hip. Guard and Tackle open the C-gap.",
      offense: [
        off("lt", "T", "#64748b", 320, 450, "Block the backside DE."),
        off("lg", "G", "#64748b", 410, 450, "Block the backside DT."),
        off("c", "C", "#eab308", 500, 450, "Snap ball, secure play-side DT/LB.", { role: "SNAP" }),
        off("rg", "G", "#3b82f6", 590, 450, "Drive block right DT."),
        off("rt", "T", "#3b82f6", 680, 450, "Kick out right DE to create seam."),
        off("w", "W", "#64748b", 780, 470, "Block outside contain."),
        off("rb-lead", "RB", "#3b82f6", 440, 540, "Lead into C-gap, block LB.", { role: "LEAD" }),
        off("rb-ball", "QB", "#eab308", 500, 590, "Take snap, attack off-tackle seam.", { role: "RUN", stroke: "#dc2626" })
      ],
      defense: genericFront(),
      blocks: [blk("lt", "de-l"), blk("lg", "dt-l"), blk("c", "lb-r"), blk("rg", "dt-r"), blk("rt", "de-r")],
      routes: [
        rte("rb-lead", [{ x: 440, y: 540 }, { x: 620, y: 460 }, { x: 660, y: 280 }]),
        rte("rb-ball", [{ x: 500, y: 590 }, { x: 660, y: 480 }, { x: 710, y: 320 }, { x: 730, y: 100 }], "dashed", "#dc2626")
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 460 }, { x: 500, y: 580 }, { x: 660, y: 480 }, { x: 710, y: 320 }, { x: 730, y: 100 }] }
    },

    {
      id: "gen-04",
      name: "Play 4",
      call: "Off-Tackle Left",
      cue: "Run left off the tackle's hip. Guard and Tackle open the C-gap.",
      offense: [
        off("w", "W", "#64748b", 220, 470, "Block outside contain."),
        off("lt", "T", "#3b82f6", 320, 450, "Kick out left DE to create seam."),
        off("lg", "G", "#3b82f6", 410, 450, "Drive block left DT."),
        off("c", "C", "#eab308", 500, 450, "Snap ball, secure play-side DT/LB.", { role: "SNAP" }),
        off("rg", "G", "#64748b", 590, 450, "Block the backside DT."),
        off("rt", "T", "#64748b", 680, 450, "Block the backside DE."),
        off("rb-lead", "RB", "#3b82f6", 560, 540, "Lead into C-gap, block LB.", { role: "LEAD" }),
        off("rb-ball", "QB", "#eab308", 500, 590, "Take snap, attack off-tackle seam.", { role: "RUN", stroke: "#dc2626" })
      ],
      defense: genericFront(),
      blocks: [blk("lt", "de-l"), blk("lg", "dt-l"), blk("c", "lb-l"), blk("rg", "dt-r"), blk("rt", "de-r")],
      routes: [
        rte("rb-lead", [{ x: 560, y: 540 }, { x: 380, y: 460 }, { x: 340, y: 280 }]),
        rte("rb-ball", [{ x: 500, y: 590 }, { x: 340, y: 480 }, { x: 290, y: 320 }, { x: 270, y: 100 }], "dashed", "#dc2626")
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 460 }, { x: 500, y: 580 }, { x: 340, y: 480 }, { x: 290, y: 320 }, { x: 270, y: 100 }] }
    },

    {
      id: "gen-05",
      name: "Play 5",
      call: "Inside Right",
      cue: "Quick dive right between Center and Right Guard (A-gap).",
      offense: [
        off("lt", "T", "#64748b", 320, 450, "Block backside DE."),
        off("lg", "G", "#64748b", 410, 450, "Block backside DT."),
        off("c", "C", "#eab308", 500, 450, "Snap ball, double right DT.", { role: "SNAP" }),
        off("rg", "G", "#3b82f6", 590, 450, "Drive right DT outside."),
        off("rt", "T", "#64748b", 680, 450, "Block right DE."),
        off("w", "W", "#64748b", 780, 470, "Block outside contain."),
        off("rb-lead", "RB", "#3b82f6", 440, 540, "Lead into A-gap, pick up LB.", { role: "LEAD" }),
        off("rb-ball", "QB", "#eab308", 500, 590, "Hit the A-gap hard and fast.", { role: "RUN", stroke: "#dc2626" })
      ],
      defense: genericFront(),
      blocks: [blk("lt", "de-l"), blk("lg", "dt-l"), blk("c", "dt-r"), blk("rg", "dt-r"), blk("rt", "de-r")],
      routes: [
        rte("rb-lead", [{ x: 440, y: 540 }, { x: 530, y: 440 }, { x: 570, y: 260 }]),
        rte("rb-ball", [{ x: 500, y: 590 }, { x: 540, y: 460 }, { x: 550, y: 300 }, { x: 560, y: 100 }], "dashed", "#dc2626")
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 460 }, { x: 500, y: 580 }, { x: 540, y: 460 }, { x: 550, y: 300 }, { x: 560, y: 100 }] }
    },

    {
      id: "gen-06",
      name: "Play 6",
      call: "Inside Left",
      cue: "Quick dive left between Center and Left Guard (A-gap).",
      offense: [
        off("w", "W", "#64748b", 220, 470, "Block outside contain."),
        off("lt", "T", "#64748b", 320, 450, "Block left DE."),
        off("lg", "G", "#3b82f6", 410, 450, "Drive left DT outside."),
        off("c", "C", "#eab308", 500, 450, "Snap ball, double left DT.", { role: "SNAP" }),
        off("rg", "G", "#64748b", 590, 450, "Block backside DT."),
        off("rt", "T", "#64748b", 680, 450, "Block backside DE."),
        off("rb-lead", "RB", "#3b82f6", 560, 540, "Lead into A-gap, pick up LB.", { role: "LEAD" }),
        off("rb-ball", "QB", "#eab308", 500, 590, "Hit the A-gap hard and fast.", { role: "RUN", stroke: "#dc2626" })
      ],
      defense: genericFront(),
      blocks: [blk("lt", "de-l"), blk("lg", "dt-l"), blk("c", "dt-l"), blk("rg", "dt-r"), blk("rt", "de-r")],
      routes: [
        rte("rb-lead", [{ x: 560, y: 540 }, { x: 470, y: 440 }, { x: 430, y: 260 }]),
        rte("rb-ball", [{ x: 500, y: 590 }, { x: 460, y: 460 }, { x: 450, y: 300 }, { x: 440, y: 100 }], "dashed", "#dc2626")
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 460 }, { x: 500, y: 580 }, { x: 460, y: 460 }, { x: 450, y: 300 }, { x: 440, y: 100 }] }
    }
  ];

  root.GENERIC_EXAMPLE_PLAYS = GENERIC_PLAYS;
})(typeof window !== "undefined" ? window : globalThis);
