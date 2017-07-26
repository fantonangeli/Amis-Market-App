var ForecastUtility=new function(){


    /**
     * gets the periods data from firebase
     * @return {object} the data
     */
    this.getPeriodsData = function() {
        //   var countryName, periodsNode, userToken;
        //   userToken = FirebaseConnector.getToken();
        //   countryName = FirebaseConnector.getCountryNameFromSheet(userToken);
        //   periodsNode = 'config/addForecast/' + countryName;
        //   return JSON.parse(FirebaseConnector.getFireBaseData(periodsNode, userToken));
      //get the google sheet
      
      var ss = SpreadsheetApp.getActiveSpreadsheet();      
      var sheet = ss.getActiveSheet();      
      var commodityName = sheet.getRange(Config.Sheet.commodityCell).getValue().toLowerCase();
      return JSON.parse(PropertiesService.getUserProperties().getProperty(commodityName+"_addForecastConfig"));
    };


    /**
     * check if the cell is the lastForecast, the forecastMetodology or the notes of any period
     * @param  {object} cell the cell to check
     * @return {bool}      true if one of that colums, false otherwise
     */
    this.isEndOfPeriod = function(cell) {
      var cellPos, currLastForecastPos, period, periodsData;
      periodsData=this.getPeriodsData();
      cellPos = cell.getColumn();
      for (period in periodsData) {
        currLastForecastPos = Utility.letterToColumn(periodsData[period].lastForecast);
        if (currLastForecastPos <= cellPos && cellPos <= (currLastForecastPos + 2)) {
          return true;
        }
      }
      return false;
    };


    /**
     * udate date of the last 3 date columns of the period of the current cell
     * @param  {object} cell               the cell
     * @param  {number} lastDateUpdaterRow row number of the date row
     */
    this.updateDataOfEndOfPeriod = function(cell,lastDateUpdaterRow) {
      var cellPos, currLastForecastPos, period, periodsData, dataCells;
      periodsData=this.getPeriodsData();
      cellPos = cell.getColumn();
      for (period in periodsData) {
        currLastForecastPos = Utility.letterToColumn(periodsData[period].lastForecast);
        if (currLastForecastPos <= cellPos && cellPos <= (currLastForecastPos + 2)) {
          dataCells=SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(lastDateUpdaterRow, currLastForecastPos, 1, 3);
          dataCells.setValue(new Date());
        }
      }
    };


  //------------------------------------------------------------------------------------------------------------------
  /**
	 * ADD A NEW FORECAST on the google sheet
     * @param  {string} auth token
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.addForecast16_17= function(userToken){

    var userChoise = Browser.msgBox('Adding New Forecast', 'Adding a new Forecast will automatically save data. Do you want to proceed?', Browser.Buttons.YES_NO);


    // if user wants to add new FRC
    if (userChoise == 'yes' || userChoise == 'si') {


      var countryName =  FirebaseConnector.getCountryNameFromSheet(userToken);
      var sheet = SpreadsheetApp.getActiveSpreadsheet();

      //datanode from firebase
      var periodsNode = 'config/addForecast/'+countryName;

      var periodsData= JSON.parse(FirebaseConnector.getFireBaseData(periodsNode,userToken));

      //I have to update also ALL other firebase configuration for all the other forecast
      for (var period in periodsData) {

        var lastForeCast = 'config/addForecast/'+countryName+'/'+period+'/lastForecast';

        var newForecastColumnPosition = JSON.parse(FirebaseConnector.getFireBaseData(lastForeCast,userToken));
        newForecastColumnPosition = Utility.letterToColumn(newForecastColumnPosition);

        //datanode from firebase
        var beginForeCast = 'config/addForecast/'+countryName+'/'+period+'/firstForecast';

        var firstForecastColumnPosition = JSON.parse(FirebaseConnector.getFireBaseData(beginForeCast,userToken));
        firstForecastColumnPosition = Utility.letterToColumn(firstForecastColumnPosition);

        //datanode from firebase
        var orderInTheSheetNode = 'config/addForecast/'+countryName+'/'+period+'/orderInTheSheet';
        var orderInTheSheet = parseInt(FirebaseConnector.getFireBaseData(orderInTheSheetNode,userToken));

        //datanode from firebase
        var labelValueNode = 'config/addForecast/'+countryName+'/'+period+'/label';
        var labelValue = JSON.parse(FirebaseConnector.getFireBaseData(labelValueNode,userToken));

        //in this case we have also to update firstForecast position
        if(orderInTheSheet!=0){
          FirebaseConnector.writeOnFirebase(Utility.numToChar(newForecastColumnPosition+1), lastForeCast, userToken);
          FirebaseConnector.writeOnFirebase(Utility.numToChar(firstForecastColumnPosition+1), beginForeCast, userToken);

          //MOVE PROTECTED FORMULAS FRC 17-18
          SyncMasterSheet.moveProtectedFormulasCols17_18(Utility.numToChar(newForecastColumnPosition)+':'+Utility.numToChar(newForecastColumnPosition),1,1);

          //MOVE RANGE TO BE STORED FRC 17-18
          SyncMasterSheet.moveRangeToBeStored17_18(Utility.numToChar(newForecastColumnPosition)+':'+Utility.numToChar(newForecastColumnPosition),1,1);

          //MOVE RANGE TO BE PROTECTED FRC 17-18
          SyncMasterSheet.moveRangeToBeProtected17_18(Utility.numToChar(newForecastColumnPosition)+':'+Utility.numToChar(newForecastColumnPosition),1,1);

        }else{
          FirebaseConnector.writeOnFirebase(Utility.numToChar(newForecastColumnPosition+1), lastForeCast, userToken);

          //get the A1 notation for the column
          var columnLetter = Utility.numToChar(newForecastColumnPosition+1);
          //move forecastMetodology column position on firebase (range as input)
          ForecastingMethodologies.moveFMCols(columnLetter+':'+columnLetter,1);

          // This inserts the new column
          sheet.insertColumnsAfter(newForecastColumnPosition,1);
          
          //this set the correct formulas for new column
          //ForecastUtility.writeFormulasForNewForecasts(userToken, newForecastColumnPosition+1);

          var formulasProperties = JSON.parse(PropertiesService.getUserProperties().getProperty("rulesForFormulas"));
          var newForecastColumnPositionLetter = Utility.numToChar(newForecastColumnPosition+1);
          
          //call rebuild formulas
          ForecastUtility.rebuildFormulas(formulasProperties, newForecastColumnPositionLetter);    
          
          //MOVE PROTECTED FORMULAS  FRC 16-17
          SyncMasterSheet.moveProtectedFormulasCols16_17(Utility.numToChar(newForecastColumnPosition)+':'+Utility.numToChar(newForecastColumnPosition),1);

          //MOVE RANGE TO BE STORED  FRC 16-17
          SyncMasterSheet.moveRangeToBeStored16_17(Utility.numToChar(newForecastColumnPosition)+':'+Utility.numToChar(newForecastColumnPosition),1);

          //MOVE RANGE TO BE STORED  FRC 16-17
          SyncMasterSheet.moveRangeToBeProtected16_17(Utility.numToChar(newForecastColumnPosition)+':'+Utility.numToChar(newForecastColumnPosition),1);


          //retrive the row where write the new label
          var labelRowNumberNode = 'config/addForecast/labelRowNumber';
          //in the database value is stored like range "9:9"... to get column number, i have to split
          var labelRowNumber = JSON.parse(FirebaseConnector.getFireBaseData(labelRowNumberNode,userToken)).split(":")[0];

          //set the years of the forecast
          var newCell = sheet.getActiveSheet().getRange(labelRowNumber,newForecastColumnPosition+1).setValue(labelValue);
        }

      }

      //refetch from firebase the configuration for forecastmetodologies
      ForecastingMethodologies.getConfig(true);
      //save all data
      SyncMasterSheet.startSync(userToken);
    }
    else {

      //do nothing
    }



  }
  //------------------------------------------------------------------------------------------------------------------
  // END --   ADD A NEW FORECAST on the google sheet
  //------------------------------------------------------------------------------------------------------------------


  //------------------------------------------------------------------------------------------------------------------
  /**
	 * ADD A NEW FORECAST 17-18
     * @param  {string} auth token
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.addForecast17_18= function(userToken){

    var userChoise = Browser.msgBox('Adding New Forecast', 'Adding a new Forecast will automatically save data. Do you want to proceed?', Browser.Buttons.YES_NO);


    // if user wants to add new FRC
    if (userChoise == 'yes' || userChoise == 'si') {
      var periodChoosen = '17-18';

      var countryName =  FirebaseConnector.getCountryNameFromSheet(userToken);
      var sheet = SpreadsheetApp.getActiveSpreadsheet();

      //datanode from firebase
      var lastForeCast = 'config/addForecast/'+countryName+'/'+periodChoosen+'/lastForecast';

      var newForecastColumnPosition = JSON.parse(FirebaseConnector.getFireBaseData(lastForeCast,userToken));

      newForecastColumnPosition = Utility.letterToColumn(newForecastColumnPosition);

      //datanode from firebase
      var beginForeCast = 'config/addForecast/'+countryName+'/'+periodChoosen+'/firstForecast';

      var firstForecastColumnPosition = JSON.parse(FirebaseConnector.getFireBaseData(beginForeCast,userToken));

      firstForecastColumnPosition = Utility.letterToColumn(firstForecastColumnPosition);

      //datanode from firebase
      var labelNode = 'config/addForecast/'+countryName+'/'+periodChoosen+'/label';
      var labelValue = JSON.parse(FirebaseConnector.getFireBaseData(labelNode,userToken));

      // This inserts the new column
      sheet.insertColumnsAfter(newForecastColumnPosition,1);


      //retrive the row where write the new label
      var labelRowNumberNode = 'config/addForecast/labelRowNumber';
      //in the database value is stored like range "9:9"... to get column number, i have to split
      var labelRowNumber = JSON.parse(FirebaseConnector.getFireBaseData(labelRowNumberNode,userToken)).split(":")[0];

      //set the years of the forecast
      var newCell = sheet.getActiveSheet().getRange(labelRowNumber,newForecastColumnPosition+1).setValue(labelValue);

      //ForecastUtility.writeFormulasForNewForecasts(userToken, newForecastColumnPosition+1);
      
      var formulasProperties = JSON.parse(PropertiesService.getUserProperties().getProperty("rulesForFormulas"));
      var newForecastColumnPositionLetter = Utility.numToChar(newForecastColumnPosition+1);
      
      //call rebuild formulas
      ForecastUtility.rebuildFormulas(formulasProperties, newForecastColumnPositionLetter);    
      
      
      FirebaseConnector.writeOnFirebase(Utility.numToChar(newForecastColumnPosition+1), lastForeCast, userToken);      
      
      //MOVE PROTECTED FORMULAS FRC 17-18
      SyncMasterSheet.moveProtectedFormulasCols17_18(Utility.numToChar(newForecastColumnPosition)+':'+Utility.numToChar(newForecastColumnPosition),1,1);

      //MOVE RANGE TO BE STORED FRC 17-18
      SyncMasterSheet.moveRangeToBeStored17_18(Utility.numToChar(newForecastColumnPosition)+':'+Utility.numToChar(newForecastColumnPosition),1,0);

      //MOVE RANGE TO BE PROTECTED FRC 17-18
      SyncMasterSheet.moveRangeToBeProtected17_18(Utility.numToChar(newForecastColumnPosition)+':'+Utility.numToChar(newForecastColumnPosition),1,0);


      //get the A1 notation for the column
      var columnLetter = Utility.numToChar(newForecastColumnPosition+1);
      //move forecastMetodology column position on firebase (range as input)
      ForecastingMethodologies.moveFMCols(columnLetter+':'+columnLetter,1);


      //refetch from firebase the configuration for forecastmetodologies
      ForecastingMethodologies.getConfig(true);
      //save all data
      SyncMasterSheet.startSync(userToken);

    }
    else{
      //do nothing
    }

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
  this.preventUndoConflictForNewForecast = function (newForecastColumnPosition,lastForeCastNode, userToken, orderInTheSheet,firstForecastColumnPosition,beginForeCastNode){

    var countryName =  FirebaseConnector.getCountryNameFromSheet(userToken);

    //datanode from firebase
    var labelRowNumber = 'config/addForecast/labelRowNumber';
    //retrive the row containing 'Forecasting  Methodology'. IT MUST BE next the last forecast.
    var forecastingMethodologyRange = FirebaseConnector.getFireBaseData(labelRowNumber,userToken);

    //orderInTheSheet choose what result must be consider
    var forecastingMethodologyColumn = Utility.findValueIntoRowMultipeResult('Forecasting  Methodology', JSON.parse(forecastingMethodologyRange))[orderInTheSheet];

    //IF THERE ARE CRTL+Z PROBLEMS (the firebase index for newForecastProblem is bigger then forecasting meth column)
    if(newForecastColumnPosition >= forecastingMethodologyColumn){

      //in this case we have also to update firstForecast position
        if(orderInTheSheet!=0){
          FirebaseConnector.writeOnFirebase(Utility.numToChar(forecastingMethodologyColumn-1), lastForeCastNode, userToken);
          FirebaseConnector.writeOnFirebase(Utility.numToChar(firstForecastColumnPosition-1), beginForeCastNode, userToken);
        }else{
          //change the value of lastForecast config on database
          FirebaseConnector.writeOnFirebase(Utility.numToChar(forecastingMethodologyColumn-1), lastForeCastNode, userToken);
        }


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
  this.hideAllPreviousForecasts = function (userToken){

    //get the google sheet
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    //TODO _ pay attention to multiple sheets
    var sheet = ss.getActiveSheet();
    
    var commodityName = sheet.getRange(Config.Sheet.commodityCell).getValue().toLowerCase();
    
    //datanode from firebase    
    var firstOldFrcFirebasePath = 'config/previousForecast/'+FirebaseConnector.getCountryNameFromSheet(userToken)+'/'+commodityName+'/first';

    //retrive the row containing 'Forecasting  Methodology'. IT MUST BE next the last forecast.
    var firstFrc = JSON.parse(FirebaseConnector.getFireBaseData(firstOldFrcFirebasePath,userToken));

    //TODO _ take from firebase
    //datanode from firebase
    var lastOldFrcFirebasePath = 'config/previousForecast/'+FirebaseConnector.getCountryNameFromSheet(userToken)+'/'+commodityName+'/last';

    //retrive the row containing 'Forecasting  Methodology'. IT MUST BE next the last forecast.
    var lastFrc = JSON.parse(FirebaseConnector.getFireBaseData(lastOldFrcFirebasePath,userToken));

    //with charToNum(letterOfTheColumn) I get the column number
    ForecastUtility.hideOldForecasts(sheet.getRange(firstFrc).getColumn(),sheet.getRange(lastFrc).getColumn(),1);

  }
  //------------------------------------------------------------------------------------------------------------------
  // END -- function called to hide all the forecast for previus year except the last one
  //------------------------------------------------------------------------------------------------------------------   
}
