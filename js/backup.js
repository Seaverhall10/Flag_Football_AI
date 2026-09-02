/**
 * Team backup: export/import legacy localStorage keys used by Seahawks Coach.
 */
(function () {
  const BACKUP_KEYS = [
    "lions_team_roster_data_v8v8_rb",
    "lions_season_schedule",
    "lions_flag_rep_tracker_data",
    "lions_player_carries",
    "lions_minifield_spots",
    "lions_coach_scratchpad_notes",
    "lions_checklist_state"
  ];

  function exportTeamBackup() {
    const data = {
      team: "Seahawks",
      exportedAt: new Date().toISOString(),
      keys: {}
    };
    BACKUP_KEYS.forEach((k) => {
      const v = localStorage.getItem(k);
      if (v !== null) data.keys[k] = v;
    });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "seahawks-coach-team-backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function importTeamBackup(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(reader.result);
        const keys = data.keys || data;
        BACKUP_KEYS.forEach((k) => {
          if (keys[k] != null) localStorage.setItem(k, typeof keys[k] === "string" ? keys[k] : JSON.stringify(keys[k]));
        });
        alert("Team backup imported. Reload to see roster, schedule, tracker, and carries.");
        location.reload();
      } catch (err) {
        alert("Could not import backup.");
      }
    };
    reader.readAsText(file);
  }

  window.lionsBackup = { exportTeamBackup, importTeamBackup, BACKUP_KEYS };

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-export-backup")?.addEventListener("click", exportTeamBackup);
    document.getElementById("input-import-backup")?.addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      importTeamBackup(f);
    });
  });
})();
