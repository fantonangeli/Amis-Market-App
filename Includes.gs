/**
 * this file as to be the last on the project. It needs Config to be compiled first
 */



FirebaseConnector = new AmisLib.FirebaseConnector( Config.dbName );
ConvertA1 = new AmisLib.ConvertA1Class();
SpreadSheetCache = new AmisLib.SpreadSheetCache();
APPCache=new APPCache();


/**
 * fetch country name from google sheet ID
 * @param  {string} userToken (optional)token
 * @return {json}   country name from google sheet id
 */
//---------------------------------------------------------
FirebaseConnector.getCountryNameFromSheet = function( userToken ) {
	userToken = ( userToken || this.getToken() );
	var sheetId = Utility.getGoogleSheetID();
	var dataBaseNodeToRead = 'config/countries/' + sheetId;
	return JSON.parse( this.getFireBaseData( dataBaseNodeToRead, userToken ) ).name;
};

/**
 * find the commodity name
 * @return {string}  it return the commodation name (eg. maize )
 */
//---------------------------------------------------------
FirebaseConnector.getCommodityName = function() {
	//get the google sheet
	var ss = SpreadsheetApp.getActiveSpreadsheet();
	var sheet = ss.getActiveSheet();

	//it return the commodation name (eg. maize )
	return sheet.getRange( Config.Sheet.commodityCell ).getValue().toLowerCase();
};

/**
 * find the commodity name FOR SECRETARIAT
 * @return {string}  it return the commodation name (eg. maize )
 */
//---------------------------------------------------------
FirebaseConnector.getCommodityNameSecretariat = function(sheet) {
	//it return the commodation name (eg. maize )
//Browser.msgBox(sheet.getRange( Config.Sheet.commodityCell ).getValue().toLowerCase());
	return sheet.getRange( Config.Sheet.commodityCell ).getValue().toLowerCase();
};
