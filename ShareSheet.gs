var ShareSheet=new function(){  
  
  
  //---------------------------------------------------------
  /**
	 * CREATE A NEW GOOGLE SHEET
	 * @param  {string} name of the new file
     * @param  {string} google account of the country (email address)
	 */
  //---------------------------------------------------------
  this.createSheet=function(countryName,countryAccount) {
	  var newFile = cloneSheet(countryName);
	  shareSheet(newFile,countryAccount);
  }
  //---------------------------------------------------------
  // END  CREATE A NEW GOOGLE SHEET
  //---------------------------------------------------------
  
  
  //---------------------------------------------------------  
  /**
	 * CLONE THE MASTER TEMPLATE
	 * @param  {string} google account of the country (email address)
	 * @return  {file} the new sheet     
	 */
  //---------------------------------------------------------
  this.cloneSheet = function(countryName){
	  //get current folder id
	  var ss = SpreadsheetApp.getActive(); //current spreadsheet
	  
	  //get current file master file to be cloned
	  var file = DriveApp.getFileById(ss.getId());
	  
//	  var directParents = file.getParents();
//	  
//	  while( directParents.hasNext() ) {
//		  var folder = directParents.next();
//		  var folderId = folder.getId();
//		  Logger.log(folder.getName() + " has id " + folderId);
//	  }
	  
	  return file.makeCopy(countryName);  
  }
  //---------------------------------------------------------
  // END -- CLONE THE MASTER TEMPLATE
  //---------------------------------------------------------
      
 
  //---------------------------------------------------------  
  /**
	 * SHARE SHEET 
     * @param  {file} the new file cloned
     * @param  {string} google account of the country (email address)  
	 */
  //---------------------------------------------------------
  this.shareSheet= function(newfile,countryAccount) {

	  //share the new country sheet
	  newfile.addEditor(countryAccount);
	  
	  //share the Amis Market Api TODO _ get it from firebase
	  DriveApp.getFileById('1OJQBydtovPhuO5-PwYdmzIe6977jVqcRuk3d3ZfvHCNWWWaLjpB8kLeg').addViewer(countryAccount);
  }
  //---------------------------------------------------------
  // END -- SHARE SHEET
  //---------------------------------------------------------

  
}