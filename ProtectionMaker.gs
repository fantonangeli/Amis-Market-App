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
    
    ss.getRange('C:AE').setDataValidation(null);
    
    //destroy eventually CONDITIONS FORMATTING COPIED AND PASTED
    e.range.clearFormat();
    
    var sheetName = ss.getName();
    
    var templateSheet = sheet.getSheetByName("Template_"+sheetName);
    
    var sheetValues = ss.getRange('C:AE').getValues();
    var sheetFormulas = ss.getRange('C:AE').getFormulas();
    
    var tmpDataValidation = templateSheet.getRange('C:AE').getDataValidations();
    
    var tmpFormulas = templateSheet.getRange('C:AE').getFormulas();
    
    var tmpValues = templateSheet.getRange('C:AE').getValues();
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
    ss.getRange('C:AE').setValues(sheetValues); 
    
    //restore the style from hidden template
    templateSheet.getRange('C:AE').copyTo(ss.getRange('C:AE'), {formatOnly:true});
    
    //restore data validations
    ss.getRange('C:AE').setDataValidations(tmpDataValidation);
    
    
  }    
  
}