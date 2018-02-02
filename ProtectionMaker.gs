var ProtectionMaker = new function() {

    /**
     * protect the first column of a period
     * @param  {string} activeRangeA1 the active range in A1A1Notation
     * @return {bool}              true if ok, false otherwise
     */
    this.protectWrongForecast = function( activeRangeA1 ) {
       if ( !activeRangeA1 ) {
          return true;
       }

       if ( ForecastUtility.editedWrongForecast( activeRangeA1 ) ) {

          Browser.msgBox( "You are trying to edit a wrong column of a forecasting period.\\nPlease click on the 'Undo' button of the sidebar on the right.");

          return false;
       }

       return true;
    };



    /**
     * check if user added or removed a column and shows an error and send an email to amis.outlook
	 * @param {object} sheet the sheet
	 * @param {object} template the template sheet
	 * @param {string} sheetName (optional) the sheetName
     * @return {bool}              true if ok, false otherwise
	 * @throws {InvalidArgument}
     */
    this.validateColumnNumber=function(sheet, template, sheetName){
        var scn, tcn;

        if (!sheet, !template) {
            throw "InvalidArgument";
        }


        scn=sheet.getLastColumn();
        tcn=template.getLastColumn();

        if(scn===tcn){
            return true;
        }


        sheetName=(sheetName || sheet.getName());

        //if column differs ask user for confirmation to restore the sheet from the database and fix the error.
        Browser.msgBox("The column number of the "+sheetName+" sheet differs from the original, please click on the 'Edit' menu, then the 'Undo' button.\\nThen try to click on the 'Validate' button.");

        return false;
    };




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

				//restore all column width getting the current size from template
		   		ProtectionMaker.restoreColsWidth();
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
	  * validate all sheet in a spreadsheet, restore styles and formulas
	  * @param {object} spreadsheet [optional] the spreadsheet
	  * @return {void}
	  */
	 this.validateAllSheet=function(spreadsheet){
		spreadsheet = ( spreadsheet || SpreadSheetCache.getActiveSpreadsheet() );

	    Utility.forEachSheet(spreadsheet.getId(), Config.commoditySheetsRegex, function(sheet){
			var sheetValues;

			sheetValues=sheet.getDataRange().getValues();

	    	ProtectionMaker.validateSheet(sheetValues, spreadsheet, sheet);
	    });
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
        var rangeToBeRestored = AmisNamedRanges.getCommodityNamedRangesBySheet(ss).rangeOfRestoreSheetStyle[0];


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


	/**
	 * get all row with in each template. Cache values will be used if present.
	 * @return {array} an array in the form [sheetName][row number]=number
	 */
	this.getTmplRowsHeight = function() {
		var rowsHeight = APPCache.get( "rowsHeight" );
		if ( !rowsHeight ) {
			rowsHeight = {};
			Utility.forEachSheet( undefined, new RegExp( "^" + Config.templatePrefix ), function( s, sheetName ) {
				rowsHeight[ sheetName ] = [];
				Utility.forEachRow(s, function(s, rowNum){
					rowsHeight[ sheetName ][ rowNum ] = s.getRowHeight( rowNum );
				});
			} );
			APPCache.put( "rowsHeight", rowsHeight );
		}
		return rowsHeight;
	};





	/**
	 * get all cols with in each template. Cache values will be used if present.
	 * @return {array} an array in the form [sheetName][col number]=number
	 */
	this.getTmplColsWidth = function() {
		var colsWidth = APPCache.get( "colsWidth" );
		if ( !colsWidth ) {
			colsWidth = {};
			Utility.forEachSheet( undefined, new RegExp( "^" + Config.templatePrefix ), function( s, sheetName ) {
				colsWidth[ sheetName ] = [];
				Utility.forEachColumn(s, function(s, colNum){
					colsWidth[ sheetName ][ colNum ] = s.getColumnWidth( colNum );
				});
			} );
			APPCache.put( "colsWidth", colsWidth );
		}
		return colsWidth;
	};


	/**
	 * restore all row height getting the current size from template. CAN BE USED ONLY FROM USER WITH ALL PERMISSIONS!
	 * @return {void}
	 * @throws "InvalidTemplateSizes" if no data from templates
	 */
	this.restoreRowsHeight=function(){
		var rowsHeight=this.getTmplRowsHeight();

		if(!rowsHeight){
			throw "InvalidTemplateSizes";
		}

		Utility.forEachSheet( undefined, /^[A-Za-z]+$/, function( s, sheetName ) {
			Utility.forEachRow(s, function(s, rowNum){
				s.setRowHeight(rowNum, rowsHeight[ Config.templatePrefix+sheetName ][ rowNum ]);
			});
		} );
	};


	/**
	 * restore all column width getting the current size from template
	 * @return {void}
	 * @throws "InvalidTemplateSizes" if no data from templates
	 */
	this.restoreColsWidth=function(){
		var colsWidth=this.getTmplColsWidth();

		if(!colsWidth){
			throw "InvalidTemplateSizes";
		}

		Utility.forEachSheet( undefined, /^[A-Za-z]+$/, function( s, sheetName ) {
			var nr, previusFc_number;

			nr=AmisNamedRanges.getCommodityNamedRangesBySheet(s);

			previusFc_number=ConvertA1.rangeA1ToIndex(nr.previousForecast.first, 1).left;

			Utility.forEachColumn(s, function(s, colNum){
				if (colNum<previusFc_number) {
					return;
				}
				s.setColumnWidth(colNum, colsWidth[ Config.templatePrefix+sheetName ][ colNum ]);
			});
		} );
	};




};
