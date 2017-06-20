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
	    //Get the number of rows and columns which contain some content
	    var [rows, columns] = [sheet.getLastRow(), sheet.getLastColumn()];
	    
	    //get firebase node
	    var saveNode= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + JSON.parse(SyncMasterSheet.getNodeToWriteData(userToken)).dataSheetNode;;
        var saveNodeFormulas = saveNode+'_formulas';
	    
	    var fireBaseValues = JSON.parse(FirebaseConnector.getFireBaseData(saveNode,userToken));	    	    
	    var fireBaseFormulas = JSON.parse(FirebaseConnector.getFireBaseData(saveNodeFormulas,userToken));	    	    
	    //Set the data contained into FIREBASE TO excel	    
        //sheet.getRange(1, 1, rows, columns).setFormulas(fireBaseFormulas);
        
	    sheet.getRange(1, 1, rows, columns).setValues(fireBaseValues);
	    //Logger.log(fireBaseFormulas[9][17]);
        for (i = 0, len = fireBaseFormulas.length; i < len; i++) {	    	
            //Logger.log(fireBaseFormulas[9][5]);
            //Logger.log(fireBaseFormulas[i].length);
            for (j = 0, len2 = fireBaseFormulas[i].length; j < len2; j++){
              Logger.log(fireBaseFormulas[i][j]);
              Logger.log(typeof(fireBaseFormulas[i][j]));
              if(fireBaseFormulas[i][j] ==="" ){
            	//sheet.getRange(i+1,j+1).setFormula(fireBaseFormulas[i][j]);                
                Logger.log('vuoto');
              }else{
                   Logger.log('pieno');
                sheet.getRange(i+1,j+1).setFormula(fireBaseFormulas[i][j]);
              }
            }
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
    //Get the number of rows and columns which contain some content
    var [rows, columns] = [sheet.getLastRow(), sheet.getLastColumn()];
    //Get the data contained in those rows and columns as a 2 dimensional array
    var data = sheet.getRange(1, 1, rows, columns).getValues();
    var dataFormulas = sheet.getRange(1, 1, rows, columns).getFormulas();
    
    for (i = 0, len = data.length; i < len; i++) {	    	
          //Logger.log(fireBaseValues[9][5]);
          for (j = 0, len2 = data[i].length; j < len2; j++){
            Logger.log(data[i][j]);
            if(Object.prototype.toString.call(data[i][j]) === '[object Date]'){
              var monthNames = [
                "January", "February", "March",
                "April", "May", "June", "July",
                "August", "September", "October",
                "November", "December"
              ];
              
              var day = data[i][j].getDate();
              var monthIndex = data[i][j].getMonth();
              var year = data[i][j].getFullYear();
              data[i][j]=day + ' ' + monthNames[monthIndex] + ' ' + year;
            }
          }
	    }
    //retrive the correct path to save data
    var saveNode= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + JSON.parse(SyncMasterSheet.getNodeToWriteData(userToken)).dataSheetNode;;
    var saveNodeFormulas = saveNode+'_formulas';
    //Use the syncMasterSheet function defined before to push this data to the "masterSheet" key in the firebase database
    SyncMasterSheet.syncMasterSheet(data,userToken,saveNode);
    SyncMasterSheet.syncMasterSheet(dataFormulas,userToken,saveNodeFormulas);
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