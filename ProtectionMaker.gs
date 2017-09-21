var ProtectionMaker=new function(){

  /**
  * GET RANGES TO BE PROTECED NODE
  * @return  {string} Firebase node of Ranges to be protected
  */
  this.getRangeToBeProtectedNode = function(userToken){
    var sheetId= Utility.getGoogleSheetID();
    var dataBaseNodeToRead='config/countries/'+sheetId;
    return 'config/rangeToBeProtected/'+JSON.parse(FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken)).name;
  }

  /**
   * validate the current sheet, restore styles and formulas
   * @return {void}
   */
  this.validateSheet=function(){
      //IF user is NOT editing a Template Sheet. Do normal logic.
      if( !Utility.isTemplate() && !Utility.isMaster() ) {
    
        ProtectionMaker.checkIfValueIsNotProtected(e);

        //forecast methodologies on edit
        ForecastingMethodologies.onEdit(e);

        //set the last date on edit event
        LastDateUpdater.onEditSetLastUpdateDate(FirebaseConnector.getToken(),e);
      }
  };


  /**
   * restore the styles, formulas, values and the formatting from the template
   * @return {void}
   */
  this.checkIfValueIsNotProtected = function () {
    var interestedRange = JSON.parse(PropertiesService.getUserProperties().getProperty("sheetProtectionRanges"));

    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();

    var rangeToBeRestored = 'C:AO';

    ss.getRange(rangeToBeRestored).setDataValidation(null);

    //destroy eventually CONDITIONS FORMATTING COPIED AND PASTED
    //e.range.clearFormat(); //commented because now with the validate button there isn't the event var

    var sheetName = ss.getName();

    var templateSheet = sheet.getSheetByName("Template_"+sheetName);

    var sheetValues = ss.getRange(rangeToBeRestored).getValues();
    var sheetFormulas = ss.getRange(rangeToBeRestored).getFormulas();

    var tmpDataValidation = templateSheet.getRange(rangeToBeRestored).getDataValidations();

    var tmpFormulas = templateSheet.getRange(rangeToBeRestored).getFormulas();

    var tmpValues = templateSheet.getRange(rangeToBeRestored).getValues();
    //var lenght=  tmpValues.length
    var row,cell;

    for (var r=tmpValues.length; r--; ) {
      row = tmpValues[r];
      for (var c=row.length; c--; ) {
        if(row[c] != '' ){
          sheetValues[r][c]=row[c]
        }
        if(tmpFormulas[r][c] != ''){
          sheetValues[r][c]=tmpFormulas[r][c]
        }
      }
    }

    //restore FORMULAS and VALUES not EDITABLE
    ss.getRange(rangeToBeRestored).setValues(sheetValues);

    //restore the style from hidden template
    templateSheet.getRange(rangeToBeRestored).copyTo(ss.getRange(rangeToBeRestored), {formatOnly:true});

    //restore data validations
    ss.getRange(rangeToBeRestored).setDataValidations(tmpDataValidation);


};

  this.checkIfValueIsNotProtected_ = function (e) {
    var interestedRange = JSON.parse(PropertiesService.getUserProperties().getProperty("sheetProtectionRanges"));

    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();

    var rangeToBeRestored = e.range.getA1Notation();

    rangeValues = e.range.getValues();

    multiple = rangeValues.length > 1 ? rangeValues.length > 1 : rangeValues[0].length > 1 ? rangeValues[0].length > 1 : rangeValues.length > 1;


    ss.getRange(rangeToBeRestored).setDataValidation(null);

    //destroy eventually CONDITIONS FORMATTING COPIED AND PASTED
    e.range.clearFormat();

    var sheetName = ss.getName();

    var templateSheet = sheet.getSheetByName("Template_"+sheetName);
    if(multiple){
      var sheetValues = ss.getRange(rangeToBeRestored).getValues();
      var sheetFormulas = ss.getRange(rangeToBeRestored).getFormulas();

      var tmpDataValidation = templateSheet.getRange(rangeToBeRestored).getDataValidations();

      var tmpFormulas = templateSheet.getRange(rangeToBeRestored).getFormulas();

      var tmpValues = templateSheet.getRange(rangeToBeRestored).getValues();
      //var lenght=  tmpValues.length
      var row,cell;

      for (var r=tmpValues.length; r--; ) {
        row = tmpValues[r];
        for (var c=row.length; c--; ) {
          if(row[c] != '' ){
            //Browser.msgBox(row[c])
            sheetValues[r][c]=row[c];
            //Browser.msgBox(ss.getRange(rangeToBeRestored).getCell(r+1, c+1).getValue())
            ss.getRange(rangeToBeRestored).getCell(r+1, c+1).setValue(row[c]);
           // Browser.msgBox(ss.getRange(rangeToBeRestored).getCell(r, c))
          }
          if(tmpFormulas[r][c] != ''){
            sheetValues[r][c]=tmpFormulas[r][c];
            //Browser.msgBox(tmpFormulas[r][c])
            //Browser.msgBox(c)
            //Browser.msgBox(ss.getRange(rangeToBeRestored).getCell(r+1, c+1))
           ss.getRange(rangeToBeRestored).getCell(r+1, c+1).setFormula(tmpFormulas[r][c])
          }
        }
      }

      //restore FORMULAS and VALUES not EDITABLE
      //ss.getRange(rangeToBeRestored).setValues(sheetValues);
    }
    //restore the style from hidden template
    templateSheet.getRange(rangeToBeRestored).copyTo(ss.getRange(rangeToBeRestored), {formatOnly:true});

    //restore data validations
    ss.getRange(rangeToBeRestored).setDataValidations(tmpDataValidation);


  }

}
