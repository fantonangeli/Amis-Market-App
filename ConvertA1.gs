// https://gist.github.com/mogsdad/7977853f69fd7cdc8fa0#file-converta1-gs


/**
 * Class with Helper functions to convert to & from A1 notation
 * @return {object}
 */
ConvertA1 = new function() {

	/**
	 * Convert a range reference from A1Notation to 0-based indices (for arrays)
	 * or 1-based indices (for Spreadsheet Service methods).
	 *
	 * @param {String}    rangeA1   Range reference to be converted. eg: F14:G34, B:D
	 * @param {Number}    index    (optional, default 0) Indicate 0 or 1 indexing
	 *
	 * @return {object}            {top, bottom, left, right}, both 0-based array indices.
	 *
	 * @throws                     Error if invalid parameter
	 */
	this.rangeA1ToIndex=function(rangeA1, index){
		var exValA, exValB, c1,c2;

		exValA=/^([A-Z]+\d+):([A-Z]+\d+)$/.exec(rangeA1);
		exValB=/^([A-Z]+):([A-Z]+)$/.exec(rangeA1);

		if(!exValA && !exValB) {
			throw new Error("Invalid range");
		}

		if(exValA){
			c1=this.cellA1ToIndex(exValA[1],index);
			c2=this.cellA1ToIndex(exValA[2],index);

			if((c1.row>c2.row) || (c1.col>c2.col)) {
				throw new Error("Invalid range");
			}

			return {
				top:c1.row,
				bottom:c2.row,
				left:c1.col,
				right:c2.col
			};
		}

		if(exValB){
			c1=this.colA1ToIndex(exValB[1],index);
			c2=this.colA1ToIndex(exValB[2],index);

			if(c1>c2) {
				throw new Error("Invalid range");
			}

			return {
				left:c1,
				right:c2
			};
		}


	};

	/**
	 * Convert a cell reference from A1Notation to 0-based indices (for arrays)
	 * or 1-based indices (for Spreadsheet Service methods).
	 *
	 * @param {String}    cellA1   Cell reference to be converted.
	 * @param {Number}    index    (optional, default 0) Indicate 0 or 1 indexing
	 *
	 * @return {object}            {row,col}, both 0-based array indices.
	 *
	 * @throws                     Error if invalid parameter
	 */
	this.cellA1ToIndex=function( cellA1, index ) {
		// Ensure index is (default) 0 or 1, no other values accepted.
		index = index || 0;
		index = ( index == 0 ) ? 0 : 1;

		// Use regex match to find column & row references.
		// Must start with letters, end with numbers.
		// This regex still allows induhviduals to provide illegal strings like "AB.#%123"
		var match = cellA1.match( /(^[A-Z]+)|([0-9]+$)/gm );

		if ( match.length != 2 ) throw new Error( "Invalid cell reference" );

		var colA1 = match[ 0 ];
		var rowA1 = match[ 1 ];

		return {
			row: this.rowA1ToIndex( rowA1, index ),
			col: this.colA1ToIndex( colA1, index )
		};
	};

	/**
	 * Return a 0-based array index corresponding to a spreadsheet column
	 * label, as in A1 notation.
	 *
	 * @param {String}    colA1    Column label to be converted.
	 *
	 * @return {Number}            0-based array index.
	 * @param {Number}    index    (optional, default 0) Indicate 0 or 1 indexing
	 *
	 * @throws                     Error if invalid parameter
	 */
	this.colA1ToIndex=function( colA1, index ) {
		if ( typeof colA1 !== 'string' || colA1.length > 2 )
			throw new Error( "Expected column label." );

		// Ensure index is (default) 0 or 1, no other values accepted.
		index = index || 0;
		index = ( index == 0 ) ? 0 : 1;

		var A = "A".charCodeAt( 0 );

		var number = colA1.charCodeAt( colA1.length - 1 ) - A;
		if ( colA1.length == 2 ) {
			number += 26 * ( colA1.charCodeAt( 0 ) - A + 1 );
		}
		return number + index;
	};



	/**
	 * Return a 0-based array index corresponding to a spreadsheet row
	 * number, as in A1 notation. Almost pointless, really, but maintains
	 * symmetry with colA1ToIndex().
	 *
	 * @param {Number}    rowA1    Row number to be converted.
	 * @param {Number}    index    (optional, default 0) Indicate 0 or 1 indexing
	 *
	 * @return {Number}            0-based array index.
	 */
	this.rowA1ToIndex=function( rowA1, index ) {
		// Ensure index is (default) 0 or 1, no other values accepted.
		index = index || 0;
		index = ( index == 0 ) ? 0 : 1;

		return rowA1 - 1 + index;
	};


};
