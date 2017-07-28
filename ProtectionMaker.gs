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
  
  this.checkIfValueIsNotProtected = function (e) {    
    var interestedRange = JSON.parse(PropertiesService.getUserProperties().getProperty("sheetProtectionRanges"));
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();
    
    var rangeToBeRestored = 'C:AO';
    
    ss.getRange(rangeToBeRestored).setDataValidation(null);
    
    //destroy eventually CONDITIONS FORMATTING COPIED AND PASTED
    e.range.clearFormat();
    
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
    
    
  }    
  
}