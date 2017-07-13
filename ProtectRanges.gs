var ProtectRanges=new function(){  

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
   * SET LAST DATE WHEN UPDATING A CELL
   * @param  {event}  you must call it from OnEdit function and pass 'e' event object
   */
    this.protectCell = function(userToken){ 	  
      var rangeFromConfigNotParsed = FirebaseConnector.getFireBaseData('config/rangeToBeProtected/argentina',userToken);
      var rangeFromConfig=JSON.parse(rangeFromConfigNotParsed);	   
      
      //store into session the ranges to be protected
      PropertiesService.getUserProperties().setProperty("rangeProtected",rangeFromConfigNotParsed);
      
      //store into session the values of protected ranges
      ProtectRanges.storeLocalValuesFromRanges(rangeFromConfig);
      
    }
    
  this.storeLocalValuesFromRanges = function(rangesProteced){
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    for (var i=0; i<rangesProteced.length;i++){
      
      //get protected values
      var val= sheet.getRange(rangesProteced[i]).getValues();
      
      //store into session the ranges protected... 
      //KEY = protected range --- VALUE = the values of the protected range
      PropertiesService.getUserProperties().setProperty(rangesProteced[i], JSON.stringify(val));      
   
    }
    
  }
  
  this.checkIfValueIsNotProtected = function (e) {    
    //THIS AVOID PROBLEMS IN CASE SOMEBODY COPY AND PASTE VALUES FROM A CELL WITH VALIDATION
    e.range.setDataValidation(null);
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var activeCell=e.range;
    var rangesProtectedStored = JSON.parse(PropertiesService.getUserProperties().getProperty("rangeProtected"));
    
    for (var i=0; i<rangesProtectedStored.length;i++){
      
      
      //if a protected cell is update
      if(Utility.isInRange(rangesProtectedStored[i], activeCell)){        

        //get old values
        var oldValues= JSON.parse(PropertiesService.getUserProperties().getProperty(rangesProtectedStored[i]));        
        //restore old values
        sheet.getRange(rangesProtectedStored[i]).setValues(oldValues);        
      }
    }
  }
  
}