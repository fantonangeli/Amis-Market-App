/**
 * Seasons management class
 * @return {Object}
 */
var Seasons=new function(){


    /**
     * add a new historical column and move the oldest forecast data to the historical data
     * @param  {object} sheet         the sheet
     * @param  {number} spreadSheetYear the year of the spreadSheet, NOT the new year
     * @return {void}
     * @throws {InvalidArgument}
     */
    this.moveOldForecastToHistoricalData=function(sheet,spreadSheetYear){
        var from, lastHistoricalCol, to, commodity, namedRanges;

        if (!sheet || !spreadSheetYear) {
            throw "InvalidArgument";
        }

        commodity=FirebaseConnector.getCommodityName(sheet);
        namedRanges=AmisNamedRanges.getCommodityNamedRangesBySheet(sheet);
        lastHistoricalCol=ForecastUtility.getHistoricalColNum(commodity).last;

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
        var ssYear, spreadSheetId, country;

        if (!token) {
            throw "InvalidArgument";
        }

        
        spreadSheet=(spreadSheet || SpreadsheetApp.getActiveSpreadsheet());

        spreadSheetId=spreadSheet.getId();
        ssYear=Seasons.getCurrentYearOfSeason(spreadSheetId, token);
        country=FirebaseConnector.getCountryNameFromSheet(token);

        //validate the user request: ssYear==(currYear-1)
        if (ssYear>=(moment().year())) {
            throw "InvalidSpreadSheetYear";
        }

        Seasons.moveOldForecastToHistoricalDataAllSheets(spreadSheet, ssYear);

        //refresh all namedRange
        AmisNamedRanges.clearNamedRanges();

        //add new period
        Seasons.newYearPeriodsAllSheets(spreadSheet, ssYear);

        Seasons.newYearUpdateTemplateCompiler(spreadSheet, country, token);

        //update notes
        Seasons.newYearUpdateDb(spreadSheetId, ssYear, token);
        
        //TODO refresh of the notes
        //TODO save the spreadsheet
        //TODO write the year on spreadSheet creation
        //TODO in case of exception show a error 
    };
};
