var ProtectFormulas=new function(){  
      
  //---------------------------------------------------------  
  /**
	 * GET RANGES TO BE PROTECED NODE  
     * @return  {string} Firebase node of Ranges to be protected  
	 */
  //---------------------------------------------------------
	this.getRangeToBeProtectedNode = function(userToken){
		  var sheetId= Utility.getGoogleSheetID();
		  var dataBaseNodeToRead='config/countries/'+sheetId;	  
		  return 'config/formulasToBeProtected/'+JSON.parse(FirebaseConnector.getFireBaseData(dataBaseNodeToRead,userToken)).name;
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
      var rangeFromConfig=JSON.parse(FirebaseConnector.getFireBaseData('config/formulasToBeProtected/argentina',userToken));	   
      //Browser.msgBox(rangeFromConfig);  
      //store into session the ranges to be protected
      PropertiesService.getUserProperties().setProperty("formulasProtected", FirebaseConnector.getFireBaseData('config/formulasToBeProtected/argentina',userToken));
      
      //Logger.log(rangeFromConfig);               
      //store into session the values of protected ranges
      ProtectFormulas.storeLocalValuesFromRanges(rangeFromConfig);
      
    }
  //------------------------------------------------------------------------------------------------------------------
  //END -- SET LAST DATE WHEN UPDATING A CELL
  //------------------------------------------------------------------------------------------------------------------	  
  
  this.storeLocalValuesFromRanges = function(rangesProteced){
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet();    
    //loop all the protected ranges stored in firebase
    for (var singleRange in rangesProteced) { 
      //Browser.msgBox(singleRange);
      //get protected values
      var val= sheet.getRange(singleRange).getFormulas();
      
      var valbck = sheet.getRange(singleRange).getBackgrounds();
       //Browser.msgBox(val);
      //Browser.msgBox('CAN sTORE ?');      
      //store into session the ranges protected... 
      //KEY = protected range --- VALUE = the values of the protected range
      PropertiesService.getUserProperties().setProperty(singleRange, JSON.stringify(val));
      PropertiesService.getUserProperties().setProperty(singleRange+'bck', JSON.stringify(valbck));
      //Browser.msgBox('TYES');
      
      //Browser.msgBox(PropertiesService.getUserProperties().getProperty(singleRange));
    }
  }
  
  this.checkIfValueIsNotProtected = function (e) {    
    //Browser.msgBox(PropertiesService.getUserProperties().getProperty("formulasProtected"));                
    //Browser.msgBox('1');
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var activeCell=e.range;
    //loop all the ranges stored in firebase
    for (var singleRange in JSON.parse(PropertiesService.getUserProperties().getProperty("formulasProtected"))) {             
      //Browser.msgBox(singleRange);
      
      //if a protected cell is update
      if(Utility.isInRange(singleRange, activeCell)){        
        
        //Browser.msgBox('2');
        
        //get old values
        var oldValues= JSON.parse(PropertiesService.getUserProperties().getProperty(singleRange));
        
        var oldValuesBck= JSON.parse(PropertiesService.getUserProperties().getProperty(singleRange+'bck'));
        
        //Browser.msgBox(oldValuesBck);
        
        sheet.getRange(singleRange).setBackgrounds(oldValuesBck);
        
        //prevent a google sheet bug: if the cell is empty formulas are not applied
        sheet.getRange(singleRange).setValue('0');        
        
        

        
        //restore old values
        sheet.getRange(singleRange).setFormulas(oldValues);        
         //Browser.msgBox('Error', 'you can\'t edit this cell', Browser.Buttons.OK);
      }
      
    }
    //Browser.msgBox('3');
  }
  
}