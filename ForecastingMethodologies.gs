/**
 * class to manage Forecasting Methodologies
 */
var ForecastingMethodologies = new( function() {

	/**
	 * path firebase where configuration is stored
	 * @type {String}
	 */
	var fbPath = "config/forecastingMethodologies/argentina";

	/**
	 * get the path firebase where configuration is stored
	 * @return {string} the path
	 */
	var getFbConfigPath = function() {
		return fbPath;
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
	 */
	this.showMethodsDialog = function( currCell ) {
		currCellNotation = currCell.getA1Notation();
		currCellValue = currCell.getValue();

		var html = HtmlService.createTemplateFromFile( 'MethodsDialog' )
			.evaluate()
			.setWidth( 800 )
			.setHeight( 400 );
		SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
			.showModalDialog( html, 'Forecasting Methodologies' );
		return true;
	};

	/**
	 * get the firebase configuration for the Forecasting Methodologies
	 * @param  {bool} refresh (default false) true to force cache renew
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

		PropertiesService.getUserProperties().setProperty("ForecastingMethodologies.config",data);

		return JSON.parse( data );
	};


	/**
	 * reads the forecasting Methodology ranges from firebase
	 * @return {array} array of ranges, null otherwise
	 */
	var getFMRanges=function() {
		var config;
		var tokenFireBase = FirebaseConnector.getToken();

		if ( !tokenFireBase ) {
			Browser.msgBox( "You must be logged to use this functionality!" );
			return null;
		}

		config=ForecastingMethodologies.getConfig();

		if(!config) return null;

		return config.maize.ranges;

	};

	/**
	 * move FM column in Firebase
	 * @param  {string} range range in A1 notation
	 * @return {bool}       true if ok, false otherwise
	 */
	this.moveFMCols = function( range ) {
		var movedColNum, newFmRanges = [];
		var fmRanges = getFMRanges();
		range = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange( range );
		movedColNum = range.getColumn();

		if ( !fmRanges ) return;

		fmRanges = JSON.parse( fmRanges );

		var r;
		for ( var i = fmRanges.length; i--; ) {
			r = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange( fmRanges[ i ] );

			if ( r.getColumn() >= movedColNum ) {
				r = r.offset( 0, 1 );
			}

			newFmRanges.unshift( r.getA1Notation() );
		}


		FirebaseConnector.writeOnFirebase(
			newFmRanges,
			this.getFbConfigPath(),
			FirebaseConnector.getToken()
		);
	};

	/**
	 * function to attach on the onEdit event
	 * @param  {Object} e
	 */
	this.onEdit = function( e ) {
		var activeCell = e.range,
			activeCellVal;
		var fmRanges = getFMRanges();

		if ( !fmRanges ) return;

		var r;
		for ( var i = fmRanges.length; i--; ) {
			r = fmRanges[ i ];

			//check if is in a FM range
			if ( Utility.isInRange( r, activeCell ) ) {
				activeCellVal = activeCell.getValue();

				//check if cell is not valid and is to open the dialog
				if ( !ForecastingMethodologies.isValid( activeCellVal ) ) {
					ForecastingMethodologies.showMethodsDialog( activeCell );
					activeCell.setValue( "" );
				} else {
					activeCell.setValue( ForecastingMethodologies.formatValue( activeCellVal ) );
				}
			}
		}
	};


} );
