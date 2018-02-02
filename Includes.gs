/**
 * this file as to be the last on the project. It needs Config to be compiled first
 */



FirebaseConnector = new AmisLib.FirebaseConnector( Config.dbName, (Config.devMode)?null:Config.errorEmail );
ConvertA1 = new AmisLib.ConvertA1Class();
SpreadSheetCache = new AmisLib.SpreadSheetCache();
APPCache=new AmisLib.APPCache(Config.cacheExpirationInSeconds);
moment=AmisLib.moment;
AmisRange=AmisLib.AmisRange;


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
 * @param {object} sheet [optional] the sheet
 * @return {string}  it return the commodation name (eg. maize )
 * @throws {InvalidArgument}
 */
FirebaseConnector.getCommodityName = function( sheet ) {
	if ( sheet === null ) {
		throw "InvalidArgument";
	}

	sheet = ( sheet || SpreadSheetCache.getActiveSheet() );

	//it return the commodation name (eg. maize )
	return sheet.getRange( Config.Sheet.commodityCell ).getValue().toLowerCase();
};

/**
 * get the countryLabel node from firebase
 * @param  {string} userToken the token
 * @return {object}           the object representing the node
 * @throws {InvalidArgument}
 */
FirebaseConnector.getCountryLabels = function( userToken ) {
	var countryLabels = {};

	if (!userToken) {
		throw "InvalidArgument";
	}

	countryLabels = APPCache.get( "countryLabels" );

	if ( countryLabels ) {
		return countryLabels;
	}

	countryLabels = FirebaseConnector.getFireBaseDataParsed( '/config/countryLabels', userToken );

	APPCache.put( "countryLabels", countryLabels );

	return countryLabels;
};


/**
 * get a countryLabel from firebase
 * @param  {string} countryName the countryName to find
 * @param  {string} userToken   the token
 * @return {string}             the label
 * @throws {InvalidArgument}
 */
FirebaseConnector.getCountryLabel=function(countryName, userToken){
	var countryLabel;

	if (!countryName || !userToken) {
		throw "InvalidArgument";
	}

	countryLabel=FirebaseConnector.getCountryLabels(userToken)[countryName];

	if (!countryLabel) {
		throw "CountryLabelNotFound";
	}

	return countryLabel;
};


/**
 * gets the templateCompiler node path for a country
 *
 * @param {string} country the country
 * @returns {string} the node path
 * @throws {InvalidArgument}
 */
FirebaseConnector.getSpreadSheetTemplateCompilerNode=function(country){
    if (!country) {
        throw "InvalidArgument";
    }
            
	return 'config/templateCompiler/'+country;
};

/**
 * gets the templateCompiler node from firebase
 *
 * @param {string} country the country
 * @param  {string} userToken auth token
 * @return {object}           the object of the firebase node
 * @throws {InvalidArgument}
 */
FirebaseConnector.getSpreadSheetTemplateCompiler=function(country, userToken){
	var sheetConfigNode;

	if (!country || !userToken) {
		throw "InvalidArgument";
	}

	sheetConfigNode=FirebaseConnector.getSpreadSheetTemplateCompilerNode(country);
	return FirebaseConnector.getFireBaseDataParsed(sheetConfigNode,userToken);
};

/**
 * very simple function to get the config sheet node path
 * @param  {string} sheetId (optional) the sheetId, current spreadsheet will be used if undefined
 * @return {string}         the config path
 */
FirebaseConnector.getSheetConfigNode=function(sheetId){
	sheetId=(sheetId || SpreadSheetCache.getActiveSpreadsheet().getId());
	return 'config/countries/'+sheetId;
};

/**
 * get the sheet config from firebase
 * @param  {[type]} sheetId   [description]
 * @param  {string} userToken auth token
 * @return {object}           the object of the firebase node
 */
FirebaseConnector.getSheetConfig=function(sheetId, userToken){
	sheetId=(sheetId || SpreadSheetCache.getActiveSpreadsheet().getId());
	var sheetConfigNode;

	if (!userToken) {
		throw "InvalidArgument";
	}

	sheetConfigNode=FirebaseConnector.getSheetConfigNode(sheetId, userToken);
	return FirebaseConnector.getFireBaseDataParsed(sheetConfigNode,userToken);
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
 * @param  {number} responseCode http response code
 * @param  {string} error        error message
 * @throws {Network401Error} for expired token
 * @throws {Network400Error} network error
 * @throws {Error} generic error
 */
 FirebaseConnector.errorCallback=function(responseCode, error) {
 	//openSidebar();
 	    //NOTE: google.script.run.withFailureHandler() doesn't accept object as exception
		if ( responseCode === 401 ) {
			throw "Network401Error";
		}
		if ( responseCode === 400 ) {
			throw "Network400Error";
		} else {
			throw new Error( "Firebase error " + responseCode + ": " + error );
		}
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
