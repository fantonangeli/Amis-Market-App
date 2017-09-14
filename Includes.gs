/**
 * this file as to be the last on the project. It needs Config to be compiled first
 */



FirebaseConnector = new AmisLib.FirebaseConnector( Config.dbName );
ConvertA1 = new AmisLib.ConvertA1Class();
SpreadSheetCache = new AmisLib.SpreadSheetCache();
APPCache=new AmisLib.APPCache(Config.cacheExpirationInSeconds);
moment=AmisLib.moment;


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
	if (!this.commodity) {
		var sheet = SpreadSheetCache.getActiveSheet();

		//it return the commodation name (eg. maize )
		this.commodity=sheet.getRange( Config.Sheet.commodityCell ).getValue().toLowerCase();
	}

	return this.commodity;
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

/**
 * callback called if firebase error catched
 */
 FirebaseConnector.errorCallback=function(responseCode, error) {
 	openSidebar();
 	throw new Error("Firebase error "+responseCode+": "+error);
 };

FirebaseConnector._getFireBaseData=FirebaseConnector.getFireBaseData;
FirebaseConnector._getFireBaseDataParsed=FirebaseConnector.getFireBaseDataParsed;
FirebaseConnector._writeOnFirebase=FirebaseConnector.writeOnFirebase;

 /**
  * override of getFireBaseData to manage errors
  */
 FirebaseConnector.getFireBaseData=function(node, userToken){
 	return FirebaseConnector._getFireBaseData(node, userToken, this.errorCallback);
};

 /**
  * override of getFireBaseDataParsed to manage errors
  */
 FirebaseConnector.getFireBaseDataParsed=function(node, userToken){
 	return FirebaseConnector._getFireBaseDataParsed(node, userToken, this.errorCallback);
};

/**
 * override of writeOnFirebase to manage errors
 */
FirebaseConnector.writeOnFirebase=function(data,saveNode,userToken){
   return FirebaseConnector._writeOnFirebase(data,saveNode,userToken, this.errorCallback);
};
