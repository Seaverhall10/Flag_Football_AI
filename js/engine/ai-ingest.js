/**
 * External-AI ingestion boundary.
 * Uploads and browser-held API keys are intentionally unavailable in the
 * public demo until a private authenticated workflow passes privacy review.
 */
(function (root) {
  "use strict";

  var MESSAGE = "Play uploads and external-AI ingestion are not available in this public demo.";

  function getApiKey() { return ""; }
  function setApiKey() { return false; }
  function hasApiKey() { return false; }
  async function ingestPlayFromImage() { throw new Error(MESSAGE); }

  root.AiIngest = {
    getApiKey: getApiKey,
    setApiKey: setApiKey,
    hasApiKey: hasApiKey,
    ingestPlayFromImage: ingestPlayFromImage,
    isAvailable: function () { return false; },
    unavailableMessage: MESSAGE
  };
})(typeof window !== "undefined" ? window : globalThis);
