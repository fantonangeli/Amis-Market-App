/**
 * class to interact with namedRanges
 * @return {class}
 */
AmisNamedRanges=new function() {


	/**
	 * parse all named range in the whole Spreadsheet
	 * @return {object} an object representing the named ranges: {commodity: {type: [index]}}
	 */
	this.parseAllNamedRanges=function() {
		var s=SpreadSheetCache.getActiveSpreadsheet();
		var rs=s.getNamedRanges();
		var retVal={}, _rangeName, _rangeNameMatch, _sheetName, _type, _index, _a1;

		var r;
		for (var i = rs.length; i--;) {
			r=rs[i];
			_rangeName=r.getName();
			_rangeNameMatch=_rangeName.match(/^(\w+)_(\w+)_((\d+)|(\w+))$/);
			_sheetName=_rangeNameMatch[1];
			_type=_rangeNameMatch[2],
			_index=_rangeNameMatch[3];
			_a1=r.getRange().getA1Notation();


			retVal[_sheetName]=(retVal[_sheetName] || {});

			//if the index is numeric
			if(_rangeNameMatch[4]){
				retVal[_sheetName][_type]=(retVal[_sheetName][_type] || []);
				retVal[_sheetName][_type][parseInt(_index, 10)]=_a1;
			}
			//the index is a key
			else{
				retVal[_sheetName][_type]=(retVal[_sheetName][_type] || {});
				retVal[_sheetName][_type][_index]=_a1;
			}
		}
		return retVal;
	};

	/**
	 * reads all named range in the whole Spreadsheet. If they are cached it will use the cache
	 * @return {object} an object representing the named ranges: {commodity: {type: [index]}}
	 */
	this.getAllNamedRanges=function() {
		var namedRanges=APPCache.get("namedRanges");
		if (!namedRanges) {
			namedRanges=this.parseAllNamedRanges();
			APPCache.put("namedRanges", namedRanges);
		}
		return namedRanges;
	};

	/**
	 * return all namedRanges of the current commodity
	 * @param {object} sheet [optional] the sheet
	 * @return {object} an object representing the named ranges: {type: [index]}
	 * @throws {InvalidArgument}
	 */
	 this.getCommodityNamedRanges = function( sheet ) {
	 	if ( sheet === null ) {
	 		throw "InvalidArgument";
	 	}

	 	sheet = ( sheet || SpreadSheetCache.getActiveSheet() );

	 	var commodityName = FirebaseConnector.getCommodityName( sheet );

	 	var namedRanges = this.getAllNamedRanges()[ commodityName ];

	 	return namedRanges;
	 };


};
