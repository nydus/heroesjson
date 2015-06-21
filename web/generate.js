"use strict";

var base = require("xbase"),
	rimraf = require("rimraf"),
	fs = require("fs"),
	moment = require("moment"),
	glob = require("glob"),
	path = require("path"),
	fileUtil = require("xutil").file,
	dustUtil = require("xutil").dust,
	tiptoe = require("tiptoe");

var dustData = 
{
};

var WEB_OUT_PATH = path.join(__dirname, "json");

tiptoe(
	function removeJSONDirectory()
	{
		rimraf(path.join(WEB_OUT_PATH), this);
	},
	function createJSONDirectory()
	{
		fs.mkdir(path.join(WEB_OUT_PATH), this);
	},
	function findJSON()
	{
		glob(path.join(__dirname, "..", "out", "*.json"), this);
	},
	function processJSON(jsonFiles)
	{
		jsonFiles.serialForEach(function(jsonFile, subcb)
		{
			fileUtil.copy(jsonFile, path.join(WEB_OUT_PATH, path.basename(jsonFile)), subcb);
		}, this);
	},
	function render()
	{
		base.info("Rendering index...");

		dustData.changeLog = JSON.parse(fs.readFileSync(path.join(__dirname, "changelog.json"), {encoding : "utf8"})).map(function(o) { o.when = moment(o.when, "YYYY-MM-DD").format("MMM D, YYYY"); return o; });
		dustData.lastUpdated = dustData.changeLog[0].when;
		dustData.version = dustData.changeLog[0].version;
		dustData.patchVersion = dustData.changeLog[0].patchVersion;

		dustUtil.render(__dirname, "index", dustData, { keepWhitespace : true }, this);
	},
	function save(html)
	{
		fs.writeFile(path.join(__dirname, "index.html"), html, {encoding:"utf8"}, this);
	},
	function finish(err)
	{
		if(err)
		{
			base.error(err.stack);
			base.error(err);
			process.exit(1);
		}

		process.exit(0);
	}
);
