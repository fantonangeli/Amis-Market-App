var LastDateUpdater=new function(){

  //---------------------------------------------------------
  /**
	 * GET RANGES TO BE PROTECED NODE
     * @params  {string} user token
     * @return  {string} Firebase node of Ranges to be protected
	 */
  //---------------------------------------------------------
  this.getLabelRow = function(userToken){
    var sheetId= Utility.getGoogleSheetID();
    var dataBaseNodeToRead='config/countries/'+sheetId;
    return 'config/labelRowForLastDate/'+JSON.parse(FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken)).name;
  }


  this.protectCell = function(userToken){

      var labelRowForLastDate=JSON.parse(FirebaseConnector.getFireBaseData('config/labelRowForLastDate/argentina',userToken));
      //Utilities.sleep(300);
    //store into session the labelRowForLastDate
      PropertiesService.getUserProperties().setProperty("labelRowForLastDate", labelRowForLastDate);

    }
  //------------------------------------------------------------------------------------------------------------------
  //END --
  //------------------------------------------------------------------------------------------------------------------

  //---------------------------------------------------------
  // END -- GET RANGES TO BE PROTECED NODE
  //---------------------------------------------------------

  this.onEditSetLastUpdateDate = function (userToken,e) {

    var lastDateUpdaterRow = JSON.parse(PropertiesService.getUserProperties().getProperty("labelRowForLastDate"));

    var sheet = SpreadsheetApp.getActiveSpreadsheet();

    var activeCell=e.range;
    var thisCol = e.range.getColumn();

    var ss = sheet.getSheets()[0];

    var formulasProtected = JSON.parse(PropertiesService.getUserProperties().getProperty("formulasProtected"));
    var rangeProtected = JSON.parse(PropertiesService.getUserProperties().getProperty("rangeProtected"));
    var mergeRange = formulasProtected.concat(rangeProtected);

    //var mergeRange = LastDateUpdater.jsonConcat(formulasProtected,rangeProtected);

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
          cell.setValue(new Date());
      }

      cell.setFontWeight("bold");
    }

  }

  //TODO _ delete
  //concat two json
  this.jsonConcat = function(o1, o2) {
    for (var key in o2) {
      o1[key] = o2[key];
    }
    return o1;
  }

}
