var SyncMasterSheet=new function(){

	  /**
	    * Saving Sheet Data function
        * @param  {string} auth token
	  */
	  this.startFetch=function(userToken) {

        var userChoise = Browser.msgBox('LOAD DATA', 'Load the latest data from the AMIS database overwriting the data in the sheet?', Browser.Buttons.YES_NO);


        // if user wants to laod data
        if (userChoise == 'yes' || userChoise == 'si') {


          //hide old forecasts leaving only the last one
          ForecastUtility.hideAllPreviousForecasts(userToken);
          
          //hide new frc unactive columns
          ForecastUtility.hideAllPeriodUnactiveColumns(userToken);

          //Get the currently active sheet
          var sheet = SpreadsheetApp.getActiveSheet();

          //var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData(SyncMasterSheet.getRangeToBeStoredNode(userToken),userToken));

          var rangeFromConfig= SyncMasterSheet.getRangeToBeStored(userToken);


          for (var i=0; i<rangeFromConfig.length;i++){

        	  //get Firebase node name to be fetch
              var fireBaseNodeData= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + JSON.parse(SyncMasterSheet.getNodeToWriteData(userToken)).dataSheetNode + '/' + FirebaseConnector.getCommodityName() + '/' + rangeFromConfig[i];

              var fireBaseValues = JSON.parse(FirebaseConnector.getFireBaseData(fireBaseNodeData,userToken));

              //if data note IS NOT EMPTY
              if(fireBaseValues){
                //set value into cells
                sheet.getRange(rangeFromConfig[i]).setValues(fireBaseValues);
              }
          }

          Utility.toastInfo('Data successfully loaded to the AMIS database', 'DATA LOADED');

        } else {

          //do nothing
        }


	  }
      
      
      /**
	    * Delete all data in TEMPLATE
        * 
	  */
      this.startFetchEmptyAllData=function(isWithWarning, isNeedingCommodityName, sheetChosenCommodityName) {
        
        userToken = FirebaseConnector.getToken();
        var chosenCountry = getSecretariatCountry();
        if(isWithWarning){
          var userChoise = Browser.msgBox('LOAD DATA', 'Load the latest data from the AMIS database overwriting the data in the sheet?', Browser.Buttons.YES_NO);
        }else(
          userChoise='yes'
        )
        
        // if user wants to laod data
        if (userChoise == 'yes' || userChoise == 'si') {
          
          var sheet;
          var rangeFromConfig;
          
          if(!isNeedingCommodityName){
            //Get the currently active sheet
            sheet = SpreadsheetApp.getActiveSheet();
            rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData(SyncMasterSheet.getRangeToBeStoredNode(userToken),userToken));
          }else{
            sheet  = sheetChosenCommodityName;
            rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData(SyncMasterSheet.getRangeToBeStoredNodeSecretariat(userToken,sheetChosenCommodityName),userToken));                     
          }
          
          for (var i=0; i<rangeFromConfig.length;i++){
            
            var fireBaseNodeData;
            
            if(!isNeedingCommodityName){
              //get Firebase node name to be fetch
              //fireBaseNodeData= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + SyncMasterSheet.getNodeToWriteDataSecretariat(userToken,chosenCountry) + '/' + FirebaseConnector.getCommodityName() + '/' + rangeFromConfig[i];
            }else{
              //get Firebase node name to be fetch
              //fireBaseNodeData= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + SyncMasterSheet.getNodeToWriteDataSecretariat(userToken,chosenCountry) + '/' + FirebaseConnector.getCommodityNameSecretariat(sheetChosenCommodityName) + '/' + rangeFromConfig[i];
              // Browser.msgBox(fireBaseNodeData);
            }
            //var fireBaseValues = JSON.parse(FirebaseConnector.getFireBaseData(fireBaseNodeData,userToken));
            
            //set EMPTY VALUE
            sheet.getRange(rangeFromConfig[i]).setValue('');
          }                    
          
        } else {
          
          //do nothing
        }

      }
      
      /**
	    * Saving Sheet Data function FOR SECRETARIET
        * @param  {string} auth token
	  */
	  this.startFetchSecretariet=function(isWithWarning, isNeedingCommodityName, sheetChosenCommodityName) {
        userToken = FirebaseConnector.getToken();
        var chosenCountry = getSecretariatCountry();
        if(isWithWarning){
          var userChoise = Browser.msgBox('LOAD DATA', 'Load the latest data from the AMIS database overwriting the data in the sheet?', Browser.Buttons.YES_NO);
        }else(
          userChoise='yes'
        )

        // if user wants to laod data
        if (userChoise == 'yes' || userChoise == 'si') {


          //hide old forecasts leaving only the last one
          ForecastUtility.hideAllPreviousForecastsSecretariat(userToken,isNeedingCommodityName,sheetChosenCommodityName);
          
          if(isNeedingCommodityName){
            //hide new frc unactive columns
            ForecastUtility.hideAllPeriodUnactiveColumnsSecretariatWithChosenCommodityName(userToken,sheetChosenCommodityName);
          }else{
            //hide new frc unactive columns
            ForecastUtility.hideAllPeriodUnactiveColumnsSecretariat(userToken);
          }
          
          
          var sheet;
          var rangeFromConfig
          if(!isNeedingCommodityName){
            //Get the currently active sheet
            sheet = SpreadsheetApp.getActiveSheet();
            rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData(SyncMasterSheet.getRangeToBeStoredNode(userToken),userToken));
          }else{
            sheet  = sheetChosenCommodityName;
            rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData(SyncMasterSheet.getRangeToBeStoredNodeSecretariat(userToken,sheetChosenCommodityName),userToken));         
            
          }

          for (var i=0; i<rangeFromConfig.length;i++){
            
            var fireBaseNodeData;
            
            if(!isNeedingCommodityName){
              //get Firebase node name to be fetch
              fireBaseNodeData= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + SyncMasterSheet.getNodeToWriteDataSecretariat(userToken,chosenCountry) + '/' + FirebaseConnector.getCommodityName() + '/' + rangeFromConfig[i];
            }else{
              //get Firebase node name to be fetch
              fireBaseNodeData= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/' + SyncMasterSheet.getNodeToWriteDataSecretariat(userToken,chosenCountry) + '/' + FirebaseConnector.getCommodityNameSecretariat(sheetChosenCommodityName) + '/' + rangeFromConfig[i];
              // Browser.msgBox(fireBaseNodeData);
            }
            
            var fireBaseValues = JSON.parse(FirebaseConnector.getFireBaseData(fireBaseNodeData,userToken));
            
            //if data note IS NOT EMPTY
            if(fireBaseValues){
              //set value into cells
              sheet.getRange(rangeFromConfig[i]).setValues(fireBaseValues);
            }
          }

          if(!isNeedingCommodityName){
            Utility.toastInfo('Data successfully loaded to the AMIS database', 'DATA LOADED');
          }
          

        } else {

          //do nothing
        }


	  }
      

    /**
     * get single range values and prepare it to be stored in firebase
     * @param  {array} sheetValues all the data in the sheet. from first column to the last
     * @param  {string} range       range in A1Notation
	 * @param  {array} fmRanges ForecastingMethodologies ranges from firebase
     * @return {array}             a two-dimensional array of values,  indexed by row, then by column
     */
    this.getRangeValuesToBeStored=function(sheetValues, range, fmRanges) {
        var currA1, rangeIndexes, hasDates=false, sheetDataJson,dataToBeStored;

        dataToBeStored = Utility.getRangeValuesFromArray(sheetValues, range);
        rangeIndexes=ConvertA1.rangeA1ToIndex(range);
        sheetDataJson=JSON.stringify(dataToBeStored);


        for (var i = 0, len = dataToBeStored.length; i < len; i++) {
            for (var j = 0, len2 = dataToBeStored[i].length; j < len2; j++){
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
                    hasDates=true;
                }else{
                    //clean invalid ForecastingMethodology values
                    currA1=Utility.numToChar(j+1+rangeIndexes.left)+(i+1+rangeIndexes.top);
                    dataToBeStored[i][j]=ForecastingMethodologies.onEditCell(currA1,fmRanges,dataToBeStored[i][j],true);
                }

            }
        }

        //if the range doesn't contains date but has changed
        if (!hasDates && (JSON.stringify(dataToBeStored)!==sheetDataJson)) {
            SpreadSheetCache.getActiveSheet().getRange(range).setValues(dataToBeStored);
        }

        return dataToBeStored;
    };

  /**
	* Saving Sheet Data function
    * @param  {string} auth token
  */
  this.startSync=function(userToken) {
    //SyncMasterSheet.deleteSavedData();
    //SyncMasterSheet.moveRangesCols('AC:AC',1);

    //hide old forecasts leaving only the last one
    ForecastUtility.hideAllPreviousForecasts(userToken);
    //hide new frc unactive columns
    ForecastUtility.hideAllPeriodUnactiveColumns(userToken);

    //Get the currently active sheet
    var sheetValues=SpreadSheetCache.getActiveSheetValues();

    var dataToBeStored={},currRange, saveNode,baseOfSaveNode, fmRanges;

    saveNode=SyncMasterSheet.getRangeToBeStoredNode(userToken);
    var rangeFromConfig= SyncMasterSheet.getRangeToBeStored(userToken);
    fmRanges = ForecastingMethodologies.getFMRanges();

    //loop all the ranges stored in firebase
    for (var p=0; p<rangeFromConfig.length;p++){
        currRange=rangeFromConfig[p];
        dataToBeStored[currRange]=SyncMasterSheet.getRangeValuesToBeStored(sheetValues,currRange, fmRanges);
    }

    baseOfSaveNode= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/'+ JSON.parse(SyncMasterSheet.getNodeToWriteData(userToken)).dataSheetNode+ '/' + FirebaseConnector.getCommodityName();
    SyncMasterSheet.syncMasterSheet(dataToBeStored,userToken,baseOfSaveNode);

    var commodityName = FirebaseConnector.getCommodityName();


    var countryName =  FirebaseConnector.getCountryNameFromSheet(userToken);    

    Utility.toastInfo('Data successfully saved to the AMIS database', 'DATA SAVED');

    //protect again the sheet
    //ProtectRanges.protectCell(userToken);
};
  
  /**
  * Saving Sheet Data function FOR SECRETARIET
  * @param  {string} auth token
  */
  this.startSyncSecretariet=function(userToken,chosenCountry) {
    chosenCountry = getSecretariatCountry();
    //hide old forecasts leaving only the last one
    ForecastUtility.hideAllPreviousForecastsSecretariat(userToken);
    //hide new frc unactive columns
    ForecastUtility.hideAllPeriodUnactiveColumnsSecretariat(userToken);
    
    //Get the currently active sheet
    var sheetValues=SpreadSheetCache.getActiveSheetValues();
    
    var dataToBeStored={},currRange, saveNode,baseOfSaveNode, fmRanges;
        
    var rangeFromConfig= SyncMasterSheet.getRangeToBeStored(userToken);
    fmRanges = ForecastingMethodologies.getFMRanges();
    
    //loop all the ranges stored in firebase
    for (var p=0; p<rangeFromConfig.length;p++){
      currRange=rangeFromConfig[p];
      dataToBeStored[currRange]=SyncMasterSheet.getRangeValuesToBeStored(sheetValues,currRange, fmRanges);
    }
    
    baseOfSaveNode= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/'+ SyncMasterSheet.getNodeToWriteDataSecretariat(userToken,chosenCountry)+ '/' + FirebaseConnector.getCommodityName();
    SyncMasterSheet.syncMasterSheet(dataToBeStored,userToken,baseOfSaveNode);
    
    var commodityName = FirebaseConnector.getCommodityName();
    
    
    var countryName =  FirebaseConnector.getCountryNameFromSheet(userToken);    
    
    Utility.toastInfo('Data successfully saved to the AMIS database', 'DATA SAVED');    
};

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




    };
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
  };

  /**
	 *  retrive from config how to name the new node (depends on the country )
     *  @param {string}  auth token
     *  @return {string} the correct node where save datas
	 */
  this.getNodeToWriteData= function (userToken){
   var sheetId= this.getSheetId();
   var dataBaseNodeToRead='config/countries/'+sheetId;
   return FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken);
  };
  
  /**
	 *  retrive from config how to name the new node (depends on the country )
     *  @param {string}  auth token
     *  @return {string} the correct node where save datas
	 */
  this.getNodeToWriteDataSecretariat= function (userToken,chosenCountry){
   chosenCountry = getSecretariatCountry();
   var addingString = 'Data'
   return chosenCountry+addingString;
  };

  this.getSheetId= function(){
	  return Utility.getGoogleSheetID();
  };

  this.setLastUpdate = function(userToken){
        var sheet = SpreadsheetApp.getActiveSheet();
        var date = new Date();

        var commodityName = FirebaseConnector.getCommodityName();

        var countryName =  FirebaseConnector.getCountryNameFromSheet(userToken);
        //datanode from firebase
        var lastUpdateCellNode = 'config/lastUpdateCell/'+countryName+'/'+commodityName;
        var lastUpdateCell= JSON.parse(FirebaseConnector.getFireBaseData(lastUpdateCellNode,userToken));

        //TODO get this range from firebase
        sheet.getRange(lastUpdateCell).setValue(date);
    };

  this.getRangeToBeStoredNode = function(userToken){
        var sheet = SpreadsheetApp.getActiveSheet();
        var commodityName = FirebaseConnector.getCommodityName();

        var sheetId= this.getSheetId();
        var dataBaseNodeToRead='config/countries/'+sheetId;
        return 'config/rangeToBeStored/'+JSON.parse(FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken)).name+'/'+commodityName;
    };

 this.getRangeToBeStoredNodeSecretariat = function(userToken,sheet){        
        var commodityName = FirebaseConnector.getCommodityNameSecretariat(sheet);
   
        return 'config/rangeToBeStored/'+ getSecretariatCountry() +'/'+commodityName;
    };    



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
};
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

    return rangeFromConfig;
};
  //---------------------------------------------------------
  //---------------------------------------------------------
  // END -- Retrives all the ranges to be stored
  //---------------------------------------------------------
  
  //---------------------------------------------------------
  /** 
  * retrive all the ranges to be stored FOR SECRETARIAT
  *  @param  {string} auth token
  *  @return  {array} ranges to be stored
  */
  //---------------------------------------------------------
  this.getRangeToBeStoredSecretariat = function(userToken) {
    
    var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData(SyncMasterSheet.getRangeToBeStoredNode(userToken),userToken));
    
    return rangeFromConfig;
  };
  //---------------------------------------------------------
  //---------------------------------------------------------
  // END -- Retrives all the ranges to be stored FOR SECRETARIAT
  //---------------------------------------------------------

  //------------------------------------------------------------------------------------------------------------------
  // delete saved data
  //------------------------------------------------------------------------------------------------------------------
  this.deleteSavedData = function(){
        var ar = [];
        FirebaseConnector.writeOnFirebase(
          ar,
          'dataAmisSheet/countries/argentinaData',
         FirebaseConnector.getToken()
        );
    };
  //------------------------------------------------------------------------------------------------------------------
  // END --  delete saved data
  //------------------------------------------------------------------------------------------------------------------
};
