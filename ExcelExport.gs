/**
 * class to manage all operation for the excel exportation
 */
var ExcelExport = new function() {
	/**
	 * create an empty spreadsheet for the excel exportation (copy a spreadsheet from the export master file)
	 * @param  {string} countryLabel label of the country
	 * @param  {string} userToken auth token
	 * @return {string} id of the file
	 * @throws {InvalidArgument}
	 */
	 this.createExportSheet = function(countryLabel,token) {
 		var master, filename, newfile, spreadSheetConfig;

 		if (!countryLabel) {
 			throw "InvalidArgument";
 		}


        spreadSheetConfig=FirebaseConnector.getSheetConfig(SpreadSheetCache.getActiveSpreadsheet().getId(), token);

 		//get current file master file to be cloned
 		master = DriveApp.getFileById( spreadSheetConfig.excelExportSheetId );

 		filename = Utility.interpolate( Config.excelExportSpreadSheetFileName, {
 			country: countryLabel
 		} );

 		newfile= master.makeCopy( filename );

		//set permissions
		newfile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);

 		return newfile.getId();
 	};

	/**
	 * write the spreadsheet id of the excel exportation spreadsheet to firebase
	 * @param  {string} parentSheetId the spreadsheet id of the nation
	 * @param  {string} exportSheetId spreadsheet id of the excel exportation spreadsheet
	 * @param  {string} userToken auth token
	 * @return {void}
	 * @throws {InvalidArgument}
	 */
	 this.storeExportSheetId=function(parentSheetId, exportSheetId, userToken){
 		var sheetConfigNode;

 		if (!parentSheetId || !exportSheetId || !userToken) {
 			throw "InvalidArgument";
 		}

 		sheetConfigNode=FirebaseConnector.getSheetConfigNode(parentSheetId)+"/excelExportSheetId";

 		FirebaseConnector.writeOnFirebase(exportSheetId,sheetConfigNode,userToken);
 	};


    /**
     * reads the spreadsheet id of the spreadsheet used for the excel exportation from firebase
     * @param  {String} parentSpreadSheetId (optional) the spreadSheetId of the parent spreadsheet (the one with used from the user). Current spreadsheet will be used if undefined
	 * @param  {string} userToken auth token
     * @return {String}                     the spreadSheetId
	 * @throws {InvalidArgument}
	 * @throws {InvalidDbData} if data not found in firebase
     */
	 this.getExcelExportSheetId=function(parentSpreadSheetId, userToken){
 		parentSpreadSheetId=(parentSpreadSheetId || SpreadSheetCache.getActiveSpreadsheet().getId());
     	var sheetConfig;

 		if (!userToken) {
  			throw "InvalidArgument";
  		}

 		sheetConfig=FirebaseConnector.getSheetConfig(parentSpreadSheetId, userToken);

 		if (!sheetConfig || !sheetConfig.excelExportSheetId) {
 			throw "InvalidDbData";
 		}

 		return sheetConfig.excelExportSheetId;
     };


	 /**
	  * start the excel exportation: copy all values to the excel export sheet and return the id for the download
 	  * @param  {string} userToken auth token
      * @return {String}                     the spreadSheetId
	  */
	 this.startExport=function(userToken){
		var from, to, fromSpreadSheet;

		fromSpreadSheet=SpreadSheetCache.getActiveSpreadsheet();

		from=fromSpreadSheet.getId();

		to=ExcelExport.getExcelExportSheetId(from, userToken);

		ProtectionMaker.validateAllSheet(fromSpreadSheet);

		Utility.copyAllSpreadSheetValues(from, to, Config.commoditySheetsRegex);

		return to;

	 };


};
