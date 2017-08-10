/**
 * open amis Sidebar
 */
AmisLib.Utility.prototype.openSidebar = function() {
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
AmisLib.Utility.prototype.createAmisMenu = function() {

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
AmisLib.Utility.prototype.isMaster = function() {
	return SpreadsheetApp.getActiveSpreadsheet().getName().indexOf( Config.masterKeyword ) > 0;
};

/**
 * check if the current spreadsheet is Master
 * @return {bool} true if master, false otherwise
 */
AmisLib.Utility.prototype.isTemplate = function() {
	return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getName().indexOf( Config.templatePrefix ) === 0;
};




Utility=new AmisLib.Utility();

/**
 * includes html files into an html
 * @param  {string} filename
 * @return {string}          the content
 * @todo this function cannot access to the template from AmisLib.Utility
 */
Utility.include = function( filename ) {
	return HtmlService.createTemplateFromFile( filename ).evaluate().getContent();
};
