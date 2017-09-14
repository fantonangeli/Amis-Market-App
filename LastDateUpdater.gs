var LastDateUpdater=new function(){

  /**
  * STORE INTO SESSION THE LABEL ROW FOR LAST DATE
  * @param  {string} user token
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


  }
  //------------------------------------------------------------------------------------------------------------------
  //END -- STORE INTO SESSION THE LABEL ROW FOR LAST DATE
  //------------------------------------------------------------------------------------------------------------------


  //------------------------------------------------------------------------------------------------------------------
  /**
  * CALLED ON EDIT --- This set the last date for column when you edit the sheet
     * @params  {eventObj} event ON edit object
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.onEditSetLastUpdateDate = function (userToken,e) {
    //get the google sheet
    var ss = SpreadSheetCache.getActiveSheet();
    //TODO _ pay attention to multiple sheets


    var lastDateUpdaterRow = parseInt(AmisNamedRanges.getCommodityNamedRanges().labelRowForLastDate.row.split(":")[0],10);


    var activeCell=e.range;
    var thisCol = e.range.getColumn();


    var rangeProtected = AmisNamedRanges.getCommodityNamedRanges().noLastUpdate;

    var mergeRange = rangeProtected;

    //used after to determinate if set the last date or not
    var canWrite = true;

    //loop all the ranges stored in firebase
    for (var i=0; i<mergeRange.length;i++){
      //if a protected cell is update
      if(Utility.isInRange(mergeRange[i], activeCell)){
        //if the cell updated is in a protected range I CANT WRITE
        canWrite = false;
      }

    }

    if(canWrite){
      var cell = ss.getRange(lastDateUpdaterRow, thisCol);

      if (ForecastUtility.isEndOfPeriod(activeCell)) {
            ForecastUtility.updateDataOfEndOfPeriod(activeCell, lastDateUpdaterRow);
      } else {
          //update the cell putting last date editing
          cell.setValue(moment.utc().format(Config.lastUpdatedDateDBFormat));
      }

      cell.setFontWeight("bold");
    }

  }
  //------------------------------------------------------------------------------------------------------------------
  // END -- CALLED ON EDIT This set the last date for column when you edit the sheet
  //------------------------------------------------------------------------------------------------------------------

  /**
   * reads the lastDateUpdaterRow from the named ranges
   * @return {number} the row number
   */
  this.getLURow=function(){
      var labelRowForLastDateA1;

      labelRowForLastDateA1=AmisNamedRanges.getCommodityNamedRanges().labelRowForLastDate.row;
      return parseInt(labelRowForLastDateA1.split(":")[0], 10);
  };

}
