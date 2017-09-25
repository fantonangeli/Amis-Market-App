var SyncMasterSheet=new function(){

	/**
	 * update all the lastUpdate cells from firebase
	 * @param  {array} fbData      firebase data of the sheet
	 * @param  {array} sheetValues sheet's data
	 */
	 this.lastDatefetcher=function(fbData, sheetValues){
 		var labelRowForLastDateIndex,fbDataLURow,cell, sheetDate,range;

 		labelRowForLastDateIndex=(LastDateUpdater.getLURow()-1);

 		fbDataLURow=fbData[labelRowForLastDateIndex];

 		for (var _i = 0, sheetValuesLURow_length=fbDataLURow.length; _i<sheetValuesLURow_length; _i++) {
 			cell=fbDataLURow[_i];

 			if(cell===sheetValues[labelRowForLastDateIndex][_i]){
 				continue;
 			}

 			sheetDate=moment(sheetValues[labelRowForLastDateIndex][_i]).format(Config.lastUpdatedDateDBFormat);


 			//if fb cell different to sheetcell
 			if(cell!==sheetDate){
 				range=SpreadSheetCache
 					.getActiveSheet()
 					.getRange(labelRowForLastDateIndex+1, _i+1)
                 range.setValue(cell);
 				range.setNumberFormat(Config.lastUpdatedDateSheetFormat);
 			}

 		}
 	};

	  /**
	    * Get the data from firebase
        * @param  {string} userToken auth token
	  */
	  this.startFetch=function(userToken) {
		var userChoise = Browser.msgBox('LOAD DATA', 'Load the latest data from the AMIS database overwriting the data in the sheet?', Browser.Buttons.YES_NO);

		try {
			// if user wants to laod data
			if (userChoise === 'yes' || userChoise === 'si') {


				//hide old forecasts leaving only the last one
				ForecastUtility.hideAllPreviousForecasts(userToken);

				//hide new frc unactive columns
				ForecastUtility.hideAllPeriodUnactiveColumns(userToken);

				//Get the currently active sheet
				var sheet = SpreadsheetApp.getActiveSheet();

				//Get the currently active sheet
				var sheetValues=SpreadSheetCache.getActiveSheetValues();

				var rangeFromConfig= SyncMasterSheet.getRangeToBeStored(userToken);

				var fbData, fireBaseValues, baseOfSaveNode= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/'+ JSON.parse(SyncMasterSheet.getNodeToWriteData(userToken)).dataSheetNode+ '/' + FirebaseConnector.getCommodityName();

				fbData=FirebaseConnector.getFireBaseDataParsed(baseOfSaveNode, userToken);

				//get lastDateUpdaterRow
				SyncMasterSheet.lastDatefetcher(fbData, sheetValues);

				//get all range to be stored
				if (fbData) {
					for (var i=0; i<rangeFromConfig.length;i++){

						//get Firebase node name to be fetch
						fireBaseValues=Utility.getRangeValuesFromArray(fbData, rangeFromConfig[i]);

						//if data note IS NOT EMPTY
						if(fireBaseValues){
							//set value into cells
							sheet.getRange(rangeFromConfig[i]).setValues(fireBaseValues);
						}
					}
				}

				Utility.toastInfo('Data successfully loaded to the AMIS database', 'DATA LOADED');

			}
		} catch (e) {
			Browser.msgBox("There is a problem with the data. Please contact the administrator.");
		}
	}




      /**
	    * Delete all data in TEMPLATE
        *
	  */
      this.startFetchEmptyAllData=function(isWithWarning, isNeedingCommodityName, sheetChosenCommodityName) {

        userToken = FirebaseConnector.getToken();
        var chosenCountry = getSecretariatCountry();
        if(isWithWarning){
          var userChoise = Browser.msgBox('LOAD DATA', 'Load the latest data from the AMIS database overwriting the data in the sheet?', Browser.Buttons.YES_NO);
        }else(
          userChoise='yes'
        )

        // if user wants to laod data
        if (userChoise == 'yes' || userChoise == 'si') {

          var sheet;
          var rangeFromConfig;

		  rangeFromConfig=this.getRangeToBeStored();
          if(!isNeedingCommodityName){
            //Get the currently active sheet
            sheet = SpreadsheetApp.getActiveSheet();
          }else{
            sheet  = sheetChosenCommodityName;
          }

          for (var i=0; i<rangeFromConfig.length;i++){

            var fireBaseNodeData;

            if(!isNeedingCommodityName){
              //get Firebase node name to be fetch
              //fireBaseNodeData= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + SyncMasterSheet.getNodeToWriteDataSecretariat(userToken,chosenCountry) + '/' + FirebaseConnector.getCommodityName() + '/' + rangeFromConfig[i];
            }else{
              //get Firebase node name to be fetch
              //fireBaseNodeData= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + SyncMasterSheet.getNodeToWriteDataSecretariat(userToken,chosenCountry) + '/' + FirebaseConnector.getCommodityNameSecretariat(sheetChosenCommodityName) + '/' + rangeFromConfig[i];
              // Browser.msgBox(fireBaseNodeData);
            }
            //var fireBaseValues = JSON.parse(FirebaseConnector.getFireBaseData(fireBaseNodeData,userToken));

            //set EMPTY VALUE
            sheet.getRange(rangeFromConfig[i]).setValue('');
          }

        } else {

          //do nothing
        }

      }

      /**
	    * Saving Sheet Data function FOR SECRETARIET
        * @param  {string} auth token
	    * @deprecated not used. Reason: chenged implementation for secretariat to access directly to sheets
	  */
	  this.startFetchSecretariet=function(isWithWarning, isNeedingCommodityName, sheetChosenCommodityName) {
        userToken = FirebaseConnector.getToken();
        var chosenCountry = getSecretariatCountry();
        if(isWithWarning){
          var userChoise = Browser.msgBox('LOAD DATA', 'Load the latest data from the AMIS database overwriting the data in the sheet?', Browser.Buttons.YES_NO);
        }else(
          userChoise='yes'
        )

        // if user wants to laod data
        if (userChoise == 'yes' || userChoise == 'si') {


          //hide old forecasts leaving only the last one
          ForecastUtility.hideAllPreviousForecastsSecretariat(userToken,isNeedingCommodityName,sheetChosenCommodityName);

          if(isNeedingCommodityName){
            //hide new frc unactive columns
            ForecastUtility.hideAllPeriodUnactiveColumnsSecretariatWithChosenCommodityName(userToken,sheetChosenCommodityName);
          }else{
            //hide new frc unactive columns
            ForecastUtility.hideAllPeriodUnactiveColumnsSecretariat(userToken);
          }


          var sheet;
          var rangeFromConfig;
  		  rangeFromConfig=SyncMasterSheet.getRangeToBeStored();
          if(!isNeedingCommodityName){
            //Get the currently active sheet
            sheet = SpreadsheetApp.getActiveSheet();
          }else{
            sheet  = sheetChosenCommodityName;
          }

          for (var i=0; i<rangeFromConfig.length;i++){

            var fireBaseNodeData;

            if(!isNeedingCommodityName){
              //get Firebase node name to be fetch
              fireBaseNodeData= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + SyncMasterSheet.getNodeToWriteDataSecretariat(userToken,chosenCountry) + '/' + FirebaseConnector.getCommodityName() + '/' + rangeFromConfig[i];
            }else{
              //get Firebase node name to be fetch
              fireBaseNodeData= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + SyncMasterSheet.getNodeToWriteDataSecretariat(userToken,chosenCountry) + '/' + FirebaseConnector.getCommodityNameSecretariat(sheetChosenCommodityName) + '/' + rangeFromConfig[i];
              // Browser.msgBox(fireBaseNodeData);
            }

            var fireBaseValues = JSON.parse(FirebaseConnector.getFireBaseData(fireBaseNodeData,userToken));

            //if data note IS NOT EMPTY
            if(fireBaseValues){
              //empty old values
              //sheet.getRange(rangeFromConfig[i]).setValue('');
              //set value into cells
              sheet.getRange(rangeFromConfig[i]).setValues(fireBaseValues);
            }else{
              sheet.getRange(rangeFromConfig[i]).setValue('');
            }
          }

          if(!isNeedingCommodityName){
            Utility.toastInfo('Data successfully loaded to the AMIS database', 'DATA LOADED');
          }


        } else {

          //do nothing
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
	 * @return {array}             the sheetValues with the dates formatted
	 */
	this.formatAllLastDate=function(sheetValues){
		var labelRowForLastDateIndex, sheetValuesLURow,cell;

		labelRowForLastDateIndex=(LastDateUpdater.getLURow()-1);

		sheetValuesLURow=sheetValues[labelRowForLastDateIndex];

		for (var _i = 0, sheetValuesLURow_length=sheetValuesLURow.length; _i<sheetValuesLURow_length; _i++) {
			cell=sheetValuesLURow[_i];
			if(moment.isDate(cell)){
				sheetValues[labelRowForLastDateIndex][_i]=moment(cell).format(Config.lastUpdatedDateDBFormat);
			}
		}

		return sheetValues;
	};

  /**
	* Saving Sheet Data function
    * @param  {string} auth token
  */
  this.startSync=function(userToken) {
	var sheetValues,fmRanges,currRange;
    //SyncMasterSheet.deleteSavedData();
    //SyncMasterSheet.moveRangesCols('AC:AC',1);

    //hide old forecasts leaving only the last one
    ForecastUtility.hideAllPreviousForecasts(userToken);
    //hide new frc unactive columns
    ForecastUtility.hideAllPeriodUnactiveColumns(userToken);

	ProtectionMaker.validateSheet();

    var baseOfSaveNode;

    var rangeFromConfig= SyncMasterSheet.getRangeToBeStored();
    fmRanges = ForecastingMethodologies.getFMRanges();

	//Get the currently active sheet
	sheetValues=SpreadSheetCache.getActiveSheetValues();

	sheetValues=SyncMasterSheet.formatAllLastDate(sheetValues);

	// for (var p=0; p<rangeFromConfig.length;p++){
	// 	currRange=rangeFromConfig[p];
	// 	sheetValues=SyncMasterSheet.getRangeValuesToBeStored(sheetValues,currRange, fmRanges);
	// }


    baseOfSaveNode= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/'+ JSON.parse(SyncMasterSheet.getNodeToWriteData(userToken)).dataSheetNode+ '/' + FirebaseConnector.getCommodityName();
    SyncMasterSheet.syncMasterSheet(sheetValues,userToken,baseOfSaveNode);

    // var commodityName = FirebaseConnector.getCommodityName();


    // var countryName =  FirebaseConnector.getCountryNameFromSheet(userToken);

    Utility.toastInfo('Data successfully saved to the AMIS database', 'DATA SAVED');

    //protect again the sheet
    //ProtectRanges.protectCell(userToken);
};

  /**
  * Saving Sheet Data function FOR SECRETARIET
  * @param  {string} auth token
  * @deprecated not used. Reason: chenged implementation for secretariat to access directly to sheets
  */
  this.startSyncSecretariet=function(userToken,chosenCountry) {
    chosenCountry = getSecretariatCountry();
    //hide old forecasts leaving only the last one
    ForecastUtility.hideAllPreviousForecastsSecretariat(userToken);
    //hide new frc unactive columns
    ForecastUtility.hideAllPeriodUnactiveColumnsSecretariat(userToken);

    //Get the currently active sheet
    var sheetValues=SpreadSheetCache.getActiveSheetValues();

    var dataToBeStored={},currRange, saveNode,baseOfSaveNode, fmRanges;

    var rangeFromConfig= SyncMasterSheet.getRangeToBeStored(userToken);
    fmRanges = ForecastingMethodologies.getFMRanges();

    //loop all the ranges stored in firebase
    for (var p=0; p<rangeFromConfig.length;p++){
      currRange=rangeFromConfig[p];
      dataToBeStored[currRange]=SyncMasterSheet.getRangeValuesToBeStored(sheetValues,currRange, fmRanges);
    }

    baseOfSaveNode= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/'+ SyncMasterSheet.getNodeToWriteDataSecretariat(userToken,chosenCountry)+ '/' + FirebaseConnector.getCommodityName();
    SyncMasterSheet.syncMasterSheet(dataToBeStored,userToken,baseOfSaveNode);

    var commodityName = FirebaseConnector.getCommodityName();


    var countryName =  FirebaseConnector.getCountryNameFromSheet(userToken);

    Utility.toastInfo('Data successfully saved to the AMIS database', 'DATA SAVED');
};

  //---------------------------------------------------------
  /**
  * logic for saving Excel on firebase
  *  @param  excel data
  *  @param  {string} auth token
  */
  //---------------------------------------------------------
  this.syncMasterSheet=function(excelData,userToken, saveNode) {

    FirebaseConnector.writeOnFirebase(excelData,saveNode,userToken);

    SyncMasterSheet.setLastUpdate(userToken);




    };
  //---------------------------------------------------------
  // END --- logic for saving Excel on firebase
  //---------------------------------------------------------

  //---------------------------------------------------------
  //---------------------------------------------------------
  // TODO functions that retrives values
  //---------------------------------------------------------
  //---------------------------------------------------------

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

  this.setLastUpdate = function(){
        var sheet = SpreadSheetCache.getActiveSheet();
        var date = new Date();

        var lastUpdateCell= AmisNamedRanges.getCommodityNamedRanges().lastUpdateCell.cell;

        sheet.getRange(lastUpdateCell).setValue(date);
    };



   /**
	 * retrive all the ranges to be stored
     *  @param  {string} auth token
     *  @return  {array} ranges to be stored
	 */
  this.getRangeToBeStored = function(){
		return AmisNamedRanges.getCommodityNamedRanges().rangeToBeStored;
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
