Utility=new AmisLib.UtilityClass();

/**
 * open amis Sidebar
 */
Utility.openSidebar = function() {
	dbName = Config.dbName;
	apiKey = Config.apiKey;
	countryCell = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange( Config.Sheet.countryCell ).getValue();
	datasourceCell = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange( Config.Sheet.datasourceCell ).getValue();
	devMode = Config.devMode;
	var html = HtmlService.createTemplateFromFile( 'amisMenu' )
		.evaluate()
		.setTitle( 'Amis' )
		.setWidth( 500 )
		.setSandboxMode( HtmlService.SandboxMode.IFRAME );
	SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
		.showSidebar( html );
};

/**
 * create Amisi menu
 */
Utility.createAmisMenu = function() {

	//create the menu voice
	SpreadsheetApp.getUi()
		.createMenu( 'AMIS' )
		.addItem( 'Open', 'AmisMarketApp.openSidebar' )
		.addToUi()
};

/**
 * check if the current spreadsheet is Master
 * @return {bool} true if master, false otherwise
 */
Utility.isMaster = function() {
	return SpreadsheetApp.getActiveSpreadsheet().getName().indexOf( Config.masterKeyword ) > 0;
};

/**
 * check if the current spreadsheet is Master
 * @param {object} sheet [optional] the sheet
 * @return {bool} true if template, false otherwise
 */
Utility.isTemplate = function(sheet) {
	sheet=sheet||SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
	return sheet.getName().indexOf( Config.templatePrefix ) === 0;
};

/**
 * show/hide all templates in the spreadsheet
 * @param  {bool} show true to show all templates, false to hide
 */
Utility.toggleTemplates=function(show){
	var sheets=SpreadSheetCache.getActiveSpreadsheet().getSheets(),s;

	for (var _i = 0, sheets_length=sheets.length; _i<sheets_length; _i++) {
		s=sheets[_i];
		if(this.isTemplate(s)){
			if (show) {
				s.showSheet();
			} else {
				s.hideSheet();
			}
		}
	}
};


/**
 * includes html files into an html
 * @param  {string} filename
 * @return {string}          the content
 * @todo this function cannot access to the template from AmisLib.Utility
 */
Utility.include = function( filename ) {
	return HtmlService.createTemplateFromFile( filename ).evaluate().getContent();
};
