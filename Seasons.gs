/**
 * Seasons management class
 * @return {Object}
 */
var Seasons=new function(){

    /**
     * add a new historical column to all sheets (normal sheets and templates)
     * @param  {object}   spreadSheet the spreadSheet
     * @param {Number} year the year of season
     * @return {Number} last historical column index
     * @throws {AddNewHistoricalColErr} if any error
     * @throws {InvalidArgument}
     */
    this.addNewHistoricalCol=function(spreadSheet, year){


    };

    /**
     * move the oldest forecast data to the
     * @param {Number} lastHistoricalCol last historical column index
     * @return {void}
     * @throws {InvalidArgument}
     * @throws {MoveOldForecastToHistoricalDataErr} if any error
     */
    this.moveOldForecastToHistoricalData=function(lastHistoricalCol){

        //ForecastUtility.copyValuesBetweenForecasts(addFrcA2 ranges, new column ranges)

    };



    /**
     * update all the named ranges with the new year of seasons
     * @param  {object}   spreadSheet the spreadSheet
     * @param {Number} year the year of season
     * @return {void}
     * @throws {UpdateNamedRangesError}
     * @throws {InvalidArgument}
     */
    this.newYearUpdateNamedRanges=function(spreadSheet, year){
        // -named range to update:
        //     -colMap: 3 ranges
        //     -lastDateRanges: 1
        //     -previousForecast: 1
        //     -rangeToBeStored: 7
        //
        // -named ranges to create:
        //     -rangeOfRestoreSheetStyle: remove from config.rangeOfRestoreSheetStyle
    };


    /**
     * update firebase with the new year of seasons
     * @param {Number} year the year of season
     * @return {void}
     * @throws {UpdateFirebaseError}
     * @throws {InvalidArgument}
     */
    this.newYearUpdateDb=function(spreadSheetId, year){

        // -firebase
        //     -config.countries.uid.year
        //         -when spreadsheet is created
        //         -at the change of season
    };


    /**
     * get the year of season of a spreadsheet from firebase
	 * @param  {string} spreadSheetId the spreadsheet id
     * @param  {string} userToken auth token
     * @return {Number} the year, false otherwise
     * @throws {InvalidArgument}
     */
    this.getYearOfSeason=function(spreadSheetId, token){
        if (!spreadSheetId || !token) {
            throw "InvalidArgument";
        }

        return FirebaseConnector.getSheetConfig(spreadSheetId, token).year;
    };


    /**
     * change the seasons of the forecasts
     * @param  {object}   spreadSheet (optional) the spreadSheet
     * @return {bool} true if ok, false otherwise
     */
    this.changeSeason=function(spreadSheet){

    };
};
