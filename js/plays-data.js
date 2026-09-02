/**
 * Cy-Fair K/1 Lions — 12 coach-sheet plays (Aug 27 binder).
 * Source of truth: photographed pages in /plays (play-01.jpg … play-12.jpg).
 * Tap SHEET to see the original photo. Circles = offense, squares = defense.
 * Defense is 8-man: 2 DT, 2 DE, 2 LB, 2 CB (as drawn on the sheets).
 */
(function (root) {
  "use strict";

  var YEL = "#f5e14a";
  var PUR = "#6d4ecb";
  var BLU = "#2f6fe0";
  var GRY = "#d0d4da";
  var WHT = "#f7f8fa";
  var GOLD = "#e8b423";
  var RED = "#dc2626";

  function off(id, letter, color, x, y, job, extra) {
    var o = { id: id, letter: letter, color: color, x: x, y: y, role: "BLOCK", job: job };
    if (extra) Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    return o;
  }
  function def(id, letter, x, y, extra) {
    var d = { id: id, letter: letter, x: x, y: y };
    if (extra) Object.keys(extra).forEach(function (k) { d[k] = extra[k]; });
    return d;
  }
  function front(opts) {
    opts = opts || {};
    var y = 348;
    return [
      def("cb-l", "CB", opts.cbL != null ? opts.cbL : 78, 300),
      def("de-l", "DE", opts.deL != null ? opts.deL : 220, y),
      def("dt-l", "DT", opts.dtL != null ? opts.dtL : 400, y),
      def("dt-r", "DT", opts.dtR != null ? opts.dtR : 600, y),
      def("de-r", "DE", opts.deR != null ? opts.deR : 780, y),
      def("cb-r", "CB", opts.cbR != null ? opts.cbR : 922, 300),
      def("lb-l", "LB", opts.lbL != null ? opts.lbL : 330, 228),
      def("lb-r", "LB", opts.lbR != null ? opts.lbR : 670, 228)
    ];
  }
  function blk(from, to) { return { from: from, toDefenderId: to }; }
  function rte(from, points, style, color) {
    return { from: from, points: points, style: style || "solid", color: color || "#111111" };
  }

  var PLAYS = [

    {
      id: "play-01", name: "Play 1", call: "Pass Right", photo: "plays/play-01.jpg?v=flip1",
      cue: "Red RB snaps. Pitch/pass right to the Wing. Blue RB dives the B-gap.",
      offense: [
        off("lt", "T", GRY, 328, 452, "Block the left DE."),
        off("lg", "G", GRY, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the left LB.", { role: "SNAP" }),
        off("rg", "G", BLU, 588, 452, "Block the right DT."),
        off("rt", "T", BLU, 672, 452, "Block the right DE."),
        off("w", "W", GRY, 790, 468, "Catch it outside. Run north.", { role: "CATCH" }),
        off("rb-lead", "RB", BLU, 575, 538, "Dive the B-gap (G–T). Head out.", { role: "LEAD" }),
        off("rb-ball", "RB", GOLD, 500, 590, "Snap. Pass/pitch right to the Wing.", { role: "PASS", stroke: RED })
      ],
      defense: front(),
      blocks: [blk("lt","de-l"), blk("lg","dt-l"), blk("c","lb-l"), blk("rg","dt-r"), blk("rt","de-r")],
      routes: [
        rte("w", [{ x: 790, y: 468 }, { x: 860, y: 400 }, { x: 900, y: 250 }]),
        rte("rb-lead", [{ x: 575, y: 538 }, { x: 620, y: 400 }, { x: 640, y: 250 }]),
        rte("rb-ball", [{ x: 500, y: 590 }, { x: 640, y: 530 }, { x: 790, y: 468 }], "dashed", RED)
      ],
      ball: { carrierId: "w", points: [{ x: 500, y: 468 }, { x: 500, y: 575 }, { x: 640, y: 530 }, { x: 790, y: 468 }, { x: 900, y: 250 }] }
    },

    {
      id: "play-02", name: "Play 2", call: "Pass Left", photo: "plays/play-02.jpg?v=flip1",
      cue: "Red RB snaps. Pass/pitch left to the Wing. Blue RB works left.",
      offense: [
        off("w", "W", GRY, 210, 468, "Catch it outside left. Run north.", { role: "CATCH" }),
        off("lt", "T", BLU, 328, 452, "Block the left DE."),
        off("lg", "G", BLU, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the left LB.", { role: "SNAP" }),
        off("rg", "G", GRY, 588, 452, "Block the right DT."),
        off("rt", "T", GRY, 672, 452, "Block the right DE."),
        off("rb-lead", "RB", BLU, 425, 538, "Work left. Head out.", { role: "LEAD" }),
        off("rb-ball", "RB", GOLD, 500, 590, "Snap. Pass/pitch left to the Wing.", { role: "PASS", stroke: RED })
      ],
      defense: front(),
      blocks: [blk("lt","de-l"), blk("lg","dt-l"), blk("c","lb-l"), blk("rg","dt-r"), blk("rt","de-r")],
      routes: [
        rte("w", [{ x: 210, y: 468 }, { x: 140, y: 400 }, { x: 100, y: 250 }]),
        rte("rb-lead", [{ x: 425, y: 538 }, { x: 300, y: 480 }, { x: 180, y: 360 }]),
        rte("rb-ball", [{ x: 500, y: 590 }, { x: 360, y: 530 }, { x: 210, y: 468 }], "dashed", RED)
      ],
      ball: { carrierId: "w", points: [{ x: 500, y: 468 }, { x: 500, y: 575 }, { x: 360, y: 530 }, { x: 210, y: 468 }, { x: 100, y: 250 }] }
    },

    {
      id: "play-03", name: "Play 3", call: "Wingback Left Sweep", photo: "plays/play-03.jpg?v=flip1",
      cue: "Red RB sweeps left. Blue RB and Wing sell right.",
      offense: [
        off("lt", "T", GRY, 328, 452, "Block the left DE."),
        off("lg", "G", GRY, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the left LB.", { role: "SNAP" }),
        off("rg", "G", BLU, 588, 452, "Block the right DT."),
        off("rt", "T", BLU, 672, 452, "Climb to the right LB."),
        off("w", "W", GRY, 772, 468, "Sell right. Eyes up.", { role: "FAKE" }),
        off("rb-ball", "RB", GOLD, 455, 590, "Catch it. Sweep left. North.", { role: "RUN", stroke: RED }),
        off("rb-lead", "RB", BLU, 560, 538, "Sell right. Eyes up.", { role: "FAKE" })
      ],
      defense: front(),
      blocks: [blk("lt","de-l"), blk("lg","dt-l"), blk("c","lb-l"), blk("rg","dt-r"), blk("rt","lb-r")],
      routes: [
        rte("w", [{ x: 772, y: 468 }, { x: 860, y: 420 }, { x: 920, y: 300 }], "dashed"),
        rte("rb-lead", [{ x: 560, y: 538 }, { x: 720, y: 520 }, { x: 880, y: 400 }], "dashed"),
        rte("rb-ball", [{ x: 455, y: 590 }, { x: 280, y: 560 }, { x: 120, y: 420 }, { x: 90, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 455, y: 575 }, { x: 280, y: 560 }, { x: 120, y: 420 }, { x: 90, y: 80 }] }
    },

    {
      id: "play-04", name: "Play 4", call: "Wingback Right Sweep", photo: "plays/play-04.jpg?v=flip1",
      cue: "Red RB sweeps right. Guard and Center pull. Blue RB leads.",
      offense: [
        off("w", "W", GRY, 228, 468, "Block the left DE.", { role: "FAKE" }),
        off("lt", "T", GRY, 328, 452, "Stay square. Head out."),
        off("lg", "G", GRY, 412, 452, "Pull right. Lead the sweep."),
        off("c", "C", YEL, 500, 452, "Snap, then pull right.", { role: "SNAP" }),
        off("rg", "G", BLU, 588, 452, "Block the right DT."),
        off("rt", "T", BLU, 672, 452, "Climb to the right LB."),
        off("rb-lead", "RB", BLU, 500, 538, "Lead right. Point at the DE.", { role: "LEAD" }),
        off("rb-ball", "RB", GOLD, 500, 600, "Catch it. Sweep right. Follow the lead.", { role: "RUN", stroke: RED })
      ],
      defense: front(),
      blocks: [blk("w","de-l"), blk("lg","cb-r"), blk("c","lb-r"), blk("rg","dt-r"), blk("rt","lb-r"), blk("rb-lead","de-r")],
      routes: [
        rte("lg", [{ x: 412, y: 452 }, { x: 520, y: 430 }, { x: 720, y: 360 }]),
        rte("c", [{ x: 500, y: 452 }, { x: 600, y: 420 }, { x: 740, y: 300 }]),
        rte("rb-lead", [{ x: 500, y: 538 }, { x: 680, y: 500 }, { x: 820, y: 360 }]),
        rte("rb-ball", [{ x: 500, y: 600 }, { x: 680, y: 560 }, { x: 860, y: 420 }, { x: 910, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 500, y: 585 }, { x: 680, y: 560 }, { x: 860, y: 420 }, { x: 910, y: 80 }] }
    },

    {
      id: "play-05", name: "Play 5", call: "RB Dive Left", photo: "plays/play-05.jpg?v=flip1",
      cue: "Red RB dives left A-gap (C–LG). Center climbs to the LB.",
      offense: [
        off("lt", "T", GRY, 328, 452, "Block the left DE."),
        off("lg", "G", GRY, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the left LB.", { role: "SNAP" }),
        off("rg", "G", BLU, 588, 452, "Block the right DT."),
        off("rt", "T", BLU, 672, 452, "Climb to the right LB."),
        off("w", "W", GRY, 772, 468, "Block the right DE."),
        off("rb-lead", "RB", BLU, 575, 538, "Dive with him. Same hole.", { role: "LEAD" }),
        off("rb-ball", "RB", GOLD, 430, 590, "Catch it. Dive left A-gap. North.", { role: "RUN", stroke: RED })
      ],
      defense: front(),
      blocks: [blk("lt","de-l"), blk("lg","dt-l"), blk("c","lb-l"), blk("rg","dt-r"), blk("rt","lb-r"), blk("w","de-r")],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 400, y: 360 }, { x: 330, y: 240 }]),
        rte("rb-lead", [{ x: 575, y: 538 }, { x: 500, y: 400 }, { x: 455, y: 250 }]),
        rte("rb-ball", [{ x: 430, y: 590 }, { x: 455, y: 400 }, { x: 455, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 430, y: 575 }, { x: 455, y: 400 }, { x: 455, y: 80 }] }
    },

    {
      id: "play-06", name: "Play 6", call: "RB Dive Right", photo: "plays/play-06.jpg?v=flip1",
      cue: "Red RB dives right A-gap (C–RG). Center climbs to the LB.",
      offense: [
        off("w", "W", GRY, 228, 468, "Block the left DE."),
        off("lt", "T", GRY, 328, 452, "Climb to the left LB."),
        off("lg", "G", BLU, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the right LB.", { role: "SNAP" }),
        off("rg", "G", GRY, 588, 452, "Block the right DT."),
        off("rt", "T", GRY, 672, 452, "Block the right DE."),
        off("rb-lead", "RB", BLU, 425, 538, "Dive with him. Same hole.", { role: "LEAD" }),
        off("rb-ball", "RB", GOLD, 500, 590, "Catch it. Dive right A-gap. North.", { role: "RUN", stroke: RED })
      ],
      defense: front(),
      blocks: [blk("w","de-l"), blk("lt","lb-l"), blk("lg","dt-l"), blk("c","lb-r"), blk("rg","dt-r"), blk("rt","de-r")],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 600, y: 360 }, { x: 670, y: 240 }]),
        rte("rb-lead", [{ x: 425, y: 538 }, { x: 500, y: 400 }, { x: 545, y: 250 }]),
        rte("rb-ball", [{ x: 500, y: 590 }, { x: 545, y: 400 }, { x: 545, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 500, y: 575 }, { x: 545, y: 400 }, { x: 545, y: 80 }] }
    },

    {
      id: "play-07", name: "Play 7", call: "Fake Handoff Left Sweep", photo: "plays/play-07.jpg?v=flip1",
      cue: "Fake left. Red RB sweeps right. Blue RB sells the fake.",
      offense: [
        off("lt", "T", BLU, 328, 452, "Block the left DE."),
        off("lg", "G", BLU, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the left LB.", { role: "SNAP" }),
        off("rg", "G", GRY, 588, 452, "Block the right DT."),
        off("rt", "T", GRY, 672, 452, "Climb to the right LB."),
        off("w", "W", GRY, 772, 468, "Block the right DE."),
        off("rb-lead", "RB", BLU, 430, 538, "Sell the fake left.", { role: "FAKE" }),
        off("rb-ball", "RB", GOLD, 530, 590, "Fake left, sweep right. North.", { role: "RUN", stroke: RED })
      ],
      defense: front(),
      blocks: [blk("lt","de-l"), blk("lg","dt-l"), blk("c","lb-l"), blk("rg","dt-r"), blk("rt","lb-r"), blk("w","de-r")],
      routes: [
        rte("rb-lead", [{ x: 430, y: 538 }, { x: 260, y: 520 }, { x: 120, y: 380 }], "dashed"),
        rte("rb-ball", [{ x: 530, y: 590 }, { x: 700, y: 540 }, { x: 860, y: 400 }, { x: 910, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 530, y: 575 }, { x: 700, y: 540 }, { x: 860, y: 400 }, { x: 910, y: 80 }] }
    },

    {
      id: "play-08", name: "Play 8", call: "Fake Handoff Right Sweep", photo: "plays/play-08.jpg?v=flip1",
      cue: "Fake right. Red RB sweeps left. Blue RB sells the fake.",
      offense: [
        off("w", "W", GRY, 228, 468, "Block the left DE."),
        off("lt", "T", BLU, 328, 452, "Climb to the left LB."),
        off("lg", "G", BLU, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the right LB.", { role: "SNAP" }),
        off("rg", "G", GRY, 588, 452, "Block the right DT."),
        off("rt", "T", GRY, 672, 452, "Block the right DE."),
        off("rb-lead", "RB", BLU, 560, 538, "Sell the fake right.", { role: "FAKE" }),
        off("rb-ball", "RB", GOLD, 470, 590, "Fake right, sweep left. North.", { role: "RUN", stroke: RED })
      ],
      defense: front(),
      blocks: [blk("w","de-l"), blk("lt","lb-l"), blk("lg","dt-l"), blk("c","lb-r"), blk("rg","dt-r"), blk("rt","de-r")],
      routes: [
        rte("rb-lead", [{ x: 560, y: 538 }, { x: 740, y: 520 }, { x: 880, y: 380 }], "dashed"),
        rte("rb-ball", [{ x: 470, y: 590 }, { x: 280, y: 540 }, { x: 120, y: 400 }, { x: 90, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 470, y: 575 }, { x: 280, y: 540 }, { x: 120, y: 400 }, { x: 90, y: 80 }] }
    },

    {
      id: "play-09", name: "Play 9", call: "Handoff Weak Left Sweep", photo: "plays/play-09.jpg?v=flip1",
      cue: "Blue RB takes it and sweeps left. Red RB sells right.",
      offense: [
        off("w", "W", GRY, 228, 468, "Block the left DE."),
        off("lt", "T", BLU, 328, 452, "Climb to the left LB."),
        off("lg", "G", BLU, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the right LB.", { role: "SNAP" }),
        off("rg", "G", GRY, 588, 452, "Block the right DT."),
        off("rt", "T", GRY, 672, 452, "Block the right DE."),
        off("rb-ball", "RB", BLU, 430, 538, "Take the handoff. Sweep left. North.", { role: "RUN" }),
        off("rb-lead", "RB", GOLD, 500, 590, "Sell right. Eyes up.", { role: "FAKE", stroke: RED })
      ],
      defense: front(),
      blocks: [blk("w","de-l"), blk("lt","lb-l"), blk("lg","dt-l"), blk("c","lb-r"), blk("rg","dt-r"), blk("rt","de-r")],
      routes: [
        rte("rb-lead", [{ x: 500, y: 590 }, { x: 680, y: 540 }, { x: 860, y: 400 }], "dashed", RED),
        rte("rb-ball", [{ x: 430, y: 538 }, { x: 240, y: 500 }, { x: 110, y: 360 }, { x: 90, y: 80 }], "dashed")
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 430, y: 530 }, { x: 240, y: 500 }, { x: 110, y: 360 }, { x: 90, y: 80 }] }
    },

    {
      id: "play-10", name: "Play 10", call: "Handoff Weak Right Sweep", photo: "plays/play-10.jpg?v=flip1",
      cue: "Blue RB takes it and sweeps right. Red RB sells left.",
      offense: [
        off("lt", "T", BLU, 328, 452, "Block the left DE."),
        off("lg", "G", BLU, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the left LB.", { role: "SNAP" }),
        off("rg", "G", GRY, 588, 452, "Block the right DT."),
        off("rt", "T", GRY, 672, 452, "Climb to the right LB."),
        off("w", "W", GRY, 772, 468, "Block the right DE."),
        off("rb-ball", "RB", BLU, 430, 538, "Take the handoff. Sweep right. North.", { role: "RUN" }),
        off("rb-lead", "RB", GOLD, 500, 590, "Sell left. Eyes up.", { role: "FAKE", stroke: RED })
      ],
      defense: front(),
      blocks: [blk("lt","de-l"), blk("lg","dt-l"), blk("c","lb-l"), blk("rg","dt-r"), blk("rt","lb-r"), blk("w","de-r")],
      routes: [
        rte("rb-lead", [{ x: 500, y: 590 }, { x: 320, y: 540 }, { x: 140, y: 400 }], "dashed", RED),
        rte("rb-ball", [{ x: 430, y: 538 }, { x: 620, y: 520 }, { x: 820, y: 380 }, { x: 910, y: 80 }], "dashed")
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 430, y: 530 }, { x: 620, y: 520 }, { x: 820, y: 380 }, { x: 910, y: 80 }] }
    },

    {
      id: "play-11", name: "Play 11", call: "RB Left Sweep", photo: "plays/play-11.jpg?v=flip1",
      cue: "Red RB sweeps left. Center climbs to the LB. Blue RB leads.",
      offense: [
        off("lt", "T", BLU, 328, 452, "Block the left DE."),
        off("lg", "G", BLU, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the left LB.", { role: "SNAP" }),
        off("rg", "G", GRY, 588, 452, "Block the right DT."),
        off("rt", "T", GRY, 672, 452, "Climb to the right LB."),
        off("w", "W", GRY, 772, 468, "Block the right DE."),
        off("rb-lead", "RB", BLU, 560, 538, "Lead left. Head out.", { role: "LEAD" }),
        off("rb-ball", "RB", GOLD, 455, 590, "Catch it. Sweep left. North.", { role: "RUN", stroke: RED })
      ],
      defense: front(),
      blocks: [blk("lt","de-l"), blk("lg","dt-l"), blk("c","lb-l"), blk("rg","dt-r"), blk("rt","lb-r"), blk("w","de-r")],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 400, y: 340 }, { x: 330, y: 240 }]),
        rte("rb-lead", [{ x: 560, y: 538 }, { x: 400, y: 500 }, { x: 200, y: 360 }]),
        rte("rb-ball", [{ x: 455, y: 590 }, { x: 260, y: 540 }, { x: 110, y: 380 }, { x: 90, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 455, y: 575 }, { x: 260, y: 540 }, { x: 110, y: 380 }, { x: 90, y: 80 }] }
    },

    {
      id: "play-12", name: "Play 12", call: "RB Right Sweep", photo: "plays/play-12.jpg?v=flip1",
      cue: "Red RB sweeps right. Wing and Tackle seal the edge.",
      offense: [
        off("w", "W", GRY, 228, 468, "Block the left DE."),
        off("lt", "T", BLU, 328, 452, "Climb to the left LB."),
        off("lg", "G", BLU, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the right LB.", { role: "SNAP" }),
        off("rg", "G", GRY, 588, 452, "Block the right DT."),
        off("rt", "T", GRY, 672, 452, "Block the right DE."),
        off("rb-lead", "RB", BLU, 430, 538, "Lead right. Head out.", { role: "LEAD" }),
        off("rb-ball", "RB", GOLD, 530, 590, "Catch it. Sweep right. North.", { role: "RUN", stroke: RED })
      ],
      defense: front(),
      blocks: [blk("w","de-l"), blk("lt","lb-l"), blk("lg","dt-l"), blk("c","lb-r"), blk("rg","dt-r"), blk("rt","de-r")],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 600, y: 340 }, { x: 670, y: 240 }]),
        rte("rb-lead", [{ x: 430, y: 538 }, { x: 620, y: 500 }, { x: 800, y: 360 }]),
        rte("rb-ball", [{ x: 530, y: 590 }, { x: 720, y: 540 }, { x: 880, y: 380 }, { x: 910, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 530, y: 575 }, { x: 720, y: 540 }, { x: 880, y: 380 }, { x: 910, y: 80 }] }
    },

    {
      id: "play-13", name: "Play 13", call: "Wide Sweep Right", photo: "plays/play-13.jpg?v=flip1",
      cue: "Split backs. Red RB takes the snap and wide sweeps right. Blue RB leads outside.",
      offense: [
        off("w", "W", GRY, 228, 468, "Block the left DE."),
        off("lt", "T", BLU, 328, 452, "Climb to the left LB."),
        off("lg", "G", BLU, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the right LB.", { role: "SNAP" }),
        off("rg", "G", GRY, 588, 452, "Block the right DT."),
        off("rt", "T", GRY, 672, 452, "Block the right DE."),
        off("rb-lead", "RB", BLU, 420, 538, "Lead wide right. Head out.", { role: "LEAD" }),
        off("rb-ball", "RB", GOLD, 540, 590, "Catch it. Wide sweep right. North.", { role: "RUN", stroke: RED })
      ],
      defense: front(),
      blocks: [blk("w","de-l"), blk("lt","lb-l"), blk("lg","dt-l"), blk("c","lb-r"), blk("rg","dt-r"), blk("rt","de-r")],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 600, y: 340 }, { x: 670, y: 240 }]),
        rte("rb-lead", [{ x: 420, y: 538 }, { x: 640, y: 500 }, { x: 840, y: 360 }]),
        rte("rb-ball", [{ x: 540, y: 590 }, { x: 740, y: 540 }, { x: 910, y: 380 }, { x: 930, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 540, y: 575 }, { x: 740, y: 540 }, { x: 910, y: 380 }, { x: 930, y: 80 }] }
    },

    {
      id: "play-14", name: "Play 14", call: "Wide Sweep Left", photo: "plays/play-14.jpg?v=flip1",
      cue: "Split backs. Red RB takes the snap and wide sweeps left. Blue RB leads outside.",
      offense: [
        off("lt", "T", BLU, 328, 452, "Block the left DE."),
        off("lg", "G", BLU, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the left LB.", { role: "SNAP" }),
        off("rg", "G", GRY, 588, 452, "Block the right DT."),
        off("rt", "T", GRY, 672, 452, "Climb to the right LB."),
        off("w", "W", GRY, 772, 468, "Block the right DE."),
        off("rb-lead", "RB", BLU, 580, 538, "Lead wide left. Head out.", { role: "LEAD" }),
        off("rb-ball", "RB", GOLD, 460, 590, "Catch it. Wide sweep left. North.", { role: "RUN", stroke: RED })
      ],
      defense: front(),
      blocks: [blk("lt","de-l"), blk("lg","dt-l"), blk("c","lb-l"), blk("rg","dt-r"), blk("rt","lb-r"), blk("w","de-r")],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 400, y: 340 }, { x: 330, y: 240 }]),
        rte("rb-lead", [{ x: 580, y: 538 }, { x: 380, y: 500 }, { x: 160, y: 360 }]),
        rte("rb-ball", [{ x: 460, y: 590 }, { x: 240, y: 540 }, { x: 90, y: 380 }, { x: 70, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 460, y: 575 }, { x: 240, y: 540 }, { x: 90, y: 380 }, { x: 70, y: 80 }] }
    }
  ];

  root.LIONS_PLAYS = PLAYS;
  root.LIONS_PLAY_MAP = {};
  PLAYS.forEach(function (p) { root.LIONS_PLAY_MAP[p.id] = p; });
})(typeof window !== "undefined" ? window : globalThis);
