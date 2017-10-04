var LastDateUpdater=new function(){

  /**
  * STORE INTO SESSION THE LABEL ROW FOR LAST DATE
  * @param  {string} user token
  * @deprecated not used
  */
  this.protectCell = function(userToken){

    //get the google spreadSheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    //get all the sheets
    var allSheets = ss.getSheets();
    //loop all the sheets and set all the properties needed
    for(var i=0; i< allSheets.length; i++){

      var sheetName = allSheets[i].getName();

      //if is not an hidden template
      if( sheetName.indexOf('Template_') < 0){

        var commodityName = ss.getSheetByName(sheetName).getRange(Config.Sheet.commodityCell).getValue().toLowerCase();

        // var labelRowForLastDate=JSON.parse(FirebaseConnector.getFireBaseData('config/labelRowForLastDate/'+FirebaseConnector.getCountryNameFromSheet(userToken)+'/'+commodityName,userToken));
        // //store into session the labelRowForLastDate
        // PropertiesService.getUserProperties().setProperty(commodityName+"_labelRowForLastDate", labelRowForLastDate);

        // var rangeFromConfigNotParsed = FirebaseConnector.getFireBaseData('config/rangeToBeProtectedFromSettingLastDateUpdate/'+FirebaseConnector.getCountryNameFromSheet(userToken)+'/'+commodityName,FirebaseConnector.getToken());
        //
        // //store into session the ranges to be protected
        // PropertiesService.getUserProperties().setProperty(commodityName+"_rangeProtected",rangeFromConfigNotParsed);


        var addForecastConfigNotParsed = FirebaseConnector.getFireBaseData('config/addForecast/'+FirebaseConnector.getCountryNameFromSheet(userToken)+'/'+commodityName,userToken);
        var addForecastConfig=JSON.parse(addForecastConfigNotParsed);
        //store into session the ranges to be protected
        PropertiesService.getUserProperties().setProperty(commodityName+"_addForecastConfig",addForecastConfigNotParsed);

      }


    }


};

  /**
   * set the last date for column when you edit the sheet
   * @param  {object} e the event
   * @return {void}
   */
  this.onEditSetLastUpdateDate = function (e) {
    var rangesToCheck=[],rangeToBeStored, lastDateRanges;
  	//get the google sheet
  	var ss = SpreadSheetCache.getActiveSheet();


  	var lastDateUpdaterRow = parseInt(AmisNamedRanges.getCommodityNamedRanges().labelRowForLastDate.row.split(":")[0],10);


  	var activeCell=e.range;
  	var thisCol = e.range.getColumn();


  	rangeToBeStored = SyncMasterSheet.getRangeToBeStored();
    lastDateRanges = LastDateUpdater.getLastDateRanges();
    rangesToCheck=rangesToCheck.concat(rangeToBeStored, lastDateRanges);

  	//used after to determinate if set the last date or not
  	var canWrite = Utility.isInAnyRange(rangesToCheck, activeCell);


  	if(canWrite){
  	  var cell = ss.getRange(lastDateUpdaterRow, thisCol);

      //TODO restore this code according to the new AddForecast behavior
 //  	  if (ForecastUtility.isEndOfPeriod(activeCell)) {
 //  			ForecastUtility.updateDataOfEndOfPeriod(activeCell, lastDateUpdaterRow);
 //  	  } else {
 //  		  //update the cell putting last date editing
 //  		  cell.setValue(moment.utc().format(Config.lastUpdatedDateDBFormat));
    //         cell.setNumberFormat(Config.lastUpdatedDateSheetFormat);
 //  	  }

      cell.setValue(moment.utc().format(Config.lastUpdatedDateDBFormat));
      cell.setNumberFormat(Config.lastUpdatedDateSheetFormat);

  	  cell.setFontWeight("bold");
  	}

  };
  //------------------------------------------------------------------------------------------------------------------
  // END -- CALLED ON EDIT This set the last date for column when you edit the sheet
  //------------------------------------------------------------------------------------------------------------------

    /**
     * reads the lastDateUpdaterRow from the named ranges
     * @return {string} the range in A1 format
     */
    this.getLURowA1 = function() {
    	return AmisNamedRanges.getCommodityNamedRanges().labelRowForLastDate.row;
    };

    /**
     * reads the lastDateUpdaterRow from the named ranges
     * @return {number} the row number
     */
    this.getLURow = function() {
    	return parseInt( this.getLURowA1().split( ":" )[ 0 ], 10 );
    };

    /**
     * reads the lastDateRanges from the named ranges
     * @return {[string]} array of the ranges in A1 format
     */
    this.getLastDateRanges=function(){
        return AmisNamedRanges.getCommodityNamedRanges().lastDateRanges;
    };

};
