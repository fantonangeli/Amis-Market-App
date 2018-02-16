Utility=new AmisLib.UtilityClass(Config.devMode, Config.errorEmail);

/**
 * open amis Sidebar
 */
Utility.openSidebar = function() {
	var sheet=SpreadSheetCache.getActiveSheet();
	var spreadsheet=SpreadSheetCache.getActiveSpreadsheet();

	dbName = Config.dbName;
	apiKey = Config.apiKey;
	countryCell = sheet.getRange( Config.Sheet.countryCell ).getValue();
	datasourceCell = sheet.getRange( Config.Sheet.datasourceCell ).getValue();
	devMode = Config.devMode;
    secretariatMode = Utility.isSecretariat();
    spreadSheetId =  Utility.getGoogleSheetID();

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
 * @param {object} spreadsheet [optional] the spreadsheet
 * @return {bool} true if master, false otherwise
 */
 Utility.isMaster = function( spreadsheet ) {
 	spreadsheet = spreadsheet || SpreadSheetCache.getActiveSpreadsheet();
 	return spreadsheet.getName().indexOf( Config.masterKeyword ) > -1;
 };

/**
 * check if the current spreadsheet is Master
 * @return {bool} true if master, false otherwise
 */
Utility.isSecretariat = function() {
	return SpreadsheetApp.getActiveSpreadsheet().getName().indexOf( Config.secretariatKeyword ) > -1;
};



/**
 * check if the current spreadsheet is Master
 * @param {object} sheet [optional] the sheet
 * @return {bool} true if template, false otherwise
 */
 Utility.isTemplate = function(sheet) {
 	sheet=sheet||SpreadSheetCache.getActiveSpreadsheet().getActiveSheet();
 	return sheet.getName().indexOf( Config.templatePrefix ) === 0;
 };

/**
 * show/hide all templates in the spreadsheet
 * @param  {bool} show true to show all templates, false to hide
 * @param  {string} SpreadSheet ID
 */
Utility.toggleTemplates=function(show,spreadSheetId){
  var sheets=spreadSheetId? SpreadsheetApp.openById(spreadSheetId).getSheets() : SpreadSheetCache.getActiveSpreadsheet().getSheets(),s;

	for (var _i = 0, sheets_length=sheets.length; _i<sheets_length; _i++) {
		s=sheets[_i];
		if(Utility.isTemplate(s)){
			if (show) {
				s.showSheet();
			} else {
				s.hideSheet();
			}
		}
	}
};


/**
 * get Template sheet by commodities
 * @param {string} name of commodity (eg. 'maize')
 * @return {SHEET} template sheet
 */
Utility.getTemplateByCommodity = function(commodity) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Config.templatePrefix+commodity);
};


/**
 * get Template sheet by commodities
 * @param
 * @return
 */
Utility.unhideAllColumns = function(sheet) {
  var range = sheet.getRange(1, 1, sheet.getLastRow(), sheet.getLastColumn());
  sheet.unhideColumn(range);
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
