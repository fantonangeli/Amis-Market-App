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
    secretariatMode = Utility.isSecretariat();
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
	return SpreadsheetApp.getActiveSpreadsheet().getName().indexOf( Config.masterKeyword ) > -1;
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
 * unhide all column
 * @param
 * @return
 */
Utility.unhudeAllColumns = function(sheet) {
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



/**
 * parse all named range in the whole Spreadsheet
 * @return {object} an object representing the named ranges: {commodity: {type: [index]}}
 */
Utility.parseAllNamedRanges=function() {
	var s=SpreadsheetApp.getActiveSpreadsheet();
	var rs=s.getNamedRanges();
	var retVal={}, _rangeName, _rangeNameMatch, _sheetName, _type, _index, _a1;

	var r;
	for (var i = rs.length; i--;) {
		r=rs[i];
		_rangeName=r.getName();
		_rangeNameMatch=_rangeName.match(/^(\w+)_(\w+)_((\d+)|(\w+))$/);
		_sheetName=_rangeNameMatch[1];
		_type=_rangeNameMatch[2],
		_index=_rangeNameMatch[3];
		_a1=r.getRange().getA1Notation();


		retVal[_sheetName]=(retVal[_sheetName] || {});

		//if the index is numeric
		if(_rangeNameMatch[4]){
			retVal[_sheetName][_type]=(retVal[_sheetName][_type] || []);
			retVal[_sheetName][_type][parseInt(_index, 10)]=_a1;
		}
		//the index is a key
		else{
			retVal[_sheetName][_type]=(retVal[_sheetName][_type] || {});
			retVal[_sheetName][_type][_index]=_a1;
		}
	}
	return retVal;
};

/**
 * reads all named range in the whole Spreadsheet. If they are cached it will use the cache
 * @return {object} an object representing the named ranges: {commodity: {type: [index]}}
 */
Utility.getAllNamedRanges=function() {
	var namedRanges=APPCache.get("namedRanges");
	if (!namedRanges) {
		namedRanges=Utility.parseAllNamedRanges();
		APPCache.put("namedRanges", namedRanges);
	}
	return namedRanges;
};

/**
 * return all namedRanges of the current commodity
 * @return {object} an object representing the named ranges: {type: [index]}
 */
Utility.getCommodityNamedRanges=function(){
	var commodityName = FirebaseConnector.getCommodityName();

    return Utility.getAllNamedRanges()[commodityName];
};
