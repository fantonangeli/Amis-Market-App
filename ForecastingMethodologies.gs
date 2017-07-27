/**
 * class to manage Forecasting Methodologies
 */
var ForecastingMethodologies = new( function() {

	/**
	 * path firebase where configuration is stored
	 * @type {String}
	 */
	var fbPath = "config/forecastingMethodologies/";

	/**
	 * get the path firebase where configuration is stored
	 * @return {string} the path
	 */
	var getFbConfigPath = function() {
		return fbPath+FirebaseConnector.getCountryNameFromSheet();
	};



	/**
	 * do the format operations of each element of the Forecasting Methodologies
	 * @param  {string} val cell value
	 * @return {string}    the value without any space
	 */
	this.formatValue = function( val ) {
		return val.toUpperCase().replace( / /g, "" ).split( "," ).filter( function( e ) {
			return e;
		} ).join( "," );
	};

	/**
	 * check if a given string is a valid Forecasting  Methodology
	 * @param  {string} value the string to validate
	 * @return {bool}       true if valid, false otherwise
	 */
	this.isValid = function( value ) {
		return /^((\s?[CRGTSIMFBO]\s?(,\s?[CRGTSIMFBO]\s?)*)|\s*)$/i.test( value );
	};

	/**
	 * show the Forecasting  Methodology's dialog
	 * @param  {string} CellNotation cell in A1Notation
	 * @param  {string} CellValue    cell value
	 */
	this.showMethodsDialog = function( CellNotation,CellValue ) {
		currCellNotation = CellNotation;
		currCellValue = CellValue;

		var html = HtmlService.createTemplateFromFile( 'MethodsDialog' )
			.evaluate()
			.setWidth( 800 )
			.setHeight( 400 );
		SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
			.showModalDialog( html, 'Forecasting Methodologies' );
	};

	/**
	 * get the firebase configuration for the Forecasting Methodologies
	 * @return {Object}         the configuration
	 */
	this.getConfig = function( refresh ) {
		var data, t;
		var fbConfig=PropertiesService.getUserProperties().getProperty("ForecastingMethodologies.config");
		refresh=(refresh || false);

		if ( ( fbConfig !== null ) && !refresh ) {
			return JSON.parse(fbConfig);
		}

		t = FirebaseConnector.getToken();
		if ( !t ) {
			return null;
		}
		data = FirebaseConnector.getFireBaseData( getFbConfigPath(), t );
		if ( !data ) {
			return null;
		}
      //Utilities.sleep(300);
		PropertiesService.getUserProperties().setProperty("ForecastingMethodologies.config",data);

		return JSON.parse( data );
	};


	/**
	 * reads the forecasting Methodology ranges from firebase
	 * @return {array} array of ranges, null otherwise
	 */
	this.getFMRanges=function() {
		var config;
		var tokenFireBase = FirebaseConnector.getToken();

		if ( !tokenFireBase ) {
			Browser.msgBox( "You must be logged to use this functionality!" );
			return null;
		}

       var sheet = SpreadsheetApp.getActiveSheet();
       var commodityName = sheet.getRange(Config.Sheet.commodityCell).getValue().toLowerCase();

		config=ForecastingMethodologies.getConfig();

		if(!config) return null;

		return config[FirebaseConnector.getCommodityName()].ranges;

	};


	 /**
 	 * move FM column in Firebase
 	 * @param  {string} range range in A1 notation
	 * @param  {number} columnOffset   number of columns right from the range's top-left cell; negative values represent columns left from the range's top-left cell
 	 * @return {bool}       true if ok, false otherwise
 	 */
	this.moveFMCols = function( range, columnOffset ) {

		var movedColNum, newFmRanges = [];
		var fmRanges = this.getFMRanges();
		range = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange( range );
		movedColNum = range.getColumn();

		if ( !fmRanges ) return;

		var r;
		for ( var i = fmRanges.length; i--; ) {
			r = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange( fmRanges[ i ] );

			if ( r.getColumn() >= movedColNum ) {
				r = r.offset( 0, columnOffset );
			}

			newFmRanges.unshift( r.getA1Notation() );
		}

		FirebaseConnector.writeOnFirebase(
			newFmRanges,
			getFbConfigPath()+'/'+FirebaseConnector.getCommodityName()+'/ranges',
			FirebaseConnector.getToken()
		);

		//reload the new configuration
		this.getConfig(true);
	};

	/**
	 * function to attach on the onEdit event
	 * @param  {Object} e
	 */
	 this.onEdit = function(e) {
	   var cell, cellValue, fmRanges, multiple, rangeValues, _i, _len, dataValidations=[];
	   rangeValues = void 0;

	   if (Utility.isMaster()) {
	     return;
	   }

	   fmRanges = this.getFMRanges();

	   if (!fmRanges) {
	     return;
	   }

	   rangeValues = e.range.getValues();

	   multiple = rangeValues.length > 1;

	   for (_i = 0, _len = rangeValues.length; _i < _len; _i++) {
	     cellValue = rangeValues[_i][0];
	     cell = e.range.getCell(_i + 1, 1);
		 dataValidations.push([null]);
	     rangeValues[_i][0]=this.onEditCell(cell, fmRanges, cellValue, multiple);
	   }

	   e.range.setValues(rangeValues);
	   e.range.setDataValidations(dataValidations);
	 };

	/**
	 * events called by this.onEdit on the single cell
	 * @param  {object} cell     current cell
	 * @param  {array} fmRanges ForecastingMethodologies ranges from firebase
	 * @param  {string} cellValue value of the cell
	 * @param  {bool} multiple set to true if the user edited a range
	 * @return {array}          the value to be writed
	 */
    this.onEditCell = function( cell, fmRanges, cellValue, multiple ) {
		var r, cellA1;

		cellA1=cell.getA1Notation();

    	for ( var i = fmRanges.length; i--; ) {
    		r = fmRanges[ i ];

    		//check if is in a FM range
    		if ( Utility.isInRange( r, cellA1 ) ) {

    			//THIS AVOID PROBLEMS IN CASE SOMEBODY COPY AND PASTE VALUES FROM A CELL WITH VALIDATION
    			//cell.setDataValidation( null );

    			//check if cell is not valid and is to open the dialog
    			if ( !ForecastingMethodologies.isValid( cellValue ) ) {
    				if(!multiple) {
						ForecastingMethodologies.showMethodsDialog( cellA1, cellValue );
					}
    				return "";
    			} else {
    				return ForecastingMethodologies.formatValue( cellValue );
    			}
    		}
    	}

		//if cell is not in a fmRanges
		return cellValue;
    };


  this.rebuildFrcMethodologiesStyle = function (e) {


    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();

    var activeCell=e.range;

    //get the letter of current column edited
    var currentColumn = Utility.numToChar(activeCell.getColumn());

    var restoreStyleRows = JSON.parse(PropertiesService.getUserProperties().getProperty('restoreStyleRows'));

    for (var i=0; i<restoreStyleRows.length;i++){

      //it contains the first and the last row of the range to be style restored
      var firstAndLastRowToBeRestored = restoreStyleRows[i].split('-');

      //A:A contain the safe style and the script rebuild that style
      sheet.getRange('B'+firstAndLastRowToBeRestored[0]+':B'+firstAndLastRowToBeRestored[1]).copyTo(sheet.getRange(currentColumn+firstAndLastRowToBeRestored[0]+':'+currentColumn+firstAndLastRowToBeRestored[1]), {formatOnly:true});
    }

  }


} );
