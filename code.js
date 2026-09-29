const SPREADSHEET_ID = "1sGChL20nBGCyorIxb0qnpt8RzQc1LYzdoOwPX0dsiBo";
const SHEET_NAME = "Sheet1";

// GANTI URL INI dengan post campaign MEEP yang sebenarnya
const CAMPAIGN_POST_URL =
  "https://x.com/MEEPNear/status/1961234567890123456";


function doPost(e) {

  const lock = LockService.getScriptLock();

  try {

    // Mencegah 2 orang mendaftar wallet yang sama secara bersamaan
    lock.waitLock(10000);

    const wallet = String(
      e && e.parameter && e.parameter.wallet || ""
    )
      .trim()
      .toLowerCase();

    const username = String(
      e && e.parameter && e.parameter.x_username || ""
    )
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

    const retweet = String(
      e && e.parameter && e.parameter.retweet_url || ""
    )
      .trim();

    const honeypot = String(
      e && e.parameter && e.parameter.website || ""
    )
      .trim();


    // Bot protection
    if (honeypot) {
      return resultPage(
        false,
        "Invalid submission.",
        false
      );
    }


    // Required fields
    if (!wallet || !username || !retweet) {
      return resultPage(
        false,
        "Please complete all required fields.",
        false
      );
    }


    // Open spreadsheet
    const spreadsheet =
      SpreadsheetApp.openById(SPREADSHEET_ID);

    const sheet =
      spreadsheet.getSheetByName(SHEET_NAME);


    if (!sheet) {
      return resultPage(
        false,
        "Sheet not found. Please contact the team.",
        false
      );
    }


    // =========================
    // CHECK DUPLICATES
    // =========================

    const lastRow = sheet.getLastRow();

    if (lastRow >= 2) {

      const rows = sheet
        .getRange(
          2,
          1,
          lastRow - 1,
          4
        )
        .getValues();


      for (let i = 0; i < rows.length; i++) {

        const existingWallet =
          String(rows[i][0] || "")
            .trim()
            .toLowerCase();


        const existingUsername =
          String(rows[i][1] || "")
            .trim()
            .replace(/^@/, "")
            .toLowerCase();


        // =========================
        // DUPLICATE WALLET
        // =========================

        if (existingWallet === wallet) {

          return resultPage(
            false,
            "This NEAR wallet has already been registered.",
            false
          );
        }


        // =========================
        // DUPLICATE X USERNAME
        // =========================

        if (existingUsername === username) {

          return resultPage(
            false,
            "This X username has already been registered.",
            false
          );
        }

      }

    }


    // =========================
    // SAVE REGISTRATION
    // =========================

    sheet.appendRow([
      wallet,
      "@" + username,
      retweet,
      new Date()
    ]);


    SpreadsheetApp.flush();


    // =========================
    // SUCCESS
    // =========================

    return resultPage(
      true,
      "Registration successful. Redirecting you to X...",
      true
    );


  } catch (error) {

    return resultPage(
      false,
      "Server error. Please try again.",
      false
    );


  } finally {

    try {
      lock.releaseLock();
    } catch (ignore) {}

  }

}



// ==================================================
// RESULT PAGE
// ==================================================

function resultPage(
  success,
  message,
  redirectToX
) {

  const safeMessage =
    escapeHtml(message);

  const redirectUrl =
    escapeHtml(CAMPAIGN_POST_URL);


  let redirectScript = "";


  if (redirectToX) {

    redirectScript =
      '<script>' +
      'setTimeout(function(){' +
      'window.location.href="' +
      redirectUrl +
      '";' +
      '},1500);' +
      '</script>';

  }


  const action = redirectToX

    ? '<a class="btn" href="' +
      redirectUrl +
      '">OPEN X CAMPAIGN</a>'

    : '<a class="btn ghost" href="https://meepswap.fun/airdrop/">BACK TO AIRDROP</a>';


  const title =
    success
      ? "SUCCESS"
      : "NOT REGISTERED";


  const color =
    success
      ? "#72f5bd"
      : "#ff9c9c";


  const html =

    '<!doctype html>' +

    '<html>' +

    '<head>' +

    '<meta name="viewport" content="width=device-width,initial-scale=1">' +

    '<title>MEEP Airdrop</title>' +

    '<style>' +

    'body{' +
    'margin:0;' +
    'background:#050706;' +
    'color:#f2f5e9;' +
    'font-family:Arial,sans-serif;' +
    'display:flex;' +
    'min-height:100vh;' +
    'align-items:center;' +
    'justify-content:center;' +
    '}' +

    '.card{' +
    'width:min(520px,calc(100% - 40px));' +
    'padding:32px;' +
    'border:1px solid #26332c;' +
    'border-radius:24px;' +
    'background:#0a0f0d;' +
    'text-align:center;' +
    '}' +

    'h1{' +
    'color:' + color + ';' +
    'font-size:36px;' +
    '}' +

    'p{' +
    'color:#aeb9b1;' +
    'line-height:1.6;' +
    '}' +

    '.btn{' +
    'display:inline-block;' +
    'margin-top:18px;' +
    'padding:14px 22px;' +
    'border-radius:999px;' +
    'background:#72f5bd;' +
    'color:#03140c;' +
    'text-decoration:none;' +
    'font-weight:700;' +
    '}' +

    '.ghost{' +
    'background:transparent;' +
    'color:#72f5bd;' +
    'border:1px solid #72f5bd;' +
    '}' +

    '</style>' +

    '</head>' +

    '<body>' +

    '<div class="card">' +

    '<h1>' +
    title +
    '</h1>' +

    '<p>' +
    safeMessage +
    '</p>' +

    action +

    '</div>' +

    redirectScript +

    '</body>' +

    '</html>';


  return ContentService

    .createTextOutput(html)

    .setMimeType(
      ContentService.MimeType.HTML
    );

}



// ==================================================
// ESCAPE HTML
// ==================================================

function escapeHtml(value) {

  return String(value)

    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");

}



// ==================================================
// TEST API
// ==================================================

function doGet() {

  return ContentService

    .createTextOutput(
      "MEEP Airdrop API is working"
    )

    .setMimeType(
      ContentService.MimeType.TEXT
    );

}