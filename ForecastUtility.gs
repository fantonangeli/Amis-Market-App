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
                rangeCells=notesPosition-actualPosition+1;
                dataCells=sheet.getRange(lastDateUpdaterRow, actualPosition, 1, rangeCells);

                //Initialize the array of values
                for (var i = rangeCells; i--;) {
                    rowValues.push(null);
                }

                //set the new date in the array
                rowValues[rangeCells-1]=rowValues[rangeCells-2]=rowValues[0]=new Date();

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

    //------------------------------------------------------------------------------------------------------------------
  /**
  * ADD A NEW FORECAST on the google sheet FOR SECRETARIET
  * @param  {string} auth token
  */
  //------------------------------------------------------------------------------------------------------------------
  this.addForecast16_17_Secretariet= function(userToken,chosenCountry){
    chosenCountry = getSecretariatCountry();
    var period = '16-17';
    ForecastUtility.addForecastSecretariet(period,userToken,chosenCountry);
  };
  //------------------------------------------------------------------------------------------------------------------
  // END --   ADD A NEW FORECAST on the google sheet FOR SECRETARIET
  //------------------------------------------------------------------------------------------------------------------

  //------------------------------------------------------------------------------------------------------------------
  /**
  * ADD A NEW FORECAST 17-18 FOR SECRETARIET
  * @param  {string} auth token
  */
  //------------------------------------------------------------------------------------------------------------------
  this.addForecast17_18_Secretariet= function(userToken, chosenCountry){
    chosenCountry = getSecretariatCountry();
    var period = '17-18';
    ForecastUtility.addForecastSecretariet(period,userToken,chosenCountry);
  };
  //------------------------------------------------------------------------------------------------------------------
  // END --   ADD A NEW FORECAST on the google sheet FOR SECRETARIET
  //------------------------------------------------------------------------------------------------------------------

  /**
   * hide period's unactive columns for ALL period
   * @param  {string} userToken firebase token
   */
  this.hideAllPeriodUnactiveColumns=function(userToken) {
      var allPeriodConf, allPeriodConfNode, commodity, countryName, period;

      countryName = FirebaseConnector.getCountryNameFromSheet(userToken);
      commodity = FirebaseConnector.getCommodityName();
      allPeriodConfNode = 'config/addForecast/' + countryName + '/' + commodity;
      allPeriodConf = JSON.parse(FirebaseConnector.getFireBaseData(allPeriodConfNode, userToken));

      for (var _i in allPeriodConf) {
        if (allPeriodConf[_i]) {
            period=allPeriodConf[_i];
            ForecastUtility.hidePeriodUnactiveColumns(period);
        }
      }
  };

  /**
   * hide period's unactive columns for ALL period FOR SECRETARIAT
   * @param  {string} userToken firebase token
   */
  this.hideAllPeriodUnactiveColumnsSecretariat=function(userToken) {
      var allPeriodConf, allPeriodConfNode, commodity, countryName, period;

      countryName = getSecretariatCountry();
      commodity = FirebaseConnector.getCommodityName();
      allPeriodConfNode = 'config/addForecast/' + countryName + '/' + commodity;
      allPeriodConf = JSON.parse(FirebaseConnector.getFireBaseData(allPeriodConfNode, userToken));

      for (var _i in allPeriodConf) {
        if (allPeriodConf[_i]) {
            period=allPeriodConf[_i];
            ForecastUtility.hidePeriodUnactiveColumns(period);
        }
      }
  };

  /**
   * hide period's unactive columns for ALL period FOR SECRETARIAT
   * @param  {string} userToken firebase token
   */
  this.hideAllPeriodUnactiveColumnsSecretariatWithChosenCommodityName=function(userToken,sheetChosenCommodityName) {
      var allPeriodConf, allPeriodConfNode, commodity, countryName, period;

      countryName = getSecretariatCountry();
      commodity = FirebaseConnector.getCommodityNameSecretariat(sheetChosenCommodityName);
      allPeriodConfNode = 'config/addForecast/' + countryName + '/' + commodity;
      allPeriodConf = JSON.parse(FirebaseConnector.getFireBaseData(allPeriodConfNode, userToken));

      for (var _i in allPeriodConf) {
        if (allPeriodConf[_i]) {
            period=allPeriodConf[_i];
            ForecastUtility.hidePeriodUnactiveColumnsWithChosenCommodityName(period,sheetChosenCommodityName);
        }
      }
  };

  /**
   * hide period's unactive columns
   * @param  {object} periodConf configuration of the period from the db
   */
  this.hidePeriodUnactiveColumns=function(periodConf){
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


  /**
   * hide period's unactive columns FOR SECRETARIAT WITH SHEET
   * @param  {object} periodConf configuration of the period from the db
   * @param  {sheet} the sheet chosen
   */
  this.hidePeriodUnactiveColumnsWithChosenCommodityName=function(periodConf,sheetChosenCommodityName){
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
      ForecastUtility.hideColumnForNewForecastsWithChosenCommodityName(firstForecastColumnPosition,lastForecastColumnPosition, actualForecastColumnPosition,sheetChosenCommodityName);
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
	 * ADD A NEW FORECAST on the google sheet FOR SECRETARIET
     * @param  {string} auth token
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.addForecastSecretariet = function(period,userToken,chosenCountry){

    var countryName =  chosenCountry;
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
  // END --   ADD A NEW FORECAST on the google sheet FOR SECRETARIET
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
	 * hide old forecast except the last 2 FOR SECRETARIAT WithChosenCommodityName
     * @param  {number} beginingPosition forecast position
     * @param  {number} lastPosition forecast position
     * @param  {number} numberOfColumnVisibleInTheRange of column you want to be shown
  */
  this.hideOldForecastsWithChosenCommodityName= function (beginingPosition, lastPosition, numberOfColumnVisibleInTheRange, sheetChosenCommodityName){

    var sheet = sheetChosenCommodityName;

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
    var userToken=FirebaseConnector.getToken();

    config = Utility.getCommodityNamedRanges().previousForecast;

    firstCol=ConvertA1.colA1ToIndex(config.first.split(":")[0],1);
    lastCol=ConvertA1.colA1ToIndex(config.last.split(":")[0],1);

    ForecastUtility.hideAllPeriodUnactiveColumns(userToken);

    sheet.showColumns(firstCol, lastCol-firstCol);

  };
  //------------------------------------------------------------------------------------------------------------------
  // END hide old forecast except the last 2
  //------------------------------------------------------------------------------------------------------------------


   /**
	 * show old forecast FOR SECRETARIAT
  */
  this.showOldForecastsSecretariat= function (){

    var config, firstCol, lastCol;
    var sheet = SpreadSheetCache.getActiveSheet();
    var userToken=FirebaseConnector.getToken();

    config = Utility.getCommodityNamedRanges().previousForecast;

    firstCol=ConvertA1.colA1ToIndex(config.first.split(":")[0],1);
    lastCol=ConvertA1.colA1ToIndex(config.last.split(":")[0],1);

    ForecastUtility.hideAllPeriodUnactiveColumns(userToken);

    sheet.showColumns(firstCol, lastCol-firstCol);

  };


  /**
	 * Solve CTRL+Z problems for 'add new forecast'
     * @param  {string} new forecast column index
     * @param  {string} last forecast position
     * @param  {string} user token
     * @return  {string} new Forecast Column Position after fixing CTRL problems
 	 * @deprecated not needed anymore
	 */
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
    var ss = SpreadSheetCache.getActiveSpreadsheet();
    //TODO _ pay attention to multiple sheets
    var sheet = ss.getActiveSheet();
    var config=Utility.getCommodityNamedRanges().previousForecast;

    ForecastUtility.hideOldForecasts(sheet.getRange(config.first).getColumn(),sheet.getRange(config.last).getColumn(),1);

  };
  //------------------------------------------------------------------------------------------------------------------
  // END -- function called to hide all the forecast for previus year except the last one
  //------------------------------------------------------------------------------------------------------------------

  //------------------------------------------------------------------------------------------------------------------
  /**
	 * function called to hide all the forecast for previus year except the last one FOR SECRETARIAT
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.hideAllPreviousForecastsSecretariat = function (userToken, isNeedingCommodityName, sheetChosenCommodityName){
    var sheet;
    var config=Utility.getCommodityNamedRanges().previousForecast;

    if(isNeedingCommodityName){
      sheet = sheetChosenCommodityName;
    }else{
      //get the google sheet
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      sheet = ss.getActiveSheet();
    }



    if(isNeedingCommodityName){
      //with charToNum(letterOfTheColumn) I get the column number
      ForecastUtility.hideOldForecastsWithChosenCommodityName(sheet.getRange(config.first).getColumn(),sheet.getRange(config.last).getColumn(),1,sheet);
    }else{
      //with charToNum(letterOfTheColumn) I get the column number
      ForecastUtility.hideOldForecasts(sheet.getRange(config.first).getColumn(),sheet.getRange(config.last).getColumn(),1);
    }

  };
  //------------------------------------------------------------------------------------------------------------------
  // END -- function called to hide all the forecast for previus year except the last one FOR SECRETARIAT
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


  this.hideColumnForNewForecastsWithChosenCommodityName= function (firstForecastColumnPosition,lastForecastColumnPosition, actualForecastColumnPosition,sheetChosenCommodityName){
    var sheet = sheetChosenCommodityName;

    //in this case just simple hide every thing after the actual position
    if(actualForecastColumnPosition - firstForecastColumnPosition <2 ) {
      ForecastUtility.hideOldForecastsWithChosenCommodityName(actualForecastColumnPosition+1, lastForecastColumnPosition,0, sheet );

    }else {

      var letterClm = Utility.numToChar(actualForecastColumnPosition);
      letterClm = letterClm+':'+letterClm;
      //unhide the new actualPosition column. the function TAKES RANGE as paramaeter!
      sheet.unhideColumn(sheet.getRange(letterClm));

      //hide the previus frc
      ForecastUtility.hideOldForecastsWithChosenCommodityName(firstForecastColumnPosition, actualForecastColumnPosition,2,sheet );
      //hide the still to much new forecast
      ForecastUtility.hideOldForecastsWithChosenCommodityName(actualForecastColumnPosition+1, lastForecastColumnPosition,0,sheet );
    }
  };

  /**
   * hide all the forecast for previus year except the last one and all unactive columns of all periods
   * @param {string} userToken firebase token
   */
  this.hideOldAndUnactiveForecast = function(userToken) {
    ForecastUtility.hideAllPeriodUnactiveColumns(userToken)

    ForecastUtility.hideAllPreviousForecasts(userToken);
  };

  /**
   * hide all the forecast for previus year except the last one and all unactive columns of all periods FOR SECRETARIAT
   * @param {string} userToken firebase token FOR SECRETARIAT
   */
  this.hideOldAndUnactiveForecastSecretariat = function(userToken) {
    ForecastUtility.hideAllPeriodUnactiveColumnsSecretariat(userToken)

    ForecastUtility.hideAllPreviousForecastsSecretariat(userToken);
  };


};
