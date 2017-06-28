var ProtectFormulas=new function(){  
 
  /**
	 * GET RANGES TO BE PROTECED NODE  
     * @params  {string} user token
     * @return  {string} Firebase node of Ranges to be protected  
	 */
	this.getRangeToBeProtectedNode = function(userToken){
		  var sheetId= Utility.getGoogleSheetID();
		  var dataBaseNodeToRead='config/countries/'+sheetId;	  
		  return 'config/formulasToBeProtected/'+JSON.parse(FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken)).name;
	  }	
  
	
	/**
	 * Protecting formulas from not allowed edits
     * @params  {string} user token     
	 */
    this.protectCell = function(userToken){
    
      //get from firebase the formulas to be protected
      var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData('config/formulasToBeProtected/argentina',userToken));	   

      //store into session the ranges to be protected
      PropertiesService.getUserProperties().setProperty("formulasProtected", FirebaseConnector.getFireBaseData('config/formulasToBeProtected/argentina',userToken));
      
      //store into session the values of protected ranges
      ProtectFormulas.storeLocalValuesFromRanges(rangeFromConfig);
      
    }
	  
  
  this.storeLocalValuesFromRanges = function(rangesProteced){
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet(); 
    
    //loop all the protected ranges stored in firebase
    for (var singleRange in rangesProteced) { 
    
      //get protected values
      var val= sheet.getRange(singleRange).getFormulas();
      
      //get protected background style
      var valbck = sheet.getRange(singleRange).getBackgrounds();

      //store into session the ranges protected... 
      //KEY = protected range --- VALUE = the values of the protected range
      PropertiesService.getUserProperties().setProperty(singleRange, JSON.stringify(val));
      //added 'bck' for background
      PropertiesService.getUserProperties().setProperty(singleRange+'bck', JSON.stringify(valbck));

    }
  }
  
  this.checkIfValueIsNotProtected = function (e) {    
	  
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var activeCell=e.range;
    
    
    //loop all the ranges stored in firebase
    for (var singleRange in JSON.parse(PropertiesService.getUserProperties().getProperty("formulasProtected"))) {             
      
      //if a protected cell is update
      if(Utility.isInRange(singleRange, activeCell)){                
        
        //get old values
        var oldValues= JSON.parse(PropertiesService.getUserProperties().getProperty(singleRange));
        
        //get old background styles
        var oldValuesBck= JSON.parse(PropertiesService.getUserProperties().getProperty(singleRange+'bck'));
        
        
        //restore old background
        sheet.getRange(singleRange).setBackgrounds(oldValuesBck);
                
        

        
        //restore old formulas
        sheet.getRange(singleRange).setFormulas(oldValues);         
      }
      
    }
    
  }
  
}