/**
 * app configuration
 * @type {Object}
 */
var Config={
	/**
	 * dbName on firebase
	 * @type {String}
	 */
	dbName:"",

	/**
	 * apiKey on firebase
	 * @type {String}
	 */
	apiKey: "",

	/**
	 *  id of AmisMarketApp
	 * @type {String}
	 */
	amisMarketAppId:"",

	/**
	 * AmisLib id
	 * @type {String}
	 */
	amisLibId:"",


	/**
	 * spreadsheet config
	 * @type {Object}
	 */
	Sheet:{
		countryCell:"B1",
		datasourceCell:"B3",
        commodityCell: "B2"
	},

	/**
	 * developer mode
	 * @type {bool}
	 */
	devMode:false,

	/**
	 * email address for errors informations
	 * @type {String}
	 */
	errorEmail:"",

	/**
	 * the keyword to recognize the master spreadsheet by the filename
	 * @type {String}
	 */
	masterKeyword:"MASTER",

    /**
	 * the keyword to recognize the master spreadsheet by the filename
	 * @type {String}
	 */
	secretariatKeyword:"secretariat",

	/**
	 * accounts that can edit All spreadsheet
	 * @type {String}
	 */
	secretariatAccount:"",

	/**
	 * the keyword to recognize the template spreadsheet by the filename
	 * @type {String}
	 */
	templatePrefix:"Template_",

	/**
	 * regex to find commodity sheet name ()
	 * @type {RegExp}
	 */
	commoditySheetsRegex:/^[A-Za-z]+$/,

	/**
	 * Cache expiration in seconds. The minimum is 1 second and the maximum is 21600 seconds (6 hours).
	 * @type {number}
	 */
	cacheExpirationInSeconds:600,

	/**
	 * template string to generate the filename of national shared sheets
	 * @type {String}
	 */
	nationalSheetFilename:"AMIS {{country}} National",

	/**
	 * date format for the "Last Updated row" to store in the database
	 * @type {String}
	 */
	lastUpdatedDateDBFormat:"YYYY-MM-DD",

	/**
	 * date format for the "Last Updated row" to store in the sheet (the format is written according to GAS API)
	 * @type {String}
	 */
	lastUpdatedDateSheetFormat:"dd-mmm-yyyy",

    /**
	 * Named range for 'add new forecast'
	 * @type {array}
	 */
	addNewForecastNamedRange:[ ['addFrcA1','addFrcA2'],['addFrcB1','addFrcB2'] ],

    /**
	 * Named ranges for forecast's notes
	 * @type {[string]}
	 */
	notesNamedRanges:[ 'notesA','notesB'],

	/**
	 * excel exportation template filename
	 * @type {String}
	 */
	excelExportSpreadSheetFileName:"{{country}} AMIS forecasts"
};
