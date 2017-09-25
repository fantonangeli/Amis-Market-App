/**
 * class to manage Forecasting Methodologies
 */
var ForecastingMethodologies = new( function() {

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
	 * reads the forecasting Methodology ranges from firebase
	 * @return {array} array of ranges, null otherwise
	 */
	this.getFMRanges=function() {
       	var ranges=AmisNamedRanges.getCommodityNamedRanges().fm;
		return ranges;
	};


	 /**
 	 * move FM column in Firebase
 	 * @param  {string} range range in A1 notation
	 * @param  {number} columnOffset   number of columns right from the range's top-left cell; negative values represent columns left from the range's top-left cell
 	 * @return {bool}       true if ok, false otherwise
 	 * @deprecated not needed anymore
 	 */
	// this.moveFMCols = function( range, columnOffset ) {
	//
	// 	var movedColNum, newFmRanges = [];
	// 	var fmRanges = this.getFMRanges();
	// 	range = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange( range );
	// 	movedColNum = range.getColumn();
	//
	// 	if ( !fmRanges ) return;
	//
	// 	var r;
	// 	for ( var i = fmRanges.length; i--; ) {
	// 		r = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange( fmRanges[ i ] );
	//
	// 		if ( r.getColumn() >= movedColNum ) {
	// 			r = r.offset( 0, columnOffset );
	// 		}
	//
	// 		newFmRanges.unshift( r.getA1Notation() );
	// 	}
	//
	// 	FirebaseConnector.writeOnFirebase(
	// 		newFmRanges,
	// 		getFbConfigPath()+'/'+FirebaseConnector.getCommodityName()+'/ranges',
	// 		FirebaseConnector.getToken()
	// 	);
	//
	// 	//reload the new configuration
	// 	this.getConfig(true);
	// };

	/**
	 * function to attach on the onEdit event
	 * @param  {Object} e
	 */
	 this.onEdit = function(e) {
	   var fmRanges, multiple, rangeValues, oldValues;
	   rangeValues = void 0;

	   if (Utility.isMaster()) {
		 return;
	   }

	   fmRanges = this.getFMRanges();

	   if (!fmRanges) {
		 return;
	   }

	   rangeValues = e.range.getValues();
	   oldValues=JSON.parse(JSON.stringify(rangeValues));

	   multiple = rangeValues.length > 1;

	   if(multiple){
		 return rangeValues;
	   }

	//    for (_i = 0, _len = rangeValues.length; _i < _len; _i++) {
	// 	   row=rangeValues[_i];
	// 	   for (var _j = 0, row_length=row.length; _j<row_length; _j++) {
	// 		   	cellValue=row[_j];
	// 			cell = e.range.getCell(_i + 1, _j+1);
	// 			rangeValues[_i][_j]=this.onEditCell(cell, fmRanges, cellValue, multiple);
	// 	   }
	//    }

	   rangeValues[0][0]=this.onEditCell(e.range, fmRanges, rangeValues[0][0], multiple);

	   if(rangeValues[0][0]!==oldValues[0][0]){
		 e.range.setValues(rangeValues);
	   }
	   //e.range.setDataValidation(null);

	   return rangeValues;
	 };

	 /**
	  * check all the FM ranges and fix their value (if not valid)
	  * @param  {array} sheetValues sheet's data
	  * @return {void}
	  */
	 this.fixAllFMRanges=function(sheetValues){
		var fmRanges;

	 	fmRanges = this.getFMRanges();

		for (var i = 0, fmRanges_length=fmRanges.length, range; i<fmRanges_length; i++) {
			range=fmRanges[i];
			sheetValues=this.fixSingleFRanges(sheetValues, range);
		}

		return sheetValues;
	 };

	 /**
	  * check a single FM range and fix its value (if not valid) and write it to the sheet
	  * @param  {array} sheetValues sheet's data
	  * @param  {string} fmRange the FM range to check in A1Notation
	  * @return {array} sheet's data
	  */
	  this.fixSingleFRanges=function(sheetValues, fmRange){
	  		var fmRangeIx, cellValue, cellA1, c, fixedCellValue, changed=false, newFMvalues, bottom;

	  		fmRangeIx=ConvertA1.rangeA1ToIndex(fmRange);

	  		c=fmRangeIx.left;

	        bottom=fmRangeIx.bottom;

	  		//check all cell in current fmRange
	  		for (var r = fmRangeIx.top; r<bottom ; r++) {
	  			cellValue=sheetValues[r][c];
	  			cellA1=ConvertA1.indexToColA1(c+1)+r;
	  			fixedCellValue=this.fixFMValue(cellA1, cellValue, true);
	  			sheetValues[r][c]=fixedCellValue;

	  			if(cellValue!==fixedCellValue){
	  				changed=true;
	  			}
	  		}

	  		//if the values changed write it to the sheet
	  		if(changed){
	  			newFMvalues=Utility.getRangeValuesFromArray(sheetValues, fmRange);
	  			SpreadSheetCache.getActiveSheet().getRange(fmRange).setValues(newFMvalues);
	  		}

	  		return sheetValues;
	  	 };


	 /**
	  * fix a value of a cell: if not valid show the dialog or empty the value, if valid format it
	  * @param  {[type]} cellA1    cell in A1Notation
 	  * @param  {string} cellValue value of the cell
 	  * @param  {bool} multiple set to true if the user edited a range
	  * @return {string}           the value fixed
	  */
	 this.fixFMValue=function(cellA1, cellValue, multiple){
		 //check if cell is not valid and is to open the dialog
		 if ( !ForecastingMethodologies.isValid( cellValue ) ) {
			 //if !multiple && !valid show a dialog
			 if(!multiple) {
				 ForecastingMethodologies.showMethodsDialog( cellA1, cellValue );
			 }
			 //if multiple && !valid empty value
			 return "";
		 } else {
			 //if !multiple && valid -> format
			 //if multiple && valid -> format
			 return ForecastingMethodologies.formatValue( cellValue );
		 }
	 };


	/**
	 * events called by this.onEdit on the single cell
	 * @param  {object|string} cell     current cell or current cell in A1Notation (for better performance)
	 * @param  {array} fmRanges ForecastingMethodologies ranges from firebase
	 * @param  {string} cellValue value of the cell
	 * @param  {bool} multiple set to true if the user edited a range
	 * @return {array}          the value to be writed
	 */
    this.onEditCell = function( cell, fmRanges, cellValue, multiple ) {
		var r, cellA1;

		cellA1=(typeof cell==="string")?cell:cell.getA1Notation();

    	for ( var i = fmRanges.length; i--; ) {
    		r = fmRanges[ i ];

    		//check if is in a FM range
    		if ( Utility.isInRange( r, cellA1 ) ) {

    			//THIS AVOID PROBLEMS IN CASE SOMEBODY COPY AND PASTE VALUES FROM A CELL WITH VALIDATION
    			//cell.setDataValidation( null );

    			//check if cell is not valid and is to open the dialog
    			return this.fixFMValue(cellA1, cellValue, multiple);
    		}
    	}

		//if cell is not in a fmRanges
		return cellValue;
    };





} );
