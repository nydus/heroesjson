"use strict";

var base = require("xbase"),
	rimraf = require("rimraf"),
	fs = require("fs"),
	moment = require("moment"),
	glob = require("glob"),
	path = require("path"),
	runUtil = require("xutil").run,
	fileUtil = require("xutil").file,
	dustUtil = require("xutil").dust,
	printUtil = require("xutil").print,
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
var dustData = 
{
};

var WEB_OUT_PATH = path.join(__dirname, "json");

var IMAGES_FULL_PATH = path.join(__dirname, "..", "images", "mods", "heroes.stormmod", "base.stormassets", "Assets", "Textures");

var ZIP_PATH = path.join(__dirname, "images.zip");

var CASCEXTRATOR_PATH = path.join(__dirname, "..", "CASCExtractor", "build", "bin", "CASCExtractor");

var IMAGE_OUT_PATH = path.join(__dirname, "..", "images");

var HEROES_JSON_PATH = path.join(__dirname, "..", "out", "heroes.json");

var IMAGE_ASSETS_PATH = "mods\\heroes.stormmod\\base.stormassets\\Assets\\Textures\\";


tiptoe(
	function removeJSONDirectory()
	{
		base.info("Clearing and creating out path...");
		rimraf(path.join(WEB_OUT_PATH), this);
	},
	function createJSONDirectory()
	{
		fs.mkdir(path.join(WEB_OUT_PATH), this);
	},
	function extractingBuildVersion()
	{
		if(process.argv[3]==="dev")
			return this();

		base.info("Extracting build version...");
		runUtil.run(CASCEXTRATOR_PATH, [HOTS_DATA_PATH, "-o", WEB_OUT_PATH, "-f", "mods\\core.stormmod\\base.stormdata\\DataBuildId.txt"], {silent:true}, this);
	},
	function readAndCleanupBuildVersion()
	{
		if(process.argv[3]==="dev")
			return this();
		
		base.info("Data Build Version: %s", fs.readFileSync(path.join(WEB_OUT_PATH, "mods", "core.stormmod", "base.stormdata", "DataBuildId.txt"), {encoding:"utf8"}).trim("B").trim());
		rimraf(path.join(WEB_OUT_PATH, "mods"), this);
	},
	function findJSON()
	{
		base.info("Finding JSON files...");
		glob(path.join(__dirname, "..", "out", "*.json"), this);
	},
	function processJSON(jsonFiles)
	{
		base.info("Copying JSON files...");
		jsonFiles.serialForEach(function(jsonFile, subcb)
		{
			fileUtil.copy(jsonFile, path.join(WEB_OUT_PATH, path.basename(jsonFile)), subcb);
		}, this);
	},
	function render()
	{
		base.info("Rendering index...");

		dustData.heroesSize = printUtil.toSize(fs.statSync(path.join(WEB_OUT_PATH, "heroes.json")).size, 1);
		dustData.mountsSize = printUtil.toSize(fs.statSync(path.join(WEB_OUT_PATH, "mounts.json")).size, 1);
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
	function extractImages()
	{
		if(process.argv[3]==="dev")
			return this();
		
		base.info("Extracting images...");
		extractAllImages(this);
	},
	function getImagesToZip()
	{
		if(process.argv[3]==="dev")
			return this();
		
		base.info("Finding extracted images...");
		glob(path.join(IMAGES_FULL_PATH, "*.png"), this);
	},
	function zipImages(images)
	{
		if(process.argv[3]==="dev")
			return this();
		
		base.info("Zipping images...");
		runUtil.run("zip", ["-r", ZIP_PATH].concat(images.map(function(image) { return path.basename(image); })), {silent:true, cwd : IMAGES_FULL_PATH}, this);
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

function extractAllImages(cb)
{
	tiptoe(
		function clearOut()
		{
			base.info("\tClearing 'images' directory...");
			rimraf(IMAGE_OUT_PATH, this);
		},
		function createOut()
		{
			fs.mkdir(IMAGE_OUT_PATH, this);
		},
		function copyBuildInfo()
		{
			base.info("\tCopying latest .build.info file...");
			fileUtil.copy(path.join(HOTS_PATH, ".build.info"), path.join(HOTS_DATA_PATH, ".build.info"), this);
		},
		function loadJSON()
		{
			base.info("\tLoading JSON...");
			fs.readFile(HEROES_JSON_PATH, {encoding:"utf8"}, this);
		},
		function extractFiles(heroesRaw)
		{
			var imageFiles = JSON.parse(heroesRaw).map(function(hero) { return Object.values(hero.talents).flatten().concat(Object.values(hero.abilities).flatten()).concat([hero]).map(function(item) { return item.icon; }); }).flatten().unique();
			base.info("\tExtracting %d image files...", imageFiles.length);
			imageFiles.parallelForEach(extractImage, this, 10);
		},
		cb
	);
}
		
function extractImage(imageFile, cb)
{
	tiptoe(
		function extractImage()
		{
			runUtil.run(CASCEXTRATOR_PATH, [HOTS_DATA_PATH, "-o", IMAGE_OUT_PATH, "-f", IMAGE_ASSETS_PATH + imageFile], {silent:true}, this);
		},
		function convertImage()
		{
			runUtil.run("convert", [path.join(IMAGE_OUT_PATH, IMAGE_ASSETS_PATH.replaceAll("\\\\", "/"), imageFile), path.join(IMAGE_OUT_PATH, IMAGE_ASSETS_PATH.replaceAll("\\\\", "/"), imageFile + ".png")], {silent:true}, this);
		},
		function removeOldImage()
		{
			fs.unlink(path.join(IMAGE_OUT_PATH, IMAGE_ASSETS_PATH.replaceAll("\\\\", "/"), imageFile), this);
		},
		cb
	);
}
