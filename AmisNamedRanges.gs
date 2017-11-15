/**
 * class to interact with namedRanges
 * @return {class}
 */
AmisNamedRanges=new function() {
	var that=this;


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
	 * @param {string} commodityName the commodity name
	 * @return {object} an object representing the named ranges: {type: [index]}
	 */
	this.getCommodityNamedRanges=function(commodityName){
		commodityName = commodityName || FirebaseConnector.getCommodityName();

		return this.getAllNamedRanges()[commodityName];
	};

	/**
	 * return all namedRanges of the current commodity
	 * @param {object} sheet [optional] the sheet
	 * @return {object} an object representing the named ranges: {type: [index]}
	 * @throws {InvalidArgument}
	 */
	 this.getCommodityNamedRangesBySheet = function( sheet ) {
	 	if ( sheet === null ) {
	 		throw "InvalidArgument";
	 	}

	 	sheet = ( sheet || SpreadSheetCache.getActiveSheet() );

	 	var commodityName = FirebaseConnector.getCommodityName( sheet );

	 	return this.getCommodityNamedRanges(commodityName);
	 };




	 /**
	  * Class to manage the mapping of data between firebase and the db
	  * @return {object}
	  */
	 this.DbMapping = new (function() {
	   this.parent = that;

	   /**
	   	 * reads and parse all the rowMap namedRanges of the Spreadsheet
	   	 * @return {object} the object in the same shape of firebase
	    */
	   this.readRows = function() {
	     var com, namedRanges, retVal;
	     namedRanges = this.parent.getAllNamedRanges();
	     retVal = {};
	     for (com in namedRanges) {
	       if (namedRanges[com]) {
	         retVal[com] = this.readCommodityRows(com, namedRanges[com].rowMap);
	       }
	     }
	     return retVal;
	   };

	   /**
	   	 * reads and parse all the rowMap namedRanges of a sheet
	   	 * @param  {string} commodity   the commodity
	   	 * @param  {object} namedRanges the namedRanges of the commodity (returned from getAllNamedRanges())
	   	 * @return {array}             array in this form [id]=rowNumber
	   	 * @throws  "InvalidArgument"
	    */
	   this.readCommodityRows = function(commodity, namedRanges) {
	     var nr, range, retVal, rowNumRegEx;
	     retVal = {};
	     rowNumRegEx = /[A-Z]*(\d+):.*/;
	     if (!commodity || !namedRanges) {
	       throw "InvalidArgument";
	     }
	     for (nr in namedRanges) {
	       range = namedRanges[nr];
	       if (range) {
	         retVal[nr] = Number(range.replace(rowNumRegEx, "$1"));
	       }
	     }
	     return retVal;
	   };

	   /**
	   	 * reads and parse all the colMap namedRanges of the Spreadsheet
	   	 * @return {object} the object in the same shape of firebase
	    */
	   this.readCols = function() {
	     var com, namedRanges, retVal;
	     namedRanges = this.parent.getAllNamedRanges();
	     retVal = {};
	     for (com in namedRanges) {
	       if (namedRanges[com]) {
	         retVal[com] = this.readCommodityCols(com, namedRanges[com].colMap);
	       }
	     }
	     return retVal;
	   };

	   /**
	   	 * reads and parse all the colMap namedRanges of a sheet
	   	 * @param  {string} commodity   the commodity
	   	 * @param  {object} namedRanges the namedRanges of the commodity (returned from getAllNamedRanges())
	   	 * @return {array}             array in this form [year]=columnLetter
	   	 * @throws  "InvalidArgument"
	    */
	   this.readCommodityCols = function(commodity, namedRanges) {
	     var colLetRegEx, nr, range, retVal;
	     retVal = {};
	     colLetRegEx = /([A-Z]+)\d*:.*/;
	     if (!commodity || !namedRanges) {
	       throw "InvalidArgument";
	     }
	     for (nr in namedRanges) {
	       range = namedRanges[nr];
	       if (range) {
	         retVal[nr] = range.replace(colLetRegEx, "$1");
	       }
	     }
	     return retVal;
	   };

	   /**
	   	 * update the mapping on firebase (batchRowArray & batchRowColumn)
	   	 * @param  {sting} userToken firebase token
	   	 * @return {void}
	   	 * @throws  "InvalidArgument"
	   	 * @throws  "NamedRangesParsingErr" if error parsing namedRanges
	    */
	   this.updateFbMapping = function(userToken) {
	     var batchRowArray, batchRowColumn;
	     if (!userToken) {
	       throw "InvalidArgument";
	     }
	     batchRowArray = AmisNamedRanges.DbMapping.readRows();
	     batchRowColumn = AmisNamedRanges.DbMapping.readCols();
	     if (!batchRowColumn || !batchRowArray) {
	       throw "NamedRangesParsingErr";
	     }
	     FirebaseConnector.writeOnFirebase(batchRowArray, "/config/batchRowArray", userToken);
	     FirebaseConnector.writeOnFirebase(batchRowColumn, "/config/batchRowColumn", userToken);
	   };
	 });




};
