var SyncMasterSheet=new function(){ 
  
	//---------------------------------------------------------
	  /**
		 * Saving Sheet Data function     
	     * @param  {string} auth token     
		 */
	  //---------------------------------------------------------
	  this.startFetch=function(userToken) {
	    	    
        //Get the currently active sheet
        var sheet = SpreadsheetApp.getActiveSheet();    
        
        //TODO _ node must come from firebase
        //var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData('config/rangeToBeStored/argentina',userToken));
        var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData(SyncMasterSheet.getRangeToBeStoredNode(userToken),userToken));
    
       //loop all the ranges stored in firebase
       for (var singleRange in rangeFromConfig) {
         
         //get Firebase node name to be fetch
         var fireBaseNodeData= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + JSON.parse(SyncMasterSheet.getNodeToWriteData(userToken)).dataSheetNode+ '/' + singleRange;                        
         
         var fireBaseValues = JSON.parse(FirebaseConnector.getFireBaseData(fireBaseNodeData,userToken));	    	    
         
         //set value into cells
         sheet.getRange(singleRange).setValues(fireBaseValues);               
       }            
        
        
        Utility.toastInfo('Data Fetched', 'DATA FETCHED');       
	    
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
    
    //Get the currently active sheet
    var sheet = SpreadsheetApp.getActiveSheet();    
    
    var baseOfSaveNode='';
    
    //TODO _ node must come from firebase
    //var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData('config/rangeToBeStored/argentina',userToken));
    var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData(SyncMasterSheet.getRangeToBeStoredNode(userToken),userToken));
    
    //loop all the ranges stored in firebase
    for (var singleRange in rangeFromConfig) {
      
      var dataToBeStored = sheet.getRange(singleRange).getValues();
      
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
        saveNode = baseOfSaveNode+ '/' + singleRange;
        SyncMasterSheet.syncMasterSheet(dataToBeStored,userToken,saveNode);
      
    }
    Utility.toastInfo('Data Saved', 'data');
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
  
  this.setLastUpdate = function(){
    var sheet = SpreadsheetApp.getActiveSheet();
    var date = new Date();
    //var dateFormatted = date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear();
    
    //TODO get this range from firebase
    sheet.getRange('C5').setValue(date);
  }
  
  this.getRangeToBeStoredNode = function(userToken){
	  var sheetId= this.getSheetId();
	  var dataBaseNodeToRead='config/countries/'+sheetId;	  
	  return 'config/rangeToBeStored/'+JSON.parse(FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken)).name;
  }
  
  //---------------------------------------------------------
  //---------------------------------------------------------
  // END -- functions that retrives values
  //---------------------------------------------------------
  //---------------------------------------------------------
  
  
  
  
  
}