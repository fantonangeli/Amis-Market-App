/**
 * Debugging utilities class
 * @return {object}
 */
var AmisDebugger=new function(){

	/**
	 * show a dialog with the info of a cell
	 * @return {void}
	 */
	 this.cellInfo=function(){
		var cell, cellA1, cellIndex, cellValue,fbValue,fblink;
	 	var userToken=FirebaseConnector.getToken();
		var fbData, baseOfSaveNode= JSON.parse(SyncMasterSheet.getAbsoluteDataSheetPath(userToken))+ '/'+ JSON.parse(SyncMasterSheet.getNodeToWriteData(userToken)).dataSheetNode+ '/' + FirebaseConnector.getCommodityName();

		fbData=FirebaseConnector.getFireBaseDataParsed(baseOfSaveNode, userToken);

		cell=SpreadsheetApp.getActiveSpreadsheet().getActiveSheet().getActiveRange();
		cellA1=cell.getA1Notation();

		cellIndex=ConvertA1.cellA1ToIndex(cellA1);

		cellValue=cell.getValue();

		fbValue=fbData[cellIndex.row][cellIndex.col];

		fblink=Utility.interpolate(
			"https://console.firebase.google.com/project/{{dbName}}/database/data/dataAmisSheet/countries/{{country}}Data/commodity/{{row}}/{{col}}",
			{
				dbName:Config.dbName,
				country:FirebaseConnector.getCountryNameFromSheet().toLowerCase(),
				commodity:FirebaseConnector.getCommodityName(),
				row:cellIndex.row,
				col:cellIndex.col
			}
		);

		Browser.msgBox("colnum="+(cellIndex.col+1)+"\\nfbValue="+fbValue+"\\ncellValue="+cellValue+"\\nfblink="+fblink);
	};


};
