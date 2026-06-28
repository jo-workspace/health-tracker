/**
 * 身體疼痛與長期健康追蹤器
 * scripts.js — 離線優先儲存模組 + 主控邏輯
 */

// =====================================================================
// 1. 儲存模組 (storage)
// =====================================================================

const KEY_PAIN_LOGS    = "pain_tracker_pain_logs";
const KEY_LT_LOGS      = "pain_tracker_long_term_logs";
const KEY_SPLINT_LOGS  = "pain_tracker_bite_splint_logs";
const KEY_TMY_LOGS     = "pain_tracker_tmy_symptoms_logs";
const KEY_SLEEP_LOGS   = "pain_tracker_sleep_logs";
const KEY_DIET_LOGS    = "pain_tracker_rainbow_diet_logs";
const KEY_CUSTOM_PLANT_COLORS = "pain_tracker_custom_plant_colors";
const KEY_SYNC_URL     = "pain_tracker_sync_url";
const KEY_LAST_SYNCED  = "pain_tracker_last_synced";
const KEY_API_TOKEN    = "pain_tracker_api_token";
const KEY_GEMINI_KEY   = "pain_tracker_gemini_key";

// 💡 取得本地日期字串 (YYYY-MM-DD)，防範 UTC 時區轉換導致早上 8 點前顯示為前一天的 Bug
function getLocalDateString(dateObj = new Date()) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getGeminiKey() {
  return localStorage.getItem(KEY_GEMINI_KEY) || "";
}

function saveGeminiKey(key) {
  localStorage.setItem(KEY_GEMINI_KEY, key.trim());
}

function generateUUID() {
  return 'uuid-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
}

function getSleepLogs() {
  const data = localStorage.getItem(KEY_SLEEP_LOGS);
  return data ? JSON.parse(data) : [];
}

function saveSleepLogsLocal(logs) {
  localStorage.setItem(KEY_SLEEP_LOGS, JSON.stringify(logs));
}

function saveSleepLog(log) {
  const logs = getSleepLogs();
  log.lastUpdated = Date.now();
  
  if (!log.id) {
    log.id = generateUUID();
    logs.push(log);
  } else {
    const idx = logs.findIndex(l => l.id === log.id);
    if (idx !== -1) {
      logs[idx] = { ...logs[idx], ...log };
    } else {
      logs.push(log);
    }
  }
  saveSleepLogsLocal(logs);
  return log;
}

function getRainbowDietLogs() {
  const data = localStorage.getItem(KEY_DIET_LOGS);
  return data ? JSON.parse(data) : [];
}

function saveRainbowDietLogsLocal(logs) {
  localStorage.setItem(KEY_DIET_LOGS, JSON.stringify(logs));
}

function saveRainbowDietLog(log) {
  const logs = getRainbowDietLogs();
  log.lastUpdated = Date.now();
  
  if (!log.id) {
    log.id = generateUUID();
    logs.push(log);
  } else {
    const idx = logs.findIndex(l => l.id === log.id);
    if (idx !== -1) {
      logs[idx] = { ...logs[idx], ...log };
    } else {
      logs.push(log);
    }
  }
  saveRainbowDietLogsLocal(logs);
  return log;
}

function getCustomPlantColors() {
  const data = localStorage.getItem(KEY_CUSTOM_PLANT_COLORS);
  return data ? JSON.parse(data) : {};
}

function saveCustomPlantColor(plant, color) {
  const custom = getCustomPlantColors();
  custom[plant] = color;
  localStorage.setItem(KEY_CUSTOM_PLANT_COLORS, JSON.stringify(custom));
}

function getPainLogs() {
  const data = localStorage.getItem(KEY_PAIN_LOGS);
  return data ? JSON.parse(data) : [];
}

function savePainLogsLocal(logs) {
  localStorage.setItem(KEY_PAIN_LOGS, JSON.stringify(logs));
}
function getTmySymptomsLogs() {
  const data = localStorage.getItem("pain_tracker_tmy_symptoms_logs");
  return data ? JSON.parse(data) : [];
}

function saveTmySymptomsLogsLocal(logs) {
  localStorage.setItem("pain_tracker_tmy_symptoms_logs", JSON.stringify(logs));
}

function saveTmySymptomsLog(log) {
  const logs = getTmySymptomsLogs();
  log.lastUpdated = Date.now();
  
  const existingIdx = logs.findIndex(l => l.date === log.date);
  if (existingIdx !== -1) {
    logs[existingIdx] = { ...logs[existingIdx], ...log, id: logs[existingIdx].id };
  } else {
    if (!log.id) {
      log.id = generateUUID();
    }
    logs.push(log);
  }
  saveTmySymptomsLogsLocal(logs);
  return log;
}
function savePainLog(log) {
  const logs = getPainLogs();
  log.lastUpdated = Date.now();
  
  if (!log.id) {
    log.id = generateUUID();
    logs.push(log);
  } else {
    const idx = logs.findIndex(l => l.id === log.id);
    if (idx !== -1) {
      logs[idx] = { ...logs[idx], ...log };
    } else {
      logs.push(log);
    }
  }
  
  savePainLogsLocal(logs);
  return log;
}

function getLongTermLogs() {
  const data = localStorage.getItem(KEY_LT_LOGS);
  return data ? JSON.parse(data) : [];
}

function saveLongTermLogsLocal(logs) {
  localStorage.setItem(KEY_LT_LOGS, JSON.stringify(logs));
}
function getBiteSplintLogs() {
  const data = localStorage.getItem("pain_tracker_bite_splint_logs");
  return data ? JSON.parse(data) : [];
}

function saveBiteSplintLogsLocal(logs) {
  localStorage.setItem("pain_tracker_bite_splint_logs", JSON.stringify(logs));
}

function saveBiteSplintLog(log) {
  const logs = getBiteSplintLogs();
  log.lastUpdated = Date.now();
  
  const existingIdx = logs.findIndex(l => l.date === log.date);
  if (existingIdx !== -1) {
    logs[existingIdx] = { ...logs[existingIdx], ...log, id: logs[existingIdx].id };
  } else {
    if (!log.id) {
      log.id = generateUUID();
    }
    logs.push(log);
  }
  saveBiteSplintLogsLocal(logs);
  return log;
}
function saveLongTermLog(log) {
  const logs = getLongTermLogs();
  log.lastUpdated = Date.now();
  
  if (!log.id) {
    log.id = generateUUID();
    logs.push(log);
  } else {
    const idx = logs.findIndex(l => l.id === log.id);
    if (idx !== -1) {
      logs[idx] = { ...logs[idx], ...log };
    } else {
      logs.push(log);
    }
  }
  
  saveLongTermLogsLocal(logs);
  return log;
}

function getSyncUrl() {
  return localStorage.getItem(KEY_SYNC_URL) || "";
}

function saveSyncUrl(url) {
  localStorage.setItem(KEY_SYNC_URL, url.trim());
}

function getLastSynced() {
  const t = localStorage.getItem(KEY_LAST_SYNCED);
  return t ? Number(t) : null;
}

function clearLocalData() {
  localStorage.removeItem(KEY_PAIN_LOGS);
  localStorage.removeItem(KEY_LT_LOGS);
  localStorage.removeItem(KEY_LAST_SYNCED);
  localStorage.removeItem(KEY_SLEEP_LOGS);
  localStorage.removeItem(KEY_DIET_LOGS);
  localStorage.removeItem(KEY_CUSTOM_PLANT_COLORS);
  localStorage.removeItem(KEY_GEMINI_KEY);
}

function getApiToken() {
  return localStorage.getItem(KEY_API_TOKEN) || "";
}

function saveApiToken(token) {
  localStorage.setItem(KEY_API_TOKEN, token.trim());
}

// 與雲端雙向同步 (支援原生 GAS 環境與 Standalone REST 環境)
async function syncWithCloud() {
  const localPainLogs   = getPainLogs();
  const localLtLogs     = getLongTermLogs();
  const localSplintLogs = getBiteSplintLogs(); 
  const localTmyLogs    = getTmySymptomsLogs(); // 抓取本地顳顎關節症狀
  const localSleepLogs  = getSleepLogs();
  const localDietLogs   = getRainbowDietLogs();

  const payload = {
    painLogs: localPainLogs,
    longTermLogs: localLtLogs,
    biteSplintLogs: localSplintLogs,
    tmySymptomsLogs: localTmyLogs,
    sleepLogs: localSleepLogs,
    rainbowDietLogs: localDietLogs
  };

  // 1. 若處於 Google Apps Script 託管環境，採用 google.script.run 原生連線 (免設網址)
  if (typeof google !== "undefined" && google.script && google.script.run) {
    return new Promise((resolve, reject) => {
      google.script.run
        .withSuccessHandler((result) => {
          if (result && result.status === "success") {
            savePainLogsLocal(result.painLogs || []);
            saveLongTermLogsLocal(result.longTermLogs || []);
            saveBiteSplintLogsLocal(result.biteSplintLogs || []);
            saveTmySymptomsLogsLocal(result.tmySymptomsLogs || []); 
            saveSleepLogsLocal(result.sleepLogs || []);
            saveRainbowDietLogsLocal(result.rainbowDietLogs || []);
            localStorage.setItem(KEY_LAST_SYNCED, Date.now().toString());
            resolve({
              success: true,
              painCount: (result.painLogs || []).length,
              ltCount: (result.longTermLogs || []).length
            });
          } else {
            reject(new Error(result ? result.message : "同步失敗"));
          }
        })
        .withFailureHandler((err) => {
          reject(new Error(err.message || err || "連線 Apps Script 服務出錯"));
        })
        .syncDataFromClient(payload);
    });
  }

  // 2. 否則採用 REST API Url 連線同步 (靜態網頁 / Vercel 模式)
  const url = getSyncUrl();
  if (!url) {
    return { success: false, reason: "no_url" };
  }

  // 若有設定 API Token，加入 payload 供 Code.gs 驗證
  const token = getApiToken();
  if (token) payload.apiToken = token;
  
  try {
    const response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) throw new Error(`HTTP 錯誤: ${response.status}`);
    const result = await response.json();
    
    if (result.status === "success") {
      savePainLogsLocal(result.painLogs || []);
      saveLongTermLogsLocal(result.longTermLogs || []);
      saveBiteSplintLogsLocal(result.biteSplintLogs || []);
      saveTmySymptomsLogsLocal(result.tmySymptomsLogs || []); 
      saveSleepLogsLocal(result.sleepLogs || []);
      saveRainbowDietLogsLocal(result.rainbowDietLogs || []);
      localStorage.setItem(KEY_LAST_SYNCED, Date.now().toString());
      return {
        success: true,
        painCount: (result.painLogs || []).length,
        ltCount: (result.longTermLogs || []).length
      };
    } else {
      throw new Error(result.message || "同步失敗");
    }
  } catch (err) {
    console.error("同步失敗:", err);
    throw new Error(`雲端同步失敗: ${err.message}`);
  }
}


// =====================================================================
// 2. 主控邏輯入口 — 等 modals.html 載入後才初始化
// =====================================================================

function loadModals() {
  // modals.html is now inlined directly into index.html to support file:// protocol and Apps Script environment
  return Promise.resolve();
}

document.addEventListener("DOMContentLoaded", () => {
  // 💡 全域事件代理：關閉 Modal 的按鈕監聽 (放置在最前段，防範後續模組崩潰導致關閉功能失效)
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-close-modal");
    if (btn) {
      e.preventDefault();
      const targetId = btn.getAttribute("data-target");
      if (targetId) {
        const modal = document.getElementById(targetId);
        if (modal) modal.close();
      }
    }
  });

  // 💡 全域事件代理：點擊對話框外部背景 (backdrop) 自動關閉
  document.addEventListener("click", (e) => {
    if (e.target.tagName === "DIALOG") {
      const dialog = e.target;
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      );
      if (!isInDialog) {
        dialog.close();
      }
    }
  });

  // 先初始化不依賴 modal DOM 的部分
  initNavigation();
  initDataManagement();

  // 載入彈窗片段後，再初始化依賴 modal DOM 的部分
  loadModals().then(() => {
    initModals();
    initSettingsModal();
    initBiometrics();
    renderApp();
    checkDailySleepPrompt(); // 💡 僅在頁面啟動載入時檢查彈出
    triggerBackgroundSync(true);
    lucide.createIcons();
  }).catch(err => {
    // fallback：若 fetch 失敗（例如直接用 file:// 開啟），嘗試用已存在的 modal
    console.warn("modals.html fetch 失敗，嘗試使用 inline modals：", err);
    initModals();
    initSettingsModal();
    initBiometrics();
    renderApp();
    checkDailySleepPrompt(); // 💡 僅在頁面啟動載入時檢查彈出
    triggerBackgroundSync(true);
    lucide.createIcons();
  });
});


// =====================================================================
// 3. 導覽列與 Anchor Link 分頁切換
// =====================================================================

function initNavigation() {
  const navItems   = document.querySelectorAll(".nav-item");
  const tabPanels  = document.querySelectorAll(".tab-panel");

  function activateTab(targetTabId) {
    navItems.forEach(nav => {
      const isTarget = nav.getAttribute("data-tab") === targetTabId;
      nav.classList.toggle("active", isTarget);
    });
    tabPanels.forEach(panel => {
      panel.classList.toggle("active", panel.id === targetTabId);
    });

    if (targetTabId === "tab-history") {
      renderHistory();
    } else if (targetTabId === "tab-dashboard") {
      renderDashboard();
    }
    lucide.createIcons();
  }

  // 點擊 nav-item 時更新 hash
  navItems.forEach(item => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const targetTabId = item.getAttribute("data-tab");
      history.pushState(null, "", "#" + targetTabId);
      activateTab(targetTabId);
    });
  });

  // 監聽 hash 變化（瀏覽器前進/後退）
  window.addEventListener("hashchange", () => {
    const hash = location.hash.replace("#", "") || "tab-dashboard";
    activateTab(hash);
  });

  // 頁面載入時根據 hash 決定初始分頁
  const initialHash = location.hash.replace("#", "") || "tab-dashboard";
  activateTab(initialHash);
}


// =====================================================================
// 4. 對話框 (Modals) 管理
// =====================================================================

function enableClickOutsideToClose(dialog) {
  // 💡 已由全域事件代理接管，此處留空以相容舊有的程式碼呼叫
}

window.selectSleepFeeling = function(value) {
  const hiddenInput = document.getElementById("sleep-feeling");
  if (hiddenInput) {
    hiddenInput.value = value;
  }
  const selector = document.getElementById("sleep-feeling-selector");
  if (selector) {
    const btns = selector.querySelectorAll(".emoji-btn");
    btns.forEach(btn => {
      if (btn.getAttribute("data-value") === value) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }
};

function initModals() {
  const modalPain        = document.getElementById("modal-pain");
  const modalLongTerm    = document.getElementById("modal-longterm");
  const modalQuickUpdate = document.getElementById("modal-quick-update");
  
  const formPain        = document.getElementById("form-pain");
  const formLongTerm    = document.getElementById("form-longterm");
  const formQuickUpdate = document.getElementById("form-quick-update");
  
  // 開啟疼痛 Modal
  document.getElementById("btn-open-pain-modal").addEventListener("click", () => {
    formPain.reset();
    document.getElementById("pain-id").value = "";
    
    const now = new Date();
    const tzOffset = now.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);
    document.getElementById("pain-date").value = localISOTime;
    
    updatePainIntensityBadge(4);
    document.getElementById("pain-intensity").value = 4;
    
    resetTriggerTags();
    
    modalPain.showModal();
    lucide.createIcons();
  });
  
  // 開啟長期追蹤 Modal
  document.getElementById("btn-open-lt-modal").addEventListener("click", () => {
    formLongTerm.reset();
    document.getElementById("lt-id").value = "";
    
    const today = getLocalDateString();
    document.getElementById("lt-date").value = today;
    
    modalLongTerm.showModal();
    lucide.createIcons();
  });

  // (全域事件代理已移至 DOMContentLoaded 最前段，防範執行緒崩潰)

  // 疼痛指數滑桿連動
  document.getElementById("pain-intensity").addEventListener("input", (e) => {
    updatePainIntensityBadge(e.target.value);
  });
  
  document.getElementById("quick-pain-intensity").addEventListener("input", (e) => {
    updateQuickIntensityBadge(e.target.value);
  });

  // 痛點觸發活動標籤選擇邏輯 (支援多選)
  const tagBtns           = document.querySelectorAll("#pain-trigger-selector .tag-btn");
  const customTriggerInput = document.getElementById("pain-trigger-custom");
  
  tagBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const val = btn.getAttribute("data-value");
      
      if (val === "不明原因") {
        tagBtns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        customTriggerInput.style.display = "none";
        customTriggerInput.removeAttribute("required");
        customTriggerInput.value = "";
      } else {
        const unknownBtn = Array.from(tagBtns).find(b => b.getAttribute("data-value") === "不明原因");
        if (unknownBtn) unknownBtn.classList.remove("active");
        
        btn.classList.toggle("active");
        
        if (val === "自訂") {
          if (btn.classList.contains("active")) {
            customTriggerInput.style.display = "block";
            customTriggerInput.setAttribute("required", "true");
            customTriggerInput.focus();
          } else {
            customTriggerInput.style.display = "none";
            customTriggerInput.removeAttribute("required");
            customTriggerInput.value = "";
          }
        }
      }
      
      const activeTags = Array.from(tagBtns).filter(b => b.classList.contains("active"));
      if (activeTags.length === 0) {
        tagBtns[0].classList.add("active");
      }
    });
  });

  // 儲存疼痛記錄表單
  formPain.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const id       = document.getElementById("pain-id").value;
    const date     = document.getElementById("pain-date").value;
    const location = document.getElementById("pain-location").value.trim();
    const intensity = parseInt(document.getElementById("pain-intensity").value);
    
    const activeTags = document.querySelectorAll("#pain-trigger-selector .tag-btn.active");
    let triggerList = [];
    activeTags.forEach(btn => {
      const val = btn.getAttribute("data-value");
      if (val === "自訂") {
        const customVal = customTriggerInput.value.trim();
        if (customVal) triggerList.push(customVal);
      } else {
        triggerList.push(val);
      }
    });
    
    const trigger = triggerList.length > 0 ? triggerList.join(" + ") : "不明原因";
    const notes   = document.getElementById("pain-notes").value.trim();
    
    savePainLog({ id: id || null, date, location, intensity, trigger, notes, status: "active" });
    
    modalPain.close();
    renderApp();
    triggerBackgroundSync();
  });

  // 儲存長期健康記錄表單
  formLongTerm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const id            = document.getElementById("lt-id").value;
    const date          = document.getElementById("lt-date").value;
    const itemName      = document.getElementById("lt-item-name").value.trim();
    const sizeWidth     = parseFloat(document.getElementById("lt-size-w").value) || "";
    const sizeHeight    = parseFloat(document.getElementById("lt-size-h").value) || "";
    const sizeDepth     = parseFloat(document.getElementById("lt-size-d").value) || "";
    const hospital      = document.getElementById("lt-hospital").value.trim();
    const doctor        = document.getElementById("lt-doctor").value.trim();
    const nextCheckupDate = document.getElementById("lt-next-date").value;
    const notes         = document.getElementById("lt-notes").value.trim();
    
    saveLongTermLog({ id: id || null, date, itemName, sizeWidth, sizeHeight, sizeDepth, hospital, doctor, nextCheckupDate, notes });
    
    modalLongTerm.close();
    renderApp();
    triggerBackgroundSync();
  });
  
  // 儲存快速更新疼痛指數表單
  formQuickUpdate.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const id           = document.getElementById("quick-pain-id").value;
    const newIntensity = parseInt(document.getElementById("quick-pain-intensity").value);
    
    const logs   = getPainLogs();
    const logIdx = logs.findIndex(l => l.id === id);
    if (logIdx !== -1) {
      logs[logIdx].intensity    = newIntensity;
      logs[logIdx].lastUpdated  = Date.now();
      savePainLogsLocal(logs);
    }
    
    modalQuickUpdate.close();
    renderApp();
    triggerBackgroundSync();
  });
}

function getPainIntensityDesc(val) {
  const v = parseInt(val);
  if (v <= 2) return { text: "微痛（有感但不影響日常與運動）",             class: "pain-level-low" };
  if (v <= 4) return { text: "輕度（微酸、緊繃，運動時隱微有感）",         class: "pain-level-mid" };
  if (v <= 6) return { text: "中度（明顯痛感，會影響/需要降低運動強度）",  class: "pain-level-high" };
  if (v <= 8) return { text: "重度（痛到必須停止訓練，影響日常行走）",     class: "pain-level-high" };
  return      { text: "劇烈（極度疼痛，需就醫處理）",                       class: "pain-level-severe" };
}

function updatePainIntensityBadge(val) {
  const badge = document.getElementById("pain-intensity-value");
  badge.textContent = val;
  badge.className = "slider-badge";
  if (val <= 3)      badge.classList.add("badge-pain-2");
  else if (val <= 6) badge.classList.add("badge-pain-5");
  else if (val <= 8) badge.classList.add("badge-pain-7");
  else               badge.classList.add("badge-pain-10");
  
  const descEl = document.getElementById("pain-intensity-desc");
  if (descEl) {
    const info = getPainIntensityDesc(val);
    descEl.textContent = info.text;
    descEl.className = "intensity-desc-text " + info.class;
  }
}

function updateQuickIntensityBadge(val) {
  const badge = document.getElementById("quick-pain-intensity-value");
  badge.textContent = val;
  badge.className = "slider-badge";
  if (val <= 3)      badge.classList.add("badge-pain-2");
  else if (val <= 6) badge.classList.add("badge-pain-5");
  else if (val <= 8) badge.classList.add("badge-pain-7");
  else               badge.classList.add("badge-pain-10");
  
  const descEl = document.getElementById("quick-pain-intensity-desc");
  if (descEl) {
    const info = getPainIntensityDesc(val);
    descEl.textContent = info.text;
    descEl.className = "intensity-desc-text " + info.class;
  }
}

function resetTriggerTags() {
  const tagBtns = document.querySelectorAll("#pain-trigger-selector .tag-btn");
  tagBtns.forEach(b => b.classList.remove("active"));
  tagBtns[0].classList.add("active");
  
  const customTriggerInput = document.getElementById("pain-trigger-custom");
  customTriggerInput.style.display = "none";
  customTriggerInput.removeAttribute("required");
  customTriggerInput.value = "";
}


// =====================================================================
// 5. 資料快取管理與手動點擊 Header 同步
// =====================================================================

function initDataManagement() {
  const btnClearCache = document.getElementById("btn-clear-cache");
  
  if (btnClearCache) {
    btnClearCache.addEventListener("click", () => {
      if (confirm("您確定要清除手機瀏覽器的快取資料嗎？\n此動作將清空本地暫存，但儲存在 Google 試算表上的資料不會受影響。重新載入網頁後，系統會自動重新從雲端下載最新資料。")) {
        clearLocalData();
        alert("快取已清除，網頁將自動重新整理並載入雲端最新資料。");
        window.location.reload();
      }
    });
  }
}

// 背景自動同步處理 (無提示)
function triggerBackgroundSync(isStartup = false) {
  const isGAS  = typeof google !== "undefined" && google.script && google.script.run;
  const hasUrl = getSyncUrl() !== "";
  
  if (!isGAS && !hasUrl) return;
  
  const btn = document.getElementById("btn-settings");
  const dot = document.getElementById("sync-dot");
  if (btn) btn.classList.add("syncing");
  if (dot) { dot.className = "sync-dot syncing"; }
  
  syncWithCloud().then(res => {
    console.log("背景自動同步成功", res);
    updateSyncStatusHeader();
    if (isStartup) renderApp();
  }).catch(err => {
    console.error("背景自動同步失敗", err);
    updateSyncStatusHeader();
  });
}

// 更新頂部齒輪按鈕同步狀態圓點
function updateSyncStatusHeader() {
  const btn = document.getElementById("btn-settings");
  const dot = document.getElementById("sync-dot");
  if (!btn || !dot) return;

  const isGAS     = typeof google !== "undefined" && google.script && google.script.run;
  const lastSynced = getLastSynced();
  const hasUrl    = getSyncUrl() !== "";

  btn.classList.remove("syncing");

  if (isGAS || hasUrl) {
    if (lastSynced) {
      dot.className   = "sync-dot synced";
      btn.title = `已同步 ${getRelativeTime(lastSynced)} · 點擊開啟設定`;
    } else {
      dot.className   = "sync-dot pending";
      btn.title = "尚未同步 · 點擊開啟設定";
    }
  } else {
    dot.className   = "sync-dot";
    btn.title = "本地儲存 · 點擊開啟設定";
  }
}

// 設定彈窗初始化
function initSettingsModal() {
  const modalSettings   = document.getElementById("modal-settings");
  const formSettings    = document.getElementById("form-settings");
  const btnManualSync   = document.getElementById("btn-manual-sync-settings");
  const btnSettingsGear = document.getElementById("btn-settings");

  // 點擊齒輪開啟設定
  btnSettingsGear.addEventListener("click", () => {
    document.getElementById("settings-sync-url").value   = getSyncUrl();
    document.getElementById("settings-api-token").value  = getApiToken();
    document.getElementById("settings-gemini-key").value = getGeminiKey();
    updateSettingsSyncStatus();
    modalSettings.showModal();
    lucide.createIcons();
  });

  // 儲存設定
  formSettings.addEventListener("submit", (e) => {
    e.preventDefault();
    saveSyncUrl(document.getElementById("settings-sync-url").value);
    saveApiToken(document.getElementById("settings-api-token").value);
    saveGeminiKey(document.getElementById("settings-gemini-key").value);
    modalSettings.close();
    updateSyncStatusHeader();
    if (getSyncUrl()) triggerBackgroundSync();
  });

  // 立即同步按鈕
  btnManualSync.addEventListener("click", async () => {
    // 先暫存目前輸入值
    saveSyncUrl(document.getElementById("settings-sync-url").value);
    saveApiToken(document.getElementById("settings-api-token").value);
    saveGeminiKey(document.getElementById("settings-gemini-key").value);

    const icon = btnManualSync.querySelector("i");
    btnManualSync.disabled = true;
    if (icon) icon.setAttribute("data-lucide", "loader");
    btnManualSync.lastChild.textContent = " 同步中...";
    lucide.createIcons();

    try {
      const res = await syncWithCloud();
      if (res.success) {
        updateSettingsSyncStatus();
        updateSyncStatusHeader();
        renderApp();
      } else if (res.reason === "no_url") {
        alert("請先填入 GAS Web App URL。");
      }
    } catch (err) {
      alert(`同步失敗：${err.message}`);
    } finally {
      btnManualSync.disabled = false;
      if (icon) icon.setAttribute("data-lucide", "refresh-cw");
      btnManualSync.lastChild.textContent = " 立即同步";
      lucide.createIcons();
    }
  });
}

function updateSettingsSyncStatus() {
  const statusEl  = document.getElementById("settings-sync-status");
  if (!statusEl) return;
  const lastSynced = getLastSynced();
  const hasUrl    = getSyncUrl() !== "";

  if (!hasUrl) {
    statusEl.innerHTML = '<span class="settings-status-tag local">● 本地儲存模式（未設定同步網址）</span>';
  } else if (lastSynced) {
    statusEl.innerHTML = `<span class="settings-status-tag synced">● 上次同步：${getRelativeTime(lastSynced)}</span>`;
  } else {
    statusEl.innerHTML = '<span class="settings-status-tag pending">● 尚未同步</span>';
  }
}


// =====================================================================
// 6. 渲染邏輯
// =====================================================================

function renderApp() {
  renderDashboard();
  updateSyncStatusHeader();
}

function renderDashboard() {
  renderActivePains();
  renderLongTermItems();
  renderStats();
  renderDailyHabits();
}

function renderActivePains() {
  const painListContainer = document.getElementById("active-pain-list");
  let logs = getPainLogs();
  
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let dataChanged = false;
  
  logs.forEach(log => {
    if (log.status === "active") {
      const lastUpdatedTime = Number(log.lastUpdated) || new Date(log.date).getTime();
      if (now - lastUpdatedTime > THIRTY_DAYS_MS) {
        log.status = "discontinued";
        log.lastUpdated = now;
        dataChanged = true;
      }
    }
  });
  
  if (dataChanged) savePainLogsLocal(logs);
  
  const activePains = logs.filter(log => log.status === "active");
  
  if (activePains.length === 0) {
    painListContainer.innerHTML = `
      <div class="empty-state">
        <i data-lucide="smile"></i>
        <div class="empty-state-text">
          <h4>目前身體狀況良好！</h4>
          <p>所有疼痛日誌皆已康復或無活躍痛點。</p>
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  
  activePains.sort((a, b) => b.lastUpdated - a.lastUpdated);
  
  painListContainer.innerHTML = "";
  activePains.forEach(log => {
    const card = document.createElement("div");
    card.className = "pain-card";
    
    const updatedTime    = Number(log.lastUpdated) || new Date(log.date).getTime();
    const relativeTimeStr = getRelativeTime(updatedTime);
    
    card.innerHTML = `
      <div class="pain-card-header">
        <div class="pain-card-title">
          <span class="pain-location">${escapeHTML(log.location)}</span>
          <span class="pain-trigger">${escapeHTML(log.trigger)}</span>
        </div>
        <span class="intensity-badge badge-pain-${log.intensity}">${log.intensity}</span>
      </div>
      ${log.notes ? `<div class="pain-card-body">${escapeHTML(log.notes)}</div>` : ""}
      <div class="pain-card-footer">
        <span class="pain-time-muted">更新於：${relativeTimeStr}</span>
        <div class="card-actions">
          <button class="card-btn card-btn-success" onclick="markPainRecovered('${log.id}')">
            <i data-lucide="check-circle" style="width:14px; height:14px;"></i> 已康復
          </button>
          <button class="card-btn card-btn-edit" onclick="openQuickUpdateModal('${log.id}', '${escapeHTML(log.location)}', ${log.intensity})">
            <i data-lucide="sliders" style="width:14px; height:14px;"></i> 更新
          </button>
        </div>
      </div>
    `;
    painListContainer.appendChild(card);
  });
  lucide.createIcons();
}

window.openQuickUpdateModal = function(id, location, intensity) {
  document.getElementById("quick-pain-id").value = id;
  document.getElementById("quick-pain-location-title").textContent = location;
  document.getElementById("quick-pain-intensity").value = intensity;
  updateQuickIntensityBadge(intensity);
  document.getElementById("modal-quick-update").showModal();
  lucide.createIcons();
};

window.markPainRecovered = function(id) {
  const logs = getPainLogs();
  const idx  = logs.findIndex(l => l.id === id);
  if (idx !== -1) {
    logs[idx].status      = "recovered";
    logs[idx].lastUpdated = Date.now();
    savePainLogsLocal(logs);
    renderApp();
    triggerBackgroundSync();
  }
};

// 輔育函式：計算回診倒數徽章 HTML
function getCheckupCountdownBadge(nextCheckupDateStr) {
  if (!nextCheckupDateStr) return "";
  
  const nextDate = new Date(nextCheckupDateStr);
  nextDate.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = nextDate.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  let badgeText = "";
  let badgeStyle = "";
  
  if (diffDays > 0) {
    badgeText = `📅 剩 ${diffDays} 天`;
    if (diffDays <= 7) {
      badgeStyle = "background: #fef3c7; color: #d97706; border: 0px;"; // 警告黃
    } else {
      badgeStyle = "background: #E2E7E1; color: #6B7767; border: 0px;"; // 成功綠
    }
  } else if (diffDays === 0) {
    badgeText = "📅 今天回診";
    badgeStyle = "background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5; font-weight: bold;";
  } else {
    badgeText = `📅 逾期 ${Math.abs(diffDays)} 天`;
    badgeStyle = "background: #fef2f2; color: #dc2626; border: 1px solid #fca5a5;";
  }
  
  return `<span class="lt-size-badge" style="${badgeStyle} font-size: 0.7rem; padding: 2px 8px; border-radius: 9999px; font-weight: 500; white-space: nowrap;">${badgeText}</span>`;
}

function renderLongTermItems() {
  const container = document.getElementById("long-term-list");
  if (!container) return;
  
  const items = getLongTermLogs();
  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i data-lucide="package-open"></i>
        <div class="empty-state-text">
          <h4>尚無長期追蹤項目</h4>
          <p>點擊上方「新增追蹤項目」開始記錄您的就醫或物品追蹤。</p>
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  
  // Group by itemName and only display the latest record for each itemName on the dashboard
  const latestItemsMap = new Map();
  items.forEach(log => {
    if (log.status === "deleted") return;
    const existing = latestItemsMap.get(log.itemName);
    if (!existing || new Date(log.date) > new Date(existing.date) || (new Date(log.date).getTime() === new Date(existing.date).getTime() && log.lastUpdated > existing.lastUpdated)) {
      latestItemsMap.set(log.itemName, log);
    }
  });
  
  const latestItems = Array.from(latestItemsMap.values());
  latestItems.sort((a, b) => {
    const dateA = a.nextCheckupDate ? new Date(a.nextCheckupDate).getTime() : Infinity;
    const dateB = b.nextCheckupDate ? new Date(b.nextCheckupDate).getTime() : Infinity;
    
    if (dateA !== dateB) {
      return dateA - dateB; // 升序：回診時間越近的排在越上面
    }
    return new Date(b.date) - new Date(a.date); // 備用排序：原檢查日期降序
  });
  
  // 🔄 先在外面把顳顎關節近 30 天的統計數據算好，避免在字串內解析出錯
  const tmyLogs = getTmySymptomsLogs ? getTmySymptomsLogs() : [];
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentLogs = tmyLogs.filter(l => new Date(l.date).getTime() >= thirtyDaysAgo);
  
  let symptomCount = 0;
  let medCount = 0;
  recentLogs.forEach(l => {
    // 依日期計算發作次數 (同天有多個症狀只算一次)
    const symptoms = l.symptoms ? l.symptoms.split(',').filter(Boolean) : [];
    if (symptoms.length > 0) {
      symptomCount++;
    }
    if (l.medication && l.medication.includes('muscle_relaxant')) medCount++;
  });

  // 🔄 咬合板的統計數據
  const splintLogs = getBiteSplintLogs ? getBiteSplintLogs() : [];
  const currentWeekLogs = splintLogs.filter(log => isCurrentWeek(new Date(log.date)));
  const lastWeekLogs = splintLogs.filter(log => isLastWeek(new Date(log.date)));
  const currentweekCount = currentWeekLogs.length;
  const lastweekCount = lastWeekLogs.length;
  const yearlyWeeklyAvg = calculateYearlyWeeklyAverage(splintLogs);

  container.innerHTML = "";
  
  latestItems.forEach(log => {
    const card = document.createElement("div");
    card.className = "history-card lt-card";
    
    let sizeStr = "";
    if (log.sizeWidth) {
      sizeStr = ` | 尺寸: ${log.sizeWidth}`;
      if (log.sizeHeight) sizeStr += `×${log.sizeHeight}`;
      if (log.sizeDepth)  sizeStr += `×${log.sizeDepth}`;
      sizeStr += " mm";
    }
    
    const clinicInfo = log.hospital || log.doctor ? ` | ${log.hospital} ${log.doctor}` : "";
    const nextCheckupStr = log.nextCheckupDate ? `<br>下次回診: ${formatDateOnly(log.nextCheckupDate)}` : "";
    
    card.innerHTML = `
      <div class="lt-card-header" style="display: flex; justify-content: space-between; align-items: center;">
        <span class="lt-title">${escapeHTML(log.itemName)}</span>
        ${getCheckupCountdownBadge(log.nextCheckupDate)}
      </div>
      <div class="lt-card-body">
        <div class="lt-info-row">
          <span class="lt-info-label">詳情</span>
          <span class="lt-info-value">${formatDateOnly(log.date)}${sizeStr}${clinicInfo}${nextCheckupStr}</span>
        </div>
        ${log.notes ? `
        <div class="lt-info-row" style="margin-top: 6px; align-items: flex-start;">
          <span class="lt-info-label">備註</span>
          <span class="lt-info-value" style="white-space: pre-wrap;">${escapeHTML(log.notes)}</span>
        </div>
        ` : ""}
        
        ${log.itemName === "顳顎關節" ? `
        <div class="splint-stats-box" style="margin-top:12px; padding:10px; background:rgba(59,130,246,0.05); border-left:4px solid var(--primary); border-radius:4px;">
          <div style="font-weight:bold; font-size:0.9rem; color:var(--text-main); margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
            <span>🦷 咬合板臨床追蹤</span>
            <button onclick="recordBiteSplintAction()" style="padding:2px 8px; font-size:0.75rem; background:var(--primary); color:white; border:none; border-radius:4px; cursor:pointer;">記配戴</button>
          </div>
          <div style="font-size:0.85rem; color:var(--text-muted); display:flex; gap:15px;">
            <span>本週：<strong style="color:var(--primary)">${currentweekCount}</strong> 次</span>
            <span>上週：<strong>${lastweekCount}</strong> 次</span>
            <span>年平均：<strong style="color:var(--success)">${yearlyWeeklyAvg}</strong> 次/週</span>
          </div>
        </div>
        
        <div class="tmy-stats-box" style="margin-top:12px; padding:10px; background:rgba(239,68,68,0.03); border-left:4px solid var(--danger); border-radius:4px;">
          <div style="font-weight:bold; font-size:0.9rem; color:var(--text-main); margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
            <span>📊 症狀監測 (30天)</span>
            <div style="display:flex; gap:6px;">
              <button onclick="openTmySymptomSummaryModal()" style="padding:2px 8px; font-size:0.75rem; background:var(--primary); color:white; border:none; border-radius:4px; cursor:pointer;">📋症狀摘要</button>
              <button onclick="openTmySymptomsModal()" style="padding: 2px 10px; font-size: 0.9rem; font-weight: bold; background: #E8B4B8; color: white; border: none; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; vertical-align: middle;">+</button>
            </div>
          </div>
          <div style="font-size:0.85rem; color:var(--text-muted);">
            <span>發作次數：<strong style="color:var(--danger)">${symptomCount}</strong> 次</span>
            <span style="margin-left:15px;">肌肉鬆弛劑：<strong>${medCount}</strong> 次</span>
          </div>
        </div>
        ` : ""}
      </div>
      <div class="lt-card-actions" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 16px; background: #fbfbfb; border-top: 1px solid #f3f3f3; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <button class="card-btn card-btn-edit" onclick="prefillForNewCheckup('${log.id}')">
            <i data-lucide="calendar-plus" style="width:14px; height:14px;"></i> 新增回診紀錄
          </button>
          <span class="pain-time-muted" style="font-size: 0.7rem; color: var(--text-dim);">更新於：${formatTimeAgo(log.lastUpdated)}</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="history-action-btn" onclick="editRecord('longterm', '${log.id}')" title="編輯"><i data-lucide="edit-3" style="width:14px; height:14px;"></i></button>
          <button class="history-action-btn history-action-btn-delete" onclick="deleteRecord('longterm', '${log.id}')" title="刪除"><i data-lucide="trash-2" style="width:14px; height:14px;"></i></button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
  lucide.createIcons();
}

window.prefillLongtermModal = function(itemName) {
  const modalLongTerm = document.getElementById("modal-longterm");
  const formLongTerm  = document.getElementById("form-longterm");
  formLongTerm.reset();
  
  document.getElementById("lt-id").value        = "";
  document.getElementById("lt-item-name").value = itemName;
  
  const today = getLocalDateString();
  document.getElementById("lt-date").value = today;
  
  modalLongTerm.showModal();
  lucide.createIcons();
};

window.prefillForNewCheckup = function(id) {
  const logs = getLongTermLogs();
  const log = logs.find(l => l.id === id);
  if (!log) return;
  
  const modalLongTerm = document.getElementById("modal-longterm");
  const formLongTerm  = document.getElementById("form-longterm");
  formLongTerm.reset();
  
  document.getElementById("lt-id").value = ""; 
  document.getElementById("lt-item-name").value = log.itemName || "";
  document.getElementById("lt-hospital").value = log.hospital || "";
  document.getElementById("lt-doctor").value = log.doctor || "";
  
  const today = getLocalDateString();
  document.getElementById("lt-date").value = today;
  
  document.getElementById("lt-size-w").value = log.sizeWidth || "";
  document.getElementById("lt-size-h").value = log.sizeHeight || "";
  document.getElementById("lt-size-d").value = log.sizeDepth || "";
  
  modalLongTerm.showModal();
  lucide.createIcons();
};

function renderStats() {
  const painLogs = getPainLogs();
  const ltLogs   = getLongTermLogs();
  
  const statLastPainTime   = document.getElementById("stat-last-pain-time");
  const statLastPainDetail = document.getElementById("stat-last-pain-detail");
  
  if (painLogs.length > 0) {
    const sortedPain = [...painLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const lastPain   = sortedPain[0];
    const daysAgo    = Math.floor((Date.now() - new Date(lastPain.date).getTime()) / (1000 * 60 * 60 * 24));
    
    statLastPainTime.textContent   = daysAgo === 0 ? "今天" : `${daysAgo} 天前`;
    statLastPainDetail.textContent = `${lastPain.location} (強度 ${lastPain.intensity})`;
  } else {
    statLastPainTime.textContent   = "無紀錄";
    statLastPainDetail.textContent = "無疼痛日誌";
  }
  
  const stat30DayCount  = document.getElementById("stat-30day-count");
  const thirtyDaysAgo   = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const count30         = painLogs.filter(log => new Date(log.date).getTime() >= thirtyDaysAgo).length;
  stat30DayCount.textContent = `${count30} 次`;
  
  const statCommonPain      = document.getElementById("stat-common-pain");
  const statCommonPainCount = document.getElementById("stat-common-pain-count");
  
  if (painLogs.length > 0) {
    const locationCounts = {};
    painLogs.forEach(log => {
      if (log.location) locationCounts[log.location] = (locationCounts[log.location] || 0) + 1;
    });
    
    let commonLocation = "-";
    let maxCount = 0;
    for (const loc in locationCounts) {
      if (locationCounts[loc] > maxCount) {
        maxCount = locationCounts[loc];
        commonLocation = loc;
      }
    }
    statCommonPain.textContent      = commonLocation;
    statCommonPainCount.textContent = `記錄 ${maxCount} 次`;
  } else {
    statCommonPain.textContent      = "-";
    statCommonPainCount.textContent = "記錄 0 次";
  }
  
  const statLtCount    = document.getElementById("stat-lt-count");
  const uniqueLtNames  = new Set(ltLogs.map(l => l.itemName));
  statLtCount.textContent = `${uniqueLtNames.size} 個`;
}


// =====================================================================
// 7. 歷史紀錄搜尋 / 篩選
// =====================================================================

let currentFilter = "all";

function initHistoryControls() {
  const historySearch = document.getElementById("history-search");
  const filterBtns    = document.querySelectorAll(".filter-btn");

  historySearch.addEventListener("input", () => { renderHistory(); });
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.getAttribute("data-filter");
      renderHistory();
    });
  });
}

// 歷史控制項在 DOM 就緒時即可初始化（不依賴 modals）
document.addEventListener("DOMContentLoaded", () => {
  initHistoryControls();
});

function renderHistory() {
  const historyListContainer = document.getElementById("history-list");
  
  // 統一在最上方讀取所有本地快取資料
  const painLogs   = getPainLogs();
  const ltLogs     = getLongTermLogs();
  const splintLogs = getBiteSplintLogs();
  const tmyLogs    = getTmySymptomsLogs();
  const sleepLogs  = getSleepLogs();
  const dietLogs   = getRainbowDietLogs();
  
  const query = document.getElementById("history-search").value.trim().toLowerCase();

  // 抓取目前選取了哪一個標籤按鈕，如果抓不到預設為 "all"
  const activeFilterBtn = document.querySelector("#tab-history .filter-btn.active");
  const currentFilter = activeFilterBtn ? activeFilterBtn.getAttribute("data-filter") : "all";

  let allRecords = [];

  // 1. 統一把所有合法的歷史資料倒進總陣列
  painLogs.forEach(log => {
    if (log.status !== "deleted") {
      allRecords.push({ ...log, type: "pain" });
    }
  });

  ltLogs.forEach(log => {
    if (log.status !== "deleted") {
      allRecords.push({ ...log, type: "longterm" });
    }
  });

  splintLogs.forEach(log => {
    if (log.status !== "deleted") {
      allRecords.push({ ...log, type: "splint", itemName: "顳顎關節-咬合板" });
    }
  });

  tmyLogs.forEach(log => {
    if (log.status !== "deleted") {
      allRecords.push({ ...log, type: "tmy", itemName: "顳顎關節-症狀紀錄" });
    }
  });

  sleepLogs.forEach(log => {
    if (log.status !== "deleted") {
      // 記錄原有的睡眠型態 (night/nap)
      allRecords.push({ ...log, type: "sleep", sleepType: log.type, itemName: log.type === "night" ? "夜間主睡眠" : "白日小睡" });
    }
  });

  dietLogs.forEach(log => {
    if (log.status !== "deleted") {
      allRecords.push({ ...log, type: "diet", itemName: "彩虹飲食-" + log.plantName });
    }
  });

  // 2. 依據目前選取的標籤 (Filter) 進行第一輪篩選
  if (currentFilter !== "all") {
    allRecords = allRecords.filter(log => log.type === currentFilter);
  }

  // 3. 關鍵字搜尋過濾功能 (搜尋框有字才過濾)
  if (query) {
    allRecords = allRecords.filter(log => {
      if (log.type === "pain") {
        return (
          (log.location && log.location.toLowerCase().includes(query)) ||
          (log.trigger  && log.trigger.toLowerCase().includes(query))  ||
          (log.notes    && log.notes.toLowerCase().includes(query))
        );
      } else if (log.type === "longterm") {
        return (
          (log.itemName && log.itemName.toLowerCase().includes(query)) ||
          (log.hospital && log.hospital.toLowerCase().includes(query)) ||
          (log.doctor   && log.doctor.toLowerCase().includes(query))   ||
          (log.notes    && log.notes.toLowerCase().includes(query))
        );
      } else if (log.type === "splint") {
        return (
          (log.itemName && log.itemName.toLowerCase().includes(query)) ||
          (log.date     && log.date.toLowerCase().includes(query))
        );
      } else if (log.type === "tmy") {
        return (
          (log.itemName && log.itemName.toLowerCase().includes(query)) ||
          (log.symptoms && log.symptoms.toLowerCase().includes(query)) ||
          (log.date     && log.date.toLowerCase().includes(query))
        );
      } else if (log.type === "sleep") {
        return (
          (log.itemName && log.itemName.toLowerCase().includes(query)) ||
          (log.notes    && log.notes.toLowerCase().includes(query)) ||
          (log.date     && log.date.toLowerCase().includes(query))
        );
      } else if (log.type === "diet") {
        return (
          (log.plantName && log.plantName.toLowerCase().includes(query)) ||
          (log.color     && log.color.toLowerCase().includes(query)) ||
          (log.date      && log.date.toLowerCase().includes(query))
        );
      }
      return false;
    });
  }

  // 統一排序：最新日期在最前面
  allRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

  // 無資料時的空狀態顯示
  if (allRecords.length === 0) {
    historyListContainer.innerHTML = `
      <div class="empty-state">
        <i data-lucide="search-slash"></i>
        <div class="empty-state-text">
          <h4>找不到相符的歷史記錄</h4>
          <p>請嘗試其他搜尋關鍵字，或切換篩選分類。</p>
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  // 開始渲染畫面卡片
  historyListContainer.innerHTML = "";
  allRecords.forEach(log => {
    const item = document.createElement("div");
    item.className = `history-item history-item-${log.type}`;
    
    const displayDate = log.date ? log.date.substring(0, 10) : "";
    
    if (log.type === "pain") {
      let statusLabel = "";
      if (log.status === "recovered")    statusLabel = " (🟢 已康復)";
      else if (log.status === "discontinued") statusLabel = " (⚪ 未持續)";
      
      item.innerHTML = `
        <div class="history-item-header">
          <span class="history-type-badge">疼痛日誌</span>
          <span class="history-item-date">${displayDate}</span>
        </div>
        <div class="history-item-content">
          <strong>${escapeHTML(log.location)}</strong> - 疼痛指數: <strong>${log.intensity}</strong> | 原因: ${escapeHTML(log.trigger)}${statusLabel}
        </div>
        ${log.notes ? `<div class="history-item-notes">${escapeHTML(log.notes)}</div>` : ""}
        <div class="history-item-actions">
          <button class="history-action-btn" onclick="editRecord('pain', '${log.id}')" title="編輯"><i data-lucide="edit-3" style="width:14px; height:14px;"></i></button>
          <button class="history-action-btn history-action-btn-delete" onclick="deleteRecord('pain', '${log.id}')" title="刪除"><i data-lucide="trash-2" style="width:14px; height:14px;"></i></button>
        </div>
      `;
    } else if (log.type === "longterm") {
      let sizeStr = "";
      if (log.sizeWidth) {
        sizeStr = ` | 尺寸: ${log.sizeWidth}`;
        if (log.sizeHeight) sizeStr += `×${log.sizeHeight}`;
        if (log.sizeDepth)  sizeStr += `×${log.sizeDepth}`;
        sizeStr += " mm";
      }
      const clinicInfo = log.hospital || log.doctor ? ` | ${log.hospital} ${log.doctor}` : "";
      
      item.innerHTML = `
        <div class="history-item-header">
          <span class="history-type-badge">長期追蹤</span>
          <span class="history-item-date">${displayDate}</span>
        </div>
        <div class="history-item-content">
          <strong>${escapeHTML(log.itemName)}</strong>${sizeStr}${clinicInfo}
          ${log.nextCheckupDate ? `<div class="lt-status-next">回診預約：${log.nextCheckupDate.substring(0, 10)}</div>` : ""}
        </div>
        ${log.notes ? `<div class="history-item-notes">${escapeHTML(log.notes)}</div>` : ""}
        <div class="history-item-actions">
          <button class="history-action-btn" onclick="editRecord('longterm', '${log.id}')" title="編輯"><i data-lucide="edit-3" style="width:14px; height:14px;"></i></button>
          <button class="history-action-btn history-action-btn-delete" onclick="deleteRecord('longterm', '${log.id}')" title="刪除"><i data-lucide="trash-2" style="width:14px; height:14px;"></i></button>
        </div>
      `;
    } else if (log.type === "splint") {
      item.innerHTML = `
        <div class="history-item-header" style="background: rgba(59,130,246,0.05);">
          <span class="history-type-badge" style="background: rgba(59,130,246,0.1); color: var(--primary);">咬合板紀錄</span>
          <span class="history-item-date">${displayDate}</span>
        </div>
        <div class="history-item-content">
          <strong>🦷 顳顎關節-咬合板</strong>
          <div class="lt-status-next" style="color: var(--success); margin-top: 4px;">配戴狀態：✅ 臨床追蹤當日已配戴</div>
        </div>
        <div class="history-item-actions">
          <button class="history-action-btn history-action-btn-delete" onclick="deleteRecord('splint', '${log.id}')" title="刪除"><i data-lucide="trash-2" style="width:14px; height:14px;"></i></button>
        </div>
      `;
    } else if (log.type === "tmy") {
      let symptomsText = [];
      if (log.symptoms) {
        log.symptoms.split(',').forEach(s => {
          if (s === "click") symptomsText.push("🔊咖咖聲");
          else if (s === "pain_open") symptomsText.push("⚡張口痛");
          else if (s === "pain_chew") symptomsText.push("🥩咀嚼痛");
          else if (s === "misalignment") symptomsText.push("📐錯位");
        });
      }
      if (log.medication === "muscle_relaxant") {
        symptomsText.push("💊肌肉鬆弛劑");
      }
      
      item.innerHTML = `
        <div class="history-item-header" style="background: rgba(239, 68, 68, 0.05);">
          <span class="history-type-badge" style="background: rgba(239, 68, 68, 0.1); color: var(--danger);">顳顎症狀</span>
          <span class="history-item-date">${displayDate}</span>
        </div>
        <div class="history-item-content">
          <strong>🦷 顳顎關節-症狀紀錄</strong>
          <div style="margin-top: 4px; color: var(--text-main);">${symptomsText.join('、') || '無症狀'}</div>
        </div>
        <div class="history-item-actions">
          <button class="history-action-btn" onclick="editRecord('tmy', '${log.id}')" title="編輯"><i data-lucide="edit-3" style="width:14px; height:14px;"></i></button>
          <button class="history-action-btn history-action-btn-delete" onclick="deleteRecord('tmy', '${log.id}')" title="刪除"><i data-lucide="trash-2" style="width:14px; height:14px;"></i></button>
        </div>
      `;
    } else if (log.type === "sleep") {
      const isNight = log.sleepType === "night";
      let sleepDetails = "";
      if (isNight) {
        const light = log.lightSleep !== undefined ? log.lightSleep : (log.sleepDuration - (log.deepSleep || 0) - (log.remSleep || 0));
        const feelingEmoji = {
          "excellent": "🤩",
          "normal": "🙂",
          "tired": "🥱",
          "sore": "🥵",
          "poor": "🤢"
        }[log.feeling] || "";
        sleepDetails = `時數: <strong>${log.sleepDuration} 小時</strong> ${feelingEmoji} (深眠: ${log.deepSleep || 0}h, REM: ${log.remSleep || 0}h, 淺眠: ${light.toFixed(1)}h) | HRV: <strong>${log.hrv || '-'} ms</strong> | 壓力: <strong>${log.stress || '-'}</strong>`;
      } else {
        sleepDetails = `白日小睡: <strong>${Math.round(log.sleepDuration * 60)} 分鐘</strong>`;
      }
      
      item.innerHTML = `
        <div class="history-item-header" style="background: rgba(111, 127, 153, 0.05);">
          <span class="history-type-badge" style="background: rgba(111, 127, 153, 0.1); color: #6f7f99;">睡眠追蹤</span>
          <span class="history-item-date">${displayDate}</span>
        </div>
        <div class="history-item-content">
          <strong>💤 ${isNight ? '夜間主睡眠' : '白日小睡'}</strong>
          <div style="margin-top: 4px; color: var(--text-main); font-size: 0.8rem;">${sleepDetails}</div>
        </div>
        ${log.notes ? `<div class="history-item-notes">${escapeHTML(log.notes)}</div>` : ""}
        <div class="history-item-actions">
          <button class="history-action-btn" onclick="editRecord('sleep', '${log.id}')" title="編輯"><i data-lucide="edit-3" style="width:14px; height:14px;"></i></button>
          <button class="history-action-btn history-action-btn-delete" onclick="deleteRecord('sleep', '${log.id}')" title="刪除"><i data-lucide="trash-2" style="width:14px; height:14px;"></i></button>
        </div>
      `;
    } else if (log.type === "diet") {
      const colorMap = {
        "red": "🔴 紅色",
        "orange-yellow": "🟡 橘黃",
        "green": "🟢 綠色",
        "blue-purple": "🔵 藍紫",
        "white-brown": "⚪ 白褐",
        "black": "⚫ 黑色"
      };
      const colorText = colorMap[log.color] || log.color;
      
      item.innerHTML = `
        <div class="history-item-header" style="background: rgba(196, 153, 142, 0.05);">
          <span class="history-type-badge" style="background: rgba(196, 153, 142, 0.1); color: #c4998e;">彩虹飲食</span>
          <span class="history-item-date">${displayDate}</span>
        </div>
        <div class="history-item-content">
          <strong>🥗 食材：${escapeHTML(log.plantName)}</strong> (${colorText})
        </div>
        <div class="history-item-actions">
          <button class="history-action-btn history-action-btn-delete" onclick="deleteRecord('diet', '${log.id}')" title="刪除"><i data-lucide="trash-2" style="width:14px; height:14px;"></i></button>
        </div>
      `;
    }
    historyListContainer.appendChild(item);
  });
  lucide.createIcons();
}

window.editRecord = function(type, id) {
  if (type === "sleep") {
    const logs = getSleepLogs();
    const log = logs.find(l => l.id === id);
    if (!log) return;
    
    if (log.type === "nap") {
      document.getElementById("nap-id").value = log.id;
      if (log.date) document.getElementById("nap-date").value = log.date.substring(0, 10);
      document.getElementById("nap-duration").value = Math.round(log.sleepDuration * 60);
      document.getElementById("nap-notes").value = log.notes || "";
      document.getElementById("modal-nap").showModal();
    } else {
      document.getElementById("sleep-id").value = log.id;
      if (log.date) document.getElementById("sleep-date").value = log.date.substring(0, 10);
      document.getElementById("sleep-bedtime").value = log.bedtime || "";
      document.getElementById("sleep-wakeup").value = log.wakeupTime || "";
      document.getElementById("sleep-duration").value = log.sleepDuration || "";
      document.getElementById("sleep-hrv").value = log.hrv || "";
      document.getElementById("sleep-deep").value = log.deepSleep || "";
      document.getElementById("sleep-rem").value = log.remSleep || "";
      document.getElementById("sleep-stress").value = (log.stress !== undefined && log.stress !== null) ? log.stress : 20;
      document.getElementById("sleep-stress-value").textContent = (log.stress !== undefined && log.stress !== null) ? log.stress : 20;
      
      // 💡 預選起床體感
      const feelingVal = log.feeling || "normal";
      selectSleepFeeling(feelingVal);
      
      document.getElementById("sleep-notes").value = log.notes || "";
      document.getElementById("modal-sleep").showModal();
    }
  } else if (type === "tmy") {
    openTmySymptomsModal(id);
    return;
  } else if (type === "pain") {
    const logs = getPainLogs();
    const log  = logs.find(l => l.id === id);
    if (!log) return;
    
    document.getElementById("pain-id").value       = log.id;
    if (log.date) {  document.getElementById("pain-date").value = getLocalDateString(new Date(log.date));}
    document.getElementById("pain-location").value = log.location;
    document.getElementById("pain-intensity").value = log.intensity;
    updatePainIntensityBadge(log.intensity);
    
    const tagBtns            = document.querySelectorAll("#pain-trigger-selector .tag-btn");
    const customTriggerInput = document.getElementById("pain-trigger-custom");
    
    tagBtns.forEach(btn => btn.classList.remove("active"));
    customTriggerInput.value = "";
    customTriggerInput.style.display = "none";
    customTriggerInput.removeAttribute("required");
    
    if (log.trigger) {
      const savedTriggers = log.trigger.split(" + ");
      let hasCustom    = false;
      let customValues = [];
      
      savedTriggers.forEach(t => {
        let isBuiltIn = false;
        tagBtns.forEach(btn => {
          if (btn.getAttribute("data-value") === t) {
            btn.classList.add("active");
            isBuiltIn = true;
          }
        });
        if (!isBuiltIn) { hasCustom = true; customValues.push(t); }
      });
      
      if (hasCustom) {
        const customBtn = document.getElementById("tag-custom-trigger");
        if (customBtn) customBtn.classList.add("active");
        customTriggerInput.style.display = "block";
        customTriggerInput.setAttribute("required", "true");
        customTriggerInput.value = customValues.join(" + ");
      }
    } else {
      tagBtns[0].classList.add("active");
    }
    
    document.getElementById("pain-notes").value = log.notes || "";
    document.getElementById("modal-pain").showModal();
  } else {
    const logs = getLongTermLogs();
    const log  = logs.find(l => l.id === id);
    if (!log) return;
    
    document.getElementById("lt-id").value          = log.id;
    if (log.date) {  document.getElementById("lt-date").value = getLocalDateString(new Date(log.date));}
    document.getElementById("lt-item-name").value   = log.itemName;
    document.getElementById("lt-size-w").value      = log.sizeWidth  || "";
    document.getElementById("lt-size-h").value      = log.sizeHeight || "";
    document.getElementById("lt-size-d").value      = log.sizeDepth  || "";
    document.getElementById("lt-hospital").value    = log.hospital   || "";
    document.getElementById("lt-doctor").value      = log.doctor     || "";
    if (log.nextCheckupDate) {  document.getElementById("lt-next-date").value = getLocalDateString(new Date(log.nextCheckupDate));}
    document.getElementById("lt-notes").value       = log.notes      || "";
    
    document.getElementById("modal-longterm").showModal();
  }
  lucide.createIcons();
};

window.deleteRecord = function(type, id) {
  if (confirm("您確定要刪除這筆記錄嗎？")) {
    if (type === "pain") {
      const logs = getPainLogs();
      const idx = logs.findIndex(l => l.id === id);
      if (idx !== -1) {
        logs[idx].status = "deleted";
        logs[idx].lastUpdated = Date.now();
        savePainLogsLocal(logs);
      }
    } else if (type === "longterm") {
      const logs = getLongTermLogs();
      const idx = logs.findIndex(l => l.id === id);
      if (idx !== -1) {
        logs[idx].status = "deleted";
        logs[idx].lastUpdated = Date.now();
        saveLongTermLogsLocal(logs);
      }
    } else if (type === "splint") {
      const logs = getBiteSplintLogs();
      const idx = logs.findIndex(l => l.id === id);
      if (idx !== -1) {
        logs[idx].status = "deleted";
        logs[idx].lastUpdated = Date.now();
        saveBiteSplintLogsLocal(logs);
      }
    } else if (type === "tmy") {
      const logs = getTmySymptomsLogs();
      const idx = logs.findIndex(l => l.id === id);
      if (idx !== -1) {
        logs[idx].status = "deleted";
        logs[idx].lastUpdated = Date.now();
        saveTmySymptomsLogsLocal(logs);
      }
    } else if (type === "sleep") {
      const logs = getSleepLogs();
      const idx = logs.findIndex(l => l.id === id);
      if (idx !== -1) {
        logs[idx].status = "deleted";
        logs[idx].lastUpdated = Date.now();
        saveSleepLogsLocal(logs);
      }
    } else if (type === "diet") {
      const logs = getRainbowDietLogs();
      const idx = logs.findIndex(l => l.id === id);
      if (idx !== -1) {
        logs[idx].status = "deleted";
        logs[idx].lastUpdated = Date.now();
        saveRainbowDietLogsLocal(logs);
      }
    }
    renderApp();
    renderHistory();
    triggerBackgroundSync();
  }
};


// =====================================================================
// 8. 輔助函式
// =====================================================================

function getRelativeTime(timestamp) {
  const diffMs = Date.now() - timestamp;
  if (diffMs < 60000) return "剛剛";
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins} 分鐘前`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} 小時前`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "昨天";
  if (diffDays < 30) return `${diffDays} 天前`;
  return `${Math.floor(diffDays / 30)} 個月前`;
}

function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g,
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
/**
 * 將任何髒髒的日期字串統一清洗為 YYYY-MM-DD 格式
 * 支援處理 "2026-06-12T00:37:00.000Z" 或 "2026-03-15 16:00:00.000Z"
 */
function formatDateOnly(dateString) {
  if (!dateString) return '-';
  try {
    // 優先直接用正則表達式切出前 10 碼 (YYYY-MM-DD)，這最安全，能防止時區造成的日期跳號
    const match = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) {
      return match[1];
    }
    
    // 如果切不出來，再交給 Date 物件保底
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return getLocalDateString(date);
    }
    return dateString; // 真的失敗了才回傳原本的字串
  } catch (e) {
    console.error("日期解析失敗:", dateString, e);
    return dateString;
  }
}

// 輔助函式：取得指定日期該週的起點
function getStartOfWeek(date, startOnMonday = true) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (startOnMonday ? (day === 0 ? -6 : 1) : 0);
  const start = new Date(d.setDate(diff));
  start.setHours(0, 0, 0, 0);
  return start;
}

// 輔助函式：判斷是否為本週
function isCurrentWeek(date) {
  const now = new Date();
  const startOfThisWeek = getStartOfWeek(now);
  const endOfThisWeek = new Date(startOfThisWeek);
  endOfThisWeek.setDate(startOfThisWeek.getDate() + 7);
  
  const targetTime = date.getTime();
  return targetTime >= startOfThisWeek.getTime() && targetTime < endOfThisWeek.getTime();
}

// 輔助函式：判斷是否為上週
function isLastWeek(date) {
  const now = new Date();
  const startOfThisWeek = getStartOfWeek(now);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
  const endOfLastWeek = startOfThisWeek;
  
  const targetTime = date.getTime();
  return targetTime >= startOfLastWeek.getTime() && targetTime < endOfLastWeek.getTime();
}

// 輔助函式：計算年度每週平均配戴次數
function calculateYearlyWeeklyAverage(logs) {
  if (!logs || logs.length === 0) return 0;
  
  const dates = logs.map(l => new Date(l.date).getTime()).filter(t => !isNaN(t));
  if (dates.length === 0) return 0;
  
  const minTime = Math.min(...dates);
  const maxTime = Math.max(...dates, Date.now());
  
  const diffMs = maxTime - minTime;
  const diffWeeks = Math.max(1, diffMs / (7 * 24 * 60 * 60 * 1000));
  
  const avg = logs.length / diffWeeks;
  return avg.toFixed(1);
}

// 輔助函式：格式化時間差
function formatTimeAgo(timestamp) {
  return getRelativeTime(timestamp);
}
// =====================================================================
// ✨ 補在檔案最底部：一鍵紀錄咬合板配戴並自動同步
// =====================================================================
async function recordBiteSplintAction() {
  const today = getLocalDateString();
  
  const newLog = {
    date: today
  };

  // 1. 儲存到瀏覽器本地
  saveBiteSplintLog(newLog);
  
  // 2. 彈出美觀的提示，並立刻重新渲染畫面讓次數+1
  alert(`🦷 成功紀錄：${today} 已配戴咬合板！`);
  if (typeof renderDashboard === "function") {
    renderDashboard();
  } else if (typeof renderAll === "function") {
    renderAll();
  }

  // 3. 自動觸發背景同步，把資料寫回 Google Sheet 的 BiteSplintLogs 表
  try {
    showSyncStatus("同步中...");
    const res = await syncWithCloud();
    if (res && res.success) {
      showSyncStatus("已同步");
    } else {
      showSyncStatus("同步失敗");
    }
  } catch (err) {
    console.error("自動同步失敗:", err);
    showSyncStatus("同步出錯");
  }
}

// 輔助更新導覽列同步狀態字樣的防錯函式
function showSyncStatus(text) {
  const statusEl = document.getElementById("sync-status");
  if (statusEl) {
    statusEl.textContent = text;
  }
} // 💡 修正：在這裡正確關閉 showSyncStatus 函式

// =====================================================================
// ✨ 顳顎關節症狀彈窗控制與同步儲存 (修正大小寫版)
// =====================================================================
function openTmySymptomsModal(editId = null) {
  let modal = document.getElementById("modal-tmy-symptoms");
  if (!modal) {
    modal = document.createElement("dialog");
    modal.id = "modal-tmy-symptoms";
    modal.className = "app-modal";
    
    modal.innerHTML = `
      <div class="modal-header">
        <h2><i data-lucide="activity"></i> 今日顳顎關節狀態</h2>
        <button class="btn-close-modal" onclick="document.getElementById('modal-tmy-symptoms').close()"><i data-lucide="x"></i></button>
      </div>
      <form id="form-tmy-symptoms" method="dialog" style="padding: 20px;">
        <input type="hidden" id="tmy-log-id">
        <p style="font-size:0.85rem; color:var(--text-muted); margin:0 0 15px 0;">請勾選今日出現的臨床症狀與用藥情況：</p>
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
          <label style="display:flex; align-items:center; gap:8px; font-size:0.95rem; cursor:pointer;"><input type="checkbox" name="symptom" value="click"> 🔊 打開有咖咖聲 (Clicking)</label>
          <label style="display:flex; align-items:center; gap:8px; font-size:0.95rem; cursor:pointer;"><input type="checkbox" name="symptom" value="pain_open"> ⚡ 張口時感覺疼痛</label>
          <label style="display:flex; align-items:center; gap:8px; font-size:0.95rem; cursor:pointer;"><input type="checkbox" name="symptom" value="pain_chew"> 🥩 咬東西時感覺疼痛</label>
          <label style="display:flex; align-items:center; gap:8px; font-size:0.95rem; cursor:pointer;"><input type="checkbox" name="symptom" value="misalignment"> 📐 咬東西感覺位置錯位</label>
          <hr style="border:none; border-top:1px solid #eee; margin:5px 0;">
          <label style="display:flex; align-items:center; gap:8px; font-size:0.95rem; cursor:pointer; color:var(--danger); font-weight:500;"><input type="checkbox" id="tmy-med-relaxant" value="muscle_relaxant"> 💊 今日有服用肌肉鬆弛劑</label>
        </div>
        <div class="form-actions">
          <button type="button" onclick="document.getElementById('modal-tmy-symptoms').close()" class="btn btn-secondary">取消</button>
          <button type="submit" class="btn btn-primary" style="background:var(--danger); border-color:var(--danger);">儲存紀錄</button>
        </div>
      </form>
    `;
    document.body.appendChild(modal);
    enableClickOutsideToClose(modal);
    
    document.getElementById("form-tmy-symptoms").addEventListener("submit", (e) => {
      e.preventDefault();
      saveTmySymptomsFormResult();
    });
  }
  
  const idInput = document.getElementById("tmy-log-id");
  const checkboxes = modal.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach(cb => cb.checked = false);
  
  if (editId) {
    idInput.value = editId;
    const logs = getTmySymptomsLogs();
    const log = logs.find(l => l.id === editId);
    if (log) {
      if (log.symptoms) {
        log.symptoms.split(',').forEach(s => {
          const cb = modal.querySelector(`input[value="${s}"]`);
          if (cb) cb.checked = true;
        });
      }
      const medCb = document.getElementById("tmy-med-relaxant");
      if (medCb) medCb.checked = (log.medication === "muscle_relaxant");
    }
  } else {
    idInput.value = "";
  }
  
  modal.showModal();
  lucide.createIcons();
}

window.openTmySymptomSummaryModal = function() {
  let modal = document.getElementById("modal-tmy-summary");
  if (!modal) {
    modal = document.createElement("dialog");
    modal.id = "modal-tmy-summary";
    modal.className = "app-modal";
    
    document.body.appendChild(modal);
    enableClickOutsideToClose(modal);
  }
  
  const tmyLogs = getTmySymptomsLogs ? getTmySymptomsLogs() : [];
  const oneYearAgo = Date.now() - (365 * 24 * 60 * 60 * 1000);
  const yearlyLogs = tmyLogs.filter(l => new Date(l.date).getTime() >= oneYearAgo);
  
  yearlyLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  const counts = {
    "click": 0,
    "pain_open": 0,
    "pain_chew": 0,
    "misalignment": 0,
    "muscle_relaxant": 0
  };
  
  let symptomDays = 0;
  yearlyLogs.forEach(l => {
    const symptoms = l.symptoms ? l.symptoms.split(',').filter(Boolean) : [];
    if (symptoms.length > 0) {
      symptomDays++;
      symptoms.forEach(s => {
        if (counts[s] !== undefined) counts[s]++;
      });
    }
    if (l.medication === "muscle_relaxant") {
      counts["muscle_relaxant"]++;
    }
  });
  
  modal.innerHTML = `
    <div class="modal-header">
      <h2><i data-lucide="bar-chart-2"></i> 近一年顳顎關節症狀摘要</h2>
      <button class="btn-close-modal" onclick="document.getElementById('modal-tmy-summary').close()"><i data-lucide="x"></i></button>
    </div>
    <div style="padding: 20px;">
      <div style="font-size:0.9rem; margin-bottom:15px; color:var(--text-muted); display: flex; gap: 15px;">
        <span>記錄天數：<strong style="color:var(--text-main)">${yearlyLogs.length}</strong> 天</span>
        <span>發作天數：<strong style="color:var(--danger)">${symptomDays}</strong> 天</span>
      </div>
      <div style="background:rgba(0,0,0,0.02); padding:12px; border-radius:8px; margin-bottom:15px;">
        <h4 style="margin:0 0 8px 0; font-size:0.9rem;">症狀頻率統計</h4>
        <div style="display:flex; flex-direction:column; gap:6px; font-size:0.85rem;">
          <div style="display:flex; justify-content:space-between;"><span>🔊 咖咖聲 (Clicking)：</span><strong>${counts["click"]} 次</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>⚡ 張口時感覺疼痛：</span><strong>${counts["pain_open"]} 次</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>🥩 咬東西時感覺疼痛：</span><strong>${counts["pain_chew"]} 次</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>📐 咬東西感覺位置錯位：</span><strong>${counts["misalignment"]} 次</strong></div>
          <hr style="border:none; border-top:1px solid #eee; margin:4px 0;">
          <div style="display:flex; justify-content:space-between; color:var(--danger);"><span>💊 服用肌肉鬆弛劑：</span><strong>${counts["muscle_relaxant"]} 次</strong></div>
        </div>
      </div>
      <h4 style="margin:0 0 8px 0; font-size:0.9rem;">詳細歷史記錄 (近一年)</h4>
      <div style="max-height:200px; overflow-y:auto; border:1px solid #eee; border-radius:8px; padding:8px; font-size:0.85rem;">
        ${yearlyLogs.length === 0 ? `
          <div style="text-align:center; color:var(--text-muted); padding:20px;">近一年無症狀記錄。</div>
        ` : yearlyLogs.map(l => {
          let symptomsText = [];
          if (l.symptoms) {
            l.symptoms.split(',').forEach(s => {
              if (s === "click") symptomsText.push("🔊咖咖聲");
              else if (s === "pain_open") symptomsText.push("⚡張口痛");
              else if (s === "pain_chew") symptomsText.push("🥩咀嚼痛");
              else if (s === "misalignment") symptomsText.push("📐錯位");
            });
          }
          if (l.medication === "muscle_relaxant") {
            symptomsText.push("💊肌肉鬆弛劑");
          }
          return `
            <div style="display:flex; justify-content:space-between; border-bottom:1px solid #f5f5f5; padding:6px 0;">
              <span style="font-weight:500;">📅 ${formatDateOnly(l.date)}</span>
              <span style="color:var(--text-main);">${symptomsText.join('、') || '無症狀'}</span>
            </div>
          `;
        }).join('')}
      </div>
      <div class="form-actions" style="margin-top:20px; justify-content:flex-end;">
        <button onclick="document.getElementById('modal-tmy-summary').close()" class="btn btn-secondary" style="padding:6px 16px;">關閉</button>
      </div>
    </div>
  `;
  
  modal.showModal();
  lucide.createIcons();
}

async function saveTmySymptomsFormResult() {
  const id = document.getElementById("tmy-log-id").value || null;
  const today = getLocalDateString();
  const modal = document.getElementById("modal-tmy-symptoms");
  
  const symptomCbs = modal.querySelectorAll("input[name='symptom']:checked");
  const symptomsList = Array.from(symptomCbs).map(cb => cb.value);
  
  const medCb = document.getElementById("tmy-med-relaxant");
  const medication = medCb && medCb.checked ? "muscle_relaxant" : "";

  if (symptomsList.length === 0 && !medication) {
    alert("未勾選任何項目，未新增紀錄。");
    modal.close();
    return;
  }

  const newLog = {
    id: id || null,
    date: today,
    symptoms: symptomsList.join(","),
    medication: medication
  };

  // 編輯時保持原本記錄的日期，不隨意覆蓋為今日
  if (id) {
    const logs = getTmySymptomsLogs();
    const existingLog = logs.find(l => l.id === id);
    if (existingLog) {
      newLog.date = existingLog.date;
    }
  }

  // 1. 儲存到本地快取
  saveTmySymptomsLog(newLog);
  modal.close();
  
  // 2. 重新刷新長期健康追蹤的畫面
  if (typeof renderLongTermItems === "function") renderLongTermItems();
  alert(`📊 顳顎關節症狀已紀錄成功！`);

  // 3. 雲端同步
  try {
    showSyncStatus("同步中...");
    const res = await syncWithCloud();
    if (res && res.success) {
      showSyncStatus("已同步");
    } else {
      showSyncStatus("同步失敗");
    }
  } catch (err) {
    console.error("症狀同步失敗:", err);
    showSyncStatus("同步出錯");
  }
} // 💡 修正：此處做為檔案結尾，剛好對應關閉 saveTmySymptomsFormResult

// =====================================================================
// ✨ 每日生理指標與生活習慣追蹤主控模組 (Sleep, HRV, Diet)
// =====================================================================

// 1. 內建彩虹飲食植物資料庫
const PLANT_DATABASE = {
  // 紅色 (red)
  "番茄": "red", "西紅柿": "red", "蘋果": "red", "草莓": "red", "櫻桃": "red", "紅甜椒": "red", "紅椒": "red", "西瓜": "red", "蔓越莓": "red", "甜菜根": "red", "紅石榴": "red", "紅鳳菜": "red", "枸杞": "red", "紅豆": "red", "蓮霧": "red", "紅棗": "red", "紅火龍果": "red", "紅李": "red",
  // 橘黃色 (orange-yellow)
  "胡蘿蔔": "orange-yellow", "紅蘿蔔": "orange-yellow", "南瓜": "orange-yellow", "木瓜": "orange-yellow", "芒果": "orange-yellow", "香蕉": "orange-yellow", "地瓜": "orange-yellow", "番薯": "orange-yellow", "甘薯": "orange-yellow", "柑橘": "orange-yellow", "橘子": "orange-yellow", "柳丁": "orange-yellow", "柳橙": "orange-yellow", "黃甜椒": "orange-yellow", "黃椒": "orange-yellow", "玉米": "orange-yellow", "鳳梨": "orange-yellow", "柿子": "orange-yellow", "檸檬": "orange-yellow", "黃豆": "orange-yellow", "燕麥": "orange-yellow", "小米": "orange-yellow", "哈密瓜": "orange-yellow", "百香果": "orange-yellow", "枇杷": "orange-yellow", "黃豆芽": "orange-yellow", "栗子": "orange-yellow", "黃金果": "orange-yellow",
  // 綠色 (green)
  "菠菜": "green", "花椰菜": "green", "綠花椰菜": "green", "青花菜": "green", "空心菜": "green", "青江菜": "green", "奇異果": "green", "小黃瓜": "green", "黃瓜": "green", "蘆筍": "green", "青椒": "green", "芹菜": "green", "綠茶": "green", "芭樂": "green", "韭菜": "green", "四季豆": "green", "豌豆": "green", "毛豆": "green", "高麗菜": "green", "萵苣": "green", "綠豆": "green", "秋葵": "green", "地瓜葉": "green", "絲瓜": "green", "苦瓜": "green", "冬瓜": "green", "芥蘭": "green", "小白菜": "green", "油菜": "green", "茼蒿": "green", "青蔥": "green", "蔥": "green", "九層塔": "green", "香菜": "green", "莧菜": "green", "龍鬚菜": "green", "酪梨": "green", "綠葡萄": "green",
  // 藍紫色 (blue-purple)
  "藍莓": "blue-purple", "茄子": "blue-purple", "紫甘藍": "blue-purple", "葡萄": "blue-purple", "桑椹": "blue-purple", "紫地瓜": "blue-purple", "黑莓": "blue-purple", "李子": "blue-purple", "紫洋蔥": "blue-purple", "紫米": "blue-purple", "無花果": "blue-purple", "黑醋栗": "blue-purple", "甜菜": "blue-purple", "紫高麗菜": "blue-purple", "紫山藥": "blue-purple",
  // 白褐色 (white-brown)
  "洋蔥": "white-brown", "大蒜": "white-brown", "蒜頭": "white-brown", "白蘿蔔": "white-brown", "蘿蔔": "white-brown", "椰子": "white-brown", "山藥": "white-brown", "白花椰菜": "white-brown", "白花菜": "white-brown", "蘑菇": "white-brown", "金針菇": "white-brown", "杏鮑菇": "white-brown", "香菇": "white-brown", "豆腐": "white-brown", "糙米": "white-brown", "薏仁": "white-brown", "蓮子": "white-brown", "百合": "white-brown", "銀耳": "white-brown", "白木耳": "white-brown", "馬鈴薯": "white-brown", "洋芋": "white-brown", "竹筍": "white-brown", "白芝麻": "white-brown", "花生": "white-brown", "核桃": "white-brown", "腰果": "white-brown", "杏仁": "white-brown", "無籽西瓜": "white-brown", "白精靈菇": "white-brown", "燕麥片": "white-brown",
  // 黑色 (black)
  "黑木耳": "black", "木耳": "black", "黑豆": "black", "黑芝麻": "black", "黑米": "black", "海帶": "black", "紫菜": "black", "昆布": "black", "黑棗": "black", "奇亞籽": "black", "黑香菇": "black", "髮菜": "black"
};

// 2. 植物顏色智能判斷核心
function classifyPlantColor(plantName) {
  const name = plantName.trim();
  if (!name) return null;
  
  // A. 優先檢查使用者自定義記憶庫
  const customColors = getCustomPlantColors();
  if (customColors[name]) {
    return customColors[name];
  }
  
  // B. 檢查內建預設資料庫
  if (PLANT_DATABASE[name]) {
    return PLANT_DATABASE[name];
  }
  
  // C. 關鍵字規則模糊比對
  if (name.includes("紅") || name.includes("莓") || name.includes("櫻桃") || name.includes("石榴") || name.includes("西瓜")) return "red";
  if (name.includes("橘") || name.includes("黃") || name.includes("橙") || name.includes("南瓜") || name.includes("地瓜") || name.includes("芒果") || name.includes("玉米") || name.includes("鳳梨")) return "orange-yellow";
  if (name.includes("綠") || name.includes("青") || name.includes("茶") || name.includes("菜") || name.includes("瓜") || (name.includes("豆") && !name.includes("黑") && !name.includes("紅") && !name.includes("黃"))) return "green";
  if (name.includes("紫") || name.includes("藍") || name.includes("葡萄") || name.includes("桑椹")) return "blue-purple";
  if (name.includes("白") || name.includes("蒜") || name.includes("菇") || name.includes("豆腐") || name.includes("山藥") || name.includes("杏仁") || name.includes("糙米") || name.includes("薏仁")) return "white-brown";
  if (name.includes("黑") || name.includes("海帶") || name.includes("紫菜") || name.includes("昆布") || name.includes("芝麻")) return "black";
  
  return null; // 未知植物，交給前端介面詢問
}

// 3. 暫存待分類的未知植物名稱
let pendingUnknownPlant = "";

// 4. 生理與指標模組初始化
window.initBiometrics = function() {
  const formSleep = document.getElementById("form-sleep");
  const formNap = document.getElementById("form-nap");
  const formQuickHrv = document.getElementById("form-quick-hrv-form");
  
  // A. 上床與起床時間連動自動計算時數
  const bedtimeInput = document.getElementById("sleep-bedtime");
  const wakeupInput = document.getElementById("sleep-wakeup");
  const durationInput = document.getElementById("sleep-duration");

  function autoCalcSleepHours() {
    if (bedtimeInput.value && wakeupInput.value) {
      const bTime = new Date(bedtimeInput.value);
      const wTime = new Date(wakeupInput.value);
      const diffMs = wTime.getTime() - bTime.getTime();
      if (diffMs > 0) {
        const hours = diffMs / (1000 * 60 * 60);
        durationInput.value = hours.toFixed(1);
      }
    }
  }
  if (bedtimeInput && wakeupInput) {
    bedtimeInput.addEventListener("change", autoCalcSleepHours);
    wakeupInput.addEventListener("change", autoCalcSleepHours);
  }

  const sleepDateInput = document.getElementById("sleep-date");
  if (sleepDateInput) {
    sleepDateInput.addEventListener("change", (e) => {
      const selectedDate = e.target.value;
      if (!selectedDate) return;
      
      const logs = getSleepLogs().filter(l => l.status !== "deleted");
      const existingLog = logs.find(l => l.date.substring(0, 10) === selectedDate && l.type === "night");
      
      if (existingLog) {
        // 💡 如果選擇的日期已有主睡眠紀錄，自動載入帶入資料
        document.getElementById("sleep-id").value = existingLog.id;
        document.getElementById("sleep-bedtime").value = existingLog.bedtime || "";
        document.getElementById("sleep-wakeup").value = existingLog.wakeupTime || "";
        document.getElementById("sleep-duration").value = existingLog.sleepDuration ? Number(existingLog.sleepDuration).toFixed(1) : "";
        document.getElementById("sleep-hrv").value = existingLog.hrv || "";
        document.getElementById("sleep-deep").value = existingLog.deepSleep ? Number(existingLog.deepSleep).toFixed(1) : "";
        document.getElementById("sleep-rem").value = existingLog.remSleep ? Number(existingLog.remSleep).toFixed(1) : "";
        
        const stressVal = (existingLog.stress !== undefined && existingLog.stress !== null) ? existingLog.stress : 20;
        document.getElementById("sleep-stress").value = stressVal;
        document.getElementById("sleep-stress-value").textContent = stressVal;
        
        const feelingVal = existingLog.feeling || "normal";
        selectSleepFeeling(feelingVal);
        
        document.getElementById("sleep-notes").value = existingLog.notes || "";
      } else {
        // 💡 如果選擇的日期沒有紀錄，重置回該日期的預設時間與預設值
        document.getElementById("sleep-id").value = "";
        
        const selDateObj = new Date(selectedDate);
        const yesterdayObj = new Date(selDateObj);
        yesterdayObj.setDate(yesterdayObj.getDate() - 1);
        const yesterdayStr = getLocalDateString(yesterdayObj);
        
        document.getElementById("sleep-bedtime").value = `${yesterdayStr}T23:00`;
        document.getElementById("sleep-wakeup").value = `${selectedDate}T07:00`;
        document.getElementById("sleep-duration").value = "8.0";
        document.getElementById("sleep-hrv").value = "";
        document.getElementById("sleep-deep").value = "";
        document.getElementById("sleep-rem").value = "";
        
        document.getElementById("sleep-stress").value = 20;
        document.getElementById("sleep-stress-value").textContent = "20";
        
        selectSleepFeeling("normal");
        document.getElementById("sleep-notes").value = "";
      }
    });
  }

  // B. 儲存夜間主睡眠
  if (formSleep) {
    formSleep.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("sleep-id").value || null;
      const date = document.getElementById("sleep-date").value;
      const bedtime = document.getElementById("sleep-bedtime").value;
      const wakeupTime = document.getElementById("sleep-wakeup").value;
      const sleepDuration = parseFloat(document.getElementById("sleep-duration").value);
      const hrv = parseInt(document.getElementById("sleep-hrv").value) || null;
      const deepSleep = parseFloat(document.getElementById("sleep-deep").value) || null;
      const remSleep = parseFloat(document.getElementById("sleep-rem").value) || null;
      const stress = parseInt(document.getElementById("sleep-stress").value);
      const feeling = document.getElementById("sleep-feeling").value;
      const notes = document.getElementById("sleep-notes").value.trim();
      
      saveSleepLog({
        id, date, type: "night", bedtime, wakeupTime, sleepDuration, hrv, deepSleep, remSleep, stress, feeling, notes
      });
      
      document.getElementById("modal-sleep").close();
      renderApp();
      renderHistory();
      triggerBackgroundSync();
    });
  }

  // C. 儲存白日小睡
  if (formNap) {
    formNap.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("nap-id").value || null;
      const date = document.getElementById("nap-date").value;
      const durationMins = parseFloat(document.getElementById("nap-duration").value);
      const notes = document.getElementById("nap-notes").value.trim();
      
      saveSleepLog({
        id, date, type: "nap", sleepDuration: durationMins / 60, notes
      });
      
      document.getElementById("modal-nap").close();
      renderApp();
      renderHistory();
      triggerBackgroundSync();
    });
  }

  // D. 快速更新 HRV 彈窗儲存
  if (formQuickHrv) {
    formQuickHrv.addEventListener("submit", (e) => {
      e.preventDefault();
      const date = document.getElementById("quick-hrv-date").value;
      const hrvVal = parseInt(document.getElementById("quick-hrv-val").value);
      
      const logs = getSleepLogs();
      // 優先找當晚的主睡眠紀錄更新
      const todayNightLog = logs.find(l => l.date.substring(0, 10) === date && l.type === "night" && l.status !== "deleted");
      if (todayNightLog) {
        todayNightLog.hrv = hrvVal;
        saveSleepLog(todayNightLog);
      } else {
        // 若無，則建立一筆極簡的主睡眠外框，方便之後補登
        saveSleepLog({
          date, type: "night", sleepDuration: 0, hrv: hrvVal
        });
      }
      
      document.getElementById("modal-quick-hrv-dialog").close();
      renderApp();
      renderHistory();
      triggerBackgroundSync();
    });
  }
}

// 5. 快速小睡/HRV/睡眠登錄輔助觸發
window.openQuickNapModal = function() {
  const form = document.getElementById("form-nap");
  if (form) form.reset();
  document.getElementById("nap-id").value = "";
  document.getElementById("nap-date").value = getLocalDateString();
  document.getElementById("modal-nap").showModal();
  lucide.createIcons();
};

window.openQuickHrvModal = function() {
  const form = document.getElementById("form-quick-hrv-form");
  if (form) form.reset();
  document.getElementById("quick-hrv-date").value = getLocalDateString();
  document.getElementById("modal-quick-hrv-dialog").showModal();
  lucide.createIcons();
};

window.openNewSleepForm = function() {
  const detailModal = document.getElementById("modal-sleep-detail");
  if (detailModal && detailModal.open) detailModal.close();
  
  // 💡 防呆：如果今天已經有夜間主睡眠紀錄，則直接呼叫 editRecord 進入編輯模式，防止填寫過的資料被覆蓋重設
  const todayStr = getLocalDateString();
  const logs = getSleepLogs().filter(l => l.status !== "deleted");
  const existingLog = logs.find(l => l.date.substring(0, 10) === todayStr && l.type === "night");
  
  if (existingLog) {
    editRecord("sleep", existingLog.id);
    return;
  }
  
  const form = document.getElementById("form-sleep");
  if (form) form.reset();
  document.getElementById("sleep-id").value = "";
  
  document.getElementById("sleep-date").value = todayStr;
  
  // 預先帶入預設時間 (上床 23:00 - 起床 07:00)
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = getLocalDateString(yesterday);
  
  document.getElementById("sleep-bedtime").value = `${yStr}T23:00`;
  document.getElementById("sleep-wakeup").value = `${todayStr}T07:00`;
  document.getElementById("sleep-duration").value = "8.0";
  document.getElementById("sleep-stress-value").textContent = "20";
  document.getElementById("sleep-stress").value = 20;
  
  // 💡 預設起床體感為正常精神
  selectSleepFeeling("normal");
  
  document.getElementById("modal-sleep").showModal();
  lucide.createIcons();
};

// 6. 今日睡眠自動提示邏輯與防打擾
window.checkDailySleepPrompt = function() {
  // 💡 如果目前使用者已經打開睡眠或小睡的填寫彈窗，就直接跳過，不打擾輸入
  const modalSleep = document.getElementById("modal-sleep");
  const modalNap = document.getElementById("modal-nap");
  if ((modalSleep && modalSleep.open) || (modalNap && modalNap.open)) return;

  const todayStr = getLocalDateString();
  const logs = getSleepLogs();
  
  // 檢查今天是否有夜間主睡眠紀錄
  const hasSleepToday = logs.some(l => l.date.substring(0, 10) === todayStr && l.type === "night" && l.status !== "deleted");
  if (hasSleepToday) return;
  
  // 檢查今天是否已標記「無紀錄/免提醒」
  const skipDate = localStorage.getItem("pain_tracker_sleep_prompt_no_record");
  if (skipDate === todayStr) return;
  
  // 若均無，彈出提醒
  document.getElementById("lbl-auto-sleep-yesterday-date").textContent = todayStr;
  const modalAuto = document.getElementById("modal-auto-sleep");
  if (modalAuto && !modalAuto.open) {
    modalAuto.showModal();
    lucide.createIcons();
  }
};

window.markAutoSleepNoRecord = function() {
  const todayStr = getLocalDateString();
  localStorage.setItem("pain_tracker_sleep_prompt_no_record", todayStr);
  document.getElementById("modal-auto-sleep").close();
};

window.triggerAutoSleepLogging = function() {
  document.getElementById("modal-auto-sleep").close();
  openNewSleepForm();
};

// 7. 彩虹飲食首頁直接輸入與顏色判斷
window.submitQuickDiet = function() {
  const inputEl = document.getElementById("input-quick-diet");
  const plantName = inputEl.value.trim();
  if (!plantName) return;
  
  const todayStr = getLocalDateString();
  const color = classifyPlantColor(plantName);
  
  if (color) {
    // 成功識別顏色，直接記錄
    saveRainbowDietLog({
      date: todayStr,
      plantName: plantName,
      color: color
    });
    inputEl.value = "";
    alert(`🥗 成功記錄吃了「${plantName}」(${getColorChineseName(color)})！`);
    renderApp();
    renderHistory();
    triggerBackgroundSync();
  } else {
    // 未知植物，彈出顏色指派介面
    pendingUnknownPlant = plantName;
    document.getElementById("lbl-unknown-plant-name").textContent = plantName;
    document.getElementById("quick-diet-color-picker").style.display = "block";
  }
};

// 使用者手動指派未知植物的顏色
window.assignColorToUnknown = function(color) {
  if (!pendingUnknownPlant) return;
  
  const todayStr = getLocalDateString();
  
  // 1. 記錄到本地客製資料庫學習
  saveCustomPlantColor(pendingUnknownPlant, color);
  
  // 2. 寫入彩虹飲食紀錄
  saveRainbowDietLog({
    date: todayStr,
    plantName: pendingUnknownPlant,
    color: color
  });
  
  // 3. 重設 UI 狀態
  alert(`🥗 已記下「${pendingUnknownPlant}」為 ${getColorChineseName(color)}，以後將會自動識別！`);
  pendingUnknownPlant = "";
  document.getElementById("input-quick-diet").value = "";
  document.getElementById("quick-diet-color-picker").style.display = "none";
  
  renderApp();
  renderHistory();
  triggerBackgroundSync();
};

function getColorChineseName(color) {
  const names = {
    "red": "紅色",
    "orange-yellow": "橘黃色",
    "green": "綠色",
    "blue-purple": "藍紫色",
    "white-brown": "白褐色",
    "black": "黑色"
  };
  return names[color] || color;
}

// 8. 儀表板指標卡片渲染邏輯
window.renderDailyHabits = function() {
  const todayStr = getLocalDateString();
  const sleepLogs = getSleepLogs().filter(l => l.status !== "deleted");
  const dietLogs = getRainbowDietLogs().filter(l => l.status !== "deleted");
  
  // ------------------ A. 渲染睡眠卡片 ------------------
  const todaySleepLogs = sleepLogs.filter(l => l.date.substring(0, 10) === todayStr);
  const mainSleep = todaySleepLogs.find(l => l.type === "night");
  const naps = todaySleepLogs.filter(l => l.type === "nap");
  
  const totalHoursText = document.getElementById("val-sleep-hours");
  const goalBadge = document.getElementById("badge-sleep-goal");
  const deepLbl = document.getElementById("lbl-deep-hours");
  const remLbl = document.getElementById("lbl-rem-hours");
  const lightLbl = document.getElementById("lbl-light-hours");
  const napLbl = document.getElementById("val-sleep-nap");
  const stressLbl = document.getElementById("val-sleep-stress");
  const progressStacked = document.getElementById("sleep-phases-bar");
  
  if (mainSleep) {
    const totalMain = mainSleep.sleepDuration;
    const napTotalHours = naps.reduce((sum, n) => sum + n.sleepDuration, 0);
    const grandTotal = totalMain + napTotalHours;
    
    if (totalHoursText) totalHoursText.textContent = grandTotal.toFixed(1);
    
    // 檢查 7 小時目標 (包含小睡)
    if (grandTotal >= 7) {
      if (goalBadge) goalBadge.style.display = "inline-flex";
      if (progressStacked) progressStacked.classList.add("goal-achieved");
    } else {
      if (goalBadge) goalBadge.style.display = "none";
      if (progressStacked) progressStacked.classList.remove("goal-achieved");
    }
    
    // 計算階段比例
    const deep = mainSleep.deepSleep || 0;
    const rem = mainSleep.remSleep || 0;
    const light = Math.max(0, totalMain - deep - rem);
    
    if (deepLbl) deepLbl.textContent = `${deep.toFixed(1)}h`;
    if (remLbl) remLbl.textContent = `${rem.toFixed(1)}h`;
    if (lightLbl) lightLbl.textContent = `${light.toFixed(1)}h`;
    
    // 設定進度條比例
    if (progressStacked) {
      const segments = progressStacked.querySelectorAll(".progress-segment");
      if (segments.length === 3) {
        const deepPct = totalMain > 0 ? (deep / totalMain) * 100 : 0;
        const remPct = totalMain > 0 ? (rem / totalMain) * 100 : 0;
        const lightPct = totalMain > 0 ? (light / totalMain) * 100 : 0;
        
        segments[0].style.width = `${deepPct}%`;
        segments[1].style.width = `${remPct}%`;
        segments[2].style.width = `${lightPct}%`;
      }
    }
    
    if (stressLbl) stressLbl.textContent = `壓力：${mainSleep.stress || '-'}`;
    
    // 💡 檢查深眠佔比 20% 目標
    const deepRatio = totalMain > 0 ? (deep / totalMain) * 100 : 0;
    const deepGoalBadge = document.getElementById("badge-deep-sleep-goal");
    if (deepGoalBadge) {
      deepGoalBadge.style.display = deepRatio >= 20 ? "inline-flex" : "none";
    }
    
    // 💡 顯示起床體感
    const feelingVal = mainSleep.feeling || "";
    const feelingMap = {
      "excellent": "🤩",
      "normal": "🙂",
      "tired": "🥱",
      "sore": "🥵",
      "poor": "🤢"
    };
    const feelingEl = document.getElementById("val-sleep-feeling");
    if (feelingEl) {
      feelingEl.textContent = feelingMap[feelingVal] || "";
    }
    
    const napMins = Math.round(napTotalHours * 60);
    if (napLbl) napLbl.textContent = napMins > 0 ? `小睡：${napMins} 分鐘` : "小睡：無";
  } else {
    // 無今日睡眠主記錄
    if (totalHoursText) totalHoursText.textContent = "-";
    if (goalBadge) goalBadge.style.display = "none";
    
    const deepGoalBadge = document.getElementById("badge-deep-sleep-goal");
    if (deepGoalBadge) deepGoalBadge.style.display = "none";
    const feelingEl = document.getElementById("val-sleep-feeling");
    if (feelingEl) feelingEl.textContent = "";
    
    if (progressStacked) {
      progressStacked.classList.remove("goal-achieved");
      const segments = progressStacked.querySelectorAll(".progress-segment");
      segments.forEach(s => s.style.width = "0%");
    }
    if (deepLbl) deepLbl.textContent = "0h";
    if (remLbl) remLbl.textContent = "0h";
    if (lightLbl) lightLbl.textContent = "0h";
    if (stressLbl) stressLbl.textContent = "壓力：-";
    
    const napTotalHours = naps.reduce((sum, n) => sum + n.sleepDuration, 0);
    const napMins = Math.round(napTotalHours * 60);
    if (napLbl) napLbl.textContent = napMins > 0 ? `小睡：${napMins} 分鐘` : "小睡：無";
  }
  
  // ------------------ B. 渲染 HRV 卡片 ------------------
  const valHrvText = document.getElementById("val-hrv");
  const lblHrvTrend = document.getElementById("lbl-hrv-trend");
  
  if (mainSleep && mainSleep.hrv) {
    if (valHrvText) valHrvText.textContent = mainSleep.hrv;
    
    // 計算今日的 21 天滾動基線
    const todayBaseline = calculateRollingHrvBaseline(todayStr, sleepLogs);
    if (todayBaseline) {
      const latest = mainSleep.hrv;
      if (lblHrvTrend) {
        if (latest >= todayBaseline.min && latest <= todayBaseline.max) {
          lblHrvTrend.innerHTML = `HRV <strong style="color:#7f8e81">🟢 正常</strong>`;
        } else if (latest < todayBaseline.min) {
          lblHrvTrend.innerHTML = `HRV <strong style="color:#c4998e">🟠 壓力大</strong>`;
        } else {
          lblHrvTrend.innerHTML = `HRV <strong style="color:#8fa0b5">🔵 恢復佳</strong>`;
      }
      }
    } else {
      // 歷史不夠 21 天，使用暫時平均對照
      const tempNightLogs = sleepLogs.filter(l => l.type === "night" && l.hrv && l.date.substring(0, 10) !== todayStr);
      if (tempNightLogs.length > 0) {
        const sumHrv = tempNightLogs.reduce((sum, l) => sum + l.hrv, 0);
        const avgHrv = Math.round(sumHrv / tempNightLogs.length);
        const diff = mainSleep.hrv - avgHrv;
        if (lblHrvTrend) {
          if (diff > 0) {
            lblHrvTrend.innerHTML = `與歷史平均相比：<strong style="color:#8fa0b5">📈 較佳 (+${diff} ms)</strong> — 恢復良好。`;
          } else if (diff < 0) {
            lblHrvTrend.innerHTML = `與歷史平均相比：<strong style="color:#c4998e">📉 較差 (${diff} ms)</strong> — 留意疲勞。`;
          } else {
            lblHrvTrend.innerHTML = `與歷史平均相比：<strong>持平</strong>`;
          }
        }
      } else {
        if (lblHrvTrend) lblHrvTrend.textContent = "基準線計算中（請持續記錄）";
      }
    }
  } else {
    if (valHrvText) valHrvText.textContent = "-";
    if (lblHrvTrend) lblHrvTrend.textContent = "今日尚未登錄 HRV。";
  }

  // ------------------ C. 渲染彩虹飲食卡片 ------------------
  const startOfWeek = getStartOfWeek(new Date());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  
  // 取得本週所有的飲食紀錄
  const currentWeekDietLogs = dietLogs.filter(log => {
    const logTime = new Date(log.date).getTime();
    return logTime >= startOfWeek.getTime() && logTime < endOfWeek.getTime();
  });
  
  // 計算本週植物多樣性 (不重複植物種類數)
  const uniquePlantsThisWeek = new Set(currentWeekDietLogs.map(l => l.plantName.trim()));
  const dietCount = uniquePlantsThisWeek.size;
  
  const dietCountVal = document.getElementById("val-diet-count");
  if (dietCountVal) dietCountVal.textContent = dietCount;
  
  // 更新進度條與彩虹漸層
  const dietProgressFill = document.getElementById("diet-progress-fill");
  const dietProgressPct = Math.min(100, (dietCount / 30) * 100);
  if (dietProgressFill) {
    dietProgressFill.style.width = `${dietProgressPct}%`;
    if (dietCount >= 30) {
      dietProgressFill.classList.add("rainbow-gradient-fill");
      const achBadge = document.getElementById("diet-achievement-badge");
      if (achBadge) achBadge.style.display = "inline-flex";
    } else {
      dietProgressFill.classList.remove("rainbow-gradient-fill");
      const achBadge = document.getElementById("diet-achievement-badge");
      if (achBadge) achBadge.style.display = "none";
    }
  }
  
  // 更新本週成就稱號
  let achievementText = "🌱 萌芽階段";
  if (dietCount >= 10 && dietCount < 20) {
    achievementText = "🌿 茂盛小溪";
  } else if (dietCount >= 20 && dietCount < 30) {
    achievementText = "🌳 綠意盎然";
  } else if (dietCount >= 30) {
    achievementText = "🌈 彩虹森林！";
  }
  const achLbl = document.getElementById("lbl-diet-achievement");
  if (achLbl) achLbl.textContent = achievementText;
  
  // 點亮今日已吃之顏色圈圈
  const todayDietLogs = dietLogs.filter(l => l.date.substring(0, 10) === todayStr);
  const eatenColorsToday = new Set(todayDietLogs.map(l => l.color));
  
  const indicators = document.querySelectorAll(".rainbow-indicators .rainbow-dot-indicator");
  const colorMapIndex = ["red", "orange-yellow", "green", "blue-purple", "white-brown", "black"];
  
  indicators.forEach((ind, idx) => {
    const targetColor = colorMapIndex[idx];
    if (eatenColorsToday.has(targetColor)) {
      ind.classList.remove("inactive");
      ind.classList.add("active");
      ind.textContent = "✓";
    } else {
      ind.classList.remove("active");
      ind.classList.add("inactive");
      ind.textContent = ind.getAttribute("title").substring(0,2);
    }
  });
};

// 9. 開啟睡眠統計詳情彈窗
window.openSleepDetailModal = function() {
  const sleepLogs = getSleepLogs().filter(l => l.status !== "deleted");
  
  // 計算主睡眠、小睡、總計的日平均值
  const nightLogs = sleepLogs.filter(l => l.type === "night" && l.sleepDuration > 0);
  const napLogs = sleepLogs.filter(l => l.type === "nap");
  
  const avgMain = nightLogs.length > 0 ? (nightLogs.reduce((sum, l) => sum + l.sleepDuration, 0) / nightLogs.length).toFixed(1) : "-";
  const avgNap = napLogs.length > 0 ? (napLogs.reduce((sum, l) => sum + l.sleepDuration * 60, 0) / napLogs.length).toFixed(0) : "-";
  
  // 總睡眠日平均 (按有記錄的天數算)
  const uniqueSleepDays = Array.from(new Set(sleepLogs.map(l => l.date.substring(0, 10))));
  let avgTotal = "-";
  if (uniqueSleepDays.length > 0) {
    const grandSum = sleepLogs.reduce((sum, l) => sum + l.sleepDuration, 0);
    avgTotal = (grandSum / uniqueSleepDays.length).toFixed(1);
  }
  
  document.getElementById("avg-sleep-main").textContent = avgMain !== "-" ? `${avgMain}小時` : "-";
  document.getElementById("avg-sleep-nap").textContent = avgNap !== "-" ? `${avgNap}分鐘` : "-";
  document.getElementById("avg-sleep-total").textContent = avgTotal !== "-" ? `${avgTotal}小時` : "-";
  
  // 💡 計算主睡眠的平均壓力等級 (排除 null/undefined)
  const stressLogs = nightLogs.filter(l => l.stress !== undefined && l.stress !== null);
  const avgStress = stressLogs.length > 0 ? (stressLogs.reduce((sum, l) => sum + l.stress, 0) / stressLogs.length).toFixed(0) : "-";
  
  const avgStressValEl = document.getElementById("avg-sleep-stress");
  const avgStressLblEl = document.getElementById("avg-sleep-stress-lbl");
  if (avgStressValEl && avgStressLblEl) {
    avgStressValEl.textContent = avgStress !== "-" ? avgStress : "-";
    if (avgStress !== "-") {
      const stressNum = parseInt(avgStress);
      if (stressNum <= 15) {
        avgStressValEl.style.color = "#10b981";
        avgStressLblEl.innerHTML = `平均睡眠壓力 <span style="font-size:0.6rem; background:rgba(16,185,129,0.12); color:#10b981; padding:1px 4px; border-radius:4px; margin-left:2px; font-weight:600;">🟢 理想</span>`;
      } else {
        avgStressValEl.style.color = "#ea580c";
        avgStressLblEl.innerHTML = `平均睡眠壓力 <span style="font-size:0.6rem; background:rgba(234,88,12,0.12); color:#ea580c; padding:1px 4px; border-radius:4px; margin-left:2px; font-weight:600;">🟠 偏高</span>`;
      }
    } else {
      avgStressValEl.style.color = "var(--text-color)";
      avgStressLblEl.textContent = "平均睡眠壓力";
    }
  }
  
  // 計算連續達標天數 (7小時以上)
  const streak = getSleepStreak();
  document.getElementById("sleep-streak-text").textContent = `🔥 連續達標：${streak} 天`;
  
  // 💡 計算近 7 天深眠與低壓力達標率
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last7Days.push(getLocalDateString(d));
  }
  
  let loggedNightsCount = 0;
  let achievedDeepNightsCount = 0;
  let achievedStressNightsCount = 0;
  
  last7Days.forEach(dateStr => {
    const dayNightLog = sleepLogs.find(log => log.date.substring(0, 10) === dateStr && log.type === "night");
    if (dayNightLog) {
      loggedNightsCount++;
      const deep = dayNightLog.deepSleep || 0;
      const total = dayNightLog.sleepDuration || 0;
      const ratio = total > 0 ? (deep / total) * 100 : 0;
      if (ratio >= 20) {
        achievedDeepNightsCount++;
      }
      
      // 💡 檢查低壓力 (<= 15) 是否達標
      if (dayNightLog.stress !== undefined && dayNightLog.stress !== null && dayNightLog.stress <= 15) {
        achievedStressNightsCount++;
      }
    }
  });
  
  const deepAchText = document.getElementById("sleep-deep-achievement-text");
  if (deepAchText) {
    deepAchText.textContent = loggedNightsCount > 0 
      ? `🧬 深眠比例達標：${achievedDeepNightsCount} / ${loggedNightsCount} 天` 
      : `🧬 深眠比例達標：無紀錄`;
  }
  
  const stressAchText = document.getElementById("sleep-stress-achievement-text");
  if (stressAchText) {
    stressAchText.textContent = loggedNightsCount > 0 
      ? `🧘 低壓力達標：${achievedStressNightsCount} / ${loggedNightsCount} 天` 
      : `🧘 低壓力達標：無紀錄`;
  }
  
  // 繪製近 7 天睡眠 stacked CSS bar chart
  const container = document.getElementById("sleep-chart-container");
  if (container) {
    container.innerHTML = "";
    
    last7Days.forEach(dateStr => {
      const dayLogs = sleepLogs.filter(log => log.date.substring(0, 10) === dateStr);
      const nightLog = dayLogs.find(log => log.type === "night");
      const dayNaps = dayLogs.filter(log => log.type === "nap");
      
      const nHours = nightLog ? nightLog.sleepDuration : 0;
      const napHours = dayNaps.reduce((sum, n) => sum + n.sleepDuration, 0);
      
      const maxVal = 12;
      const nightPct = Math.min(100, (nHours / maxVal) * 100);
      const napPct = Math.min(100, (napHours / maxVal) * 100);
      
      const wrapper = document.createElement("div");
      wrapper.className = "chart-bar-wrapper";
      
      const bar = document.createElement("div");
      bar.className = "chart-bar-stacked";
      
      if (nHours > 0) {
        const nSeg = document.createElement("div");
        nSeg.className = "chart-bar-segment segment-night";
        nSeg.style.height = `${nightPct}%`;
        
        // 💡 根據睡眠壓力動態調整主睡眠柱體顏色與 Title 提示
        if (nightLog && nightLog.stress !== undefined && nightLog.stress !== null) {
          const stress = nightLog.stress;
          if (stress <= 15) {
            nSeg.style.backgroundColor = "#3d5a80"; // 🧘 深海藍 (低壓力)
            nSeg.title = `主睡眠: ${nHours.toFixed(1)}h (壓力: ${stress} 理想)`;
          } else if (stress <= 30) {
            nSeg.style.backgroundColor = "#90b3c4"; // 湖水藍 (普通壓力)
            nSeg.title = `主睡眠: ${nHours.toFixed(1)}h (壓力: ${stress} 普通)`;
          } else {
            nSeg.style.backgroundColor = "#b0c2cc"; // 煙燻灰藍 (高壓力)
            nSeg.title = `主睡眠: ${nHours.toFixed(1)}h (壓力: ${stress} 偏高)`;
          }
        } else {
          nSeg.style.backgroundColor = "#6f7f99"; // 預設藍 (無壓力資料)
          nSeg.title = `主睡眠: ${nHours.toFixed(1)}h`;
        }
        
        bar.appendChild(nSeg);
      }
      if (napHours > 0) {
        const napSeg = document.createElement("div");
        napSeg.className = "chart-bar-segment segment-nap";
        napSeg.style.height = `${napPct}%`;
        napSeg.title = `小睡: ${Math.round(napHours * 60)} 分鐘`;
        bar.appendChild(napSeg);
      }
      
      const label = document.createElement("div");
      label.className = "chart-label";
      const dateObj = new Date(dateStr);
      const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
      label.innerHTML = `<span style="font-weight:600; color:var(--text-color);">${(nHours + napHours).toFixed(1)}h</span><br>${dateStr.substring(8, 10)}<br>(${weekdays[dateObj.getDay()]})`;
      
      wrapper.appendChild(bar);
      wrapper.appendChild(label);
      container.appendChild(wrapper);
    });
  }
  
  document.getElementById("modal-sleep-detail").showModal();
  lucide.createIcons();
};

// 10. 開啟 HRV 統計詳情彈窗
// 💡 HRV 個人基準線計算：取得目標日期往前的 21 天主睡眠 HRV 滾動平均值 ± 1 標準差 (±1 SD)
function calculateRollingHrvBaseline(targetDateStr, allLogs) {
  const targetDateObj = new Date(targetDateStr);
  const startTime = new Date(targetDateObj);
  startTime.setDate(targetDateObj.getDate() - 20); // 包含當天往前共 21 天
  
  const windowLogs = allLogs.filter(log => {
    if (log.status === "deleted" || log.type !== "night" || !log.hrv) return false;
    const logTime = new Date(log.date.substring(0, 10)).getTime();
    return logTime >= startTime.getTime() && logTime <= targetDateObj.getTime();
  });
  
  if (windowLogs.length === 0) return null;
  
  const hrvValues = windowLogs.map(l => l.hrv);
  const n = hrvValues.length;
  const mean = hrvValues.reduce((sum, v) => sum + v, 0) / n;
  
  let stdDev = 0;
  if (n > 1) {
    const variance = hrvValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (n - 1);
    stdDev = Math.sqrt(variance);
  } else {
    stdDev = mean * 0.1; // fallback
  }
  
  stdDev = Math.max(3, stdDev); // 防呆，標準差不小於 3
  
  return {
    mean: mean,
    stdDev: stdDev,
    min: mean - stdDev,
    max: mean + stdDev,
    loggedDays: n
  };
}

// 10. 開啟 HRV 統計詳情彈窗
window.openHrvDetailModal = function() {
  // 💡 先開啟彈窗，確保無數據時也能開窗顯示提示訊息，而不是點擊無反應
  document.getElementById("modal-hrv-detail").showModal();
  
  const allLogs = getSleepLogs().filter(l => l.status !== "deleted");
  const nightLogsWithHrv = allLogs.filter(l => l.type === "night" && l.hrv);
  
  const todayStr = getLocalDateString();
  const todayNightLog = allLogs.find(l => l.date.substring(0, 10) === todayStr && l.type === "night" && l.hrv);
  const todayHrv = todayNightLog ? todayNightLog.hrv : null;
  
  // 計算今日的 21 天滾動基線
  const todayBaseline = calculateRollingHrvBaseline(todayStr, allLogs);
  
  // A. 更新詳情彈窗上方的資訊卡片
  const todayValEl = document.getElementById("hrv-today-val");
  if (todayValEl) {
    todayValEl.textContent = todayHrv !== null ? `${todayHrv} ms` : "-";
  }
  
  const rangeEl = document.getElementById("hrv-baseline-range");
  if (rangeEl) {
    rangeEl.textContent = todayBaseline 
      ? `${Math.round(todayBaseline.min)} - ${Math.round(todayBaseline.max)} ms` 
      : "-";
  }
  
  const statusEl = document.getElementById("hrv-status-badge");
  if (statusEl) {
    if (todayHrv === null) {
      statusEl.textContent = "-";
      statusEl.style.color = "var(--text-muted)";
    } else if (todayBaseline) {
      if (todayHrv >= todayBaseline.min && todayHrv <= todayBaseline.max) {
        statusEl.textContent = "🟢 正常";
        statusEl.style.color = "#7f8e81";
      } else if (todayHrv < todayBaseline.min) {
        statusEl.textContent = "🔴 恢復較差";
        statusEl.style.color = "#c4998e";
      } else {
        statusEl.textContent = "🔵 恢復較佳";
        statusEl.style.color = "#8fa0b5";
      }
    } else {
      // 數據不足 21 天的臨時對照
      const tempAvg = nightLogsWithHrv.length > 0 ? nightLogsWithHrv.reduce((sum, l) => sum + l.hrv, 0) / nightLogsWithHrv.length : 50;
      if (todayHrv >= tempAvg - 5 && todayHrv <= tempAvg + 5) {
        statusEl.textContent = "🟢 正常 (計算中)";
        statusEl.style.color = "#7f8e81";
      } else if (todayHrv < tempAvg - 5) {
        statusEl.textContent = "🔴 較差 (計算中)";
        statusEl.style.color = "#c4998e";
      } else {
        statusEl.textContent = "🔵 較佳 (計算中)";
        statusEl.style.color = "#8fa0b5";
      }
    }
  }

  // 💡 更新 HRV 生理狀態解說內容
  const explanationDescEl = document.getElementById("hrv-explanation-desc");
  if (explanationDescEl) {
    if (todayHrv === null) {
      explanationDescEl.textContent = "今日尚未登錄 HRV。請於睡眠表單中記錄以取得個人生理狀態解析。";
    } else {
      let isWithin = false;
      let isBelow = false;
      let isAbove = false;
      if (todayBaseline) {
        isWithin = todayHrv >= todayBaseline.min && todayHrv <= todayBaseline.max;
        isBelow = todayHrv < todayBaseline.min;
        isAbove = todayHrv > todayBaseline.max;
      } else {
        // Fallback 近似對照
        const tempAvg = nightLogsWithHrv.length > 0 ? nightLogsWithHrv.reduce((sum, l) => sum + l.hrv, 0) / nightLogsWithHrv.length : 50;
        isWithin = todayHrv >= tempAvg - 5 && todayHrv <= tempAvg + 5;
        isBelow = todayHrv < tempAvg - 5;
        isAbove = todayHrv > tempAvg + 5;
      }
      
      if (isWithin) {
        explanationDescEl.innerHTML = "今日 HRV 落在您的個人基線內。這通常代表您的<strong>自主神經系統平衡穩定</strong>，身體恢復與生理壓力維持在健康的正常狀態，可照常進行工作或運動。";
      } else if (isBelow) {
        explanationDescEl.innerHTML = "今日 HRV 低於您的個人基線。可能與<strong>疲勞累積、睡眠不足、心理壓力過大、發炎/生病、飲酒</strong>或前日進行高強度訓練有關，代表身體恢復欠佳，建議今日適度減壓並注重休養。";
      } else if (isAbove) {
        explanationDescEl.innerHTML = "今日 HRV 高於您的個人基線。這通常代表您的<strong>身體恢復良好、壓力較低、睡眠充足且精力充沛</strong>。但請注意：<strong>若 HRV 異常偏高且持續數天</strong>，建議觀察是否伴隨其他身體不適或變化。";
      }
    }
  }
  
  // B. 繪製近 7 天 HRV 趨勢與包絡基準線 SVG
  const container = document.getElementById("hrv-chart-container");
  if (container) {
    container.innerHTML = "";
    
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(getLocalDateString(d));
    }
    
    // 計算這 7 天中每一天的 HRV 數值與滾動基準線
    const chartData = last7Days.map(dateStr => {
      const log = allLogs.find(l => l.date.substring(0, 10) === dateStr && l.type === "night");
      const hrvVal = log ? log.hrv || null : null;
      
      let baseline = calculateRollingHrvBaseline(dateStr, allLogs);
      // Fallback：當歷史數據不夠 21 天，使用全部歷史 HRV 的平均值與標準差作為近似包絡線，防範畫面出現空白區域
      if (!baseline && nightLogsWithHrv.length > 0) {
        const hrvVals = nightLogsWithHrv.map(l => l.hrv);
        const mean = hrvVals.reduce((sum, v) => sum + v, 0) / hrvVals.length;
        let std = 0;
        if (hrvVals.length > 1) {
          const variance = hrvVals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (hrvVals.length - 1);
          std = Math.sqrt(variance);
        } else {
          std = mean * 0.1;
        }
        std = Math.max(3, std);
        baseline = { mean, stdDev: std, min: mean - std, max: mean + std };
      }
      
      return {
        dateStr: dateStr,
        hrv: hrvVal,
        baseline: baseline
      };
    });
    
    // 尋找 Y 軸上下界
    let yValues = [];
    chartData.forEach(d => {
      if (d.hrv !== null) yValues.push(d.hrv);
      if (d.baseline) {
        yValues.push(d.baseline.min);
        yValues.push(d.baseline.max);
      }
    });
    
    if (yValues.length === 0) {
      container.innerHTML = `<div style="display:flex; align-items:center; justify-content:center; height:100%; font-size:0.8rem; color:var(--text-dim);">尚無充足 HRV 數據紀錄</div>`;
      return;
    }
    
    const minVal = Math.min(...yValues);
    const maxVal = Math.max(...yValues);
    // 💡 y 軸根據資料範圍動態調整 (縮小 padding 至 2 ms) 以最大化圖表佔比，防範過多空白
    const chartMin = Math.max(0, Math.floor(minVal - 2));
    const chartMax = Math.ceil(maxVal + 2);
    
    // SVG 面板設定 (420 x 140)
    const svgWidth = 420;
    const svgHeight = 140;
    const paddingX = 35;
    const paddingY = 22;
    
    const getX = (idx) => paddingX + (idx / 6) * (svgWidth - 2 * paddingX);
    const getY = (val) => {
      if (chartMax === chartMin) return svgHeight / 2;
      return paddingY + (1 - (val - chartMin) / (chartMax - chartMin)) * (svgHeight - 2 * paddingY);
    };
    
    let svgHtml = `<svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="100%" style="overflow:visible;">`;
    
    // 1. 繪製灰色基線封包區 (Polygon)
    let topPoints = [];
    let bottomPoints = [];
    chartData.forEach((d, idx) => {
      if (d.baseline) {
        const x = getX(idx);
        const yMin = getY(d.baseline.min);
        const yMax = getY(d.baseline.max);
        topPoints.push(`${x},${yMax}`);
        bottomPoints.unshift(`${x},${yMin}`);
      }
    });
    
    if (topPoints.length > 0) {
      const polygonPoints = [...topPoints, ...bottomPoints].join(" ");
      // 包絡背景面
      svgHtml += `<polygon points="${polygonPoints}" fill="rgba(120, 120, 120, 0.12)" stroke="none" />`;
      
      // 上下界邊緣虛線
      let topPath = "M " + topPoints.map(p => p.replace(",", " ")).join(" L ");
      let bottomPath = "M " + bottomPoints.reverse().map(p => p.replace(",", " ")).join(" L ");
      svgHtml += `<path d="${topPath}" fill="none" stroke="rgba(120, 120, 120, 0.28)" stroke-width="1" stroke-dasharray="3,3" />`;
      svgHtml += `<path d="${bottomPath}" fill="none" stroke="rgba(120, 120, 120, 0.28)" stroke-width="1" stroke-dasharray="3,3" />`;
    }
    
    // 2. 繪製 HRV 趨勢折線 (Line)
    let linePoints = [];
    chartData.forEach((d, idx) => {
      if (d.hrv !== null) {
        linePoints.push(`${getX(idx)},${getY(d.hrv)}`);
      }
    });
    
    if (linePoints.length > 1) {
      const pathD = "M " + linePoints.map(p => p.replace(",", " ")).join(" L ");
      svgHtml += `<path d="${pathD}" fill="none" stroke="rgba(127, 142, 129, 0.5)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`;
    }
    
    // 3. 繪製節點圓圈與數值與 X 軸標籤
    const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
    chartData.forEach((d, idx) => {
      const x = getX(idx);
      
      // 日期與星期標籤
      const dateObj = new Date(d.dateStr);
      svgHtml += `<text x="${x}" y="123" text-anchor="middle" font-size="8.5" fill="var(--text-muted)" font-weight="500">${d.dateStr.substring(8, 10)}</text>`;
      svgHtml += `<text x="${x}" y="133" text-anchor="middle" font-size="8" fill="var(--text-dim)">(${weekdays[dateObj.getDay()]})</text>`;
      
      // 數據節點
      if (d.hrv !== null) {
        const y = getY(d.hrv);
        
        // 基於基準線判定今日狀態色彩
        let color = "#7f8e81"; // 🟢 正常 (預設)
        if (d.baseline) {
          if (d.hrv < d.baseline.min) {
            color = "#c4998e"; // 🔴 較差
          } else if (d.hrv > d.baseline.max) {
            color = "#8fa0b5"; // 🔵 較佳
          }
        }
        
        // 外圓點
        svgHtml += `<circle cx="${x}" cy="${y}" r="4.5" fill="${color}" stroke="#ffffff" stroke-width="1.5" style="filter: drop-shadow(0px 1px 2px rgba(0,0,0,0.1));" />`;
        // 頂部數值
        svgHtml += `<text x="${x}" y="${y - 9}" text-anchor="middle" font-size="8.5" fill="var(--text-color)" font-weight="600">${d.hrv}</text>`;
      } else {
        // 無記錄節點輔助小灰點
        svgHtml += `<circle cx="${x}" cy="${getY(chartMin + (chartMax-chartMin)/2)}" r="2" fill="rgba(150,150,150,0.15)" />`;
      }
    });
    
    svgHtml += "</svg>";
    container.innerHTML = svgHtml;
  }
  
  lucide.createIcons();
};

// 11. 開啟彩虹飲食週統計彈窗
window.openDietDetailModal = function() {
  const dietLogs = getRainbowDietLogs().filter(l => l.status !== "deleted");
  const startOfWeek = getStartOfWeek(new Date());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  
  // 篩選本週紀錄
  const weekLogs = dietLogs.filter(log => {
    const logTime = new Date(log.date).getTime();
    return logTime >= startOfWeek.getTime() && logTime < endOfWeek.getTime();
  });
  
  const uniquePlants = new Set(weekLogs.map(l => l.plantName.trim()));
  const totalCount = uniquePlants.size;
  
  // 更新本週稱號進度
  let titleBadgeText = "🌱 萌芽階段";
  if (totalCount >= 10 && totalCount < 20) titleBadgeText = "🌿 茂盛小溪";
  else if (totalCount >= 20 && totalCount < 30) titleBadgeText = "🌳 綠意盎然";
  else if (totalCount >= 30) titleBadgeText = "🌈 彩虹森林！";
  
  document.getElementById("diet-badge-text").textContent = `${titleBadgeText} (${totalCount} / 30 種)`;
  
  // 渲染歷週達標皇冠 (近 4 週)
  const crownsContainer = document.getElementById("diet-crowns-container");
  if (crownsContainer) {
    crownsContainer.innerHTML = "";
    
    const crowns = getDietWeeklyCrowns();
    crowns.forEach(c => {
      const crown = document.createElement("span");
      crown.className = `crown-badge ${c.earned ? 'earned' : ''}`;
      crown.innerHTML = `👑`;
      crown.title = `週起點 ${c.dateLabel}：吃了 ${c.count} 種植物 (${c.earned ? '已達標' : '未達標'})`;
      crownsContainer.appendChild(crown);
    });
  }
  
  // 依顏色分類渲染本週吃過的食材清單
  const categorizedList = document.getElementById("diet-categorized-list");
  if (categorizedList) {
    categorizedList.innerHTML = "";
    
    const colorMap = {
      "red": { label: "🔴 紅色植物", class: "rb-red" },
      "orange-yellow": { label: "🟡 橘黃植物", class: "rb-orange-yellow" },
      "green": { label: "🟢 綠色植物", class: "rb-green" },
      "blue-purple": { label: "🔵 藍紫植物", class: "rb-blue-purple" },
      "white-brown": { label: "⚪ 白褐植物", class: "rb-white-brown" },
      "black": { label: "⚫ 黑色植物", class: "rb-black" }
    };
    
    Object.keys(colorMap).forEach(colorKey => {
      const colorInfo = colorMap[colorKey];
      const colorPlantLogs = weekLogs.filter(l => l.color === colorKey);
      
      // 依食材名稱排重以顯示
      const uniquePlantsInColor = [];
      const seenPlants = new Set();
      colorPlantLogs.forEach(l => {
        const name = l.plantName.trim();
        if (!seenPlants.has(name)) {
          seenPlants.add(name);
          uniquePlantsInColor.push(l);
        }
      });
      
      if (uniquePlantsInColor.length > 0) {
        const group = document.createElement("div");
        group.className = "diet-list-group";
        
        const title = document.createElement("div");
        title.className = `diet-list-title ${colorInfo.class}`;
        if (colorKey === "white-brown") {
          title.style.color = "#555";
          title.style.border = "1px solid #ccc";
        } else {
          title.style.color = "#fff";
        }
        title.textContent = `${colorInfo.label} (${uniquePlantsInColor.length} 種)`;
        
        const itemsContainer = document.createElement("div");
        itemsContainer.className = "diet-list-items";
        
        uniquePlantsInColor.forEach(log => {
          const itemTag = document.createElement("span");
          itemTag.className = "diet-item-tag";
          itemTag.innerHTML = `${escapeHTML(log.plantName)} <span style="color:var(--text-dim); margin-left:4px; cursor:pointer;" onclick="deleteRecord('diet', '${log.id}'); document.getElementById('modal-diet-detail').close();">×</span>`;
          itemsContainer.appendChild(itemTag);
        });
        
        group.appendChild(title);
        group.appendChild(itemsContainer);
        categorizedList.appendChild(group);
      }
    });
    
    if (totalCount === 0) {
      categorizedList.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-dim); font-size:0.8rem;">本週尚未記錄任何植物，快在首頁輸入框加菜吧！</div>`;
    }
  }
  
  document.getElementById("modal-diet-detail").showModal();
  lucide.createIcons();
};

// 12. 計算彩虹飲食週度達標狀態 (近 4 週)
function getDietWeeklyCrowns() {
  const dietLogs = getRainbowDietLogs().filter(log => log.status !== "deleted");
  const crowns = [];
  
  const now = new Date();
  const startOfThisWeek = getStartOfWeek(now);
  
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(startOfThisWeek);
    weekStart.setDate(startOfThisWeek.getDate() - i * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    const weekLogs = dietLogs.filter(log => {
      const logTime = new Date(log.date).getTime();
      return logTime >= weekStart.getTime() && logTime < weekEnd.getTime();
    });
    
    const uniquePlants = new Set(weekLogs.map(l => l.plantName.trim()));
    const earned = uniquePlants.size >= 30;
    
    crowns.push({
      count: uniquePlants.size,
      earned: earned,
      dateLabel: `${weekStart.getMonth()+1}/${weekStart.getDate()}`
    });
  }
  
  return crowns;
}

// 13. 計算睡眠連續達標天數 (主睡眠 >= 7小時)
function getSleepStreak() {
  const sleepLogs = getSleepLogs()
    .filter(log => log.status !== "deleted" && log.type === "night" && log.sleepDuration >= 7)
    .map(log => log.date.substring(0, 10));
  
  if (sleepLogs.length === 0) return 0;
  
  const uniqueDates = Array.from(new Set(sleepLogs)).sort((a, b) => new Date(b) - new Date(a));
  
  let streak = 0;
  const todayStr = getLocalDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);
  
  if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
    return 0;
  }
  
  let currentCheck = new Date(uniqueDates[0]);
  for (let i = 0; i < uniqueDates.length; i++) {
    const expectedStr = getLocalDateString(currentCheck);
    if (uniqueDates[i] === expectedStr) {
      streak++;
      currentCheck.setDate(currentCheck.getDate() - 1);
    } else {
      break;
    }
  }
  
  return streak;
}

// 初始化時間差預估功能
document.addEventListener("DOMContentLoaded", () => {
  if (typeof initSleepTimeAutoCalculator === "function") {
    initSleepTimeAutoCalculator();
  }
});

// =====================================================================
// 📸 Gemini AI 睡眠數據截圖自動辨識填入
// =====================================================================
window.importSleepScreenshot = async function(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  const apiKey = getGeminiKey();
  if (!apiKey) {
    alert("❌ 請先點擊首頁右上角設定按鈕（齒輪），填入您的 Gemini API Key！");
    event.target.value = "";
    return;
  }
  
  // 顯示加載指示器
  const uploadBtn = event.target.previousElementSibling;
  const originalText = uploadBtn.innerHTML;
  uploadBtn.disabled = true;
  uploadBtn.innerHTML = `<i data-lucide="loader" style="width:14px; height:14px; display:inline-block; animation: spin 1s linear infinite;"></i> 分析中...`;
  lucide.createIcons();
  
  try {
    // 💡 根據睡眠記錄表單上所設定的日期作為基準日期，以避免 AI 誤判年份 (例如 2024)
    const selectedDate = document.getElementById("sleep-date").value || getLocalDateString();
    const selDateObj = new Date(selectedDate);
    const yesterdayObj = new Date(selDateObj);
    yesterdayObj.setDate(yesterdayObj.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterdayObj);

    const promptParts = [
      {
        text: `You are an expert sleep data parser. Analyze these sleep metrics screenshots (usually in Chinese from Garmin, Apple Health, or other wearables).
You may receive multiple screenshots belonging to the same sleep session (e.g. one image containing sleep duration and sleep phases, and another image showing bedtime and wakeup times).
Synthesize all the uploaded screenshots and extract the following fields if they appear in any of the images:
1. "sleepDuration": Total sleep duration/time in bed in hours (as a float, e.g. 6.38 for 6h 23m. If it lists "持續時間" or "睡眠時間" or "時間" as "6時23分" or "6小時23分", convert to hours like 6.38).
2. "stress": Average stress level as an integer from 0 to 100 (e.g. 17).
3. "deepSleep": Deep sleep duration in hours (as a float, e.g. 1.77 for 1時46分).
4. "remSleep": REM sleep duration in hours (as a float, e.g. 0.33 for 20分).
5. "hrv": HRV value in ms (as an integer, e.g. 55).
6. "bedtime": Estimated bedtime in strict "YYYY-MM-DDTHH:MM" format (e.g. 2026-06-26T22:15). Default the date part to: ${yesterdayStr} unless the image explicitly shows a different date. Hours and minutes must be 2-digit (padded with zero if needed, e.g. 05:08, NOT 5:8).
7. "wakeupTime": Estimated wakeup time in strict "YYYY-MM-DDTHH:MM" format (e.g. 2026-06-27T06:23). Default the date part to: ${selectedDate} unless the image explicitly shows a different date. Hours and minutes must be 2-digit (padded with zero if needed, e.g. 05:08, NOT 5:8).
8. "notes": Any brief description of sleep patterns if visible.

Format your output ONLY as a valid JSON object. Do not include markdown code block formatting (e.g., do not wrap in \`\`\`json).
Example:
{
  "sleepDuration": 6.38,
  "stress": 17,
  "deepSleep": 1.77,
  "remSleep": 0.33,
  "hrv": null,
  "bedtime": "${yesterdayStr}T23:15",
  "wakeupTime": "${selectedDate}T06:23",
  "notes": "Garmin screenshot import"
}`
      }
    ];

    // 讀取所有選取的檔案並轉換成 Base64 parts
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64Data = await fileToBase64(file);
      const mimeType = file.type;
      const base64Content = base64Data.split(",")[1];
      
      promptParts.push({
        inlineData: {
          mimeType: mimeType,
          data: base64Content
        }
      });
    }
    
    // 呼叫 Gemini Vision API (採用與 pantry-tracker 相同的 gemini-2.5-flash 與 x-goog-api-key 標頭模式)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify({
        contents: [
          {
            parts: promptParts
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Gemini API 請求失敗，狀態碼：${response.status}`);
    }
    
    const result = await response.json();
    const textResponse = result.candidates[0].content.parts[0].text;
    
    // 去除 model 可能輸出的 markdown ```json 包裝
    let cleanJsonStr = textResponse.trim();
    if (cleanJsonStr.startsWith("```")) {
      cleanJsonStr = cleanJsonStr.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }
    
    const parsedData = JSON.parse(cleanJsonStr);
    
    // 自動填入睡眠表單欄位
    if (parsedData.sleepDuration) {
      document.getElementById("sleep-duration").value = Number(parsedData.sleepDuration).toFixed(1);
    }
    if (parsedData.stress !== undefined && parsedData.stress !== null) {
      document.getElementById("sleep-stress").value = parsedData.stress;
      document.getElementById("sleep-stress-value").textContent = parsedData.stress;
    }
    if (parsedData.deepSleep) {
      document.getElementById("sleep-deep").value = Number(parsedData.deepSleep).toFixed(1);
    }
    if (parsedData.remSleep) {
      document.getElementById("sleep-rem").value = Number(parsedData.remSleep).toFixed(1);
    }
    if (parsedData.hrv) {
      document.getElementById("sleep-hrv").value = parsedData.hrv;
    }
    if (parsedData.bedtime) {
      document.getElementById("sleep-bedtime").value = parsedData.bedtime;
    }
    if (parsedData.wakeupTime) {
      document.getElementById("sleep-wakeup").value = parsedData.wakeupTime;
    }
    if (parsedData.notes) {
      document.getElementById("sleep-notes").value = parsedData.notes;
    }
    
    alert("🎉 睡眠截圖解讀成功，數據已自動填入欄位！");
    
  } catch (err) {
    console.error("截圖解讀出錯:", err);
    alert("❌ 截圖解析失敗，請確認 API Key 是否正確，或手動填入數據。錯誤原因：" + err.message);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.innerHTML = originalText;
    event.target.value = ""; // 重設上傳欄位
    lucide.createIcons();
  }
};

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}