/**
 * Compact GIF89a writer for the Lions play sim. 3-3-2 palette, 256 colors.
 */
(function (root) {
  "use strict";

  function palette332() {
    var pal = new Uint8Array(768);
    for (var i = 0; i < 256; i++) {
      pal[i * 3] = ((i >> 5) & 7) * 36;
      pal[i * 3 + 1] = ((i >> 2) & 7) * 36;
      pal[i * 3 + 2] = (i & 3) * 85;
    }
    return pal;
  }

  function index332(rgba) {
    var n = (rgba.length / 4) | 0;
    var out = new Uint8Array(n);
    for (var i = 0; i < n; i++) {
      var o = i * 4;
      out[i] = (rgba[o] & 0xE0) | ((rgba[o + 1] & 0xE0) >> 3) | (rgba[o + 2] >> 6);
    }
    return out;
  }

  function lzwEncode(minCodeSize, pixels) {
    var clear = 1 << minCodeSize;
    var eoi = clear + 1;
    var codeSize = minCodeSize + 1;
    var nextCode = eoi + 1;
    var dict = Object.create(null);
    var i;
    for (i = 0; i < clear; i++) dict[String(i)] = i;

    var bitBuf = 0;
    var bitN = 0;
    var out = [];
    var block = [];

    function pushByte(b) {
      block.push(b & 255);
      if (block.length === 255) {
        out.push(255);
        for (var j = 0; j < 255; j++) out.push(block[j]);
        block.length = 0;
      }
    }

    function writeCode(code) {
      bitBuf |= code << bitN;
      bitN += codeSize;
      while (bitN >= 8) {
        pushByte(bitBuf);
        bitBuf >>= 8;
        bitN -= 8;
      }
    }

    function reset() {
      dict = Object.create(null);
      for (var k = 0; k < clear; k++) dict[String(k)] = k;
      codeSize = minCodeSize + 1;
      nextCode = eoi + 1;
    }

    writeCode(clear);
    var w = String(pixels[0]);
    for (i = 1; i < pixels.length; i++) {
      var k = pixels[i];
      var nw = w + "," + k;
      if (dict[nw] !== undefined) {
        w = nw;
      } else {
        writeCode(dict[w]);
        if (nextCode < 4096) {
          dict[nw] = nextCode;
          if (nextCode === (1 << codeSize) && codeSize < 12) codeSize += 1;
          nextCode += 1;
        } else {
          writeCode(clear);
          reset();
        }
        w = String(k);
      }
    }
    writeCode(dict[w]);
    writeCode(eoi);
    if (bitN > 0) pushByte(bitBuf);
    if (block.length) {
      out.push(block.length);
      for (i = 0; i < block.length; i++) out.push(block[i]);
    }
    out.push(0);
    return out;
  }

  function u16(n) { return [n & 255, (n >> 8) & 255]; }

  function encodeGif(frames, width, height, delayCs) {
    var pal = palette332();
    var bytes = [71, 73, 70, 56, 57, 97];
    bytes.push.apply(bytes, u16(width));
    bytes.push.apply(bytes, u16(height));
    bytes.push(0xF7, 0, 0);
    for (var i = 0; i < 768; i++) bytes.push(pal[i]);
    bytes.push(0x21, 0xFF, 0x0B);
    var ns = "NETSCAPE2.0";
    for (i = 0; i < ns.length; i++) bytes.push(ns.charCodeAt(i));
    bytes.push(0x03, 0x01, 0x00, 0x00, 0x00);
    delayCs = delayCs == null ? 8 : delayCs;
    for (var f = 0; f < frames.length; f++) {
      var idx = frames[f];
      if (!(idx instanceof Uint8Array)) idx = index332(idx);
      bytes.push(0x21, 0xF9, 0x04, 0x04);
      bytes.push.apply(bytes, u16(delayCs));
      bytes.push(0x00, 0x00);
      bytes.push(0x2C, 0x00, 0x00, 0x00, 0x00);
      bytes.push.apply(bytes, u16(width));
      bytes.push.apply(bytes, u16(height));
      bytes.push(0x00, 0x08);
      var lzw = lzwEncode(8, idx);
      for (i = 0; i < lzw.length; i++) bytes.push(lzw[i]);
    }
    bytes.push(0x3B);
    return new Uint8Array(bytes);
  }

  function svgFrame(svg, width, height) {
    return new Promise(function (resolve, reject) {
      var clone = svg.cloneNode(true);
      clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      clone.setAttribute("width", String(width));
      clone.setAttribute("height", String(height));
      var xml = new XMLSerializer().serializeToString(clone);
      if (xml.indexOf("xmlns") === -1) {
        xml = xml.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      var img = new Image();
      img.onload = function () {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.fillStyle = "#0b3522";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(index332(ctx.getImageData(0, 0, width, height).data));
      };
      img.onerror = function () { reject(new Error("Could not draw the play field")); };
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
    });
  }

  function downloadBytes(bytes, filename) {
    var blob = new Blob([bytes], { type: "image/gif" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  root.LIONS_GIF = {
    encodeGif: encodeGif,
    index332: index332,
    svgFrame: svgFrame,
    downloadBytes: downloadBytes
  };
})(typeof window !== "undefined" ? window : globalThis);
