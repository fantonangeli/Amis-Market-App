var SyncMasterSheet=new function(){

	/**
	 * update all the lastUpdate cells from firebase
	 * @param  {array} fbData      firebase data of the sheet
	 * @param  {array} sheetValues sheet's data
     * @param  {Sheet} the chosen sheet
     * @param  {bool}  true= clear data, false= set data
	 */
	 this.lastDatefetcher=function(fbData, sheetValues, chosenSheet, isReset){
 		var labelRowForLastDateIndex,fbDataLURow,cell, sheetDate,range;

        labelRowForLastDateIndex=(LastDateUpdater.getLURow(chosenSheet)-1);

 		chosenSheet = chosenSheet || SpreadSheetCache.getActiveSheet();

 		fbDataLURow=fbData[labelRowForLastDateIndex];

 		for (var _i = 0, sheetValuesLURow_length=fbDataLURow.length; _i<sheetValuesLURow_length; _i++) {
 			cell=fbDataLURow[_i];

 			if(cell===sheetValues[labelRowForLastDateIndex][_i]){
 				continue;
 			}

 			sheetDate=moment(sheetValues[labelRowForLastDateIndex][_i]).format(Config.lastUpdatedDateDBFormat);




 			//if fb cell different to sheetcell
 			if(cell!==sheetDate){

                range=chosenSheet.getRange(labelRowForLastDateIndex+1, _i+1);
                range.setValue(cell);
                range.setNumberFormat(Config.lastUpdatedDateSheetFormat);

            }else if(isReset){
               range=chosenSheet.getRange(labelRowForLastDateIndex+1, _i+1);
               range.setValue('');
            }

 		}
 	};

	/**
	 * show a confirm message to the user to ask confirmation to discard sheet data
	 * @return {bool}           true if user said yes, false otherwise
	 */
	this.fetchConfirmMsg = function() {
		var userChoise = "yes";

		userChoise = Browser.msgBox( 'DISCARD CHANGES', 'Discard your edits and overwrite the sheet with the data from the AMIS database?', Browser.Buttons.YES_NO );

		return ( userChoise === "yes" );
	};

	/**
	 * Get the data from firebase
	 * @param  {string} userToken auth token
	 * @param  {bool} forceload (default false) if true doesn't ask the user for loading data
	 */
	this.startFetch = function( userToken, forceload ) {
		var spreadsheet, country;

		spreadsheet = SpreadSheetCache.getActiveSpreadsheet();
		country = FirebaseConnector.getCountryNameFromSheet( userToken );

		if ( ( forceload !== true ) && ( !SyncMasterSheet.fetchConfirmMsg() ) ) {
			return;
		}

		Utility.forEachSheet( null, /^[A-Za-z]+$/, function( sheet, sheetName ) {
			//fetch lastupdate date
            SyncMasterSheet.getLastUpdate(sheet);
            //in the call back we load data for all the commodities
			SyncMasterSheet.startFetchLoadAllData( userToken, spreadsheet, sheet, sheetName, false, country );

		} );

		Utility.toastInfo( 'Data successfully loaded from the AMIS database', 'DATA SAVED' );

	};

	/**
	 * Fetch or delete all data for the master template, for a chosen country (loop all the sheet of a spreadsheet)
	 * @param  {string} userToken auth token
	 * @param  {bool} forceload (default false) if true doesn't ask the user for loading data
	 * @param  {string} the country selected
	 * @param  {bool} true=clear data , false = set data
	 */
	this.startFetchMaster = function( userToken, forceload, countrySelected, isReset ) {
		var spreadsheet;

		spreadsheet = SpreadSheetCache.getActiveSpreadsheet();

		if ( ( forceload !== true ) && ( !SyncMasterSheet.fetchConfirmMsg() ) ) {
			return;
		}

		Utility.forEachSheet( null, /^[A-Za-z]+$/, function( sheet, sheetName ) {
			//in the call back we load data for all the commodities
			SyncMasterSheet.startFetchLoadAllData( userToken, spreadsheet, sheet, sheetName, isReset, countrySelected );
		} );

		Utility.toastInfo( 'Data successfully loaded from the AMIS database', 'DATA SAVED' );
	};


      /**
	    * Get the ALL data from firebase for each commodities by country
        * @param  {string} userToken auth token
		* @param {object} spreadsheet [optional] the spreadsheet
   	 	* @param {object} sheet [optional] the sheet
   	 	* @param  {string} sheetName   sheet's name*
        * @param  {bool} isReset true=clear data , false = set data
		* @param  {string} countrySelected the country selected
		* @return {void}
        * @throws {InvalidFirebaseData}
	  */
	  this.startFetchLoadAllData=function(userToken, spreadsheet, sheet, sheetName, isReset, countrySelected) {
        userToken= userToken || FirebaseConnector.getToken();
        countrySelected = countrySelected || FirebaseConnector.getCountryNameFromSheet(userToken);
		spreadsheet = spreadsheet || SpreadSheetCache.getActiveSpreadsheet();
        //var sheetName= sheet.getName().toLowerCase();
        sheetName=sheetName.toLowerCase();

		try {
			//we take only NOT TEMPLATE_ sheets
			if(sheet.getSheetName().indexOf(Config.templatePrefix)){

			  //Get the currently active sheet
			  var sheetValues=sheet.getSheetValues(1, 1, sheet.getLastRow(),sheet.getLastColumn());

			  var rangeFromConfig= SyncMasterSheet.getRangeToBeStored(sheetName);

			  var fbData, fireBaseValues, baseOfSaveNode= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/'+ countrySelected+'Data'+ '/' + sheet.getSheetName().toLowerCase();

			  fbData=FirebaseConnector.getFireBaseDataParsed(baseOfSaveNode, userToken);

			  //exception if firebase data has not the same size of the sheet
			  if (!isReset && ((!fbData) || (fbData.length!==sheetValues.length) || (fbData[0].length!==sheetValues[0].length))) {
				Browser.msgBox("Firebase data has not the same size of the sheet "+sheetName);
				throw "InvalidFirebaseData";
			  }

			  //get lastDateUpdaterRow
			  SyncMasterSheet.lastDatefetcher(fbData, sheetValues, sheet, isReset);

			  //get all range to be stored
			  if (fbData) {
				for (var i=0; i<rangeFromConfig.length;i++){

				  //get Firebase node name to be fetch
				  fireBaseValues=Utility.getRangeValuesFromArray(fbData, rangeFromConfig[i]);

				  //if data note IS NOT EMPTY
				  if(fireBaseValues){
					//if isreset...empty all data
					if(isReset){
					  sheet.getRange(rangeFromConfig[i]).setValue('');
					}
					else{
					  //set value into cells
					  sheet.getRange(rangeFromConfig[i]).setValues(fireBaseValues);
					}
				  }
				}
			  }

			  ProtectionMaker.validateSheet(sheetValues, spreadsheet, sheet);

			  ForecastUtility.hideAllPreviousForecasts(sheet);

			}
		} catch (e) {
			var ex=e;
			if(e!=="Network401Error"){
				Utility.sendErrorEmails(
					"Firebase data wrong",
					Config.errorEmail
				);
				Browser.msgBox(
					"Internal error reading the data from the AMIS database.\\n"+
					"The AMIS administrator has been notified.\\n"+
					"You can contact them directly on amis-outlook@gmail.com");
			}
			throw e;
		}
	}

    /**
     * get single range values and prepare it to be stored in firebase
     * @param  {array} sheetValues all the data in the sheet. from first column to the last
     * @param  {string} range       range in A1Notation
	 * @param  {array} fmRanges ForecastingMethodologies ranges from firebase
     * @return {array}             a two-dimensional array of values,  indexed by row, then by column
     */
    this.getRangeValuesToBeStored=function(sheetValues, range, fmRanges) {
        var currA1, rangeIndexes, sheetDataJson,dataToBeStored;

        dataToBeStored = Utility.getRangeValuesFromArray(sheetValues, range);
        rangeIndexes=ConvertA1.rangeA1ToIndex(range);
        sheetDataJson=JSON.stringify(dataToBeStored);


        for (var i = 0, len = dataToBeStored.length; i < len; i++) {
            for (var j = 0, len2 = dataToBeStored[i].length; j < len2; j++){
				currA1=Utility.numToChar(j+1+rangeIndexes.left)+(i+1+rangeIndexes.top);
				dataToBeStored[i][j]=ForecastingMethodologies.onEditCell(currA1,fmRanges,dataToBeStored[i][j],true);
				sheetValues[i+1+rangeIndexes.top][j+1+rangeIndexes.left]=dataToBeStored[i][j];
            }
        }

        //if the range doesn't contains date but has changed
        if (JSON.stringify(dataToBeStored)!==sheetDataJson) {
            SpreadSheetCache.getActiveSheet().getRange(range).setValues(dataToBeStored);
        }

        return sheetValues;
    };

	/**
	 * get the sheetValues array and format all the last date dates
     * @param  {array} sheetValues all the data in the sheet. from first column to the last
	 * @param {object} sheet [optional] the sheet
	 * @return {array}             the sheetValues with the dates formatted
	 * @throws {InvalidArgument}
	 */
	 this.formatAllLastDate = function( sheetValues, sheet ) {
	 	if ( sheet === null ) {
	 		throw "InvalidArgument";
	 	}

	 	sheet = ( sheet || SpreadSheetCache.getActiveSheet() );
	 	var labelRowForLastDateIndex, sheetValuesLURow, cell;

	 	labelRowForLastDateIndex = ( LastDateUpdater.getLURow( sheet ) - 1 );

	 	sheetValuesLURow = sheetValues[ labelRowForLastDateIndex ];

	 	for ( var _i = 0, sheetValuesLURow_length = sheetValuesLURow.length; _i < sheetValuesLURow_length; _i++ ) {
	 		cell = sheetValuesLURow[ _i ];
	 		if ( moment.isDate( cell ) ) {
	 			sheetValues[ labelRowForLastDateIndex ][ _i ] = moment( cell ).format( Config.lastUpdatedDateDBFormat );
	 		}
	 	}

	 	return sheetValues;
	 };

	/**
	 * validate and reads the data of a sheet for saving in firebase
	 * @param  {object} spreadsheet the spreadsheet
	 * @param  {object} sheet       the sheet
	 * @param  {string} sheetName   sheet's name
	 * @return {array}             array of data of the sheet rightly formatted
	 * @throws {InvalidSheetData}
	 */
	this.startSyncSheet = function( spreadsheet, sheet, sheetName ) {
		var sheetValues;

		Logger.log( sheetName );

		sheetValues = sheet.getDataRange().getValues();
		ForecastUtility.hideAllPreviousForecasts( sheet );

		try {
			ProtectionMaker.validateSheet( sheetValues, spreadsheet, sheet );
		} catch ( e ) {
			var ex = e;
			throw "InvalidSheetData";
		}

      	//SyncMasterSheet.setLastUpdate( sheet );
		sheetValues = SyncMasterSheet.formatAllLastDate( sheetValues );


		//SyncMasterSheet.syncMasterSheet(sheetValues,userToken,baseOfSaveNode, sheet);

		return sheetValues;
	};

	/**
	 * Saving Sheet Data function
	 * @param  {string} userToken auth token
	 * @throws {InvalidSheetData} in case of non valid data in the sheet
	 */
	this.startSync = function( userToken ) {
		var baseOfSaveNode, spreadsheet, spreadsheetData = {};

		spreadsheet = SpreadSheetCache.getActiveSpreadsheet();

		baseOfSaveNode = JSON.parse( SyncMasterSheet.getAbsoluteDataSheetPath( userToken ) ) + '/' + JSON.parse( SyncMasterSheet.getNodeToWriteData( userToken ) ).dataSheetNode;

		Utility.forEachSheet( null, /^(?!Template).*$/, function( sheet, sheetName ) {
			spreadsheetData[ sheetName.toLowerCase() ] = SyncMasterSheet.startSyncSheet( spreadsheet, sheet, sheetName );
		} );

		FirebaseConnector.writeOnFirebase( spreadsheetData, baseOfSaveNode, userToken );


		Utility.toastInfo( 'Data successfully saved to the AMIS database', 'DATA SAVED' );
	};


  /**
	 *  retrive the absolute firebase node where write data
     *  @param {string}  auth token
     *  @return {string} the correct node where save datas
	 */
  this.getAbsoluteDataSheetPath = function(userToken){
	  var dataBaseNodeToRead='config/absoluteDataSheetPath';
	  var node=APPCache.get("absoluteDataSheetPath");
	  if (!node) {
		  node=FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken);
		  APPCache.put("absoluteDataSheetPath", node);
	  }
	  return node;
  };

  /**
	 *  retrive from config how to name the new node (depends on the country )
     *  @param {string}  auth token
     *  @return {string} the correct node where save datas
	 */
  this.getNodeToWriteData= function (userToken){
   var sheetId= this.getSheetId();
   var dataBaseNodeToRead='config/countries/'+sheetId;
   return FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken);
  };

  /**
	 *  retrive from config how to name the new node (depends on the country )
     *  @param {string}  auth token
     *  @return {string} the correct node where save datas
	 */
  this.getNodeToWriteDataSecretariat= function (userToken,chosenCountry){
   chosenCountry = getSecretariatCountry();
   var addingString = 'Data'
   return chosenCountry+addingString;
  };

  this.getSheetId= function(){
	  return Utility.getGoogleSheetID();
  };

  /**
   * set the current date to the lastUpdateCell in the sheet
   * @param {object} sheet [optional] the sheet
   * @return {void}
   * @throws {InvalidArgument}
   */
   this.setLastUpdate = function( sheet ) {
   	if ( sheet === null ) {
   		throw "InvalidArgument";
   	}

   	sheet = ( sheet || SpreadSheetCache.getActiveSheet() );
   	var date = new Date();

   	var lastUpdateCell = AmisNamedRanges.getCommodityNamedRanges().lastUpdateCell.cell;

   	sheet.getRange( lastUpdateCell ).setValue( date );
   };


  /**
   * get from Database the current lastUpdateCell in the current sheet
   * @param {object} sheet [optional] the sheet
   * @return {void}
   * @throws {InvalidArgument}
   */
   this.getLastUpdate = function( sheet ) {
   	if ( sheet === null ) {
   		throw "InvalidArgument";
   	}

   	sheet = ( sheet || SpreadSheetCache.getActiveSheet() );

     var userToken= userToken || FirebaseConnector.getToken();
     var countrySelected = countrySelected || FirebaseConnector.getCountryNameFromSheet(userToken);
     var fbData, fireBaseDate, baseOfSaveNode= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/'+ countrySelected+'Data'+ '/' + sheet.getSheetName().toLowerCase();

     fbData=FirebaseConnector.getFireBaseDataParsed(baseOfSaveNode, userToken);

     var lastUpdateCell = AmisNamedRanges.getCommodityNamedRanges().lastUpdateCell.cell;
     //get Firebase node name to be fetch
     fireBaseDate=Utility.getRangeValuesFromArray(fbData, lastUpdateCell+':'+lastUpdateCell);
     var fireBaseDateFormatted = moment(new Date(fireBaseDate).toISOString()).utc().format(Config.lastUpdatedDateDBFormat);

     if (fbData) {
       sheet.getRange(lastUpdateCell).setValue(fireBaseDateFormatted);
       sheet.getRange(lastUpdateCell).setNumberFormat(Config.lastUpdatedDateSheetFormat);
     }
   };


   /**
	 * retrive all the ranges to be stored
     *  @param  {string} auth token
     *  @return  {array} ranges to be stored
	 */
  this.getRangeToBeStored = function(commodityName){
		return AmisNamedRanges.getCommodityNamedRanges(commodityName).rangeToBeStored;
};
  //---------------------------------------------------------
   //---------------------------------------------------------
  // END -- Retrives all the ranges to be stored
  //---------------------------------------------------------

  //---------------------------------------------------------
  /**
  * retrive all the ranges to be stored FOR SECRETARIAT
  *  @param  {string} auth token
  *  @return  {array} ranges to be stored
  */
  //---------------------------------------------------------
  this.getRangeToBeStoredSecretariat = function() {

    return this.getRangeToBeStored();
  };
  //---------------------------------------------------------
  //---------------------------------------------------------
  // END -- Retrives all the ranges to be stored FOR SECRETARIAT
  //---------------------------------------------------------

  //------------------------------------------------------------------------------------------------------------------
  // delete saved data
  //------------------------------------------------------------------------------------------------------------------
  this.deleteSavedData = function(){
        var ar = [];
        FirebaseConnector.writeOnFirebase(
          ar,
          'dataAmisSheet/countries/argentinaData',
         FirebaseConnector.getToken()
        );
    };
  //------------------------------------------------------------------------------------------------------------------
  // END --  delete saved data
  //------------------------------------------------------------------------------------------------------------------
};
