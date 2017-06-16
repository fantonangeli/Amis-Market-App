/**
 * class to manage Forecasting Methodologies
 */
var ForecastingMethodologies=new (function(){

	/**
	 * do the format operations of each element of the Forecasting Methodologies
	 * @param  {string} val cell value
	 * @return {string}    the value without any space
	 */
	this.formatValue=function(val){
		return val.toUpperCase().replace(/ /g, "").split(",").filter(function(e){return e;}).join(",");
	};

	/**
	 * check if a given string is a valid Forecasting  Methodology
	 * @param  {string} value the string to validate
	 * @return {bool}       true if valid, false otherwise
	 */
	this.isValid=function(value){
		return /^((\s?[CRGTSIMFBO]\s?(,\s?[CRGTSIMFBO]\s?)*)|\s*)$/i.test(value);
	};

	/**
	 * show the Forecasting  Methodology's dialog
	 */
	this.showMethodsDialog=function(currCell) {
      currCellNotation=currCell.getA1Notation();
      currCellValue=currCell.getValue();

		var html = HtmlService.createTemplateFromFile( 'MethodsDialog' )
            .evaluate()
			.setWidth( 800 )
			.setHeight( 400 );
		SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
			.showModalDialog( html, 'Forecasting Methodologies' );
      return true;
  };

	/**
	 * sets the value of the current cell
	 * @param  {string} value the value to set
	 */
	this.setCellValue=function(range, value){
      Logger.log("range "+range);
        var cell=SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(range);

		if(!cell) return;

		cell.setValue(value);
	};

	/**
	 * check if the active cell is in the forecast column
	 * @param  {number} colNum column number
	 * @param  {object} activeCell current edited cell
	 */
	var isInFMColumn = function(colNum,activeCell) {
	  var activeCellVal, colLt, activeCellIndex;

	  if(colNum!==activeCell.getColumn()) return;

	  colLt = Utility.numToChar(colNum);
	  activeCellIndex=activeCell.getRowIndex();

	  //check if the active cell is in the forecast range
	  if(
		  	(11 <= activeCellIndex) && (activeCellIndex >= 31) ||
			(35 <= activeCellIndex) && (activeCellIndex >= 36) ||
			(40 <= activeCellIndex) && (activeCellIndex >= 45) ||
			(48 <= activeCellIndex) && (activeCellIndex >= 53)
	  ){
		activeCellVal=activeCell.getValue();
		if(!ForecastingMethodologies.isValid(activeCellVal)){
			ForecastingMethodologies.showMethodsDialog(activeCell);
			activeCell.setValue("");
		}else{
			activeCell.setValue(ForecastingMethodologies.formatValue(activeCellVal));
		}
	  }
	};

	/**
	 * function to attach on the onEdit event
	 * @param  {Object} e
	 */
	this.onEdit=function(e){
		  var activeCell=e.range;
		  var fmColNums=Utility.regexEvalIntoRow(/\d{4}\.FM/, "1:1");

		  for (var i = fmColNums.length; i--;) {
			isInFMColumn(fmColNums[i], activeCell)
		  }
	};


});
