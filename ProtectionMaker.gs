var ProtectionMaker = new function() {

	/**
	 * validate the current sheet, restore styles and formulas
	 * @param  {array} sheetValues [optional] sheet's data
	 * @param {object} spreadsheet [optional] the spreadsheet
	 * @param {object} sheet [optional] the sheet
	 * @return {void}
	 * @throws {InvalidArgument}
	 * @throws {JavaException} in case of non valid data in the sheet
	 */
	 this.validateSheet = function( sheetValues, spreadsheet, sheet ) {
	 	spreadsheet = ( spreadsheet || SpreadSheetCache.getActiveSpreadsheet() );
	 	sheet = ( sheet || SpreadSheetCache.getActiveSheet() );
	 	sheetValues = ( sheetValues || SpreadSheetCache.getActiveSheetValues() );

	 	try {
	 		if ( !Utility.isTemplate()  ) {

	 			ProtectionMaker.checkIfValueIsNotProtected(spreadsheet, sheet);

	 			//forecast methodologies on edit
	 			ForecastingMethodologies.fixAllFMRanges( sheetValues,sheet );
	 		}
	 	} catch ( e ) {
	 		var ex = e;
	 		if ( ex instanceof JavaException ) {
	 			Browser.msgBox( "Error in " + sheet.getName() + " sheet: " + ex.message );
	 		} else {
	 			Browser.msgBox( "There is a problem with the sheet " + sheet.getName() + ". Please contact the administrator." );
	 		}

	 		throw e;
	 	}
	 };



	/**
	 * restore the styles, formulas, values and the formatting from the template
	 * @param {object} spreadsheet [optional] the spreadsheet
	 * @param {object} sheet [optional] the sheet
	 * @return {void}
	 * @throws {RowsOrColChanged} if sheet's rows and columns doesn't match with template
	 * @throws {JavaException} in case of non valid data in the sheet
	 * @throws {InvalidArgument}
	 */
	 this.checkIfValueIsNotProtected = function(spreadsheet, sheet) {


   	 	if ( !sheet || !spreadsheet ) {
   	 		throw "InvalidArgument";
   	 	}

 		var ss = sheet;
         var rangeToBeRestored = Config.rangeOfRestoreSheetStyle;


 		ss.getRange( rangeToBeRestored ).setDataValidation( null );

 		//destroy eventually CONDITIONS FORMATTING COPIED AND PASTED
 		//e.range.clearFormat(); //commented because now with the validate button there isn't the event var

 		var sheetName = ss.getName();

 		var templateSheet = spreadsheet.getSheetByName( "Template_" + sheetName );

 		var sheetValues = ss.getRange( rangeToBeRestored ).getValues();
 		//var sheetFormulas = ss.getRange(rangeToBeRestored).getFormulas();

 		var tmpDataValidation = templateSheet.getRange( rangeToBeRestored ).getDataValidations();

 		var tmpFormulas = templateSheet.getRange( rangeToBeRestored ).getFormulas();

 		var tmpValues = templateSheet.getRange( rangeToBeRestored ).getValues();
 		//var lenght=  tmpValues.length
 		var row;

 		//If user removes a column/row show a dialog with a message
 		if ( ( sheetValues.length !== tmpValues.length ) || ( sheetValues[ 0 ].length !== tmpValues[ 0 ].length ) ) {
 			throw "RowsOrColChanged";
 		}

 		for ( var r = tmpValues.length; r--; ) {
 			row = tmpValues[ r ];
 			for ( var c = row.length; c--; ) {
 				if ( row[ c ] != '' ) {
 					sheetValues[ r ][ c ] = row[ c ];
 				}
 				if ( tmpFormulas[ r ][ c ] != '' ) {
 					sheetValues[ r ][ c ] = tmpFormulas[ r ][ c ];
 				}
 			}
 		}

 		//restore the style from hidden template
 		templateSheet.getRange( rangeToBeRestored ).copyTo( ss.getRange( rangeToBeRestored ), {
 			formatOnly: true
 		} );

 		//restore data validations
 		ss.getRange( rangeToBeRestored ).setDataValidations( tmpDataValidation );

 		//restore FORMULAS and VALUES not EDITABLE. Getvalues is needed to throw exception in case of non valid data in the sheet
 		ss.getRange( rangeToBeRestored ).setValues( sheetValues ).getValues();

 	};





};
