// Paste this over the existing doPost in the Apps Script project, then
// Deploy > Manage deployments > (pencil) > Version: New version > Deploy.
// Changes vs. the previous version are marked "DEDUPE".

function doPost(e) {
    // --- CONFIGURATION ---
    var SHEET_NAME = "Limelight_Feedback_Form";
    // Ensure this list of keys EXACTLY matches the form fields defined in your Angular component (commentsForm).
    // The ORDER in this list MUST MATCH the sequential order of data columns in your Google Sheet (after Timestamp).
    const ANGULAR_KEY_ORDER = [
        "Name", "Occupation", "Date_of_Birth", "Wedding_Anniversary", "Contact_Number",
        "Email", "Address", "Date_of_Visit", "Hospitality", "Attention", "Taste",
        "Food_Temperature", "Food_Presentation", "Decor", "Cleanliness",
        "How_Did_You_Hear", "Dishes_Liked", "Dishes_Disliked", "Any_Suggestions",
        "Manager_Visit", "Return_to_Palace", "Table_No", "Steward", "Manager"
    ];
    // DEDUPE: how long a submissionId is remembered (CacheService max is 21600s = 6h)
    var DEDUPE_TTL_SECONDS = 21600;

    // --- STANDARD RESPONSE STRUCTURE FOR CORS/SUCCESS ---
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) {
        return ContentService.createTextOutput(JSON.stringify({
            'result': 'error',
            'message': 'Server busy, please try again.'
        })).setMimeType(ContentService.MimeType.JSON);
    }

    try {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var sheet = ss.getSheetByName(SHEET_NAME);

        if (!sheet) {
            throw new Error("Sheet not found! Please verify the sheet name: " + SHEET_NAME);
        }

        // 1. Parse incoming data (sent as JSON string in e.parameter.data)
        var content = e.parameter.data;
        if (!content) {
            throw new Error("No data found in the request parameters (e.parameter.data is null).");
        }
        var data = JSON.parse(content);
        Logger.log("Incoming Angular Data Payload: " + JSON.stringify(data));

        // DEDUPE: if this submissionId was already written, report success without appending.
        // The check runs inside the lock, so concurrent requests are serialised.
        var cache = CacheService.getScriptCache();
        var cacheKey = data.submissionId ? "sub_" + data.submissionId : null;
        if (cacheKey && cache.get(cacheKey)) {
            Logger.log("Duplicate submissionId skipped: " + data.submissionId);
            return ContentService.createTextOutput(JSON.stringify({
                'result': 'success',
                'message': 'Duplicate submission ignored.'
            })).setMimeType(ContentService.MimeType.JSON);
        }

        // 2. Read all headers from Row 1
        var lastCol = sheet.getLastColumn();
        if (lastCol === 0) {
            throw new Error("Sheet is empty. Cannot determine column structure.");
        }
        var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

        // 3. Initialize the row array to the exact width of the sheet
        var row = new Array(lastCol).fill('');

        // 4. Determine the insertion index for the Timestamp (Column A, Index 0 is standard)
        var timestampIndex = -1;

        // Search for the timestamp column index
        for (var i = 0; i < headers.length; i++) {
            var normalizedHeader = String(headers[i]).trim().toUpperCase();
            if (normalizedHeader === "TIMESTAMP" || normalizedHeader === "TIME STAMP" || normalizedHeader === "DATE/TIME") {
                timestampIndex = i;
                break;
            }
        }

        // If not explicitly found, assume index 0 is reserved for it, provided the sheet is wide enough
        // to hold the timestamp plus all form fields.
        if (timestampIndex === -1 && lastCol >= ANGULAR_KEY_ORDER.length) {
            timestampIndex = 0; // Assume the first column is the Timestamp column
        }

        var dataInsertionIndex = 0; // Default start point for data

        if (timestampIndex !== -1) {
            row[timestampIndex] = new Date();
            Logger.log("Timestamp inserted at column index: " + timestampIndex);
            // Start data *after* the timestamp column.
            dataInsertionIndex = timestampIndex + 1;
        } else {
            Logger.log("WARNING: No dedicated TIMESTAMP column found or assumed. Data insertion starts at index 0.");
        }

        // 5. Populate the row using the fixed Angular keys sequentially.
        // submissionId is deliberately NOT in ANGULAR_KEY_ORDER, so it is never written to the sheet.
        for (var k = 0; k < ANGULAR_KEY_ORDER.length; k++) {
            var angularKey = ANGULAR_KEY_ORDER[k];
            var value = data[angularKey] === undefined ? '' : data[angularKey];

            if (dataInsertionIndex < lastCol) {

                // Defensive layer in highly unusual sheet setups where timestampIndex is not 0.
                if (dataInsertionIndex === timestampIndex && timestampIndex !== -1) {
                    Logger.log("Defensive skip of timestamp index: " + dataInsertionIndex);
                    dataInsertionIndex++;
                }

                row[dataInsertionIndex] = String(value);
                dataInsertionIndex++; // Move to the next column
            } else {
                Logger.log("WARNING: Ran out of sheet columns before processing all form fields.");
                break; // Stop if we run out of columns
            }
        }

        // Final sanity check: ensure the row is not entirely empty
        if (row.every(function(val) { return val === ''; })) {
            throw new Error("Row constructed is entirely empty. Check Angular keys vs. Sheet columns.");
        }

        // 6. Append the new row
        sheet.appendRow(row);
        Logger.log("Row successfully appended: " + row.join(" | "));

        // DEDUPE: remember this submission only after the row is safely written
        if (cacheKey) {
            cache.put(cacheKey, "1", DEDUPE_TTL_SECONDS);
        }

        // 7. Return a success response
        var output = { 'result': 'success', 'message': 'Data logged successfully.' };
        return ContentService.createTextOutput(JSON.stringify(output))
                             .setMimeType(ContentService.MimeType.JSON);

    } catch (error) {
        Logger.log("Apps Script Fatal Error: " + error.toString());
        var output = {
            'result': 'error',
            'message': 'Server Error: Check Apps Script Logs for details.'
        };
        return ContentService.createTextOutput(JSON.stringify(output))
                             .setMimeType(ContentService.MimeType.JSON);

    } finally {
        lock.releaseLock(); // Always release the lock
    }
}
