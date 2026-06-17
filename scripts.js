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
const KEY_SYNC_URL     = "pain_tracker_sync_url";
const KEY_LAST_SYNCED  = "pain_tracker_last_synced";
const KEY_API_TOKEN    = "pain_tracker_api_token";

function generateUUID() {
  return 'uuid-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
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

  const payload = {
    painLogs: localPainLogs,
    longTermLogs: localLtLogs,
    biteSplintLogs: localSplintLogs,
    tmySymptomsLogs: localTmyLogs // 打包帶走症狀
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
  // 先初始化不依賴 modal DOM 的部分
  initNavigation();
  initDataManagement();

  // 載入彈窗片段後，再初始化依賴 modal DOM 的部分
  loadModals().then(() => {
    initModals();
    initSettingsModal();
    renderApp();
    triggerBackgroundSync(true);
    lucide.createIcons();
  }).catch(err => {
    // fallback：若 fetch 失敗（例如直接用 file:// 開啟），嘗試用已存在的 modal
    console.warn("modals.html fetch 失敗，嘗試使用 inline modals：", err);
    initModals();
    initSettingsModal();
    renderApp();
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
    
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("lt-date").value = today;
    
    modalLongTerm.showModal();
    lucide.createIcons();
  });

  // 關閉 Modal 的通用按鈕
  document.querySelectorAll(".btn-close-modal").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute("data-target");
      document.getElementById(targetId).close();
    });
  });

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
    updateSettingsSyncStatus();
    modalSettings.showModal();
    lucide.createIcons();
  });

  // 儲存設定
  formSettings.addEventListener("submit", (e) => {
    e.preventDefault();
    saveSyncUrl(document.getElementById("settings-sync-url").value);
    saveApiToken(document.getElementById("settings-api-token").value);
    modalSettings.close();
    updateSyncStatusHeader();
    if (getSyncUrl()) triggerBackgroundSync();
  });

  // 立即同步按鈕
  btnManualSync.addEventListener("click", async () => {
    // 先暫存目前輸入值
    saveSyncUrl(document.getElementById("settings-sync-url").value);
    saveApiToken(document.getElementById("settings-api-token").value);

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
    const existing = latestItemsMap.get(log.itemName);
    if (!existing || new Date(log.date) > new Date(existing.date) || (new Date(log.date).getTime() === new Date(existing.date).getTime() && log.lastUpdated > existing.lastUpdated)) {
      latestItemsMap.set(log.itemName, log);
    }
  });
  
  const latestItems = Array.from(latestItemsMap.values());
  latestItems.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  // 🔄 先在外面把顳顎關節近 30 天的統計數據算好，避免在字串內解析出錯
  const tmyLogs = getTmySymptomsLogs ? getTmySymptomsLogs() : [];
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
  const recentLogs = tmyLogs.filter(l => new Date(l.date).getTime() >= thirtyDaysAgo);
  
  let symptomCount = 0;
  let medCount = 0;
  recentLogs.forEach(l => {
    if (l.symptoms) symptomCount += l.symptoms.split(',').filter(Boolean).length;
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
    
    const clinicInfo = log.hospital || log.doctor ? ` | 就醫: ${log.hospital} ${log.doctor}` : "";
    
    card.innerHTML = `
      <div class="lt-card-header">
        <span class="lt-title">${escapeHTML(log.itemName)}</span>
        <span class="lt-size-badge" style="background: var(--primary-light); color: var(--primary); font-weight: 500;">
          更新於：${formatTimeAgo(log.lastUpdated)}
        </span>
      </div>
      <div class="lt-card-body">
        <div class="lt-info-row">
          <span class="lt-info-label">追蹤詳情</span>
          <span class="lt-info-value">起始: ${formatDateOnly(log.date)}${sizeStr}${clinicInfo}</span>
        </div>
        ${log.nextCheckupDate ? `
        <div class="lt-info-row" style="background: rgba(245,158,11,0.05); padding: 4px 8px; border-radius: 4px; margin-top: 4px;">
          <span class="lt-info-label" style="color: #d97706; font-weight: 500;">📅 下次預約</span>
          <span class="lt-info-value" style="color: #d97706; font-weight: bold;">${formatDateOnly(log.nextCheckupDate)}</span>
        </div>
        ` : ""}
        ${log.notes ? `
        <div class="lt-info-row" style="margin-top: 6px; align-items: flex-start;">
          <span class="lt-info-label">備忘備註</span>
          <span class="lt-info-value" style="white-space: pre-wrap; background: #f9f9f9; padding: 6px; border-radius: 4px; display: block; width: 100%;">${escapeHTML(log.notes)}</span>
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
              <button onclick="openTmySymptomsModal()" style="padding: 2px 10px; font-size: 0.9rem; font-weight: bold; background: #757A73; color: white; border: none; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; vertical-align: middle;">+</button>
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
        <div>
          <button class="card-btn card-btn-edit" onclick="prefillForNewCheckup('${log.id}')">
            <i data-lucide="calendar-plus" style="width:14px; height:14px;"></i> 新增回診紀錄
          </button>
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
  
  const today = new Date().toISOString().split("T")[0];
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
  
  const today = new Date().toISOString().split("T")[0];
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
    allRecords.push({ ...log, type: "longterm" });
  });

  splintLogs.forEach(log => {
    allRecords.push({ ...log, type: "splint", itemName: "顳顎關節-咬合板" });
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
      const clinicInfo = log.hospital || log.doctor ? ` | 就醫: ${log.hospital} ${log.doctor}` : "";
      
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
      `;
    }
    historyListContainer.appendChild(item);
  });
  lucide.createIcons();
}

window.editRecord = function(type, id) {
  if (type === "pain") {
    const logs = getPainLogs();
    const log  = logs.find(l => l.id === id);
    if (!log) return;
    
    document.getElementById("pain-id").value       = log.id;
    if (log.date) {  document.getElementById("pain-date").value = new Date(log.date).toISOString().split('T')[0];}
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
    if (log.date) {  document.getElementById("lt-date").value = new Date(log.date).toISOString().split('T')[0];}
    document.getElementById("lt-item-name").value   = log.itemName;
    document.getElementById("lt-size-w").value      = log.sizeWidth  || "";
    document.getElementById("lt-size-h").value      = log.sizeHeight || "";
    document.getElementById("lt-size-d").value      = log.sizeDepth  || "";
    document.getElementById("lt-hospital").value    = log.hospital   || "";
    document.getElementById("lt-doctor").value      = log.doctor     || "";
    if (log.nextCheckupDate) {  document.getElementById("lt-next-date").value = new Date(log.nextCheckupDate).toISOString().split('T')[0];}
    document.getElementById("lt-notes").value       = log.notes      || "";
    
    document.getElementById("modal-longterm").showModal();
  }
  lucide.createIcons();
};

window.deleteRecord = function(type, id) {
  if (confirm("您確定要刪除這筆記錄嗎？")) {
    if (type === "pain") {
      savePainLogsLocal(getPainLogs().filter(l => l.id !== id));
    } else {
      saveLongTermLogsLocal(getLongTermLogs().filter(l => l.id !== id));
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
      return date.toISOString().split('T')[0];
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
  const today = new Date().toISOString().split("T")[0];
  
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
function openTmySymptomsModal() {
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
    
    document.getElementById("form-tmy-symptoms").addEventListener("submit", (e) => {
      e.preventDefault();
      saveTmySymptomsFormResult();
    });
  }
  
  const checkboxes = modal.querySelectorAll("input[type='checkbox']");
  checkboxes.forEach(cb => cb.checked = false);
  
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
  
  yearlyLogs.forEach(l => {
    if (l.symptoms) {
      l.symptoms.split(',').forEach(s => {
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
      <div style="font-size:0.9rem; margin-bottom:15px; color:var(--text-muted);">
        累計記錄天數：<strong style="color:var(--primary)">${yearlyLogs.length}</strong> 天 (近 365 天)
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
  const today = new Date().toISOString().split("T")[0];
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
    date: today,
    symptoms: symptomsList.join(","),
    medication: medication
  };

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
