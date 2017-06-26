var ProtectRanges=new function(){  
      
  //---------------------------------------------------------  
  /**
	 * GET RANGES TO BE PROTECED NODE  
     * @return  {string} Firebase node of Ranges to be protected  
	 */
  //---------------------------------------------------------
	this.getRangeToBeProtectedNode = function(userToken){
		  var sheetId= Utility.getGoogleSheetID();
		  var dataBaseNodeToRead='config/countries/'+sheetId;	  
		  return 'config/rangeToBeProtected/'+JSON.parse(FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken)).name;
	  }
	
  //---------------------------------------------------------
  // END -- GET RANGES TO BE PROTECED NODE
  //---------------------------------------------------------
  
	
 //------------------------------------------------------------------------------------------------------------------
  /**
   * SET LAST DATE WHEN UPDATING A CELL
   * @param  {event}  you must call it from OnEdit function and pass 'e' event object
   */
  //------------------------------------------------------------------------------------------------------------------
    this.protectCell = function(userToken){ 	  
      
      var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData('config/rangeToBeProtected/argentina',userToken));	   
      
      //store into session the ranges to be protected
      PropertiesService.getUserProperties().setProperty("rangeProtected", FirebaseConnector.getFireBaseData('config/rangeToBeProtected/argentina',userToken));
      
      //Logger.log(rangeFromConfig);        
      
      //store into session the values of protected ranges
      ProtectRanges.storeLocalValuesFromRanges(rangeFromConfig);
      
    }
  //------------------------------------------------------------------------------------------------------------------
  //END -- SET LAST DATE WHEN UPDATING A CELL
  //------------------------------------------------------------------------------------------------------------------	  
  
  this.storeLocalValuesFromRanges = function(rangesProteced){
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    //loop all the protected ranges stored in firebase
    for (var singleRange in rangesProteced) { 
      
      //get protected values
      var val= sheet.getRange(singleRange).getValues();
       //Browser.msgBox(val);
      // Browser.msgBox('CAN sTORE ?');      
      //store into session the ranges protected... 
      //KEY = protected range --- VALUE = the values of the protected range
      PropertiesService.getUserProperties().setProperty(singleRange, JSON.stringify(val));
      //Browser.msgBox('TYES');
      
      //Browser.msgBox(PropertiesService.getUserProperties().getProperty(singleRange));
    }
  }
  
  this.checkIfValueIsNotProtected = function (e) {    
    //Browser.msgBox(PropertiesService.getUserProperties().getProperty("rangeProtected"));                
   // Browser.msgBox('1');
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var activeCell=e.range;
    //loop all the ranges stored in firebase
    for (var singleRange in JSON.parse(PropertiesService.getUserProperties().getProperty("rangeProtected"))) {             
      //Browser.msgBox(singleRange);
      
      //if a protected cell is update
      if(Utility.isInRange(singleRange, activeCell)){        
        //Browser.msgBox(singleRange);
        //get old values
        var oldValues= JSON.parse(PropertiesService.getUserProperties().getProperty(singleRange));
        //Browser.msgBox(oldValues);
        //restore old values
        sheet.getRange(singleRange).setValues(oldValues);        
      }
      
    }
    //Browser.msgBox('3');
  }
  
}