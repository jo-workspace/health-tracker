// =====================================================================
// Google Apps Script (Code.gs) - 完整健康追蹤器同步腳本
// =====================================================================

// 自訂 API Token（若有設定，需與前端網頁設定的值相同。留空表示免驗證）
var API_TOKEN = ""; 

/**
 * 處理來自靜態網頁 (REST API Mode) 的 POST 請求
 */
function doPost(e) {
  try {
    var requestData = JSON.parse(e.postData.contents);
    
    // 驗證 Token (選填)
    if (API_TOKEN && requestData.apiToken !== API_TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "驗證 Token 錯誤，同步拒絕。"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var result = syncDataFromClient(requestData);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 客戶端數據與試算表雙向合併同步的核心邏輯
 */
function syncDataFromClient(payload) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 各工作表名稱與其對應的欄位表頭
  var sheetsConfig = {
    painLogs: {
      name: "PainLogs",
      headers: ["id", "date", "location", "intensity", "trigger", "notes", "status", "lastUpdated"]
    },
    longTermLogs: {
      name: "LongTermLogs",
      headers: ["id", "date", "itemName", "sizeWidth", "sizeHeight", "sizeDepth", "hospital", "doctor", "nextCheckupDate", "notes", "status", "lastUpdated"]
    },
    biteSplintLogs: {
      name: "BiteSplintLogs",
      headers: ["id", "date", "status", "lastUpdated"]
    },
    tmySymptomsLogs: {
      name: "TMJSymptomsLogs", // 💡 精確對齊原版試算表大寫名稱 TMJSymptomsLogs
      headers: ["id", "date", "symptoms", "medication", "status", "lastUpdated"]
    },
    sleepLogs: {
      name: "SleepLogs",
      headers: ["id", "date", "type", "bedtime", "fallAsleepTime", "wakeupTime", "sleepDuration", "deepSleep", "remSleep", "lightSleep", "stress", "feeling", "hrv", "notes", "lastUpdated"]
    },
    rainbowDietLogs: {
      name: "RainbowDietLogs",
      headers: ["id", "date", "plantName", "color", "lastUpdated"]
    }
  };
  
  var responsePayload = { status: "success" };
  
  // 遍歷所有配置，進行雙向合併
  for (var key in sheetsConfig) {
    var config = sheetsConfig[key];
    var sheet = ss.getSheetByName(config.name);
    
    // 💡 自動偵測：若工作表不存在，則自動新增工作表並寫入表頭欄位
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
      sheet.appendRow(config.headers);
    }
    
    var serverLogs = getLogsFromSheet(sheet, config.headers);
    var clientLogs = payload[key] || [];
    
    // 進行雙向資料合併：以 id 為主鍵，lastUpdated 最新者獲勝
    var mergedMap = {};
    
    // 放入伺服器舊資料
    serverLogs.forEach(function(item) {
      if (item.id) mergedMap[item.id] = item;
    });
    
    // 合併客戶端新資料
    clientLogs.forEach(function(item) {
      if (item.id) {
        var existing = mergedMap[item.id];
        if (!existing || Number(item.lastUpdated) > Number(existing.lastUpdated)) {
          mergedMap[item.id] = item;
        }
      }
    });
    
    var mergedList = Object.keys(mergedMap).map(function(id) {
      return mergedMap[id];
    });
    
    // 💡 物理刪除對齊：寫回 Google Sheet 時排除已刪除紀錄，維持試算表版面乾淨
    var sheetList = mergedList.filter(function(item) {
      return item.status !== "deleted";
    });
    
    // 將合併後的最新資料寫回工作表
    saveLogsToSheet(sheet, sheetList, config.headers);
    
    // 回傳包含已刪除標記的完整合併清單給前端，以正確同步本機快取
    responsePayload[key] = mergedList;
  }
  
  return responsePayload;
}

/**
 * 自工作表讀取資料並轉換為 JSON 物件陣列
 */
function getLogsFromSheet(sheet, headers) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return []; // 只有表頭，無資料
  
  var dataRange = sheet.getRange(2, 1, lastRow - 1, headers.length);
  var values = dataRange.getValues();
  
  return values.map(function(row) {
    var obj = {};
    headers.forEach(function(header, idx) {
      var val = row[idx];
      // 處理日期格式轉為 ISO String
      if (val instanceof Date) {
        if (val.getHours() === 0 && val.getMinutes() === 0 && val.getSeconds() === 0) {
          obj[header] = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
        } else {
          obj[header] = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd'T'HH:mm");
        }
      } else {
        obj[header] = val;
      }
    });
    return obj;
  });
}

/**
 * 將 JSON 物件陣列完全覆寫寫回工作表
 */
function saveLogsToSheet(sheet, logs, headers) {
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, headers.length).clearContent();
  }
  
  if (logs.length === 0) return;
  
  var rows = logs.map(function(log) {
    return headers.map(function(header) {
      return log[header] !== undefined ? log[header] : "";
    });
  });
  
  sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
}
