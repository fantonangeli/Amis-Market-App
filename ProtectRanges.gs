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
  
	

    //------------------------------------------------------------------------------------------------------------------
    /**
    * STORE INTO SESSION THE PROTECTED RANGES
    * @params  {string} user token
    */
    //------------------------------------------------------------------------------------------------------------------
    this.protectCell = function(userToken){
      var rangeFromConfigNotParsedStd = FirebaseConnector.getFireBaseData('config/rangeToBeProtected/argentina',FirebaseConnector.getToken());      
      //get from firebase the formulas to be protected
      var a=JSON.parse(rangeFromConfigNotParsedStd);	
      
      //get for frc 16-17
      var rangeFromConfigNotParsed16_17 = FirebaseConnector.getFireBaseData('config/rangeToBeProtected16-17/argentina',FirebaseConnector.getToken());      
      var b=JSON.parse(rangeFromConfigNotParsed16_17);	
      
      //get for frc 17-18
      var rangeFromConfigNotParsed17_18 = FirebaseConnector.getFireBaseData('config/rangeToBeProtected17-18/argentina',FirebaseConnector.getToken());      
      var c=JSON.parse(rangeFromConfigNotParsed17_18);
      
      //set the final ranges
      var rangeFromConfig = a.concat(b.concat(c));
      //create the final ranges string to be stored into session
      var rangeFromConfigNotParsed = rangeFromConfigNotParsedStd.replace(']',',')+rangeFromConfigNotParsed16_17.substring(1, rangeFromConfigNotParsed16_17.length-1)+rangeFromConfigNotParsed17_18.replace('[',',');
      
      //store into session the ranges to be protected
      PropertiesService.getUserProperties().setProperty("rangeProtected",rangeFromConfigNotParsed);
      
      //store into session the values of protected ranges
      ProtectRanges.storeLocalValuesFromRanges(rangeFromConfig);
      
      var addForecastConfigNotParsed = FirebaseConnector.getFireBaseData('config/addForecast/argentina',userToken);
      var addForecastConfig=JSON.parse(addForecastConfigNotParsed);
      
      //store into session the ranges to be protected
      PropertiesService.getUserProperties().setProperty("addForecastConfig",addForecastConfigNotParsed);
      
    }
    //------------------------------------------------------------------------------------------------------------------
    //END -- STORE INTO SESSION THE PROTECTED RANGES
    //------------------------------------------------------------------------------------------------------------------
   
    //------------------------------------------------------------------------------------------------------------------
    /**
    * STORE INTO SESSION THE VALUSE FOR ALL THE PROTECTED RANGES
    * @params  {ARRAY}   rangesProteced
    */
    //------------------------------------------------------------------------------------------------------------------  
    this.storeLocalValuesFromRanges = function(rangesProteced){
      var sheet = SpreadsheetApp.getActiveSpreadsheet();
      
      for (var i=0; i<rangesProteced.length;i++){
        
        //get protected values
        var val= sheet.getRange(rangesProteced[i]).getValues();
        
        //store into session the ranges protected... 
        //KEY = protected range --- VALUE = the values of the protected range
        PropertiesService.getUserProperties().setProperty(rangesProteced[i]+'_rangePtr', JSON.stringify(val));      
        
      }
      
    }
    //------------------------------------------------------------------------------------------------------------------
    //END -- STORE INTO SESSION THE VALUSE FOR ALL THE PROTECTED RANGES
    //------------------------------------------------------------------------------------------------------------------
    
    
    //------------------------------------------------------------------------------------------------------------------
    /**
    * CALLED ON EDIT --- RESTORE OLD PROTECTED RANGES VALUES
    * @params  {eventObj} event ON edit object
    */
    //------------------------------------------------------------------------------------------------------------------
    this.checkIfValueIsNotProtected = function (e) {    
      
      var sheet = SpreadsheetApp.getActiveSpreadsheet();
      var activeCell=e.range;
      var rangesProtectedStored = JSON.parse(PropertiesService.getUserProperties().getProperty("rangeProtected"));
      
      for (var i=0; i<rangesProtectedStored.length;i++){
        
        
        //if a protected cell is update
        if(Utility.isInRange(rangesProtectedStored[i], activeCell)){        
          //THIS AVOID PROBLEMS IN CASE SOMEBODY COPY AND PASTE VALUES FROM A CELL WITH VALIDATION
          e.range.setDataValidation(null);
          //get old values
          var oldValues= JSON.parse(PropertiesService.getUserProperties().getProperty(rangesProtectedStored[i]+'_rangePtr'));                
          //restore old values
          sheet.getRange(rangesProtectedStored[i]).setValues(oldValues);        
        }
      }
    }
    //------------------------------------------------------------------------------------------------------------------
    //END -- CALLED ON EDIT  RESTORE OLD PROTECTED RANGES VALUES
    //------------------------------------------------------------------------------------------------------------------
  
}