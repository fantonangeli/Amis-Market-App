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
      
      var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData('config/rangeToBeProtected/argentina',userToken));	   
      
      //store into session the ranges to be protected
      PropertiesService.getUserProperties().setProperty("rangeProtected", FirebaseConnector.getFireBaseData('config/rangeToBeProtected/argentina',userToken));
      
      
      //store into session the values of protected ranges
      ProtectRanges.storeLocalValuesFromRanges(rangeFromConfig);
      
    }
    
  this.storeLocalValuesFromRanges = function(rangesProteced){
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    //loop all the protected ranges stored in firebase
    for (var singleRange in rangesProteced) { 
      
      //get protected values
      var val= sheet.getRange(singleRange).getValues();
      
      //store into session the ranges protected... 
      //KEY = protected range --- VALUE = the values of the protected range
      PropertiesService.getUserProperties().setProperty(singleRange, JSON.stringify(val));      
    }
  }
  
  this.checkIfValueIsNotProtected = function (e) {    

    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var activeCell=e.range;
    //loop all the ranges stored in firebase
    for (var singleRange in JSON.parse(PropertiesService.getUserProperties().getProperty("rangeProtected"))) {             

      
      //if a protected cell is update
      if(Utility.isInRange(singleRange, activeCell)){        

        //get old values
        var oldValues= JSON.parse(PropertiesService.getUserProperties().getProperty(singleRange));
        
        //restore old values
        sheet.getRange(singleRange).setValues(oldValues);        
      }
      
    }
  }
  
}