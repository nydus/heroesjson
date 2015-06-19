"use strict";
/*global setImmediate: true*/

var base = require("xbase"),
	fs = require("fs"),
	path = require("path"),
	runUtil = require("xutil").run,
	fileUtil = require("xutil").file,
	rimraf = require("rimraf"),
	tiptoe = require("tiptoe");

var EXTRA_HEROS = ["anubarak", "chen", "crusader", "jaina", "kaelthas", "lostvikings", "murky", "sonyarework", "sylvanas", "thrall"];

if(process.argv.length<3 || !fs.existsSync(process.argv[2]))
{
	base.error("Usage: node generate.js /path/to/hots");
	process.exit(1);
}

var HOTS_PATH = process.argv[2];
var HOTS_DATA_PATH = path.join(HOTS_PATH, "HeroesData");

if(!fs.existsSync(HOTS_DATA_PATH))
{
	base.error("HeroesData dir not found: %s", HOTS_DATA_PATH);
	process.exit(1);
}

var OUT_PATH = path.join(__dirname, "out");
var CASCEXTRATOR_PATH = path.join(__dirname, "CASCExtractor", "build", "bin", "CASCExtractor");
var NEEDED_SUBFIXES =
[
	"enus.stormdata\\LocalizedData\\GameStrings.txt",
	"base.stormdata\\GameData\\BehaviorData.xml",
	"base.stormdata\\GameData\\TalentData.xml",
	"base.stormdata\\GameData\\HeroData.xml",
];

var NEEDED_PREFIXES = ["heroesdata.stormmod"];
EXTRA_HEROS.forEach(function(EXTRA_HERO)
{
	NEEDED_PREFIXES.push("heromods\\" + EXTRA_HERO + ".stormmod");
});

var NEEDED_FILE_PATHS = [];

NEEDED_PREFIXES.forEach(function(NEEDED_PREFIX)
{
	NEEDED_SUBFIXES.forEach(function(NEEDED_SUBFIX)
	{
		NEEDED_FILE_PATHS.push("mods\\" + NEEDED_PREFIX + "\\" + NEEDED_SUBFIX);
	});
});

var STRINGS = {};

tiptoe(
	function clearOut()
	{
		base.info("Clearing 'out' directory...");
		rimraf(OUT_PATH, this);
	},
	function createOut()
	{
		fs.mkdir(OUT_PATH, this);
	},
	function copyBuildInfo()
	{
		base.info("Copying latest .build.info file...");
		fileUtil.copy(path.join(HOTS_PATH, ".build.info"), path.join(HOTS_DATA_PATH, ".build.info"), this);
	},
	function extractFiles()
	{
		base.info("Extracting needed files...");
		NEEDED_FILE_PATHS.parallelForEach(function(NEEDED_FILE_PATH, subcb)
		{
			runUtil.run(CASCEXTRATOR_PATH, [HOTS_DATA_PATH, "-o", OUT_PATH, "-f", NEEDED_FILE_PATH], {silent:true}, subcb);
		}, this, 10);
	},
	function loadData()
	{
		base.info("Loading strings...");
		NEEDED_FILE_PATHS.forEach(function(NEEDED_FILE_PATH)
		{
			var diskPath = path.join(OUT_PATH, NEEDED_FILE_PATH.replaceAll("\\\\", "/"));
			base.info(diskPath);
			if(diskPath.endsWith("GameStrings.txt"))
			{
				fs.readFileSync(diskPath, {encoding:"utf8"}).split("\n").forEach(function(line) {
					STRINGS[line.substring(0, line.indexOf("="))] = line.substring(line.indexOf("=")+1);
				});
			}
		});

		this();
	},
	function finish(err)
	{
		if(err)
		{
			base.error(err);
			process.exit(1);
		}

		process.exit(0);
	}
);
