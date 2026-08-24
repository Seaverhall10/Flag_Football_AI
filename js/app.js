/**
 * Cy-Fair K/1 Lions — App Core Utilities
 * Handles navigation, audio cues, and schedule storage.
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Highlight Active Nav Tab based on current page URL
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav a");
  
  navLinks.forEach(link => {
    const href = link.getAttribute("href");
    if (href === currentPath || (currentPath === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });

  // 2. Command Center Play Caller Interaction
  const callDisplay = document.getElementById("call");
  const callSub = document.getElementById("call-sub");
  const playButtons = document.querySelectorAll(".play-btn");

  if (callDisplay && playButtons.length > 0) {
    playButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const callName = btn.getAttribute("data-name");
        const callSymbol = btn.getAttribute("data-symbol");
        const callHole = btn.getAttribute("data-hole");
        const callColor = btn.getAttribute("data-color");

        // Sound cadence
        if (window.sfx) {
          window.sfx.playCadence();
        }

        callDisplay.innerHTML = `<span style="color:${callColor}">${callName}</span>`;
        if (callSub) {
          callSub.textContent = `${callSymbol} · Hole: ${callHole} · Direct Snap`;
        }

        // Highlight active button
        playButtons.forEach(b => b.style.outline = "none");
        btn.style.outline = `4px solid ${callColor || 'var(--gold)'}`;
      });
    });
  }

  // 3. Persistent Checklist Items (Cart & Gear)
  const checkboxes = document.querySelectorAll(".checklist-item input[type='checkbox']");
  if (checkboxes.length > 0) {
    const savedState = JSON.parse(localStorage.getItem("lions_checklist_state") || "{}");
    checkboxes.forEach((cb, idx) => {
      const key = `item_${idx}`;
      if (savedState[key] !== undefined) {
        cb.checked = savedState[key];
      }
      cb.addEventListener("change", () => {
        savedState[key] = cb.checked;
        localStorage.setItem("lions_checklist_state", JSON.stringify(savedState));
      });
    });
  }
});
