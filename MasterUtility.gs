var MasterUtility=new function(){  
  
  //------------------------------------------------------------------------------------------------------------------
  /**
  * write into MASTER TEMPLATE the notes/data taken from Firebase
  * @param  {string} selected country
  * @param  {string} user token
  */
  //------------------------------------------------------------------------------------------------------------------
  this.writeNoteAndDataForCountries= function(countrySelected,isReset){    
    
    //read config from firebase
    var templateCompilerNode = 'config/templateCompiler/'+countrySelected;    
    var templateCompiler = JSON.parse(FirebaseConnector.getFireBaseData(templateCompilerNode,FirebaseConnector.getToken()));
    
    //read config from firebase
    var valuesNode = '';
    var valuesToBeWritten = '';
    
    for (var values in templateCompiler) {
      valuesNode = 'config/templateCompiler/'+countrySelected+'/'+values;
      valuesToBeWritten = JSON.parse(FirebaseConnector.getFireBaseData(valuesNode,FirebaseConnector.getToken()));      
      
      //for sheet
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(values);
      //for TEMPLATE sheet
      var templateSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Template_'+values);
      
      for (var subNode in valuesToBeWritten) {
        //contain the range
        //valuesToBeWritten[subNode][0]        
        //contain the value
        //valuesToBeWritten[subNode][1]
        
        
        if(isReset){
          //delete all the data/notes. The master will be restored
          sheet.getRange(valuesToBeWritten[subNode][0]).setValue('');
          templateSheet.getRange(valuesToBeWritten[subNode][0]).setValue('');
        }else{
          //set the values from Firebase
          sheet.getRange(valuesToBeWritten[subNode][0]).setValue(valuesToBeWritten[subNode][1]);
          templateSheet.getRange(valuesToBeWritten[subNode][0]).setValue(valuesToBeWritten[subNode][1]);
        }
        
        
        
      }
      
    }
    
   
  }
  //------------------------------------------------------------------------------------------------------------------
  // END --   ADD A NEW FORECAST on the google sheet
  //------------------------------------------------------------------------------------------------------------------
}