/**
 * Cy-Fair K/1 Lions — 14 coach-sheet plays.
 * Source of truth: photographed binder pages in /plays (play-01.jpg … play-14.jpg).
 * Labels match the sheet: C, G, T, W, RB, DT, DE, LB, CB. Circles = offense, squares = defense.
 */
(function (root) {
  "use strict";

  var YEL = "#f5e14a";
  var PUR = "#6d4ecb";
  var BLU = "#2f6fe0";
  var GRY = "#d0d4da";
  var WHT = "#f7f8fa";
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
    var deL = opts.deL != null ? opts.deL : 225;
    var deR = opts.deR != null ? opts.deR : 775;
    var dtL = opts.dtL != null ? opts.dtL : 410;
    var dtR = opts.dtR != null ? opts.dtR : 590;
    var y = 348;
    return [
      def("cb-l", "CB", opts.cbL != null ? opts.cbL : 78, 300, opts.cbLSlide ? { slide: opts.cbLSlide } : null),
      def("de-l", "DE", deL, y),
      def("dt-l", "DT", dtL, y),
      def("dt-r", "DT", dtR, y),
      def("de-r", "DE", deR, y),
      def("cb-r", "CB", opts.cbR != null ? opts.cbR : 922, 300, opts.cbRSlide ? { slide: opts.cbRSlide } : null),
      def("lb-l", "LB", opts.lbL != null ? opts.lbL : 330, 228),
      def("lb-r", "LB", opts.lbR != null ? opts.lbR : 670, 228)
    ];
  }
  function blk(from, to) { return { from: from, toDefenderId: to }; }
  function rte(from, points, style, color) {
    return { from: from, points: points, style: style || "solid", color: color || "#111111" };
  }

  var PLAYS = [

    /* 1. Off-Tackle Right — W left; purple RB leads to DE-R; red RB through RG–RT. */
    {
      id: "play-01",
      name: "Play 1",
      call: "Off-Tackle Right",
      photo: "plays/play-01.jpg",
      cue: "Snap to the deep RB. Follow the lead through the right tackle gap. Head out. Hands inside.",
      offense: [
        off("w", "W", GRY, 228, 452, "Block the left DE. Head out. Hands inside."),
        off("lt", "T", WHT, 328, 452, "Climb to the left LB. Eyes up. Two-point."),
        off("lg", "G", WHT, 412, 452, "Block the left DT. Hands inside."),
        off("c", "C", YEL, 500, 452, "Snap, then curve left through the A-gap. Head out.", { role: "SNAP" }),
        off("rg", "G", PUR, 588, 452, "Block the right DT. Stay square."),
        off("rt", "T", PUR, 672, 452, "Climb to the right LB. Head out."),
        off("rb-lead", "RB", PUR, 430, 538, "Lead around the right tackle. Point at the right DE.", { role: "LEAD" }),
        off("rb-ball", "RB", WHT, 575, 602, "Catch the snap. Hit the RG–RT gap. One cut. North.", { role: "RUN", stroke: RED })
      ],
      defense: front({ deL: 175, deR: 760, lbL: 300, lbR: 640 }),
      blocks: [
        blk("w", "de-l"), blk("lt", "lb-l"), blk("lg", "dt-l"),
        blk("rg", "dt-r"), blk("rt", "lb-r"), blk("rb-lead", "de-r")
      ],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 455, y: 390 }, { x: 390, y: 250 }]),
        rte("rb-lead", [{ x: 430, y: 538 }, { x: 620, y: 500 }, { x: 740, y: 400 }, { x: 770, y: 330 }]),
        rte("rb-ball", [{ x: 575, y: 602 }, { x: 620, y: 500 }, { x: 655, y: 400 }, { x: 670, y: 250 }, { x: 680, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 575, y: 590 }, { x: 620, y: 500 }, { x: 655, y: 400 }, { x: 670, y: 250 }, { x: 680, y: 80 }] }
    },

    /* 2. Off-Tackle Left — W right; purple RB leads left; red RB through LT–DE. */
    {
      id: "play-02",
      name: "Play 2",
      call: "Off-Tackle Left",
      photo: "plays/play-02.jpg",
      cue: "Deep RB takes the snap and follows the lead through the left tackle gap.",
      offense: [
        off("lt", "T", GRY, 328, 452, "Climb to the left LB. Head out."),
        off("lg", "G", GRY, 412, 452, "Block the left DT. Hands inside."),
        off("c", "C", YEL, 500, 452, "Snap, then curve left. Head out.", { role: "SNAP" }),
        off("rg", "G", PUR, 588, 452, "Block the right DT. Stay home."),
        off("rt", "T", PUR, 672, 452, "Climb to the right LB."),
        off("w", "W", GRY, 772, 468, "Block the right DE. Hands inside."),
        off("rb-lead", "RB", PUR, 575, 530, "Lead left. Point at the left DE.", { role: "LEAD" }),
        off("rb-ball", "RB", WHT, 455, 605, "Catch it. Off-tackle left. One cut. North.", { role: "RUN", stroke: RED })
      ],
      defense: front({ deL: 250, deR: 790, lbL: 290, lbR: 680 }),
      blocks: [
        blk("lt", "lb-l"), blk("lg", "dt-l"), blk("rg", "dt-r"),
        blk("rt", "lb-r"), blk("w", "de-r"), blk("rb-lead", "de-l")
      ],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 450, y: 385 }, { x: 360, y: 250 }]),
        rte("rb-lead", [{ x: 575, y: 530 }, { x: 430, y: 500 }, { x: 280, y: 400 }, { x: 240, y: 330 }]),
        rte("rb-ball", [{ x: 455, y: 605 }, { x: 370, y: 500 }, { x: 300, y: 400 }, { x: 270, y: 240 }, { x: 250, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 455, y: 590 }, { x: 370, y: 500 }, { x: 300, y: 400 }, { x: 270, y: 240 }, { x: 250, y: 80 }] }
    },

    /* 3. Sweep Right, fake left to W. */
    {
      id: "play-03",
      name: "Play 3",
      call: "Sweep Right",
      photo: "plays/play-03.jpg",
      cue: "Snap to the middle RB. Fake left to the Wing. Sweep right behind the lead RB.",
      offense: [
        off("lt", "T", GRY, 328, 452, "Block the left DE. Head out."),
        off("lg", "G", GRY, 412, 452, "Block the left DT. Hands inside."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the left LB.", { role: "SNAP" }),
        off("rg", "G", PUR, 588, 452, "Block the right DT."),
        off("rt", "T", PUR, 672, 452, "Climb to the right LB."),
        off("w", "W", GRY, 355, 545, "Sell the fake left. Eyes up.", { role: "FAKE" }),
        off("rb-ball", "RB", WHT, 500, 575, "Catch it. Sweep right. Follow the lead.", { role: "RUN", stroke: RED }),
        off("rb-lead", "RB", PUR, 595, 538, "Lead the right DE. Head out.", { role: "LEAD" })
      ],
      defense: front(),
      blocks: [
        blk("lt", "de-l"), blk("lg", "dt-l"), blk("c", "lb-l"),
        blk("rg", "dt-r"), blk("rt", "lb-r"), blk("rb-lead", "de-r")
      ],
      routes: [
        rte("w", [{ x: 355, y: 545 }, { x: 250, y: 560 }, { x: 130, y: 480 }, { x: 90, y: 300 }], "dashed", "#111111"),
        rte("rb-lead", [{ x: 595, y: 538 }, { x: 700, y: 430 }, { x: 775, y: 340 }]),
        rte("rb-ball", [{ x: 500, y: 575 }, { x: 620, y: 590 }, { x: 760, y: 520 }, { x: 860, y: 360 }, { x: 880, y: 90 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 500, y: 560 }, { x: 620, y: 590 }, { x: 760, y: 520 }, { x: 860, y: 360 }, { x: 880, y: 90 }], icons: [{ x: 500, y: 530 }, { x: 700, y: 555 }] }
    },

    /* 4. Sweep Left, fake right. */
    {
      id: "play-04",
      name: "Play 4",
      call: "Sweep Left",
      photo: "plays/play-04.jpg",
      cue: "Snap to the middle RB. Fake right. Sweep left behind the Wing.",
      offense: [
        off("lt", "T", WHT, 328, 452, "Block the left DE. Head out."),
        off("lg", "G", WHT, 412, 452, "Block the left DT. Hands inside."),
        off("c", "C", YEL, 500, 452, "Snap, then climb left. Head out.", { role: "SNAP" }),
        off("rg", "G", BLU, 588, 452, "Block the right DT."),
        off("rt", "T", BLU, 672, 452, "Climb to the right LB."),
        off("w", "W", GRY, 360, 545, "Stay home, then open the left edge.", { role: "LEAD" }),
        off("rb-ball", "RB", WHT, 500, 575, "Catch it. Sweep left. One cut. North.", { role: "RUN", stroke: RED }),
        off("rb-fake", "RB", BLU, 595, 538, "Sell the fake right, then the right DE.", { role: "FAKE" })
      ],
      defense: front(),
      blocks: [
        blk("lt", "de-l"), blk("lg", "dt-l"), blk("c", "lb-l"),
        blk("rg", "dt-r"), blk("rt", "lb-r"), blk("rb-fake", "de-r")
      ],
      routes: [
        rte("rb-fake", [{ x: 595, y: 538 }, { x: 720, y: 560 }, { x: 860, y: 470 }, { x: 900, y: 300 }], "dashed", "#111111"),
        rte("w", [{ x: 360, y: 545 }, { x: 250, y: 430 }, { x: 180, y: 300 }]),
        rte("rb-ball", [{ x: 500, y: 575 }, { x: 360, y: 590 }, { x: 200, y: 500 }, { x: 110, y: 340 }, { x: 90, y: 90 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 500, y: 560 }, { x: 360, y: 590 }, { x: 200, y: 500 }, { x: 110, y: 340 }, { x: 90, y: 90 }], icons: [{ x: 500, y: 530 }] }
    },

    /* 5. Wing pass / rollout right. Football icons on the dashed path to W. */
    {
      id: "play-05",
      name: "Play 5",
      call: "Wing Pass Right",
      photo: "plays/play-05.jpg",
      cue: "Snap to the middle RB. Roll right. Throw to the Wing on the deep right.",
      offense: [
        off("lt", "T", GRY, 328, 452, "Block the left DE. Head out."),
        off("lg", "G", GRY, 412, 452, "Block the left DT. Hands inside."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the left LB.", { role: "SNAP" }),
        off("rg", "G", PUR, 588, 452, "Block the right DT."),
        off("rt", "T", PUR, 672, 452, "Block the right DE. Protect the roll."),
        off("w", "W", GRY, 810, 460, "Take one step back, then go deep right. Eyes up.", { role: "CATCH" }),
        off("rb-ball", "RB", WHT, 500, 575, "Catch the snap. Roll right. Throw to the Wing.", { role: "PASS", stroke: RED }),
        off("rb-lead", "RB", PUR, 595, 545, "Protect the roll. Point at the right DE.", { role: "LEAD" })
      ],
      defense: front({ deR: 800, cbR: 940 }),
      blocks: [
        blk("lt", "de-l"), blk("lg", "dt-l"), blk("c", "lb-l"),
        blk("rg", "dt-r"), blk("rt", "de-r"), blk("rb-lead", "de-r")
      ],
      routes: [
        rte("w", [{ x: 810, y: 460 }, { x: 760, y: 540 }, { x: 820, y: 380 }, { x: 880, y: 180 }, { x: 910, y: 70 }], "dashed", "#111111"),
        rte("rb-ball", [{ x: 500, y: 575 }, { x: 560, y: 530 }, { x: 680, y: 510 }, { x: 760, y: 490 }], "dashed", RED),
        rte("rb-lead", [{ x: 595, y: 545 }, { x: 700, y: 430 }, { x: 790, y: 340 }])
      ],
      ball: {
        carrierId: "w",
        points: [{ x: 500, y: 468 }, { x: 500, y: 560 }, { x: 650, y: 510 }, { x: 780, y: 420 }, { x: 880, y: 180 }, { x: 910, y: 70 }],
        icons: [{ x: 500, y: 530 }, { x: 700, y: 500 }, { x: 880, y: 160 }]
      }
    },

    /* 6. Reverse left — pitch to W sweeping left. */
    {
      id: "play-06",
      name: "Play 6",
      call: "Reverse Left",
      photo: "plays/play-06.jpg",
      cue: "Snap to the middle RB. Pitch to the Wing. Wing sweeps the left edge.",
      offense: [
        off("w", "W", GRY, 210, 470, "Come back for the pitch, then sweep left.", { role: "RUN" }),
        off("lt", "T", GRY, 328, 452, "Climb to the left LB. Head out."),
        off("lg", "G", GRY, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the right LB.", { role: "SNAP" }),
        off("rg", "G", PUR, 588, 452, "Block the right DT."),
        off("rt", "T", PUR, 672, 452, "Block the right DE."),
        off("rb-lead", "RB", PUR, 360, 545, "Lead the left DE. Head out.", { role: "LEAD" }),
        off("rb-ball", "RB", WHT, 500, 575, "Catch it. Pitch left to the Wing.", { role: "PITCH", stroke: RED })
      ],
      defense: front({ deL: 175, lbL: 310, lbR: 620 }),
      blocks: [
        blk("lt", "lb-l"), blk("lg", "dt-l"), blk("c", "lb-r"),
        blk("rg", "dt-r"), blk("rt", "de-r"), blk("rb-lead", "de-l")
      ],
      routes: [
        rte("w", [{ x: 210, y: 470 }, { x: 300, y: 560 }, { x: 250, y: 600 }, { x: 120, y: 480 }, { x: 70, y: 280 }, { x: 60, y: 80 }], "dashed", "#111111"),
        rte("rb-lead", [{ x: 360, y: 545 }, { x: 260, y: 430 }, { x: 200, y: 340 }]),
        rte("rb-ball", [{ x: 500, y: 575 }, { x: 430, y: 560 }])
      ],
      ball: {
        carrierId: "w",
        points: [{ x: 500, y: 468 }, { x: 500, y: 560 }, { x: 360, y: 575 }, { x: 250, y: 600 }, { x: 120, y: 480 }, { x: 70, y: 280 }, { x: 60, y: 80 }],
        icons: [{ x: 500, y: 530 }, { x: 360, y: 575 }, { x: 140, y: 450 }]
      }
    },

    /* 7. A-Gap Right — W right; red RB through C–RG; blue RB leads. Right CB slides in. */
    {
      id: "play-07",
      name: "Play 7",
      call: "A-Gap Right",
      photo: "plays/play-07.jpg",
      cue: "Red RB through the C–RG gap. Blue RB leads. Line stays square.",
      offense: [
        off("lt", "T", GRY, 328, 452, "Block the left DE. Head out."),
        off("lg", "G", GRY, 412, 452, "Block the left DT. Hands inside."),
        off("c", "C", YEL, 500, 452, "Snap, then curve to the left LB.", { role: "SNAP" }),
        off("rg", "G", PUR, 588, 452, "Block the right DT. Own that jersey."),
        off("rt", "T", PUR, 672, 452, "Climb to the right LB."),
        off("w", "W", GRY, 772, 468, "Block the right DE. Hands inside."),
        off("rb-ball", "RB", WHT, 430, 575, "Catch it. Hit the A-gap right. North.", { role: "RUN", stroke: RED }),
        off("rb-lead", "RB", BLU, 588, 545, "Lead straight up inside the right guard.", { role: "LEAD" })
      ],
      defense: front({
        deR: 800,
        cbRSlide: [{ x: 922, y: 300 }, { x: 760, y: 250 }, { x: 640, y: 230 }]
      }),
      blocks: [
        blk("lt", "de-l"), blk("lg", "dt-l"), blk("c", "lb-l"),
        blk("rg", "dt-r"), blk("rt", "lb-r"), blk("w", "de-r")
      ],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 455, y: 380 }, { x: 350, y: 230 }]),
        rte("rb-lead", [{ x: 588, y: 545 }, { x: 588, y: 400 }, { x: 600, y: 280 }]),
        rte("rb-ball", [{ x: 430, y: 575 }, { x: 500, y: 500 }, { x: 545, y: 400 }, { x: 555, y: 240 }, { x: 560, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 430, y: 560 }, { x: 500, y: 500 }, { x: 545, y: 400 }, { x: 555, y: 240 }, { x: 560, y: 80 }] }
    },

    /* 8. A-Gap Left — W left (play side purple); red RB through C–LG. Left CB slides. */
    {
      id: "play-08",
      name: "Play 8",
      call: "A-Gap Left",
      photo: "plays/play-08.jpg",
      cue: "Red RB through the C–LG gap. Purple RB leads the left alley.",
      offense: [
        off("w", "W", GRY, 228, 452, "Block the left DE. Head out."),
        off("lt", "T", PUR, 328, 452, "Climb to the left LB."),
        off("lg", "G", PUR, 412, 452, "Block the left DT. Hands inside."),
        off("c", "C", YEL, 500, 452, "Snap, then curve to the right LB.", { role: "SNAP" }),
        off("rg", "G", WHT, 588, 452, "Block the right DT. Stay home."),
        off("rt", "T", WHT, 672, 452, "Block the right DE."),
        off("rb-lead", "RB", PUR, 412, 538, "Lead through the left B-gap.", { role: "LEAD" }),
        off("rb-ball", "RB", WHT, 530, 590, "Catch it. A-gap left. One cut. North.", { role: "RUN", stroke: RED })
      ],
      defense: front({
        deL: 175,
        cbLSlide: [{ x: 78, y: 300 }, { x: 220, y: 250 }, { x: 330, y: 230 }]
      }),
      blocks: [
        blk("w", "de-l"), blk("lt", "lb-l"), blk("lg", "dt-l"),
        blk("rg", "dt-r"), blk("rt", "de-r"), blk("rb-lead", "de-l")
      ],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 545, y: 380 }, { x: 650, y: 230 }]),
        rte("rb-lead", [{ x: 412, y: 538 }, { x: 370, y: 400 }, { x: 350, y: 250 }]),
        rte("rb-ball", [{ x: 530, y: 590 }, { x: 480, y: 500 }, { x: 455, y: 400 }, { x: 440, y: 240 }, { x: 430, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 530, y: 575 }, { x: 480, y: 500 }, { x: 455, y: 400 }, { x: 440, y: 240 }, { x: 430, y: 80 }] }
    },

    /* 9. Toss Right — I-backs; purple RB leads to CB; red RB sweeps outside W. */
    {
      id: "play-09",
      name: "Play 9",
      call: "Toss Right",
      photo: "plays/play-09.jpg",
      cue: "Deep RB sweeps right. Purple RB leads to the corner. Wing seals the DE.",
      offense: [
        off("lt", "T", GRY, 328, 452, "Climb to the left LB. Head out."),
        off("lg", "G", GRY, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then curve right to the second level.", { role: "SNAP" }),
        off("rg", "G", PUR, 588, 452, "Block the right DT."),
        off("rt", "T", PUR, 672, 452, "Climb to the right LB."),
        off("w", "W", GRY, 772, 468, "Block the right DE. Seal the edge."),
        off("rb-lead", "RB", PUR, 500, 530, "Lead wide right. Point at the right CB.", { role: "LEAD" }),
        off("rb-ball", "RB", WHT, 500, 610, "Catch it. Sweep outside the Wing. North.", { role: "RUN", stroke: RED })
      ],
      defense: front({ deR: 800, lbL: 300, lbR: 700 }),
      blocks: [
        blk("lt", "lb-l"), blk("lg", "dt-l"), blk("rg", "dt-r"),
        blk("rt", "lb-r"), blk("w", "de-r"), blk("rb-lead", "cb-r")
      ],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 560, y: 385 }, { x: 640, y: 250 }]),
        rte("rb-lead", [{ x: 500, y: 530 }, { x: 680, y: 520 }, { x: 820, y: 400 }, { x: 900, y: 280 }]),
        rte("rb-ball", [{ x: 500, y: 610 }, { x: 700, y: 580 }, { x: 860, y: 450 }, { x: 910, y: 260 }, { x: 920, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 500, y: 595 }, { x: 700, y: 580 }, { x: 860, y: 450 }, { x: 910, y: 260 }, { x: 920, y: 80 }] }
    },

    /* 10. Toss Left — W left; blue RB leads to CB; red RB sweeps left. */
    {
      id: "play-10",
      name: "Play 10",
      call: "Toss Left",
      photo: "plays/play-10.jpg",
      cue: "Red RB sweeps left. Blue RB leads to the corner. Wing seals the DE.",
      offense: [
        off("w", "W", GRY, 228, 460, "Block the left DE. Seal the edge."),
        off("lt", "T", WHT, 328, 452, "Climb to the left LB."),
        off("lg", "G", WHT, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then curve to the right LB.", { role: "SNAP" }),
        off("rg", "G", BLU, 588, 452, "Block the right DT."),
        off("rt", "T", BLU, 672, 452, "Block the right DE."),
        off("rb-lead", "RB", BLU, 430, 545, "Lead wide left. Point at the left CB.", { role: "LEAD" }),
        off("rb-ball", "RB", WHT, 545, 610, "Catch it. Sweep left. Follow the lead.", { role: "RUN", stroke: RED })
      ],
      defense: front({ deL: 175, lbL: 300, lbR: 560 }),
      blocks: [
        blk("w", "de-l"), blk("lt", "lb-l"), blk("lg", "dt-l"),
        blk("c", "lb-r"), blk("rg", "dt-r"), blk("rt", "de-r"), blk("rb-lead", "cb-l")
      ],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 560, y: 370 }, { x: 640, y: 230 }]),
        rte("rb-lead", [{ x: 430, y: 545 }, { x: 260, y: 500 }, { x: 130, y: 380 }, { x: 80, y: 260 }]),
        rte("rb-ball", [{ x: 545, y: 610 }, { x: 360, y: 590 }, { x: 160, y: 470 }, { x: 80, y: 280 }, { x: 70, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 545, y: 595 }, { x: 360, y: 590 }, { x: 160, y: 470 }, { x: 80, y: 280 }, { x: 70, y: 80 }] }
    },

    /* 11. Boot Right — W crack/lead; purple RB crosses to CB; red RB keeps right. */
    {
      id: "play-11",
      name: "Play 11",
      call: "Boot Right",
      photo: "plays/play-11.jpg",
      cue: "Snap to the middle RB. Keep right. Wing and backside RB lead the edge.",
      offense: [
        off("lt", "T", GRY, 328, 452, "Block the left DE. Head out."),
        off("lg", "G", GRY, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then curve to the left LB.", { role: "SNAP" }),
        off("rg", "G", PUR, 588, 452, "Block the right DT."),
        off("rt", "T", PUR, 672, 452, "Climb to the right LB."),
        off("w", "W", GRY, 760, 530, "Lead the right DE. Get outside.", { role: "LEAD" }),
        off("rb-lead", "RB", PUR, 340, 575, "Cross right. Lead the right CB.", { role: "LEAD" }),
        off("rb-ball", "RB", WHT, 500, 575, "Catch it. Keep right. Follow the Wing.", { role: "RUN", stroke: RED })
      ],
      defense: front({ deR: 790 }),
      blocks: [
        blk("lt", "de-l"), blk("lg", "dt-l"), blk("c", "lb-l"),
        blk("rg", "dt-r"), blk("rt", "lb-r"), blk("w", "de-r"), blk("rb-lead", "cb-r")
      ],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 440, y: 380 }, { x: 340, y: 230 }]),
        rte("rt", [{ x: 672, y: 452 }, { x: 700, y: 360 }, { x: 720, y: 240 }]),
        rte("w", [{ x: 760, y: 530 }, { x: 820, y: 400 }, { x: 850, y: 300 }]),
        rte("rb-lead", [{ x: 340, y: 575 }, { x: 560, y: 540 }, { x: 780, y: 400 }, { x: 900, y: 260 }]),
        rte("rb-ball", [{ x: 500, y: 575 }, { x: 640, y: 540 }, { x: 780, y: 430 }, { x: 860, y: 260 }, { x: 880, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 500, y: 560 }, { x: 640, y: 540 }, { x: 780, y: 430 }, { x: 860, y: 260 }, { x: 880, y: 80 }] }
    },

    /* 12. Sweep Left — W leads left; purple RB crosses; red RB sweeps left. */
    {
      id: "play-12",
      name: "Play 12",
      call: "Sweep Left",
      photo: "plays/play-12.jpg",
      cue: "Red RB sweeps left behind the Wing. Purple RB crosses as the lead.",
      offense: [
        off("lt", "T", GRY, 328, 452, "Block the left DE. Head out."),
        off("lg", "G", GRY, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then climb to the right LB.", { role: "SNAP" }),
        off("rg", "G", PUR, 588, 452, "Block the right DT."),
        off("rt", "T", PUR, 672, 452, "Block the right DE."),
        off("w", "W", GRY, 330, 545, "Lead left. Point at the left CB.", { role: "LEAD" }),
        off("rb-lead", "RB", PUR, 590, 555, "Cross left. Lead the edge.", { role: "LEAD" }),
        off("rb-ball", "RB", WHT, 500, 585, "Catch it. Sweep left. Follow the Wing.", { role: "RUN", stroke: RED })
      ],
      defense: front(),
      blocks: [
        blk("lt", "de-l"), blk("lg", "dt-l"), blk("c", "lb-r"),
        blk("rg", "dt-r"), blk("rt", "de-r"), blk("w", "cb-l")
      ],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 560, y: 370 }, { x: 660, y: 230 }]),
        rte("w", [{ x: 330, y: 545 }, { x: 200, y: 430 }, { x: 110, y: 280 }]),
        rte("rb-lead", [{ x: 590, y: 555 }, { x: 400, y: 540 }, { x: 220, y: 400 }, { x: 130, y: 240 }]),
        rte("rb-ball", [{ x: 500, y: 585 }, { x: 330, y: 580 }, { x: 160, y: 470 }, { x: 80, y: 280 }, { x: 70, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 500, y: 570 }, { x: 330, y: 580 }, { x: 160, y: 470 }, { x: 80, y: 280 }, { x: 70, y: 80 }], icons: [{ x: 70, y: 90 }] }
    },

    /* 13. Wide Sweep Right — split backs; blue RB leads to CB; red RB wider. */
    {
      id: "play-13",
      name: "Play 13",
      call: "Wide Sweep Right",
      photo: "plays/play-13.jpg",
      cue: "Red RB sweeps wide right. Blue RB leads to the corner. Wing seals the DE.",
      offense: [
        off("lt", "T", GRY, 328, 452, "Block the left DE. Head out."),
        off("lg", "G", GRY, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then curve to the left LB.", { role: "SNAP" }),
        off("rg", "G", BLU, 588, 452, "Block the right DT."),
        off("rt", "T", BLU, 672, 452, "Climb to the right LB."),
        off("w", "W", GRY, 772, 468, "Block the right DE. Seal the edge."),
        off("rb-ball", "RB", WHT, 455, 575, "Catch it. Sweep wide right. Outside everyone.", { role: "RUN", stroke: RED }),
        off("rb-lead", "RB", BLU, 545, 575, "Lead right. Point at the right CB.", { role: "LEAD" })
      ],
      defense: front({ deR: 800 }),
      blocks: [
        blk("lt", "de-l"), blk("lg", "dt-l"), blk("c", "lb-l"),
        blk("rg", "dt-r"), blk("rt", "lb-r"), blk("w", "de-r"), blk("rb-lead", "cb-r")
      ],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 440, y: 380 }, { x: 340, y: 230 }]),
        rte("rb-lead", [{ x: 545, y: 575 }, { x: 720, y: 540 }, { x: 860, y: 400 }, { x: 920, y: 260 }]),
        rte("rb-ball", [{ x: 455, y: 575 }, { x: 620, y: 620 }, { x: 820, y: 560 }, { x: 930, y: 380 }, { x: 950, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 455, y: 560 }, { x: 620, y: 620 }, { x: 820, y: 560 }, { x: 930, y: 380 }, { x: 950, y: 80 }] }
    },

    /* 14. Wide Sweep Left — W left; blue RB leads to CB; red RB sweeps left. */
    {
      id: "play-14",
      name: "Play 14",
      call: "Wide Sweep Left",
      photo: "plays/play-14.jpg",
      cue: "Red RB sweeps left. Blue RB leads to the corner. Wing seals the DE.",
      offense: [
        off("w", "W", GRY, 228, 460, "Block the left DE. Seal the edge."),
        off("lt", "T", GRY, 328, 452, "Climb to the left LB."),
        off("lg", "G", GRY, 412, 452, "Block the left DT."),
        off("c", "C", YEL, 500, 452, "Snap, then curve to the right LB.", { role: "SNAP" }),
        off("rg", "G", BLU, 588, 452, "Block the right DT."),
        off("rt", "T", BLU, 672, 452, "Block the right DE."),
        off("rb-lead", "RB", BLU, 380, 555, "Lead wide left. Point at the left CB.", { role: "LEAD" }),
        off("rb-ball", "RB", WHT, 470, 585, "Catch it. Sweep left outside the Wing.", { role: "RUN", stroke: RED })
      ],
      defense: front({ deL: 175, lbL: 300, lbR: 560 }),
      blocks: [
        blk("w", "de-l"), blk("lt", "lb-l"), blk("lg", "dt-l"),
        blk("c", "lb-r"), blk("rg", "dt-r"), blk("rt", "de-r"), blk("rb-lead", "cb-l")
      ],
      routes: [
        rte("c", [{ x: 500, y: 452 }, { x: 560, y: 370 }, { x: 650, y: 230 }]),
        rte("rb-lead", [{ x: 380, y: 555 }, { x: 230, y: 500 }, { x: 110, y: 360 }, { x: 70, y: 240 }]),
        rte("rb-ball", [{ x: 470, y: 585 }, { x: 280, y: 590 }, { x: 130, y: 470 }, { x: 60, y: 280 }, { x: 50, y: 80 }], "dashed", RED)
      ],
      ball: { carrierId: "rb-ball", points: [{ x: 500, y: 468 }, { x: 470, y: 570 }, { x: 280, y: 590 }, { x: 130, y: 470 }, { x: 60, y: 280 }, { x: 50, y: 80 }] }
    }
  ];

  root.LIONS_PLAYS = PLAYS;
  root.LIONS_PLAY_MAP = {};
  PLAYS.forEach(function (p) { root.LIONS_PLAY_MAP[p.id] = p; });
})(typeof window !== "undefined" ? window : globalThis);
