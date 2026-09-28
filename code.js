const SPREADSHEET_ID = "1sGChL20nBGCyorIxb0qnpt8RzQc1LYzdoOwPX0dsiBo";
const SHEET_NAME = "Sheet1";

function doPost(e) {
  try {

    // Read FormData sent from website
    const wallet = String(e.parameter.wallet || "")
      .trim()
      .toLowerCase();

    const username = String(e.parameter.x_username || "")
      .trim()
      .replace(/^@/, "")
      .toLowerCase();

    const retweet = String(e.parameter.retweet_url || "")
      .trim();

    // Validate required fields
    if (!wallet || !username || !retweet) {
      return response({
        success: false,
        message: "Missing required fields."
      });
    }

    // Open Google Sheet
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return response({
        success: false,
        message: "Sheet not found."
      });
    }

    // Get existing registrations
    const lastRow = sheet.getLastRow();

    if (lastRow >= 2) {

      const rows = sheet
        .getRange(2, 1, lastRow - 1, 4)
        .getValues();

      for (let i = 0; i < rows.length; i++) {

        const existingWallet = String(rows[i][0] || "")
          .trim()
          .toLowerCase();

        const existingUsername = String(rows[i][1] || "")
          .trim()
          .replace(/^@/, "")
          .toLowerCase();

        // Duplicate wallet
        if (existingWallet === wallet) {

          return response({
            success: false,
            message: "This NEAR wallet has already been registered."
          });
        }

        // Duplicate X username
        if (existingUsername === username) {

          return response({
            success: false,
            message: "This X username has already been registered."
          });
        }
      }
    }

    // Save new registration
    sheet.appendRow([
      wallet,
      "@" + username,
      retweet,
      new Date()
    ]);

    // Success
    return response({
      success: true,
      message: "Registration successful. Thanks for joining."
    });

  } catch (error) {

    return response({
      success: false,
      message: "Server error."
    });
  }
}


// JSON response
function response(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return ContentService
    .createTextOutput("MEEP Airdrop API is working")
    .setMimeType(ContentService.MimeType.TEXT);
}