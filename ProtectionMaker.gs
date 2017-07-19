var ProtectionMaker=new function(){  

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
   * STORE THE ROWS TO BE RESTORED
   * @param  {event}  you must call it from OnEdit function and pass 'e' event object
   */
    this.protectCell = function(userToken){ 	  
      var rangeFromConfigNotParsed = FirebaseConnector.getFireBaseData('config/restoreStyleRows/argentina',userToken);
      var rangeFromConfig=JSON.parse(rangeFromConfigNotParsed);	   
      
      //store into session the ranges to be protected
      PropertiesService.getUserProperties().setProperty("restoreStyleRows",rangeFromConfigNotParsed);
      
      //store into session the values of protected ranges
      //ProtectionMaker.storeLocalValuesFromRanges(rangeFromConfig);
      
    }
    
  this.storeLocalValuesFromRanges = function(rangesProteced){
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    
    for (var i=0; i<rangesProteced.length;i++){
      
      //get protected values
      //var val= sheet.getRange(rangesProteced[i]).getValues();
      var formulas= sheet.getRange(rangesProteced[i]).getFormulas();
     // var bck= sheet.getRange(rangesProteced[i]).getBackgrounds();
     // var numberFormats = sheet.getRange(rangesProteced[i]).getNumberFormats();
     // var fontFamilies = sheet.getRange(rangesProteced[i]).getFontFamilies();
      
     // var fontColors =sheet.getRange(rangesProteced[i]).getFontColors();
      
    //  var fontLines = sheet.getRange(rangesProteced[i]).getFontLines();
      
    //  var fontStyles = sheet.getRange(rangesProteced[i]).getFontStyles();
    //  var fontWeights = sheet.getRange(rangesProteced[i]).getFontWeights();
      
      //store into session the ranges protected... 
      //KEY = protected range --- VALUE = the values of the protected range
     // PropertiesService.getUserProperties().setProperty(rangesProteced[i], JSON.stringify(val));      
      PropertiesService.getUserProperties().setProperty(rangesProteced[i]+'_frm', JSON.stringify(formulas));      
     // PropertiesService.getUserProperties().setProperty(rangesProteced[i]+'_bck', JSON.stringify(bck));      
    //  PropertiesService.getUserProperties().setProperty(rangesProteced[i]+'_nbfm', JSON.stringify(numberFormats));      
   //   PropertiesService.getUserProperties().setProperty(rangesProteced[i]+'_ftfm', JSON.stringify(fontFamilies));      
      
      //PropertiesService.getUserProperties().setProperty(rangesProteced[i]+'_ftclr', JSON.stringify(fontColors));      
   //   PropertiesService.getUserProperties().setProperty(rangesProteced[i]+'_ftlns', JSON.stringify(fontLines));      
   //   PropertiesService.getUserProperties().setProperty(rangesProteced[i]+'_ftsty', JSON.stringify(fontStyles));      
   //   PropertiesService.getUserProperties().setProperty(rangesProteced[i]+'_ftwgt', JSON.stringify(fontWeights));      
     
    }
    
  }
  
  this.checkIfValueIsNotProtected_OLD = function (e) {    
    
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();
    
    var activeCell=e.range;
    //var activeCell=ss.getRange('Z22');
    //Browser.msg(ss.getRange('K8').getBackground());
    var rangesProtectedStored = JSON.parse(PropertiesService.getUserProperties().getProperty("rangeProtectionMaker"));
    
    for (var i=0; i<rangesProtectedStored.length;i++){

      
      //if a protected cell is update
      if(Utility.isInRange(rangesProtectedStored[i], activeCell)){        
        
        var rangePrtColumn = rangesProtectedStored[i].split(':')[0];
        //var rangePrtColumn2 = rangesProtectedStored[i].split(':')[1];
        
        //Browser.msgBox(rangePrtColumn);
       // Browser.msgBox(rangePrtColumn2);
        
        //THIS AVOID PROBLEMS IN CASE SOMEBODY COPY AND PASTE VALUES FROM A CELL WITH VALIDATION
        //e.range.setDataValidation(null);
        
        //get old values
       // var oldValues= JSON.parse(PropertiesService.getUserProperties().getProperty(rangesProtectedStored[i]));
        var oldFormulas = JSON.parse(PropertiesService.getUserProperties().getProperty(rangesProtectedStored[i]+'_frm'));        
        //var oldBck=JSON.parse(PropertiesService.getUserProperties().getProperty(rangesProtectedStored[i]+'_bck'));                
       // var nbfm=JSON.parse(PropertiesService.getUserProperties().getProperty(rangesProtectedStored[i]+'_nbfm'));
       // var ftfm=JSON.parse(PropertiesService.getUserProperties().getProperty(rangesProtectedStored[i]+'_ftfm'));
        
       //var ftclr=JSON.parse(PropertiesService.getUserProperties().getProperty(rangesProtectedStored[i]+'_ftclr'));
      //  var ftlns=JSON.parse(PropertiesService.getUserProperties().getProperty(rangesProtectedStored[i]+'_ftlns'));
     //   var ftsty=JSON.parse(PropertiesService.getUserProperties().getProperty(rangesProtectedStored[i]+'_ftsty'));
     //   var ftwgt=JSON.parse(PropertiesService.getUserProperties().getProperty(rangesProtectedStored[i]+'_ftwgt'));

        for (var p=0; p<oldFormulas.length;p++){
        
          if(oldFormulas[p] !=''){  
            //if(oldFormulas[p][0]!='')
              //Browser.msgBox(oldFormulas[p]);
            //Browser.msgBox(oldFormulas[p].split(',')[0]);
           sheet.getRange(rangePrtColumn+(p+1)).setFormula(oldFormulas[p]);                    
          }else{            
            //sheet.getRange(rangePrtColumn+(p+1)).setValue(oldValues[p]);               
          }
            
        }         
        
       // sheet.getRange(rangesProtectedStored[i]).setValues(oldValues);        
        //sheet.getRange(rangesProtectedStored[i]).setBackgrounds(oldBck);        
        //sheet.getRange(rangesProtectedStored[i]).setNumberFormats(nbfm);        
       // sheet.getRange(rangesProtectedStored[i]).setFontFamilies(ftfm);
        
       // sheet.getRange(rangesProtectedStored[i]).setFontLines(ftlns);
        
      //  sheet.getRange(rangesProtectedStored[i]).setFontStyles(ftsty);
      //  sheet.getRange(rangesProtectedStored[i]).setFontWeights(ftwgt);
        
        
      //  sheet.getRange(rangesProtectedStored[i]).setBorder(true, true, true, true, true,true);
        
        //sheet.getRange('A:A').copyTo(sheet.getRange(rangesProtectedStored[i]), {formatOnly:true});
        
        //sheet.getRange(rangesProtectedStored[i]).setFontColor(ftclr);
        //Browser.msgBox('DONE');
      }
    }
  }
  
  
  this.checkIfValueIsNotProtected = function (e) {    
    
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet();
    var ss = sheet.getActiveSheet();
    
    var activeCell=e.range;
    
    //get the letter of current column edited
    var currentColumn = Utility.numToChar(activeCell.getColumn());                
    
    var restoreStyleRows = JSON.parse(PropertiesService.getUserProperties().getProperty('restoreStyleRows'));        
    
    for (var i=0; i<restoreStyleRows.length;i++){
      
      //it contains the first and the last row of the range to be style restored
      var firstAndLastRowToBeRestored = restoreStyleRows[i].split('-');
    
      //A:A contain the safe style and the script rebuild that style
      sheet.getRange('A'+firstAndLastRowToBeRestored[0]+':A'+firstAndLastRowToBeRestored[1]).copyTo(sheet.getRange(currentColumn+firstAndLastRowToBeRestored[0]+':'+currentColumn+firstAndLastRowToBeRestored[1]), {formatOnly:true});
    }
    
  }
  
}