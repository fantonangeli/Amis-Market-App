var ProtectionMaker = new function() {

	/**
	 * validate the current sheet, restore styles and formulas
	 * @return {void}
	 * @throws {JavaException} in case of non valid data in the sheet
	 */
	this.validateSheet = function() {
		//Get the currently active sheet
		var sheetValues = SpreadSheetCache.getActiveSheetValues();

		try {
			if ( !Utility.isTemplate() && !Utility.isMaster() ) {

				ProtectionMaker.checkIfValueIsNotProtected();

				//forecast methodologies on edit
				ForecastingMethodologies.fixAllFMRanges( sheetValues );
			}
		} catch ( e ) {
			var ex = e;
			if ( ex instanceof JavaException ) {
				Browser.msgBox( "Sheet error: " + ex.message );
			} else {
				Browser.msgBox( "There is a problem with the sheet. Please contact the administrator." );
			}

			throw e;
		}
	};


	/**
	 * restore the styles, formulas, values and the formatting from the template
	 * @return {void}
	 * @throws {RowsOrColChanged} if sheet's rows and columns doesn't match with template
	 * @throws {JavaException} in case of non valid data in the sheet
	 */
	this.checkIfValueIsNotProtected = function() {
		//var interestedRange = JSON.parse(PropertiesService.getUserProperties().getProperty("sheetProtectionRanges"));

		var sheet = SpreadsheetApp.getActiveSpreadsheet();
		var ss = sheet.getActiveSheet();
        var rangeToBeRestored = Config.rangeOfRestoreSheetStyle;
      
      

		ss.getRange( rangeToBeRestored ).setDataValidation( null );

		//destroy eventually CONDITIONS FORMATTING COPIED AND PASTED
		//e.range.clearFormat(); //commented because now with the validate button there isn't the event var

		var sheetName = ss.getName();

		var templateSheet = sheet.getSheetByName( "Template_" + sheetName );

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
