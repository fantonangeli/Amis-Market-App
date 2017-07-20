var ProtectFormulas=new function(){  
  
 //------------------------------------------------------------------------------------------------------------------
  /**
	 * GET RANGES WHERE RESTORE FORMULAS MUST NOT BE APPLY
     * @params  {string} user token
     * @return  {string} Firebase node of Ranges to be protected  
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.getRangeToBeProtectedNode = function(userToken){
		  var sheetId= Utility.getGoogleSheetID();
		  var dataBaseNodeToRead='config/countries/'+sheetId;	  
		  return 'config/formulasToBeProtected/'+JSON.parse(FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken)).name;
	  }	
  //------------------------------------------------------------------------------------------------------------------
  //END -- GET RANGES WHERE RESTORE FORMULAS MUST NOT BE APPLY  
  //------------------------------------------------------------------------------------------------------------------
	
  
  //------------------------------------------------------------------------------------------------------------------
  /**
	 * STORE INTO SESSION THE RANGES WHERE RESTORE FORMULAS MUST NOT BE APPLY  
     * @params  {string} user token
	 */
  //------------------------------------------------------------------------------------------------------------------
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
      
    }
    //------------------------------------------------------------------------------------------------------------------
    //END -- STORE INTO SESSION THE RANGES WHERE RESTORE FORMULAS MUST NOT BE APPLY  
    //------------------------------------------------------------------------------------------------------------------
  
    
  //------------------------------------------------------------------------------------------------------------------
  /**
  * CALLED ON EDIT --- If the ranges NOT BELONG to FormulaProtected Ranges:  it applyREBUILD STYLE AND FORMULAS
       and CONTIDIONAL FORMATTING
     * @params  {eventObj} event ON edit object
	 */
  //------------------------------------------------------------------------------------------------------------------
  this.checkIfValueIsNotProtected = function (e) {    
	  
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var activeCell=e.range;
    var rangesProtectedStored = JSON.parse(PropertiesService.getUserProperties().getProperty("formulasProtected"));
    
    //used after to determinate if REBUILD OR NOT STYLE, FORMULAS AND FORMATTING CONDITIONS
    var canWrite = true;
    
    for (var i=0; i<rangesProtectedStored.length;i++){
     
      //if a protected cell is update
      if(Utility.isInRange(rangesProtectedStored[i], activeCell)){
        
        //if FALSE THE SCRIPT MUST NOT REBUILD STYLE, FORMULAS AND FORMATTING CONDITIONS
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
      //DO NOTHING
    }
    
        
  }
  //------------------------------------------------------------------------------------------------------------------
  //END -- * CALLED ON EDIT --- If the ranges NOT BELONG to FormulaProtected Ranges:  it applyREBUILD STYLE AND FORMULAS and CONTIDIONAL FORMATTING  
  //------------------------------------------------------------------------------------------------------------------
  
}