/**
 * Class to protect sheets styles, formulas, values
 */
var ProtectSheet=new function(){
	/**
	 * suffix for hidden file name
	 * @type {String}
	 */
	var hiddenSuffix="_hidden";

	/**
	 * clone a sheet
	 * @param  {String} name the name of the sheet
	 */
	this.cloneGoogleSheet=function(name) {
	  var hSheetName=name+hiddenSuffix;
	  var ss = SpreadsheetApp.getActiveSpreadsheet();
	  var sheet = ss.getSheetByName(name).copyTo(ss);

	  /* Before cloning the sheet, delete any previous copy */
	  var old = ss.getSheetByName(hSheetName);
	  if (old) ss.deleteSheet(old); // or old.setName(new Name);

	  SpreadsheetApp.flush(); // Utilities.sleep(2000);
	  sheet.setName(hSheetName).hideSheet();

	}

	/**
	 * protect the sheet for unauthenticated users
	 * @param  {object} e onedit event
	 */
	this.onEdit=function(e) {
	   var ss = SpreadsheetApp.getActiveSpreadsheet();
	   var sheet = ss.getActiveSheet();
	   var cloneSheet = ss.getSheetByName(sheet.getName()+hiddenSuffix);
	   var cell = sheet.getActiveCell();
	   var editRange = e.range;
	   var cloneRange = cloneSheet.getRange(editRange.getA1Notation())
	   var editCol = editRange.getColumn();

	   if(!cloneSheet ) return;

	   if(e.oldValue){
		  Browser.msgBox('old value is defined as ' + cloneRange.getFormula());
		  e.range.setValue(cloneRange.getFormula());
	   } else {
		  e.range.clear();
	  }
	}

};
