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
    
      var rangeFromConfigNotParsed = FirebaseConnector.getFireBaseData('config/formulasToBeProtected/argentina',userToken);      
      //get from firebase the formulas to be protected
      var rangeFromConfig=JSON.parse(rangeFromConfigNotParsed);	   

      //store into session the ranges to be protected
      PropertiesService.getUserProperties().setProperty("formulasProtected", rangeFromConfigNotParsed);
      
      //store into session the values of protected ranges
      ProtectFormulas.storeLocalValuesFromRanges(rangeFromConfig);
      
    }
	  
  
  this.storeLocalValuesFromRanges = function(rangesProteced){
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    for (var i=0; i<rangesProteced.length;i++){
    
      //get protected values
      var val= sheet.getRange(rangesProteced[i]).getFormulas();
      
      //get protected background style
      var valbck = sheet.getRange(rangesProteced[i]).getBackgrounds();
    
      //store into session the ranges protected... 
      //KEY = protected range --- VALUE = the values of the protected range
      PropertiesService.getUserProperties().setProperty(rangesProteced[i], JSON.stringify(val));      
      //added 'bck' for background
      PropertiesService.getUserProperties().setProperty(rangesProteced[i]+'bck', JSON.stringify(valbck));
    }
    
    
  }
  
  this.checkIfValueIsNotProtected = function (e) {    
	  
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var activeCell=e.range;
    var rangesProtectedStored = JSON.parse(PropertiesService.getUserProperties().getProperty("formulasProtected"));
    
    for (var i=0; i<rangesProtectedStored.length;i++){
     
      //if a protected cell is update
      if(Utility.isInRange(rangesProtectedStored[i], activeCell)){        
        
        //get old values
        var oldValues= JSON.parse(PropertiesService.getUserProperties().getProperty(rangesProtectedStored[i]));
        
        //get old background styles
        var oldValuesBck= JSON.parse(PropertiesService.getUserProperties().getProperty(rangesProtectedStored[i]+'bck'));
        
        //restore old background
        sheet.getRange(rangesProtectedStored[i]).setBackgrounds(oldValuesBck);
                
        //restore old formulas
        sheet.getRange(rangesProtectedStored[i]).setFormulas(oldValues);   
      }
      
    }
    
        
  }
  
}