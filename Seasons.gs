/**
 * Seasons management class
 * @return {Object}
 */
var Seasons=new function(){

    
    /**
     * add a new historical column to the excel export spredsheet
     * @param  {object} excelExportSheetId         the sheet
     * @param  {object}   spreadSheetId the spreadSheet
     * @return {void}
     * @throws {InvalidArgument}
     */
    this.addNewHistoricalCol2Excel=function(spreadSheetId, excelExportSheetId){
        var excelSS;

        excelSS=SpreadsheetApp.openById(excelExportSheetId);

        Utility.forEachSheet( spreadSheetId, Config.commoditySheetsRegex, function( sheet,sheetName) {
            var historicalCol, excelSheet;

            historicalCol=ForecastUtility.getHistoricalColNumBySheet(sheet);

            excelSheet=excelSS.getSheetByName(sheetName);

            //add the new col to the historical data
            excelSheet.insertColumnBefore(historicalCol.last);


            ForecastUtility.hideOldForecasts( historicalCol.first,historicalCol.last, 0, excelSheet );
        } );
        
    };
    

    
    /**
     * add a new historical column and move the oldest forecast data to the historical data
     * @param  {object} sheet         the sheet
     * @param  {number} spreadSheetYear the year of the spreadSheet, NOT the new year
     * @return {void}
     * @throws {InvalidArgument}
     */
    this.moveOldForecastToHistoricalData=function(sheet,spreadSheetYear){
        var from, lastHistoricalCol, to, namedRanges;

        if (!sheet || !spreadSheetYear) {
            throw "InvalidArgument";
        }

        namedRanges=AmisNamedRanges.getCommodityNamedRangesBySheet(sheet);
        lastHistoricalCol=ForecastUtility.getHistoricalColNumBySheet(sheet).last;

        //add the new col to the historical data
        sheet.insertColumnBefore(lastHistoricalCol);

        //copy last historical col to
        to=sheet.getRange(namedRanges.previousForecast.last);
        from=to.offset(0, 1);
        from.copyTo(to);

        //copy old forecast to the last historical column
        to=from;
        from=sheet.getRange(namedRanges.colMap[spreadSheetYear-1]).offset(0,2);
        from.copyTo(to);
    };

    /**
     * add a new historical column and move the oldest forecast data to the historical data
     * @param  {object}   spreadSheet the spreadSheet
     * @param  {number} spreadSheetYear the year of the spreadSheet, NOT the new year
     * @return {void}
     * @throws {InvalidArgument}
     */
    this.moveOldForecastToHistoricalDataAllSheets=function(spreadSheet, spreadSheetYear){
        var spreadSheetId;

        if (!spreadSheet) {
            throw "InvalidArgument";
        }

        spreadSheetId=spreadSheet.getId();

        Utility.forEachSheet(spreadSheetId, /.*/, function(s, sheetName) {
            Seasons.moveOldForecastToHistoricalData(s, spreadSheetYear);

            if (new RegExp( "^" + Config.templatePrefix ).test(sheetName)) {
                Seasons.newHistoricalColumnUpdateNamedRanges(spreadSheet, s, spreadSheetYear);
            }
        });
    };




    /**
     * move the last period to the old period and format the last forecast and update the labels in 8 row
     * @param  {object} sheet         the sheet
     * @return {void}
     * @throws {InvalidArgument}
     */
    this.moveLastPeriodToOldPeriod=function(sheet){
        var dataRanges, sheetNamedRange;

        if (!sheet)  {
            throw "InvalidArgument";
        }

        sheetNamedRange=AmisNamedRanges.getCommodityNamedRangesBySheet(sheet);
        dataRanges=sheetNamedRange.lastDateRanges.concat(sheetNamedRange.rangeToBeStored);

        //move only data for ranges that overlaps fcPeriods, lastDateRanges and rangeToBeStored
        for (var i = 0, dataRanges_length=dataRanges.length, r; r=dataRanges[i], i<dataRanges_length; i++) {
            if(Utility.isRangesOverlap(r, sheetNamedRange.fcPeriods[1])){
                Utility.copyToOffset(sheet, r, 0, -5);
            }
        }


        //move labels
        Utility.copyToOffset(sheet, sheetNamedRange.fcSeasonLabels[1], 0, -5);
    };

    /**
     * change last period labels an prepare the new year period
     * @param  {object} sheet         the sheet
     * @param {Number} year the year of season
     * @return {void}
     * @throws {InvalidArgument}
     */
    this.formatNewYearPeriod=function(sheet, year){
        var newYearLabel,dataRanges,sheetNamedRange;

        if (!sheet || !year)  {
            throw "InvalidArgument";
        }

        sheetNamedRange=AmisNamedRanges.getCommodityNamedRangesBySheet(sheet);
        newYearLabel=year+"/"+(year+1).toString().slice(2);
        dataRanges=sheetNamedRange.lastDateRanges.concat(sheetNamedRange.rangeToBeStored);

        //move only data for ranges that overlaps fcPeriods, lastDateRanges and rangeToBeStored
        for (var i = 0, dataRanges_length=dataRanges.length, r; r=dataRanges[i], i<dataRanges_length; i++) {
            if(Utility.isRangesOverlap(r, sheetNamedRange.fcPeriods[1])){
                sheet.getRange(r).setValue("");
            }
        }

        sheet.getRange(sheetNamedRange.fcSeasonLabels[1]).setValue(newYearLabel);
    };




    /**
     * update all the ranges with the new historical column
     * @param  {object}   spreadSheet the spreadSheet
     * @param  {object} sheet         the sheet
     * @param {Number} year the current year of season
     * @return {void}
     * @throws {InvalidArgument}
     */
    this.newHistoricalColumnUpdateNamedRanges=function(spreadSheet, sheet, year){
        var commodity, namedRanges;

        if (!spreadSheet || !sheet || !year) {
            throw "InvalidArgument";
        }

        commodity=FirebaseConnector.getCommodityName(sheet);
        namedRanges=AmisNamedRanges.getCommodityNamedRangesBySheet(sheet);

        //      -colMap_2015 to old range
        spreadSheet.setNamedRange(commodity+"_colMap_"+(year-2), sheet.getRange(namedRanges.colMap[year-2]));
        //      -colMap_2016 to the new historical column
        spreadSheet.setNamedRange(commodity+"_colMap_"+(year-1), sheet.getRange(namedRanges.colMap[year-2]).offset(0,1));
    };




    /**
     * update the ranges colMap_* with the new historical column for a single sheet
     * @param  {object}   spreadSheet the spreadSheet
     * @param  {object} sheet         the sheet
     * @param {Number} year the current year of season
     * @return {void}
     * @throws {UpdateNamedRangesError}
     * @throws {InvalidArgument}
     */
    this.newPeriodUpdateNamedRanges=function(spreadSheet, sheet, year){
        var commodity, namedRanges, periodAIndex, periodBIndex;

        if (!spreadSheet || !sheet || !year) {
            throw "InvalidArgument";
        }

        commodity=FirebaseConnector.getCommodityName(sheet);
        namedRanges=AmisNamedRanges.getCommodityNamedRangesBySheet(sheet);

        periodAIndex=ConvertA1.rangeA1ToIndex(namedRanges.fcPeriods[0],1);
        periodBIndex=ConvertA1.rangeA1ToIndex(namedRanges.fcPeriods[1],1);

        spreadSheet.setNamedRange(commodity+"_colMap_"+(year), sheet.getRange(1,periodAIndex.left, periodAIndex.bottom, 1));
        spreadSheet.setNamedRange(commodity+"_colMap_"+(year+1), sheet.getRange(1,periodBIndex.left, periodBIndex.bottom, 1));
    };


    /**
     * update firebase with the new year of seasons
	 * @param  {string} spreadSheetId the spreadsheet id
     * @param {Number} year the new year of season
     * @param  {string} userToken auth token
     * @return {void}
     * @throws {UpdateFirebaseError}
     * @throws {InvalidArgument}
     */
    this.newYearUpdateDb=function(spreadSheetId, year, userToken){
 		var sheetConfigNode;

 		if (!spreadSheetId || !year || !userToken) {
 			throw "InvalidArgument";
 		}

        year++;

 		sheetConfigNode=FirebaseConnector.getSheetConfigNode(spreadSheetId)+"/year";

 		FirebaseConnector.writeOnFirebase(year,sheetConfigNode,userToken);
    };


    /**
     * get the year of season of a spreadsheet from firebase
	 * @param  {string} spreadSheetId the spreadsheet id
     * @param  {string} userToken auth token
     * @return {Number} the year, false otherwise
     * @throws {InvalidArgument}
     */
    this.getCurrentYearOfSeason=function(spreadSheetId, token){
        if (!spreadSheetId || !token) {
            throw "InvalidArgument";
        }

        return FirebaseConnector.getSheetConfig(spreadSheetId, token).year;
    };


    /**
     * add a new period to all the sheets of the spreadSheet
     * @param  {object}   spreadSheet the spreadSheet
     * @param  {number} spreadSheetYear the year of the spreadSheet, NOT the new year
     * @return {void}
     */
    this.newYearPeriodsAllSheets=function(spreadSheet, spreadSheetYear){
        if (!spreadSheet || !spreadSheetYear) {
            throw "InvalidArgument";
        }

        Utility.forEachSheet(spreadSheet.getId(), /.*/, function(s, sheetName) {
            var namedRanges;

            namedRanges=AmisNamedRanges.getCommodityNamedRangesBySheet(s);
            //move the last period to the old period and format the last forecast. NORMAL SHEETS ONLY
            Seasons.moveLastPeriodToOldPeriod(s);

            //change last period labels an prepare the new year period
            Seasons.formatNewYearPeriod(s, spreadSheetYear+1);


            if (new RegExp( "^" + Config.templatePrefix ).test(sheetName)) {
                Seasons.newPeriodUpdateNamedRanges(spreadSheet, s, spreadSheetYear);
            }
        });

    };


    /**
     * Update the templateCompiler cell reference for a commodity
     *
     * @param {object} sheet the sheet
     * @param {object} commodityJson json object of a commodity
     * @returns {object} the commodity json object updated
     * @throws {InvalidArgument}
     */
    this.newYearUpdateTemplateCompilerCommodity=function(sheet, commodityJson){
        if (!sheet || !commodityJson) {
            throw "InvalidArgument";
        }
                       
        
        commodityJson.frc1NoteCrop[0]=Utility.A1Offset(sheet, commodityJson.frc1NoteCrop[0], 0 , 1);
        commodityJson.frc1NoteITY[0]=Utility.A1Offset(sheet, commodityJson.frc1NoteITY[0], 0, 1);
        commodityJson.frc1NoteNMY[0]=Utility.A1Offset(sheet, commodityJson.frc1NoteNMY[0], 0, 1);
        commodityJson.frc2NoteCrop[0]=Utility.A1Offset(sheet, commodityJson.frc2NoteCrop[0], 0, 1);
        commodityJson.frc2NoteITY[0]=Utility.A1Offset(sheet, commodityJson.frc2NoteITY[0], 0, 1);
        commodityJson.frc2NoteNMY[0]=Utility.A1Offset(sheet, commodityJson.frc2NoteNMY[0], 0, 1);

        return commodityJson;
    };

    /**
     * update all the templateCompiler node cell reference with the change of season
     *
     * @param  {object}   spreadSheet the spreadSheet
     * @param {string} country the country
     * @param  {string} userToken auth token
     * @returns {void}
     * @throws {InvalidArgument}
     */
    this.newYearUpdateTemplateCompiler=function(spreadSheet, country, userToken){
        var templateCompiler, node, spreadSheetId;
        var that=this;
        
        if (!spreadSheet || !country || !userToken) {
            throw "InvalidArgument";
        }

        templateCompiler=FirebaseConnector.getSpreadSheetTemplateCompiler(country, userToken);
        node=FirebaseConnector.getSpreadSheetTemplateCompilerNode(country);
        
        spreadSheetId=spreadSheet.getId();

        Utility.forEachSheet(spreadSheetId, Config.commoditySheetsRegex, function(s) {
            var commodity;
            commodity=FirebaseConnector.getCommodityName(s);
            templateCompiler[commodity]=that.newYearUpdateTemplateCompilerCommodity(s, templateCompiler[commodity]);
        });
        
        FirebaseConnector.writeOnFirebase(templateCompiler,node,userToken);
        
    };



    /**
     * change the seasons of the forecasts
     * @param  {string} userToken auth token
     * @param  {object}   spreadSheet (optional) the spreadSheet
     * @return {bool} true if ok, false otherwise
     * @throws {InvalidSpreadSheetYear} if the spreadSheet year of seasons is already updated
     * @throws {InvalidArgument}
     */
    this.changeSeason=function(token, spreadSheet ){
        var ssYear, spreadSheetId, country, spreadSheetConfig;

        if (!token) {
            throw "InvalidArgument";
        }

        
        spreadSheet=(spreadSheet || SpreadsheetApp.getActiveSpreadsheet());
        

        spreadSheetId=spreadSheet.getId();
        spreadSheetConfig=FirebaseConnector.getSheetConfig(spreadSheetId, token);
        ssYear=spreadSheetConfig.year;
        country=FirebaseConnector.getCountryNameFromSheet(token);

        // validate the user request: ssYear==(currYear-1)
        if (ssYear>=(moment().year())) {
            Browser.msgBox("The year of season is already "+ssYear+"!");
            throw "InvalidSpreadSheetYear";
        }

        
        ProtectionMaker.validateAllSheet(spreadSheet);


        try{
            Seasons.moveOldForecastToHistoricalDataAllSheets(spreadSheet, ssYear);


            Seasons.addNewHistoricalCol2Excel(spreadSheetId, spreadSheetConfig.excelExportSheetId);


            //cache flush
            APPCache.removeAll();

            //add new period
            Seasons.newYearPeriodsAllSheets(spreadSheet, ssYear);

            //cache flush
            APPCache.removeAll();

            //hide historical series
            ForecastUtility.hideOldAndUnactiveForecast();

            if (!Utility.isMaster()) {
                Seasons.newYearUpdateTemplateCompiler(spreadSheet, country, token);
            }

            //update notes
            Seasons.newYearUpdateDb(spreadSheetId, ssYear, token);


            if (!Utility.isMaster()) {
                //save the spreadsheet
                SyncMasterSheet.startSync(token);
            }else{
              //update ETLconfigs
              Seasons.newYearUpdateETLSConfigurations(token);
            }

            Browser.msgBox("The new year of seasons is "+(ssYear+1)+".");
            
        }catch(e){
            var ex=e;
            Utility.sendErrorEmails(
                "ChangeSeason Error",
                Config.errorEmail
            );
            Browser.msgBox(
                "Internal error during the change of season!\\n"+
                "The AMIS administrator has been notified.");
            throw e;

        }
    };


    
    /**
     * Check if a spredsheet has the correct year (the same of master)
     *
     * @param {string} userToken the firebase token
     * @param {string} sheetId (optional)the spreadSheet id
     * @returns {bool} true if valid, false otherwise
     * @throws {InvalidDbData}
     * @throws {InvalidArgument}
     */
    this.isValidSpreadSheetYear=function(userToken, sheetId){
        var masterConfig, sheetConfig, countryRegisterNode, countryRegister;


        if (!userToken) {
            throw "InvalidArgument";
        }
                
        sheetId=(sheetId || SpreadSheetCache.getActiveSpreadsheet().getId());

        countryRegisterNode = 'config/countryRegister';
        countryRegister=FirebaseConnector.getFireBaseDataParsed(countryRegisterNode,userToken);
        
        masterConfig=FirebaseConnector.getSheetConfig(countryRegister.master, userToken);
        sheetConfig=FirebaseConnector.getSheetConfig(sheetId, userToken);

        if(!masterConfig || !sheetConfig){
            throw "InvalidDbData";
        }

        if(masterConfig.year!==sheetConfig.year){
            return false;
        }

        return true;
    };
  
  /**
     * update all the configuration for ETLS and FB configurations
     *          
     * @param  {string} userToken auth token
     * @returns {void}
     * @throws {InvalidArgument}
     */
    this.newYearUpdateETLSConfigurations=function(userToken){
      if (!userToken) {
        throw "InvalidArgument";
      }
      Seasons.newYearUpdateNationalCsvUploaderConfig(userToken);
      
      Seasons.newYearUpdateETLConfig(userToken);
      AmisNamedRanges.DbMapping.updateFbMapping(userToken);
      Seasons.newYearUpdateBatchRowColumn(userToken);
    };
  
  /**
     * update all the National Csv Uploader configurations
     *          
     * @param  {string} userToken auth token
     * @returns {void}
     * @throws {InvalidArgument}
     */
    this.newYearUpdateNationalCsvUploaderConfig=function(userToken){
      if (!userToken) {
        throw "InvalidArgument";
      }
      Seasons.newYearUpdateSliderFrc(userToken);
      Seasons.newYearUpdateBatchKindOfFrc(userToken);
    };
  
  /**
  * update sliderFrc FB node
  *          
  * @param  {string} userToken auth token
  * @returns {void}
  * @throws {InvalidArgument}
  */
  this.newYearUpdateSliderFrc=function(userToken){
    if (!userToken) {
      throw "InvalidArgument";
    }
    var sliderFrc;
    var sliderFrcNode = 'config/sliderFrc';        
    
    sliderFrc=FirebaseConnector.getFireBaseDataParsed(sliderFrcNode, userToken);                
    
    sliderFrc.sliderFrcA.from= ConvertA1.indexToColA1(Utility.letterToColumn(sliderFrc.sliderFrcA.from)+1)
    sliderFrc.sliderFrcA.to= ConvertA1.indexToColA1(Utility.letterToColumn(sliderFrc.sliderFrcA.to)+1)
    
    sliderFrc.sliderFrcB.from= ConvertA1.indexToColA1(Utility.letterToColumn(sliderFrc.sliderFrcB.from)+1)
    sliderFrc.sliderFrcB.to= ConvertA1.indexToColA1(Utility.letterToColumn(sliderFrc.sliderFrcB.to)+1)   
    
    FirebaseConnector.writeOnFirebase(sliderFrc,sliderFrcNode,userToken);
    
  };
  
   /**
  * update BatchKindOfFrc FB node
  *          
  * @param  {string} userToken auth token
  * @returns {void}
  * @throws {InvalidArgument}
  */
  this.newYearUpdateBatchKindOfFrc=function(userToken){
    if (!userToken) {
      	throw "InvalidArgument";
    }
    var batchKindOfFrc;
    var batchKindOfFrcNode = 'config/batchKindOfFrc';        
    
    batchKindOfFrc=FirebaseConnector.getFireBaseDataParsed(batchKindOfFrcNode, userToken);                    
    batchKindOfFrc.A= moment().year() - 1; 
    batchKindOfFrc.B= moment().year();   
    FirebaseConnector.writeOnFirebase(batchKindOfFrc,batchKindOfFrcNode,userToken);
    
  };

  
  /**
  * update batchConfig FB node
  *          
  * @param  {string} userToken auth token
  * @returns {void}
  * @throws {InvalidArgument}
  */
  this.newYearUpdatebatchConfig=function(userToken){
    if (!userToken) {
      throw "InvalidArgument";
    }
    var batchConfig;
    var currentYear = moment().year();
    var batchConfigNode = '/config/batchConfig/xccbs/CSVMappingOrderFields/'+ currentYear;        
    batchConfig=FirebaseConnector.getFireBaseDataParsed(batchConfigNode, userToken);                
    
    var batchConfigNodeNewYear = '/config/batchConfig/xccbs/CSVMappingOrderFields/'+(currentYear+1);
       
    FirebaseConnector.writeOnFirebase(batchConfig+1,batchConfigNodeNewYear,userToken);
    
  };
  
   /**
  * update ETLConfig FB node
  *          
  * @param  {string} userToken auth token
  * @returns {void}
  * @throws {InvalidArgument}
  */
  this.newYearUpdateETLConfig=function(userToken){
     if (!userToken) {
            throw "InvalidArgument";
     }
    var etlConfig;
    var currentYear = moment().year();
    var etlConfigNode = '/config/ETLConfig';        
    etlConfig=FirebaseConnector.getFireBaseDataParsed(etlConfigNode, userToken);                
    
    for (var commodity in etlConfig){
      
      var columnsContainingData = etlConfig[commodity].columnsContainingData;
      var length= columnsContainingData.length-1;
      for(var i=length;i>length-4;i--){
        columnsContainingData[i]= ConvertA1.indexToColA1(Utility.letterToColumn(columnsContainingData[i])+1);
      }
      //adding the new period that become now historical 
      columnsContainingData.splice(length-3,0,ConvertA1.indexToColA1(Utility.letterToColumn(columnsContainingData[length-4])+1));
      
      etlConfig[commodity].columnsContainingData= columnsContainingData;
      
      etlConfig[commodity].flagColumnA=ConvertA1.indexToColA1(Utility.letterToColumn(etlConfig[commodity].flagColumnA)+1);
      etlConfig[commodity].flagColumnB=ConvertA1.indexToColA1(Utility.letterToColumn(etlConfig[commodity].flagColumnB)+1);
      
      etlConfig[commodity].noteColumnA=ConvertA1.indexToColA1(Utility.letterToColumn(etlConfig[commodity].noteColumnA)+1);
      etlConfig[commodity].noteColumnB=ConvertA1.indexToColA1(Utility.letterToColumn(etlConfig[commodity].noteColumnB)+1);
    }
        
    //writing on FB the new node
    FirebaseConnector.writeOnFirebase(etlConfig,etlConfigNode,userToken);
    
  };
  
   /**
  * update BatchRowColumn FB node
  *          
  * @param  {string} userToken auth token
  * @returns {void}
  * @throws {InvalidArgument}
  */
  this.newYearUpdateBatchRowColumn = function(userToken){
    if (!userToken) {
      throw "InvalidArgument";
    }
    var batchRowColumn;
    var currentYear = moment().year();
    var batchRowColumnNode = '/config/batchRowColumn';        
    batchRowColumn=FirebaseConnector.getFireBaseDataParsed(batchRowColumnNode, userToken);                
    
    for (var commodity in batchRowColumn){
      
      batchRowColumn[commodity][currentYear]= ConvertA1.indexToColA1(Utility.letterToColumn(batchRowColumn[commodity][currentYear])+1);
      batchRowColumn[commodity][currentYear-1]=ConvertA1.indexToColA1(Utility.letterToColumn(batchRowColumn[commodity][currentYear-1])+1);
    }
    
    //writing on FB the new node
    FirebaseConnector.writeOnFirebase(batchRowColumn,batchRowColumnNode,userToken);
  };

};
