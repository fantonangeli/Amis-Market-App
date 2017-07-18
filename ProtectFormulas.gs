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
    
      var rangeFromConfigNotParsedStd = FirebaseConnector.getFireBaseData('config/formulasToBeProtected/argentina',FirebaseConnector.getToken());      
      //get from firebase the formulas to be protected
      var a=JSON.parse(rangeFromConfigNotParsedStd);	
      
      //get for frc 16-17
      var rangeFromConfigNotParsed16_17 = FirebaseConnector.getFireBaseData('config/formulasToBeProtectedFrc16-17/argentina',FirebaseConnector.getToken());      
      var b=JSON.parse(rangeFromConfigNotParsed16_17);	

      //get for frc 17-18
      var rangeFromConfigNotParsed17_18 = FirebaseConnector.getFireBaseData('config/formulasToBeProtectedFrc17-18/argentina',FirebaseConnector.getToken());      
      var c=JSON.parse(rangeFromConfigNotParsed17_18);
      
      //set the final ranges
       var rangeFromConfig = a.concat(b.concat(c));
      //create the final ranges string to be stored into session
      var rangeFromConfigNotParsed = rangeFromConfigNotParsedStd.replace(']',',')+rangeFromConfigNotParsed16_17.substring(1, rangeFromConfigNotParsed16_17.length-1)+rangeFromConfigNotParsed17_18.replace('[',',')
      
      //Utilities.sleep(300);
      //store into session the ranges to be protected
      PropertiesService.getUserProperties().setProperty("formulasProtected", rangeFromConfigNotParsed);
      
      //store into session the values of protected ranges
      //ProtectFormulas.storeLocalValuesFromRanges(rangeFromConfig);
      
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
      //Utilities.sleep(300);
      PropertiesService.getUserProperties().setProperty(rangesProteced[i], JSON.stringify(val));      
      //added 'bck' for background
      //Utilities.sleep(300);
      PropertiesService.getUserProperties().setProperty(rangesProteced[i]+'bck', JSON.stringify(valbck));
    }
    
    
  }
  
  this.checkIfValueIsNotProtected_Old = function (e) {    
	  
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
        
        //set bold text
        sheet.getRange(rangesProtectedStored[i]).setFontWeight("bold");
        
        //set font size
        sheet.getRange(rangesProtectedStored[i]).setFontSize(10);
      }
      
    }
    
        
  }
  
  
  this.checkIfValueIsNotProtected = function (e) {    
	  
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var activeCell=e.range;
    var rangesProtectedStored = JSON.parse(PropertiesService.getUserProperties().getProperty("formulasProtected"));
    
    //used after to determinate if set the last date or not
    var canWrite = true;
    
    for (var i=0; i<rangesProtectedStored.length;i++){
     
      //if a protected cell is update
      if(Utility.isInRange(rangesProtectedStored[i], activeCell)){        
        //if the cell updated is in a protected range I CANT WRITE
        canWrite = false;  
      }
      
    }
    if(canWrite){      
      //rebuild Style form current column
      ProtectionMaker.checkIfValueIsNotProtected(e);
      //rebuild the formulas for current column
      ForecastUtility.checkIfValueIsNotProtected(e);
      //rebuild conditional formatting
      Utility.applyConditionalFormatting(e);
       
    }else{
      
    }
    
        
  }
  
}