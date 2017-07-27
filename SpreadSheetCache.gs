/**
 * class to cache the SpreadsheetApp
 * @return {[type]} [description]
 */
SpreadSheetCache = new function() {
  var activeSheet = null;
  var activeRange = null;
  var activeCell = null;
  var activeSpreadSheet = null;


  this.getActiveSheet = function() {
    activeSheet = activeSheet || this.getActiveSpreadsheet().getActiveSheet();
    return activeSheet;
  };
  this.getActiveSpreadsheet = function() {
    activeSpreadSheet = activeSpreadSheet || SpreadsheetApp.getActiveSpreadsheet();
    return activeSpreadSheet;
  };
  this.getActiveRange = function() {
    activeRange = activeRange || this.getActiveSheet().getActiveRange();
    return activeRange;
  };
  this.getActiveCell = function() {
    activeCell = activeCell || this.getActiveSheet().getActiveCell();
    return activeCell;
  };
};
