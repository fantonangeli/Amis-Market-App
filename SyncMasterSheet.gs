var SyncMasterSheet=new function(){ 
  
	//---------------------------------------------------------
	  /**
		 * Saving Sheet Data function     
	     * @param  {string} auth token     
		 */
	  //---------------------------------------------------------
	  this.startFetch=function(userToken) {
        
        var userChoise = Browser.msgBox('LOAD DATA', 'Load the latest data from the AMIS database overwriting the data in the sheet?', Browser.Buttons.YES_NO);        
        
        
        // if user wants to laod data
        if (userChoise == 'yes' || userChoise == 'si') {
          
          
          //hide old forecasts leaving only the last one
          ForecastUtility.hideAllPreviousForecasts(userToken);
          
          //Get the currently active sheet
          var sheet = SpreadsheetApp.getActiveSheet();    
          
          //var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData(SyncMasterSheet.getRangeToBeStoredNode(userToken),userToken));
          
          var rangeFromConfig= SyncMasterSheet.getRangeToBeStored(userToken);
          
          
          for (var i=0; i<rangeFromConfig.length;i++){

        	  //get Firebase node name to be fetch
              var fireBaseNodeData= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + JSON.parse(SyncMasterSheet.getNodeToWriteData(userToken)).dataSheetNode+ '/' + rangeFromConfig[i];                        
              
              var fireBaseValues = JSON.parse(FirebaseConnector.getFireBaseData(fireBaseNodeData,userToken));	    	    
              
              //set value into cells
              sheet.getRange(rangeFromConfig[i]).setValues(fireBaseValues);
          }
                   
          Utility.toastInfo('Data successfully loaded to the AMIS database', 'DATA LOADED');
          
        } else {
          
          //do nothing
        }
        
	    
	  }
	  //---------------------------------------------------------
	  // END Saving Sheet Data function
	  //--------------------------------------------------------- 	                 
	
  //---------------------------------------------------------
  /**
	 * Saving Sheet Data function     
     * @param  {string} auth token     
	 */
  //---------------------------------------------------------
  this.startSync=function(userToken) {
    //SyncMasterSheet.deleteSavedData();
    //SyncMasterSheet.moveRangesCols('AC:AC',1);
    
    //hide old forecasts leaving only the last one
    ForecastUtility.hideAllPreviousForecasts(userToken);    
    
    //Get the currently active sheet
    var sheet = SpreadsheetApp.getActiveSheet();    
    
    var baseOfSaveNode='';
    
    //var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData(SyncMasterSheet.getRangeToBeStoredNode(userToken),userToken));
    
    var rangeFromConfig= SyncMasterSheet.getRangeToBeStored(userToken);
    
    //loop all the ranges stored in firebase    
    for (var p=0; p<rangeFromConfig.length;p++){
        
        var dataToBeStored = sheet.getRange(rangeFromConfig[p]).getValues();
        
        //TODO put it into function -- store data to firebase
        for (i = 0, len = dataToBeStored.length; i < len; i++) {	    	          
            for (j = 0, len2 = dataToBeStored[i].length; j < len2; j++){
              //Logger.log(dataToBeStored[i][j]);
              if(Object.prototype.toString.call(dataToBeStored[i][j]) === '[object Date]'){              
                var monthNames = [
                  "January", "February", "March",
                  "April", "May", "June", "July",
                  "August", "September", "October",
                  "November", "December"
                ];
                
                var day = dataToBeStored[i][j].getDate();
                var monthIndex = dataToBeStored[i][j].getMonth();
                var year = dataToBeStored[i][j].getFullYear();
                dataToBeStored[i][j]=day + ' ' + monthNames[monthIndex] + ' ' + year;
              }
            }
  	    }
          //store node for data in firebase -- it contains the rangeDefinition
        if(baseOfSaveNode ===''){
            baseOfSaveNode= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + JSON.parse(SyncMasterSheet.getNodeToWriteData(userToken)).dataSheetNode;
        }
          saveNode = baseOfSaveNode+ '/' + rangeFromConfig[p];
          SyncMasterSheet.syncMasterSheet(dataToBeStored,userToken,saveNode);
        
      }
    
    Utility.toastInfo('Data successfully saved to the AMIS database', 'DATA SAVED');
    
    //protect again the sheet
    //ProtectRanges.protectCell(userToken);
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
   this.syncMasterSheet=function(excelData,userToken, saveNode) {
    
    FirebaseConnector.writeOnFirebase(excelData,saveNode,userToken);
     
    SyncMasterSheet.setLastUpdate(userToken);
    
    //-------------------------------------------------------------------------------------------------
     //TODO _ move this logic out of here
     //get the google sheet
     var ss = SpreadsheetApp.getActiveSpreadsheet();
     //TODO _ pay attention to multiple sheets
     var sheet = ss.getActiveSheet();
     
     var commodityName = sheet.getRange(Config.Sheet.commodityCell).getValue();
     
     
     var countryName =  FirebaseConnector.getCountryNameFromSheet(userToken);
     
     //datanode from firebase
      var periodsNode = 'config/addForecast/'+countryName+ '/' +commodityName;
     
     var periodsData= JSON.parse(FirebaseConnector.getFireBaseData(periodsNode,userToken));
     
     for (var period in periodsData) {       
       //datanode from firebase
       var lastForeCast = 'config/addForecast/'+countryName+'/'+commodityName+'/'+ period+'/lastForecast';
     
       //var newForecastColumnPosition = parseInt(FirebaseConnector.getFireBaseData(lastForeCast,userToken));
       var newForecastColumnPosition = JSON.parse(FirebaseConnector.getFireBaseData(lastForeCast,userToken));
       newForecastColumnPosition = Utility.letterToColumn(newForecastColumnPosition);      
       
       //datanode from firebase
       var beginForeCast = 'config/addForecast/'+countryName+'/'+ commodityName+'/'+ period+'/firstForecast';
       
       //var firstForecastColumnPosition = parseInt(FirebaseConnector.getFireBaseData(beginForeCast,userToken));
       var firstForecastColumnPosition = JSON.parse(FirebaseConnector.getFireBaseData(beginForeCast,userToken));
       firstForecastColumnPosition = Utility.letterToColumn(firstForecastColumnPosition);
       
       //datanode from firebase
       var orderInTheSheetNode = 'config/addForecast/'+countryName+'/'+ commodityName+ '/'+ +period+'/orderInTheSheet';
       
       var orderInTheSheet = parseInt(FirebaseConnector.getFireBaseData(orderInTheSheetNode,userToken));
       
       //SOLVE CTRL+Z PROBLEMS. IF ANY and return the position where put the new column
       //newForecastColumnPosition =ForecastUtility.preventUndoConflictForNewForecast(newForecastColumnPosition,lastForeCast,userToken,orderInTheSheet,firstForecastColumnPosition,beginForeCast);       
       
       //hide all the last forecast -- this.findeValueIntoRow(lastForeCast) is called again because moveNewForecastFinder moves that value
       ForecastUtility.hideOldForecasts(firstForecastColumnPosition, newForecastColumnPosition,2 );
     }
    
    //-------------------------------------------------------------------------------------------------
    
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
   var sheetId= this.getSheetId();
   var dataBaseNodeToRead='config/countries/'+sheetId;
   return FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken);
  }
  
  this.getSheetId= function(){
	  return Utility.getGoogleSheetID();
  }
  
  this.setLastUpdate = function(userToken){    
    var sheet = SpreadsheetApp.getActiveSheet();
    var date = new Date();    
    
    var commodityName = sheet.getRange(Config.Sheet.commodityCell).getValue();    
    
    var countryName =  FirebaseConnector.getCountryNameFromSheet(userToken);
    //datanode from firebase
    var lastUpdateCellNode = 'config/lastUpdateCell/'+countryName+'/'+commodityName;
    var lastUpdateCell= JSON.parse(FirebaseConnector.getFireBaseData(lastUpdateCellNode,userToken));
    
    //TODO get this range from firebase
    sheet.getRange(lastUpdateCell).setValue(date);
  }
  
  this.getRangeToBeStoredNode = function(userToken){
	  var sheetId= this.getSheetId();
	  var dataBaseNodeToRead='config/countries/'+sheetId;	  
	  return 'config/rangeToBeStored/'+JSON.parse(FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken)).name+'/Maize';
  }
  
  
  
  //---------------------------------------------------------
  //---------------------------------------------------------
  // END -- functions that retrives values
  //---------------------------------------------------------
  //---------------------------------------------------------
  
  
   //---------------------------------------------------------   
   /**
	 * retrive all the ranges to be stored       
     *  @param  {string} auth token     
     *  @return  {array} ranges to be stored
	 */
   //---------------------------------------------------------
  this.getRangeToBeStoredOLD = function(userToken) {
    
    var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData(SyncMasterSheet.getRangeToBeStoredNode(userToken),userToken));
    
    //get for frc 16-17
    var rangeFromConfigFrc16_17 =JSON.parse(FirebaseConnector.getFireBaseData('config/rangeToBeStored16-17/argentina',userToken));    
    
    //get for frc 17-18
    var rangeFromConfigFrc17_18 =JSON.parse(FirebaseConnector.getFireBaseData('config/rangeToBeStored17-18/argentina',userToken));    
        
    //set the final ranges
    return rangeFromConfig.concat(rangeFromConfigFrc16_17.concat(rangeFromConfigFrc17_18));
  }
  //--------------------------------------------------------- 
  //---------------------------------------------------------
  // END -- Retrives all the ranges to be stored
  //---------------------------------------------------------
  
  //---------------------------------------------------------   
   /**
	 * retrive all the ranges to be stored       
     *  @param  {string} auth token     
     *  @return  {array} ranges to be stored
	 */
   //---------------------------------------------------------
  this.getRangeToBeStored = function(userToken) {
    
    var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData(SyncMasterSheet.getRangeToBeStoredNode(userToken),userToken));
    
    return rangeFromConfig
  }
  //--------------------------------------------------------- 
  //---------------------------------------------------------
  // END -- Retrives all the ranges to be stored
  //---------------------------------------------------------
  
  //------------------------------------------------------------------------------------------------------------------  
  // delete saved data
  //------------------------------------------------------------------------------------------------------------------
  this.deleteSavedData = function(){
    var ar = []
    FirebaseConnector.writeOnFirebase(
      ar,
      'dataAmisSheet/countries/argentinaData',
     FirebaseConnector.getToken()
    );
  }
  //------------------------------------------------------------------------------------------------------------------  
  // END --  delete saved data
  //------------------------------------------------------------------------------------------------------------------
}
