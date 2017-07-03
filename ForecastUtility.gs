var ForecastUtility=new function(){
  
  //------------------------------------------------------------------------------------------------------------------
  /**
	 * ADD A NEW FORECAST on the google sheet	 
     * @param  {string} auth token
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.addForecast= function(periodChoosen,userToken){
    
    //TODO _ must  be taken from input parameter
    //var period = '16-17';        

    var countryName =  FirebaseConnector.getCountryNameFromSheet(userToken);
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    
    //datanode from firebase
    var periodsNode = 'config/addForecast/'+countryName;
    
    var periodsData= JSON.parse(FirebaseConnector.getFireBaseData(periodsNode,userToken));
    
    for (var period in periodsData) {       
      //Browser.msgBox(period);
      //datanode from firebase
      var lastForeCast = 'config/addForecast/'+countryName+'/'+period+'/lastForecast';
      
      //var newForecastColumnPosition = parseInt(FirebaseConnector.getFireBaseData(lastForeCast,userToken));
      var newForecastColumnPosition = JSON.parse(FirebaseConnector.getFireBaseData(lastForeCast,userToken));
      newForecastColumnPosition = Utility.letterToColumn(newForecastColumnPosition);      
      //Browser.msgBox(newForecastColumnPosition);
      
      //datanode from firebase
      var beginForeCast = 'config/addForecast/'+countryName+'/'+period+'/firstForecast';
      
      //var firstForecastColumnPosition = parseInt(FirebaseConnector.getFireBaseData(beginForeCast,userToken));
      var firstForecastColumnPosition = JSON.parse(FirebaseConnector.getFireBaseData(beginForeCast,userToken));
      firstForecastColumnPosition = Utility.letterToColumn(firstForecastColumnPosition);
      
      //datanode from firebase
      var orderInTheSheetNode = 'config/addForecast/'+countryName+'/'+period+'/orderInTheSheet';
      
      var orderInTheSheet = parseInt(FirebaseConnector.getFireBaseData(orderInTheSheetNode,userToken));
      
      //SOLVE CTRL+Z PROBLEMS. IF ANY and return the position where put the new column
      newForecastColumnPosition =ForecastUtility.preventUndoConflictForNewForecast(newForecastColumnPosition,lastForeCast,userToken,orderInTheSheet);
    }
    
   
    //datanode from firebase
    var lastForeCast = 'config/addForecast/'+countryName+'/'+periodChoosen+'/lastForecast';
    
    //var newForecastColumnPosition = parseInt(FirebaseConnector.getFireBaseData(lastForeCast,userToken));
    var newForecastColumnPosition = JSON.parse(FirebaseConnector.getFireBaseData(lastForeCast,userToken));    
    newForecastColumnPosition = Utility.letterToColumn(newForecastColumnPosition);    
        
    //datanode from firebase
    var beginForeCast = 'config/addForecast/'+countryName+'/'+periodChoosen+'/firstForecast';
    
    //var firstForecastColumnPosition = parseInt(FirebaseConnector.getFireBaseData(beginForeCast,userToken));     
    var firstForecastColumnPosition = JSON.parse(FirebaseConnector.getFireBaseData(beginForeCast,userToken));
    firstForecastColumnPosition = Utility.letterToColumn(firstForecastColumnPosition);
    
    //datanode from firebase
    var orderInTheSheetNode = 'config/addForecast/'+countryName+'/'+periodChoosen+'/orderInTheSheet';
    var orderInTheSheet = parseInt(FirebaseConnector.getFireBaseData(orderInTheSheetNode,userToken));     
    
    //datanode from firebase
    var labelNode = 'config/addForecast/'+countryName+'/'+periodChoosen+'/label';    
    var labelValue = JSON.parse(FirebaseConnector.getFireBaseData(labelNode,userToken));
    
    //SOLVE CTRL+Z PROBLEMS. IF ANY and return the position where put the new column
    //newForecastColumnPosition =ForecastUtility.preventUndoConflictForNewForecast(newForecastColumnPosition,lastForeCast,userToken, orderInTheSheet);
    
    
    // This inserts a column in the second column position
    sheet.insertColumnsAfter(newForecastColumnPosition,1);
    
    //retrive the row where write the new label
    var labelRowNumberNode = 'config/addForecast/labelRowNumber';
    //in the database value is stored like range "9:9"... to get column number, i have to split
    var labelRowNumber = JSON.parse(FirebaseConnector.getFireBaseData(labelRowNumberNode,userToken)).split(":")[0];
    
    //set the years of the forecast
    var newCell = sheet.getActiveSheet().getRange(labelRowNumber,newForecastColumnPosition+1).setValue(labelValue);
    
    // update lastForeCast on firebase
    //this.moveNewForecastFinder(sheet.getActiveSheet().getRange(4,newForecastColumnPosition),sheet.getActiveSheet().getRange(4,newForecastColumnPosition+1),lastForeCast);   
    
    //orderInTheSheet means that I'm adding a new forecast that impact on the other new forecast columns
    //it "push" other forecast column
    if(orderInTheSheet==0){
      
      //so I have to update also ALL other firebase configuration for all the other forecast
      for (var period in periodsData) {  
        
        var lastForeCast = 'config/addForecast/'+countryName+'/'+period+'/lastForecast';
        
        //var newForecastColumnPosition = parseInt(FirebaseConnector.getFireBaseData(lastForeCast,userToken));
        var newForecastColumnPosition = JSON.parse(FirebaseConnector.getFireBaseData(lastForeCast,userToken));
        //Browser.msgBox(newForecastColumnPosition);
        newForecastColumnPosition = Utility.letterToColumn(newForecastColumnPosition);      
        
        //datanode from firebase
        var beginForeCast = 'config/addForecast/'+countryName+'/'+period+'/firstForecast';
        
        //var firstForecastColumnPosition = parseInt(FirebaseConnector.getFireBaseData(beginForeCast,userToken));
        var firstForecastColumnPosition = JSON.parse(FirebaseConnector.getFireBaseData(beginForeCast,userToken));
        firstForecastColumnPosition = Utility.letterToColumn(firstForecastColumnPosition);
        
        //datanode from firebase
        var orderInTheSheetNode = 'config/addForecast/'+countryName+'/'+period+'/orderInTheSheet';
        var orderInTheSheet = parseInt(FirebaseConnector.getFireBaseData(orderInTheSheetNode,userToken));
        
        //in this case we have also to update firstForecast position
        if(orderInTheSheet!=0){
          FirebaseConnector.writeOnFirebase(Utility.numToChar(newForecastColumnPosition+1), lastForeCast, userToken);
          FirebaseConnector.writeOnFirebase(Utility.numToChar(firstForecastColumnPosition+1), beginForeCast, userToken);                    
        }else{
          FirebaseConnector.writeOnFirebase(Utility.numToChar(newForecastColumnPosition+1), lastForeCast, userToken);
        }
      }
    }
    else{
      FirebaseConnector.writeOnFirebase(Utility.numToChar(newForecastColumnPosition+1), lastForeCast, userToken);
    }
    
    
    
    
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
  this.preventUndoConflictForNewForecast = function (newForecastColumnPosition,lastForeCastNode, userToken, orderInTheSheet){
    
    //var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    //var a1PosNewForecastColumnPosition = Utility.numToChar(newForecastColumnPosition);
    
    var countryName =  FirebaseConnector.getCountryNameFromSheet(userToken);    
    
    //datanode from firebase
    var labelRowNumber = 'config/addForecast/labelRowNumber';
    //Browser.msgBox(orderInTheSheet);
    //retrive the row containing 'Forecasting  Methodology'. IT MUST BE next the last forecast.
    var forecastingMethodologyRange = FirebaseConnector.getFireBaseData(labelRowNumber,userToken);    
    //Browser.msgBox(Utility.findValueIntoRowMultipeResult('Forecasting  Methodology', JSON.parse(forecastingMethodologyRange)));
    //labelRow
    //var labelRow = JSON.parse(forecastingMethodologyRange).split(":")[0]
    
    //retrive the last column of sheet
    //var lastColumnOfTheSheet = Utility.numToChar(sheet.getRange(JSON.parse(forecastingMethodologyRange)).getLastColumn())
    
    //building range
    //var rangeToSearch = a1PosNewForecastColumnPosition+labelRow+':'+lastColumnOfTheSheet
    
    //Browser.msgBox(rangeToSearch);
    
    //retrive the column containing 'Forecasting  Methodology'
    //var forecastingMethodologyColumn = Utility.findValueIntoRow('Forecasting  Methodology', JSON.parse(forecastingMethodologyRange));
    
    //orderInTheSheet choose what result must be consider
    var forecastingMethodologyColumn = Utility.findValueIntoRowMultipeResult('Forecasting  Methodology', JSON.parse(forecastingMethodologyRange))[orderInTheSheet];
    //Browser.msgBox(Utility.findValueIntoRow('Forecasting  Methodology', rangeToSearch));
   // Browser.msgBox(forecastingMethodologyColumn);
    
    //Browser.msgBox(Utility.findValueIntoRow('Forecasting  Methodology', rangeToSearch));
    //Browser.msgBox(Utility.findValueIntoRowMultipeResult('Forecasting  Methodology', JSON.parse(forecastingMethodologyRange)));
    //Browser.msgBox(Utility.numToChar(newForecastColumnPosition));
    //Browser.msgBox(sheet.getRange(JSON.parse(forecastingMethodologyRange)).getLastColumn());
    //Browser.msgBox(Utility.numToChar(sheet.getRange(JSON.parse(forecastingMethodologyRange)).getLastColumn()));
    //IF THERE ARE CRTL+Z PROBLEMS (the firebase index for newForecastProblem is bigger then forecasting meth column)
    if(newForecastColumnPosition >= forecastingMethodologyColumn){
      
      //change the value of lastForecast config on database
      FirebaseConnector.writeOnFirebase(Utility.numToChar(forecastingMethodologyColumn-1), lastForeCastNode, userToken);
      
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
  
  //------------------------------------------------------------------------------------------------------------------ 
  /**
	 * function called to hide all the forecast for previus year except the last one          
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.hideAllPreviusForecasts = function (userToken){

    //get the google sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    //TODO _ pay attention to multiple sheets
    var sheet = ss.getSheets()[0];
    
    //TODO _ take from firebase
    //datanode from firebase
    var firstOldFrcFirebasePath = 'config/previusForecast/argentina/first';
  
    //retrive the row containing 'Forecasting  Methodology'. IT MUST BE next the last forecast.
    var firstFrc = JSON.parse(FirebaseConnector.getFireBaseData(firstOldFrcFirebasePath,userToken));
    
    //TODO _ take from firebase
    //datanode from firebase
    var lastOldFrcFirebasePath = 'config/previusForecast/argentina/last';
  
    //retrive the row containing 'Forecasting  Methodology'. IT MUST BE next the last forecast.
    var lastFrc = JSON.parse(FirebaseConnector.getFireBaseData(lastOldFrcFirebasePath,userToken));
    
    //with charToNum(letterOfTheColumn) I get the column number
    ForecastUtility.hideOldForecasts(sheet.getRange(firstFrc).getColumn(),sheet.getRange(lastFrc).getColumn(),1);
    
  }
  //------------------------------------------------------------------------------------------------------------------
  // END -- function called to hide all the forecast for previus year except the last one          
  //------------------------------------------------------------------------------------------------------------------
  
}
