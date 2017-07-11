/**
 * Class to protect sheets styles, formulas, values
 */
var ProtectSheet=function(){

	/**
	 * clone a sheet
	 * @param  {String} name the name of the sheet
	 */
	this.cloneGoogleSheet=function(name) {
	  var hSheetName=name+"_hidden";
	  var ss = SpreadsheetApp.getActiveSpreadsheet();
	  var sheet = ss.getSheetByName(name).copyTo(ss);

	  /* Before cloning the sheet, delete any previous copy */
	  var old = ss.getSheetByName(hSheetName);
	  if (old) ss.deleteSheet(old); // or old.setName(new Name);

	  SpreadsheetApp.flush(); // Utilities.sleep(2000);
	  sheet.setName(hSheetName);

	}
};
