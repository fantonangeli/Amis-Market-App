var Utility=new (function(){
  this.validateCells=function() {
    var cell = SpreadsheetApp.getActive().getRange('A1');
    var rule = cell.getDataValidation();
    if (rule != null) {
      var criteria = rule.getCriteriaType();
      var args = rule.getCriteriaValues();
      Logger.log('The data-validation rule is %s %s', criteria, args);
    } else {
      Logger.log('The cell does not have a data-validation rule.')
    }
};

    /**
     * returns a character from the specified ASCII value
     * used from numToChar()
     * @param  {number} codePt ASCII value
     * @return {string}        character
     */
    var chr = function (codePt) {
        if (codePt > 0xFFFF) {
            codePt -= 0x10000;
            return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
        }
        return String.fromCharCode(codePt);
    };


  /**
   * converts column letter to column number
   * @param  {string} letter eg. A, AB
   * @return {number}        the number of the column (column A is 1)
   */
   this.charToNum = function(alpha) {
           var index = 0;
           for(var i = 0, j = 1; i < j; i++, j++)  {
               if(alpha == numToChar(i))   {
                   index = i;
                   j = i;
               }
           }
           console.log(index);
       };

   /**
    * converts column number to column letter
    * @param  {number} number the number of the column (column A is 1)
    * @return {string}        the letter of the column (column A is 1)
    */
   this.numToChar = function(number)    {
           var numeric = (number - 1) % 26;
           var letter = chr(65 + numeric);
           var number2 = parseInt((number - 1) / 26);
           if (number2 > 0) {
               return numToChar(number2) + letter;
           } else {
               return letter;
           }
       };
  //-----------------------------------------------------------------------------------------------------------------
  /**
   * FIND A VALUE INTO A ROW OF A SPECIFIC RANGE
   * @param  {string} value
   * @param  {range}  range of the row where search
   * @return {string} number of column containing the string
   */
  //------------------------------------------------------------------------------------------------------------------
  this.findValueIntoRow = function(value,range){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    var data = sheet.getRange(range).getValues();


    for(var i = 0; i<data[0].length;i++){
      if(data[0][i] == value){
        return i+1;
      }
    }
   };
  //------------------------------------------------------------------------------------------------------------------
  //END  -- THIS FIND A VALUE INTO A ROW OF A SPECIFIC RANGE
  //------------------------------------------------------------------------------------------------------------------

  /**
   * EVALUATE A REGEXP TO ANY COLUMN INTO A ROW OF A SPECIFIC RANGE. IT DOESN'T STOPS ON THE FIRST OCCURANCE
   * @param  {RegExp} regexp the regexp to be evaluated
   * @param  {range}  range of the row where search
   * @return {array}  array of number of column containing the string
   */
  this.regexEvalIntoRow = function(regexp,range){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    var data = sheet.getRange(range).getValues();

    var result=[];

    for(var i = 0; i<data[0].length;i++){
      if(regexp.test(data[0][i])){
        result.push(i+1);
      }
    }

    return result;
   };

  //------------------------------------------------------------------------------------------------------------------
  /**
   * TODO -- deprecated ?THIS MOVE THE VALUE USED TO FIND FORECAST TO OTHER CELL
   * @param  {string}  cell to be deleted
   * @param  {string}  cell target
   * @param {string}  string to put in cell target
   */
  //------------------------------------------------------------------------------------------------------------------
  this.moveNewForecastFinder = function (cellFrom,cellTo,stringValue){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    //blanks the old position
    cellFrom.setValue('');
    //set new value on other column
    cellTo.setValue(stringValue);
  }
  //------------------------------------------------------------------------------------------------------------------
  //END -- THIS MOVE THE VALUE USED TO FIND FORECAST TO OTHER CELL
  //------------------------------------------------------------------------------------------------------------------

  //------------------------------------------------------------------------------------------------------------------
  /**
   * SET LAST DATE WHEN UPDATING A CELL
   * @param  {event}  you must call it from OnEdit function and pass 'e' event object
   */
  //------------------------------------------------------------------------------------------------------------------
  this.onEditSetLastUpdateDate = function(e){

    //TODO they must come from firebase
    var rowsToWriteUpdateDate = [10,34,39,47];
    var rowToUpdate;

    var thisRow = e.range.getRow();
    var thisCol = e.range.getColumn();

    var ss = e.range.getSheet();

    var configRow = ss.getRange(thisRow,1).getValues()[0][0];
    var configColumn = ss.getRange(1,thisCol).getValues()[0][0];

    //TODO _ nu --- must come by firebase
    // if the cell is NU --- NO UPDATE DATE
    if(configRow == 'nu' || configColumn == 'nu' )
      return;

    //else

    for (i = 0; i < rowsToWriteUpdateDate.length; i++) {

      //at the first loop I simple assign rowToUpdate
      if(i==0)
        rowToUpdate=rowsToWriteUpdateDate[i];

      //found the 'distance' between the label row and the active cell
      var sub = thisRow - rowsToWriteUpdateDate[i];

      //if the 'distance' is positive I'll take the minus 'distance'
      if(sub > 0  && ( (thisRow - rowToUpdate) >= sub))
      rowToUpdate = rowsToWriteUpdateDate[i];
    }
    Logger.log(rowToUpdate);

    //TODO put this value under firebase config and retrive the row number
    var cell = ss.getRange(rowToUpdate, thisCol);

    //update the cell putting last date editing
    cell.setValue(new Date());
    cell.setFontWeight("bold");
  }
  //------------------------------------------------------------------------------------------------------------------
  //END -- SET LAST DATE WHEN UPDATING A CELL
  //------------------------------------------------------------------------------------------------------------------

  //------------------------------------------------------------------------------------------------------------------
  /**
   * make a toast on the screen
   * @param  {string}  title of toast
   * @param  {string}  text of toast
   */
  //------------------------------------------------------------------------------------------------------------------
  this.toastInfo= function(text1,text2){
      // Show a popup with the title "Status" and the message "Task started".
      SpreadsheetApp.getActiveSpreadsheet().toast(text1, text2);
  }
  //------------------------------------------------------------------------------------------------------------------
  // END -- make a toast
  //------------------------------------------------------------------------------------------------------------------

  //------------------------------------------------------------------------------------------------------------------
  /**
   * open amis Sidebar
   */
  //------------------------------------------------------------------------------------------------------------------
  this.openSidebar = function(){

  var html = HtmlService.createTemplateFromFile('amisMenu')
      .evaluate()
      .setTitle('Amis')
      .setWidth(500)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME);
  SpreadsheetApp.getUi() // Or DocumentApp or FormApp.
      .showSidebar(html);
  }
  //------------------------------------------------------------------------------------------------------------------
  // END --  open amis Sidebar
  //------------------------------------------------------------------------------------------------------------------

  //------------------------------------------------------------------------------------------------------------------
  /**
   * create Amisi menu
   */
  //------------------------------------------------------------------------------------------------------------------
  this.createAmisMenu = function(){

    //create the menu voice
    SpreadsheetApp.getUi()
    .createMenu('AMIS Menu')
    .addItem('Open', 'AmisMarketApp.openSidebar')
    .addToUi()
  }
  //------------------------------------------------------------------------------------------------------------------
  // END --  create Amisi menu
  //------------------------------------------------------------------------------------------------------------------
  
  //------------------------------------------------------------------------------------------------------------------
  /**
   * get GoogleSheetID
   * @return {string} GoogleSheetID
   */
  //------------------------------------------------------------------------------------------------------------------  
  this.getGoogleSheetID= function(){
	  return SpreadsheetApp.getActive().getId(); //current spreadsheet	  
  }
  //------------------------------------------------------------------------------------------------------------------
  // END --  get GoogleSheetID  
  //------------------------------------------------------------------------------------------------------------------
  
  this.noNegativeValue=function(){
    //Get the currently active sheet
    var sheet = SpreadsheetApp.getActiveSheet()
    //select a range to be validated
    var newRange = sheet.getRange('Maize!R10:AA26');
    // Set the data validation for cells to require any value that does not include "-".
    var rule = SpreadsheetApp.newDataValidation().requireTextDoesNotContain('-').setAllowInvalid(false).build();
    newRange.setDataValidation(rule);
  }

  /**
   * check if a given cell is in a range
   * @param  {string} range the range eg. "AD11:AD19"
   * @param  {range} cell  the cell to check
   * @return {bool}       true if the cell is in the range, false otherwise
   */
  this.isInRange = function(range, cell) {
        range = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(range);

        var editRange = {
            top: range.getRow(),
            bottom: range.getRow()+range.getNumRows(),
            left: range.getColumn(),
            right: range.getLastColumn()
        };

        // Exit if we're out of range
        var thisRow = cell.getRow();
        if (thisRow < editRange.top || thisRow > editRange.bottom) return false;

        var thisCol = cell.getColumn();
        if (thisCol < editRange.left || thisCol > editRange.right) return false;

        return true;

    };

    /**
     * get the acitve cell value (useful for sidebar and dialog)
     * @return {object} the value in the cell
     */
    this.getActiveCellValue = function() {
      return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getActiveCell().getValue();
    };


  /**
  * workaround that allows you to call any library function if you paste in this one generic wrapper function. Then you can call this from the spreadsheet.
  * For example, if I had a library called MyLib with a function add(x, y) (pretend x is in cell A1 and y is in cell A2) I could call it like this: =LIB_FUNC("MyLib", "add", A1, A2).
  * @param       {string} functionName
  * @constructor
  */
  this.LIB_FUNC=function(functionName) {
    var currFn=this;
    var extraArgs = [];
    var fnArr=functionName.split(".");

    var fnArr_length=fnArr.length;
    for (var i = 0; i<fnArr_length; i++) {
      currFn=currFn[fnArr[i]];

      if(!currFn) throw "No such function: " + fnArr[i];
    }

    if (arguments.length > 1) {
      extraArgs = Array.apply(null, arguments).slice(1);
    }

    return currFn.apply(this, extraArgs);
  };

  /**
   * sets the value of the current cell
   * @param  {string} value the value to set
   */
  this.setCellValue=function(range, value){
      var cell=SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(range);

      if(!cell) return;

      cell.setValue(value);
  };

  /**
   * includes html files into an html
   * @param  {string} filename
   * @return {string}          the content
   */
  this.include=function(filename) {
    return HtmlService.createHtmlOutputFromFile(filename)
        .getContent();
  };

});
