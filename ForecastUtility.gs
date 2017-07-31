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
      var commodityName = FirebaseConnector.getCommodityName();
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
          if(periodsData.hasOwnProperty(period)){
                currLastForecastPos = Utility.letterToColumn(periodsData[period].lastForecast);
                if (currLastForecastPos <= cellPos && cellPos <= (currLastForecastPos + 2)) {
                  return true;
              }
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
      var cellPos, actualPosition, lastForecastPosition, period, periodsData, dataCells, sheet,notesPosition, rangeCells, rowValues=[];
      sheet=SpreadSheetCache.getActiveSheet();
      periodsData=this.getPeriodsData();
      cellPos = cell.getColumn();

      for (period in periodsData) {
        if(periodsData[period])  {
            actualPosition = ConvertA1.colA1ToIndex(periodsData[period].actualPosition, 1);
            lastForecastPosition = ConvertA1.colA1ToIndex(periodsData[period].lastForecast, 1);

            //cell is the actualPosition or ForecastingMethodologies or Notes
            if (
                (cellPos===actualPosition) || //cell is the actualPosition
                (cellPos===lastForecastPosition+1) || //cell is ForecastingMethodologies
                (cellPos===lastForecastPosition+2) //cell is Notes
            ) {
                notesPosition=(lastForecastPosition+2);
                rangeCells=notesPosition-actualPosition;
                dataCells=sheet.getRange(lastDateUpdaterRow, actualPosition, 1, rangeCells);

                //Initialize the array of values
                for (var i = rangeCells-1; i--;) {
                    rowValues.push(null);
                }

                //set the new date in the array
                rowValues[rangeCells]=rowValues[rangeCells-1]=rowValues[0]=new Date();
                
                var da=dataCells.getValues();
                dataCells.setValues([rowValues]);

                return;
            }
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
    var period = '16-17';
    ForecastUtility.addForecast(period,userToken);
  };
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
    var period = '17-18';
    ForecastUtility.addForecast(period,userToken);
  };
  //------------------------------------------------------------------------------------------------------------------
  // END --   ADD A NEW FORECAST on the google sheet
  //------------------------------------------------------------------------------------------------------------------

  /**
   * hide period's unactive columns
   * @param  {object} periodConf configuration of the period from the db
   */
  this.hidePeriodColumns=function(periodConf){
      //last frc
      var lastForecastColumnPosition = periodConf.lastForecast;
      lastForecastColumnPosition = Utility.letterToColumn(lastForecastColumnPosition);

      //first frc
      var firstForecastColumnPosition = periodConf.firstForecast;
      firstForecastColumnPosition = Utility.letterToColumn(firstForecastColumnPosition);

      //actual frc
      var actualForecastColumnPosition = periodConf.actualPosition;
      actualForecastColumnPosition = Utility.letterToColumn(actualForecastColumnPosition);

      //hide correctly the new column
      ForecastUtility.hideColumnForNewForecasts(firstForecastColumnPosition,lastForecastColumnPosition, actualForecastColumnPosition);
  };


  //------------------------------------------------------------------------------------------------------------------
  /**
	 * ADD A NEW FORECAST on the google sheet
     * @param  {string} auth token
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.addForecast= function(period,userToken){

    var countryName =  FirebaseConnector.getCountryNameFromSheet(userToken);
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var commodity = FirebaseConnector.getCommodityName();

    //read config from firebase
    var periodConfNode = 'config/addForecast/'+countryName+'/'+commodity +'/'+period;

    var periodConf = JSON.parse(FirebaseConnector.getFireBaseData(periodConfNode,userToken));

    //last frc
    var lastForecastColumnPosition = periodConf.lastForecast;
    lastForecastColumnPosition = Utility.letterToColumn(lastForecastColumnPosition);

    //first frc
    var firstForecastColumnPosition = periodConf.firstForecast;
    firstForecastColumnPosition = Utility.letterToColumn(firstForecastColumnPosition);

    //actual frc
    var actualForecastColumnPosition = periodConf.actualPosition;
    actualForecastColumnPosition = Utility.letterToColumn(actualForecastColumnPosition);

    //if we cannot add new FRC.. break the script
    if(actualForecastColumnPosition == lastForecastColumnPosition)
      return 0;

    //increase actual position
    actualForecastColumnPosition = actualForecastColumnPosition +1;

    var actualForecastColumnPositionNode = periodConfNode + '/actualPosition';

    //update the actualPositon in FIREBASE
    FirebaseConnector.writeOnFirebase(Utility.numToChar(actualForecastColumnPosition), actualForecastColumnPositionNode, userToken);

    //hide correctly the new column
    ForecastUtility.hideColumnForNewForecasts(firstForecastColumnPosition,lastForecastColumnPosition, actualForecastColumnPosition);

  };
  //------------------------------------------------------------------------------------------------------------------
  // END --   ADD A NEW FORECAST on the google sheet
  //------------------------------------------------------------------------------------------------------------------



  //------------------------------------------------------------------------------------------------------------------
  /**
	 * ADD A NEW FORECAST on the google sheet
     * @param  {string} auth token
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.addForecast16_17_OLD= function(userToken){

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



  };
  //------------------------------------------------------------------------------------------------------------------
  // END --   ADD A NEW FORECAST on the google sheet
  //------------------------------------------------------------------------------------------------------------------


  //------------------------------------------------------------------------------------------------------------------
  /**
	 * ADD A NEW FORECAST 17-18
     * @param  {string} auth token
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.addForecast17_18_OLD = function(userToken){

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

  };
  //------------------------------------------------------------------------------------------------------------------
  // END --   ADD A NEW FORECAST on the google sheet
  //------------------------------------------------------------------------------------------------------------------

  /**
	 * hide old forecast except the last 2
     * @param  {number} beginingPosition forecast position
     * @param  {number} lastPosition forecast position
     * @param  {number} numberOfColumnVisibleInTheRange of column you want to be shown
  */
  this.hideOldForecasts= function (beginingPosition, lastPosition, numberOfColumnVisibleInTheRange){

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    var columnToBeHidden = lastPosition - beginingPosition - numberOfColumnVisibleInTheRange;

    if(columnToBeHidden >-1)
      sheet.hideColumns(beginingPosition, columnToBeHidden+1);
  };

  /**
	 * show old forecast
  */
  this.showOldForecasts= function (){
    var config, firstCol, lastCol;
    var sheet = SpreadSheetCache.getActiveSheet();
    var commodityName = FirebaseConnector.getCommodityName();
    var userToken=FirebaseConnector.getToken();
    var firebasePath = 'config/previousForecast/'+FirebaseConnector.getCountryNameFromSheet(userToken)+'/'+commodityName;

    config = JSON.parse(FirebaseConnector.getFireBaseData(firebasePath,userToken));

    firstCol=ConvertA1.colA1ToIndex(config.first.split(":")[0],1);
    lastCol=ConvertA1.colA1ToIndex(config.last.split(":")[0],1);

    sheet.showColumns(firstCol, lastCol-firstCol);

  };
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
  };
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

    var commodityName = FirebaseConnector.getCommodityName();

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

  };
  //------------------------------------------------------------------------------------------------------------------
  // END -- function called to hide all the forecast for previus year except the last one
  //------------------------------------------------------------------------------------------------------------------

  this.hideColumnForNewForecasts= function (firstForecastColumnPosition,lastForecastColumnPosition, actualForecastColumnPosition){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    //in this case just simple hide every thing after the actual position
    if(actualForecastColumnPosition - firstForecastColumnPosition <2 ) {
      ForecastUtility.hideOldForecasts(actualForecastColumnPosition+1, lastForecastColumnPosition,0 );

    }else {

      var letterClm = Utility.numToChar(actualForecastColumnPosition);
      letterClm = letterClm+':'+letterClm;
      //unhide the new actualPosition column. the function TAKES RANGE as paramaeter!
      sheet.unhideColumn(sheet.getRange(letterClm));

      //hide the previus frc
      ForecastUtility.hideOldForecasts(firstForecastColumnPosition, actualForecastColumnPosition,2 );
      //hide the still to much new forecast
      ForecastUtility.hideOldForecasts(actualForecastColumnPosition+1, lastForecastColumnPosition,0 );
    }
  };

  /**
   * hide all the forecast for previus year except the last one and all unactive columns of all periods
   * @param {string} userToken firebase token
   */
  this.hideOldAndUnactiveForecast = function(userToken) {
    var allPeriodConf, allPeriodConfNode, commodity, countryName, period;

    countryName = FirebaseConnector.getCountryNameFromSheet(userToken);
    commodity = FirebaseConnector.getCommodityName();
    allPeriodConfNode = 'config/addForecast/' + countryName + '/' + commodity;
    allPeriodConf = JSON.parse(FirebaseConnector.getFireBaseData(allPeriodConfNode, userToken));

    for (var _i in allPeriodConf) {
      period=allPeriodConf[_i];
      ForecastUtility.hidePeriodColumns(period);
    }

    ForecastUtility.hideAllPreviousForecasts(userToken);
  };


};
