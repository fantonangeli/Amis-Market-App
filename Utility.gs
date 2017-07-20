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
               return Utility.numToChar(number2) + letter;
           } else {
               return letter;
           }
       };


  this.popUpAlert = function () {
    Browser.msgBox('Please ensure that popup lock is DISABLED. Then try again.');
  }

  /**
   * converts column letter to column number
   * @param  {string} column letter
   * @return {integer} column number
   */
  this.letterToColumn = function(letter)
  {
    var column = 0, length = letter.length;
    for (var i = 0; i < length; i++)
    {
      column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
    }
    return column;
  }
  //------------------------------------------------------------------------------------------------------------------
  //END  -- converts column letter to column number
  //------------------------------------------------------------------------------------------------------------------

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

  //-----------------------------------------------------------------------------------------------------------------
  /**
   * FIND A VALUE INTO A ROW OF A SPECIFIC RANGE
   * @param  {string} value
   * @param  {range}  range of the row where search
   * @return {ARRAY}  RETURN AN ARRAY OF ALL THE OCCURENCY OF THE STRING SEARCHED
   */
  //------------------------------------------------------------------------------------------------------------------
  this.findValueIntoRowMultipeResult = function(value,range){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    var data = sheet.getRange(range).getValues();

    var res =[];

    for(var i = 0; i<data[0].length;i++){
      if(data[0][i] == value){
        res.push(i+1);
      }
    }
    return res;
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
  dbName=Config.dbName;
  apiKey=Config.apiKey;
  countryCell=SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(Config.Sheet.countryCell).getValue();
  datasourceCell=SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getRange(Config.Sheet.datasourceCell).getValue();
  devMode=Config.devMode;
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
    .createMenu('AMIS')
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

  //------------------------------------------------------------------------------------------------------------------
  /**
   * apply conditional formatting and color the cell when it is required
   * @params {e} ON EDIT params
   */
  //------------------------------------------------------------------------------------------------------------------
  this.applyConditionalFormatting= function(e){
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var activeCell=e.range;
    var columnsEdited = Utility.numToChar(activeCell.getColumn());

    //TODO _ move it to firebase / session ?
    //                     0    1   2   3   4   5   6   7   8     9   10   11   12   13   14  15   16  17
    var interestedRows  = [12 ,16 ,40 ,41, 42, 43, 44 ,49 , 48 , 50 , 51 , 52 , 53 , 54 , 55, 29 , 30, 31 ];

    //valore assoluto C43 - (C12/C41)
    var operation = Math.abs(parseFloat(sheet.getRange(columnsEdited+interestedRows[5]).getValue()) - ( parseFloat(sheet.getRange(columnsEdited+interestedRows[0]).getValue()) / parseFloat(sheet.getRange(columnsEdited+interestedRows[3]).getValue()) ));
    //valore assoluto ASS(C44-1000*C16/C40)
    var operation2 = Math.abs(parseFloat(sheet.getRange(columnsEdited+interestedRows[6]).getValue()) - ( 1000 * parseFloat(sheet.getRange(columnsEdited+interestedRows[1]).getValue()) / parseFloat(sheet.getRange(columnsEdited+interestedRows[2]).getValue()) ));
    //sum 48 50 52
    var operation3 = parseFloat(sheet.getRange(columnsEdited+interestedRows[8]).getValue()) + parseFloat(sheet.getRange(columnsEdited+interestedRows[9]).getValue()) +parseFloat(sheet.getRange(columnsEdited+interestedRows[11]).getValue());
    //sum 48 50 52
    var operation4 = parseFloat(sheet.getRange(columnsEdited+interestedRows[7]).getValue()) + parseFloat(sheet.getRange(columnsEdited+interestedRows[10]).getValue()) +parseFloat(sheet.getRange(columnsEdited+interestedRows[12]).getValue());

    
    //CELL 54 = CELL 12
    sheet.getRange(columnsEdited+interestedRows[13]).setValue(sheet.getRange(columnsEdited+interestedRows[0]).getValue());
    //CELL 55 = CELL 41
    sheet.getRange(columnsEdited+interestedRows[14]).setValue(sheet.getRange(columnsEdited+interestedRows[3]).getValue());
    
    //condition formatting number one and two
    if ( parseFloat(sheet.getRange(columnsEdited+interestedRows[17]).getValue()) != 0) {

      //set cell 31
      sheet.getRange(columnsEdited+interestedRows[17]).setFontColor('#ff0000');
      sheet.getRange(columnsEdited+interestedRows[17]).setBackground('#d8d8d8');
      sheet.getRange(columnsEdited+interestedRows[17]).setNumberFormat('0');

    }else {
      //set cell 41
      sheet.getRange(columnsEdited+interestedRows[17]).setFontColor('#000000');
      sheet.getRange(columnsEdited+interestedRows[17]).setBackground('#d8d8d8');
      sheet.getRange(columnsEdited+interestedRows[17]).setNumberFormat('0');
    }

    //condition formatting number one and two
    if ( sheet.getRange(columnsEdited+interestedRows[4]).getValue() != '' &&  parseFloat(sheet.getRange(columnsEdited+interestedRows[3]).getValue()) > parseFloat(sheet.getRange(columnsEdited+interestedRows[4]).getValue())  ) {

      //set cell 41
      sheet.getRange(columnsEdited+interestedRows[3]).setFontColor('#ff0000');
      sheet.getRange(columnsEdited+interestedRows[3]).setBackground('#ffffff');
      sheet.getRange(columnsEdited+interestedRows[3]).setNumberFormat('0');
      //set cell 42
      sheet.getRange(columnsEdited+interestedRows[4]).setFontColor('#ff0000');
      sheet.getRange(columnsEdited+interestedRows[4]).setBackground('#ffffff');
      sheet.getRange(columnsEdited+interestedRows[4]).setNumberFormat('0');

    }else {
      //set cell 41
      sheet.getRange(columnsEdited+interestedRows[3]).setFontColor('#000000');
      sheet.getRange(columnsEdited+interestedRows[3]).setBackground('#ffffff');
      sheet.getRange(columnsEdited+interestedRows[3]).setNumberFormat('0');
      //set cell 42
      sheet.getRange(columnsEdited+interestedRows[4]).setFontColor('#000000');
      sheet.getRange(columnsEdited+interestedRows[4]).setBackground('#ffffff');
      sheet.getRange(columnsEdited+interestedRows[4]).setNumberFormat('0');
    }

    //condition formatting number three
    if ( operation > 0.1 && sheet.getRange(columnsEdited+interestedRows[0]).getValue() != '' && sheet.getRange(columnsEdited+interestedRows[3]).getValue() != '' ) {
      //set cell 43
      sheet.getRange(columnsEdited+interestedRows[5]).setFontColor('#ff0000');
      sheet.getRange(columnsEdited+interestedRows[5]).setBackground('#d8d8d8');
      sheet.getRange(columnsEdited+interestedRows[5]).setNumberFormat('0.00');
    }else {
     //set cell 43
     sheet.getRange(columnsEdited+interestedRows[5]).setFontColor('#000000');
     sheet.getRange(columnsEdited+interestedRows[5]).setBackground('#d8d8d8');
     sheet.getRange(columnsEdited+interestedRows[5]).setNumberFormat('0.00');
   }

    //condition formatting number four
    if ( operation2 > 0.1 && sheet.getRange(columnsEdited+interestedRows[1]).getValue() != '' && sheet.getRange(columnsEdited+interestedRows[2]).getValue() != '' ) {
      //set cell 44
      sheet.getRange(columnsEdited+interestedRows[6]).setFontColor('#ff0000');
      sheet.getRange(columnsEdited+interestedRows[6]).setBackground('#d8d8d8');
      sheet.getRange(columnsEdited+interestedRows[6]).setNumberFormat('0.00');
    }else {
      //set cell 44
      sheet.getRange(columnsEdited+interestedRows[6]).setFontColor('#000000');
      sheet.getRange(columnsEdited+interestedRows[6]).setBackground('#d8d8d8');
      sheet.getRange(columnsEdited+interestedRows[6]).setNumberFormat('0.00');
    }

    //condtion formatting number 5
    if ( sheet.getRange(columnsEdited+interestedRows[13]).getValue() != '' && ( sheet.getRange(columnsEdited+interestedRows[8]).getValue() != '' && sheet.getRange(columnsEdited+interestedRows[9]).getValue() != '' && sheet.getRange(columnsEdited+interestedRows[11]).getValue() != '') && operation3 != parseFloat(sheet.getRange(columnsEdited+interestedRows[13]).getValue())  ) {
      //set cell 54
      sheet.getRange(columnsEdited+interestedRows[13]).setFontColor('#ff0000');
      sheet.getRange(columnsEdited+interestedRows[13]).setBackground('#d8d8d8');
      sheet.getRange(columnsEdited+interestedRows[14]).setNumberFormat('0');
    }else {      
      //set cell 54
      sheet.getRange(columnsEdited+interestedRows[13]).setFontColor('#000000');
      sheet.getRange(columnsEdited+interestedRows[13]).setBackground('#d8d8d8');
      sheet.getRange(columnsEdited+interestedRows[14]).setNumberFormat('0');
    }

     //condtion formatting number 6
    if ( sheet.getRange(columnsEdited+interestedRows[14]).getValue() != '' && ( sheet.getRange(columnsEdited+interestedRows[7]).getValue() != '' && sheet.getRange(columnsEdited+interestedRows[10]).getValue() != '' && sheet.getRange(columnsEdited+interestedRows[12]).getValue() != '') && operation4 != parseFloat(sheet.getRange(columnsEdited+interestedRows[14]).getValue())  ) {
      //set cell 55
      sheet.getRange(columnsEdited+interestedRows[14]).setFontColor('#ff0000');
      sheet.getRange(columnsEdited+interestedRows[14]).setBackground('#d8d8d8');
      sheet.getRange(columnsEdited+interestedRows[14]).setNumberFormat('0');
    }else {
      //set cell 55
      sheet.getRange(columnsEdited+interestedRows[14]).setFontColor('#000000');
      sheet.getRange(columnsEdited+interestedRows[14]).setBackground('#d8d8d8');
      sheet.getRange(columnsEdited+interestedRows[14]).setNumberFormat('0');
    }
    //condition formatting number 7

    if (parseFloat(sheet.getRange(columnsEdited+interestedRows[16]).getValue())  > parseFloat(sheet.getRange(columnsEdited+interestedRows[15]).getValue())  ) {
      //set cell 30
      sheet.getRange(columnsEdited+interestedRows[16]).setFontColor('#ff0000');
      sheet.getRange(columnsEdited+interestedRows[4]).setBackground('#ffffff');
      sheet.getRange(columnsEdited+interestedRows[16]).setNumberFormat('0');
    }else {
      //set cell 30
      sheet.getRange(columnsEdited+interestedRows[16]).setFontColor('#000000');
      sheet.getRange(columnsEdited+interestedRows[4]).setBackground('#ffffff');
      sheet.getRange(columnsEdited+interestedRows[16]).setNumberFormat('0');
    }

  }
  //------------------------------------------------------------------------------------------------------------------
  // END -- apply conditional formatting and color the cell when it is required
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
    return HtmlService.createTemplateFromFile(filename).evaluate().getContent();
  };


  /**
   * sends a debug email message
   * @param  {string} message debug info to send
   */
  this.sendErrorEmails=function(message) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet=ss.getActiveSheet();
    var title="Error message in spreadsheet "+ss.getName();
    message="Error in sheet:"+sheet.getName()+"\n\n"+
        "getActiveCell().getA1Notation():"+sheet.getActiveCell().getA1Notation()+"\n\n"+
        "Session.getActiveUser().getEmail():"+Session.getActiveUser().getEmail()+"\n\n"+
        "FirebaseConnector.getToken():"+FirebaseConnector.getToken()+"\n\n"+
        "message:"+message+"\n\n";
    MailApp.sendEmail(Config.errorEmail, title, message);
    };

    /**
     * check if the current spreadsheet is Master
     * @return {bool} true if master, false otherwise
     */
    this.isMaster = function() {
      return SpreadsheetApp.getActiveSpreadsheet().getName().indexOf(Config.masterKeyword)>0;
    };


});
