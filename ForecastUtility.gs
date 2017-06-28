var ForecastUtility=new function(){
  
  //------------------------------------------------------------------------------------------------------------------
  /**
	 * ADD A NEW FORECAST on the google sheet	 
     * @param  {string} auth token
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.addForecast= function(userToken){
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    //datanode from firebase
    var lastForeCast = 'config/addForecast/argentina/lastForecast16_17';
    
    var newForecastColumnPosition = parseInt(FirebaseConnector.getFireBaseData(lastForeCast,userToken));
    
    //datanode from firebase
    var beginForeCast = 'config/addForecast/argentina/firstForecast16_17';
    
    var firstForecastColumnPosition = parseInt(FirebaseConnector.getFireBaseData(beginForeCast,userToken));     
    
    //SOLVE CTRL+Z PROBLEMS. IF ANY and return the position where put the new column
    newForecastColumnPosition =ForecastUtility.preventUndoConflictForNewForecast(newForecastColumnPosition,lastForeCast,userToken);
    
    // This inserts a column in the second column position
    sheet.insertColumnsAfter(newForecastColumnPosition,1);
    
    //TODO this must come from firebase
    //set the years of the forecast
    var newCell = sheet.getActiveSheet().getRange(9,newForecastColumnPosition+1).setValue('2016/17');
    
    // update lastForeCast on firebase
    //this.moveNewForecastFinder(sheet.getActiveSheet().getRange(4,newForecastColumnPosition),sheet.getActiveSheet().getRange(4,newForecastColumnPosition+1),lastForeCast);   
    FirebaseConnector.writeOnFirebase(newForecastColumnPosition+1, lastForeCast, userToken);
    
    //get the A1 notation for the column
    var columnLetter = Utility.numToChar(newForecastColumnPosition+1);    
    //move forecastMetodology column position on firebase (range as input)
    ForecastingMethodologies.moveFMCols(columnLetter+':'+columnLetter,1);
    //refetch from firebase the configuration for forecastmetodologies
    ForecastingMethodologies.getConfig(true);
    
    //protect again the sheet
    ProtectRanges.protectCell(userToken);
    
  }
  //------------------------------------------------------------------------------------------------------------------
  // END --   ADD A NEW FORECAST on the google sheet
  //------------------------------------------------------------------------------------------------------------------
  
  //------------------------------------------------------------------------------------------------------------------
  /**
	 * hide old forecast except the last 2
     * @param  {string} first forecast position
     * @param  {string} last forecast position
     * @param  {string} number of column you want to be shown
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.hideOldForecasts= function (beginingPosition, lastPosition, numberOfColumnVisibleInTheRange){
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
    var columnToBeHidden = lastPosition - beginingPosition - numberOfColumnVisibleInTheRange;      
    
    if(columnToBeHidden >-1)
      sheet.hideColumns(beginingPosition, columnToBeHidden+1);
  }
  //------------------------------------------------------------------------------------------------------------------
  // END hide old forecast except the last 2
  //------------------------------------------------------------------------------------------------------------------
  
  //------------------------------------------------------------------------------------------------------------------ 
  /**
	 * Solve CTRL+Z problems for 'add new forecast'
     * @param  {string} new forecast column index
     * @param  {string} last forecast position
     * @param  {string} user token
     * @return  {string} new Forecast Column Position after fixing CTRL problems
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.preventUndoConflictForNewForecast = function (newForecastColumnPosition,lastForeCastNode, userToken){
  
    //datanode from firebase
    var labelRowNumber = 'config/addForecast/argentina/labelRowNumber';
  
    //retrive the row containing 'Forecasting  Methodology'. IT MUST BE next the last forecast.
    var forecastingMethodologyRange = FirebaseConnector.getFireBaseData(labelRowNumber,userToken);
  
    //retrive the column containing 'Forecasting  Methodology'
    var forecastingMethodologyColumn = Utility.findValueIntoRow('Forecasting  Methodology', JSON.parse(forecastingMethodologyRange));
    
    //IF THERE ARE CRTL+Z PROBLEMS (the firebase index for newForecastProblem is bigger then forecasting meth column)
    if(newForecastColumnPosition >= forecastingMethodologyColumn){
      
      //change the value of lastForecast config on database
      FirebaseConnector.writeOnFirebase(forecastingMethodologyColumn-1, lastForeCastNode, userToken);
      
      //get the A1 notation for the column
      var columnLetter = Utility.numToChar(forecastingMethodologyColumn-1);    
      //move forecastMetodology column position on firebase (range as input)
      ForecastingMethodologies.moveFMCols(columnLetter+':'+columnLetter,-1);
      //refetch from firebase the configuration for forecastmetodologies
      ForecastingMethodologies.getConfig(true);
      
      return forecastingMethodologyColumn-1;
      
    }else{
      
      return newForecastColumnPosition;
      
    }
  }
  //------------------------------------------------------------------------------------------------------------------
  // END -- Solve CTRL+Z problems for 'add new forecast'
  //------------------------------------------------------------------------------------------------------------------
  
  
}
