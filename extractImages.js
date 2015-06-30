"use strict";

var base = require("xbase"),
	fs = require("fs"),
	path = require("path"),
	runUtil = require("xutil").run,
	fileUtil = require("xutil").file,
	rimraf = require("rimraf"),
	tiptoe = require("tiptoe");

if(process.argv.length<3 || !fs.existsSync(process.argv[2]))
{
	base.error("Usage: node extractImages.js /path/to/hots");
	process.exit(1);
}

var HOTS_PATH = process.argv[2];
var HOTS_DATA_PATH = path.join(HOTS_PATH, "HeroesData");

if(!fs.existsSync(HOTS_DATA_PATH))
{
	base.error("HeroesData dir not found: %s", HOTS_DATA_PATH);
	process.exit(1);
}

var CASCEXTRATOR_PATH = path.join(__dirname, "CASCExtractor", "build", "bin", "CASCExtractor");

var IMAGE_OUT_PATH = path.join(__dirname, "images");

var HEROES_JSON_PATH = path.join(__dirname, "out", "heroes.json");

var IMAGE_ASSETS_PATH = "mods\\heroes.stormmod\\base.stormassets\\Assets\\Textures\\";

tiptoe(
	function clearOut()
	{
		base.info("Clearing 'images' directory...");
		rimraf(IMAGE_OUT_PATH, this);
	},
	function createOut()
	{
		fs.mkdir(IMAGE_OUT_PATH, this);
	},
	function copyBuildInfo()
	{
		base.info("Copying latest .build.info file...");
		fileUtil.copy(path.join(HOTS_PATH, ".build.info"), path.join(HOTS_DATA_PATH, ".build.info"), this);
	},
	function loadJSON()
	{
		base.info("Loading JSON...");
		fs.readFile(HEROES_JSON_PATH, {encoding:"utf8"}, this);
	},
	function extractFiles(heroesRaw)
	{
		base.info("Extracting needed files...");
		JSON.parse(heroesRaw).serialForEach(extractHeroImages, this);
	},
	function finish(err)
	{
		if(err)
		{
			base.error(err);
			process.exit(1);
		}

		base.info("Done.");

		process.exit(0);
	}
);
		
function extractHeroImages(hero, cb)
{
	base.info("Extracting images for: %s", hero.name);
	tiptoe(
		function extractHeroImage()
		{
			runUtil.run(CASCEXTRATOR_PATH, [HOTS_DATA_PATH, "-o", IMAGE_OUT_PATH, "-f", IMAGE_ASSETS_PATH + hero.icon], {silent:true}, this);
		},
		function extractTalentImages()
		{
			Object.values(hero.talents).flatten().concat(Object.values(hero.abilities).flatten()).parallelForEach(function(item, subcb)
			{
				runUtil.run(CASCEXTRATOR_PATH, [HOTS_DATA_PATH, "-o", IMAGE_OUT_PATH, "-f", IMAGE_ASSETS_PATH + item.icon], {silent:true}, subcb);
				setImmediate(subcb);
			}, this, 10);
		},
		cb
	);
}
