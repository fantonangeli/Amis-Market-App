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


  //------------------------------------------------------------------------------------------------------------------
  /**
  * STORE INTO SESSION THE LABEL ROW FOR LAST DATE
  * @params  {string} user token
  */
  //------------------------------------------------------------------------------------------------------------------
  this.protectCell = function(userToken){
    
    var labelRowForLastDate=JSON.parse(FirebaseConnector.getFireBaseData('config/labelRowForLastDate/argentina',userToken));    
    //store into session the labelRowForLastDate
    PropertiesService.getUserProperties().setProperty("labelRowForLastDate", labelRowForLastDate);
    
    var rangeFromConfigNotParsed = FirebaseConnector.getFireBaseData('config/rangeToBeProtectedFromSettingLastDateUpdate/argentina/Maize',FirebaseConnector.getToken());          
    //store into session the ranges to be protected
    PropertiesService.getUserProperties().setProperty("rangeProtected",rangeFromConfigNotParsed);
    
    
    var addForecastConfigNotParsed = FirebaseConnector.getFireBaseData('config/addForecast/argentina',userToken);
    var addForecastConfig=JSON.parse(addForecastConfigNotParsed);    
    //store into session the ranges to be protected
    PropertiesService.getUserProperties().setProperty("addForecastConfig",addForecastConfigNotParsed);
    
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

    var lastDateUpdaterRow = JSON.parse(PropertiesService.getUserProperties().getProperty("labelRowForLastDate"));

    var sheet = SpreadsheetApp.getActiveSpreadsheet();

    var activeCell=e.range;
    var thisCol = e.range.getColumn();

    var ss = sheet.getSheets()[0];
    
    var rangeProtected = JSON.parse(PropertiesService.getUserProperties().getProperty("rangeProtected"));    

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
          cell.setValue(new Date());
      }

      cell.setFontWeight("bold");
    }

  }
  //------------------------------------------------------------------------------------------------------------------  
  // END -- CALLED ON EDIT This set the last date for column when you edit the sheet
  //------------------------------------------------------------------------------------------------------------------  

}
