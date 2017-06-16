/**
 * class to manage Forecasting Methodologies
 */
ForecastingMethodologies={

	/**
	 * do the format operations of each element of the Forecasting Methodologies
	 * @param  {string} val cell value
	 * @return {string}    the value without any space
	 */
	formatValue:function(val){
		return val.toUpperCase().replace(/ /g, "").split(",").filter(function(e){return e;}).join(",");
	},

	/**
	 * check if a given string is a valid Forecasting  Methodology
	 * @param  {string} value the string to validate
	 * @return {bool}       true if valid, false otherwise
	 */
	isValid:function(value){
		return /^((\s?[CRGTSIMFBO]\s?(,\s?[CRGTSIMFBO]\s?)*)|\s*)$/i.test(value);
	},

	/**
	 * show the Forecasting  Methodology's dialog
	 */
	showMethodsDialog:function(currCell) {
      currCellNotation=currCell.getA1Notation();
      currCellValue=currCell.getValue();

		var html = HtmlService.createTemplateFromFile( 'MethodsDialog' )
            .evaluate()
			.setWidth( 800 )
			.setHeight( 400 );
		SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
			.showModalDialog( html, 'Forecasting Methodologies' );
      return true;
  },

	/**
	 * sets the value of the current cell
	 * @param  {string} value the value to set
	 */
	setCellValue:function(range, value){
      Logger.log("range "+range);
        var cell=SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(range);

		if(!cell) return;

		cell.setValue(value);
	},

	/**
	 * function to attach on the onEdit event
	 * @param  {Object} e
	 */
	onEdit:function(e){
		  var activeCell=e.range;
		  var activeCellVal=activeCell.getValue();
		Logger.log("fmoe");

		  //check if the active cell is in the forecast range
		  if(Utility.isInRange("AB11:AB32", activeCell)){
		    if(!ForecastingMethodologies.isValid(activeCellVal)){
				ForecastingMethodologies.showMethodsDialog(activeCell);
		        activeCell.setValue("");
		    }else{
				activeCell.setValue(ForecastingMethodologies.formatValue(activeCellVal));
			}
		  }
	}


};
