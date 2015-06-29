"use strict";
/*global setImmediate: true*/

var base = require("xbase"),
	fs = require("fs"),
	glob = require("glob"),
	diffUtil = require("xutil").diff,
	httpUtil = require("xutil").http,
	path = require("path"),
	tiptoe = require("tiptoe");

tiptoe(
	function findJSON()
	{
		glob(path.join(__dirname, "..", "web", "json", "*.json"), this);
	},
	function processFiles(files)
	{
		files.serialForEach(function(file, subcb)
		{
			processFile(path.basename(file.substring(0, file.indexOf(".json"))), subcb);
		}, this);
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

function processFile(fileName, cb)
{
	base.info("Comparing: %s", fileName);

	tiptoe(
		function getJSON()
		{
			httpUtil.get("http://heroesjson.com/json/" + fileName + ".json", this.parallel());
			fs.readFile(path.join(__dirname, "..", "web", "json", fileName + ".json"), {encoding : "utf8"}, this.parallel());
		},
		function compare(oldJSON, newJSON)
		{
			if(oldJSON[2]===404)
			{
				base.info("Skipping %s do to being missing on production.", fileName);
				return this();
			}

			var result = diffUtil.diff(JSON.parse(oldJSON[0]), JSON.parse(newJSON), {compareArraysDirectly:true, arrayKey : "id"});
			if(result)
				console.log(result);

			this();
		},
		function finish(err)
		{
			setImmediate(function() { cb(err); });
		}
	);
}
