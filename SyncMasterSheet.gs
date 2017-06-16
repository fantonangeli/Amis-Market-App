var SyncMasterSheet=new function(){ 
  
  //---------------------------------------------------------
  /**
	 * Saving Sheet Data function     
     * @param  {string} auth token     
	 */
  //---------------------------------------------------------
  this.startSync=function(userToken) {
    
    //Get the currently active sheet
    var sheet = SpreadsheetApp.getActiveSheet();
    //Get the number of rows and columns which contain some content
    var [rows, columns] = [sheet.getLastRow(), sheet.getLastColumn()];
    //Get the data contained in those rows and columns as a 2 dimensional array
    var data = sheet.getRange(1, 1, rows, columns).getValues();       
    
    //Use the syncMasterSheet function defined before to push this data to the "masterSheet" key in the firebase database
    SyncMasterSheet.syncMasterSheet(data,userToken);
  }
  //---------------------------------------------------------
  // END Saving Sheet Data function
  //---------------------------------------------------------
  
  
  //---------------------------------------------------------   
   /**
	 * logic for saving Excel on firebase
     *  @param  excel data
     *  @param  {string} auth token     
	 */
   //---------------------------------------------------------
   this.syncMasterSheet=function(excelData,userToken) {
    
    //retrive the correct path to save data
    var saveNode= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + JSON.parse(SyncMasterSheet.getNodeToWriteData(userToken)).dataSheetNode;;
    
    FirebaseConnector.writeOnFirebase(excelData,saveNode,userToken);
     
    SyncMasterSheet.setLastUpdate();
    
    //-------------------------------------------------------------------------------------------------
    //data from firebase
    var lastForeCast = 'config/lastForecast16_17';
   
    var newForecastColumnPosition = parseInt(FirebaseConnector.getFireBaseData(lastForeCast,userToken));
   
    //data from firebase
    var beginForeCast = 'config/firstForecast16_17';
    
    var firstForecastColumnPosition = parseInt(FirebaseConnector.getFireBaseData(beginForeCast,userToken));
    
    //SOLVE CTRL+Z PROBLEMS. IF ANY and return the position where put the new column
    newForecastColumnPosition =ForecastUtility.preventUndoConflictForNewForecast(newForecastColumnPosition,lastForeCast,userToken);
    
    //hide all the last forecast -- this.findeValueIntoRow(lastForeCast) is called again because moveNewForecastFinder moves that value
    ForecastUtility.hideOldForecasts(firstForecastColumnPosition, newForecastColumnPosition,2 );
    //-------------------------------------------------------------------------------------------------
    
    
    Utility.toastInfo('Data Saved', 'data');
    
   }
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
   return FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken);
  }
  
  /**
	 *  retrive from config how to name the new node (depends on the country )
     *  @param {string}  auth token     
     *  @return {string} the correct node where save datas 
	 */
  this.getNodeToWriteData= function (userToken){
   var countryName= this.getCountryName().toLowerCase();
   var dataBaseNodeToRead='config/countries/'+countryName;
   return FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken);
  }
  
  this.getCountryName= function(){
   //Get the currently active sheet
  var sheet = SpreadsheetApp.getActiveSheet();
  //get the cell containing the country name
   return sheet.getRange('C2').getValue();
  }
  
  this.setLastUpdate = function(){
    var sheet = SpreadsheetApp.getActiveSheet();
    var date = new Date();
    //var dateFormatted = date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear();
    
    //TODO get this range from firebase
    sheet.getRange('C5').setValue(date);
  }
  //---------------------------------------------------------
  //---------------------------------------------------------
  // END -- functions that retrives values
  //---------------------------------------------------------
  //---------------------------------------------------------
  
  
  
  
  
}