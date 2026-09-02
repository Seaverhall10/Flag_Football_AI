/**
 * External coaching-assistant boundary.
 * The public app uses only reviewed, source-controlled teaching content.
 */
(function (root) {
  "use strict";

  var MESSAGE = "External Coach AI is not available in this public demo.";

  async function askCoachAi() { throw new Error(MESSAGE); }
  function openAiCoachModal() { return false; }

  root.AiCoach = {
    askCoachAi: askCoachAi,
    openAiCoachModal: openAiCoachModal,
    isAvailable: function () { return false; },
    unavailableMessage: MESSAGE
  };
})(typeof window !== "undefined" ? window : globalThis);
