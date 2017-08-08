/**
 * class to cache the SpreadsheetApp
 * @return {[type]} [description]
 */
SpreadSheetCache = new function() {
  var activeSheet = null;
  var activeRange = null;
  var activeCell = null;
  var activeSpreadSheet = null;
  var activeSheetValues = null;





  /**
   * Returns a two-dimensional array of values, indexed by row, then by column for the whole sheet
   * @return {array} a two-dimensional array of values
   */
  this.getActiveSheetValues = function() {
      var s;
      if (!activeSheetValues) {
          s = this.getActiveSheet();
          activeSheetValues = s.getSheetValues(1, 1, s.getLastRow(), s.getLastColumn());
      }
      return activeSheetValues;
  };

  /**
   * Gets the active sheet in a spreadsheet
   * @return {object} the active sheet in the spreadsheet
   */
  this.getActiveSheet = function() {
    activeSheet = activeSheet || this.getActiveSpreadsheet().getActiveSheet();
    return activeSheet;
  };

  /**
   * Returns the currently active spreadsheet, or null if there is none.
   * @return {object}  the active Spreadsheet object
   */
  this.getActiveSpreadsheet = function() {
    activeSpreadSheet = activeSpreadSheet || SpreadsheetApp.getActiveSpreadsheet();
    return activeSpreadSheet;
  };

  /**
   * Returns the active range for the active sheet. Returns the range of cells that is currently considered active.
   * @return {object} the active range
   */
  this.getActiveRange = function() {
    activeRange = activeRange || this.getActiveSheet().getActiveRange();
    return activeRange;
  };

  /**
   * Returns the active cell in this sheet.
   * @return {object} the active cell
   */
  this.getActiveCell = function() {
    activeCell = activeCell || this.getActiveSheet().getActiveCell();
    return activeCell;
  };

};
