"use strict";
/*global setImmediate: true*/

var base = require("xbase"),
	fs = require("fs"),
	path = require("path"),
	runUtil = require("xutil").run,
	fileUtil = require("xutil").file,
	libxmljs = require("libxmljs"),
	C = require("C"),
	rimraf = require("rimraf"),
	tiptoe = require("tiptoe");

var EXTRA_HEROES = ["anubarak", "chen", "crusader", "jaina", "kaelthas", "lostvikings", "murky", "sonyarework", "sylvanas", "thrall", "herointeractions"];

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

var CASCEXTRATOR_PATH = path.join(__dirname, "CASCExtractor", "build", "bin", "CASCExtractor");
var NEEDED_SUBFIXES =
[
	"enus.stormdata\\LocalizedData\\GameStrings.txt",
	"base.stormdata\\GameData\\BehaviorData.xml",
	"base.stormdata\\GameData\\TalentData.xml",
	"base.stormdata\\GameData\\HeroData.xml",
];

var NEEDED_PREFIXES = ["heroesdata.stormmod"];
EXTRA_HEROES.forEach(function(EXTRA_HERO)
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

NEEDED_FILE_PATHS.removeAll([
	"mods\\heromods\\herointeractions.stormmod\\base.stormdata\\GameData\\BehaviorData.xml",
	"mods\\heromods\\herointeractions.stormmod\\base.stormdata\\GameData\\TalentData.xml"
]);

var OUT_PATH = path.join(__dirname, "out");
var HEROES_OUT_PATH = path.join(OUT_PATH, "heroes.json");

var S = {};

tiptoe(
	/*function clearOut()
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
	},*/
	function loadDataAndSaveJSON()
	{
		var heroDocs = [];

		base.info("Loading data...");
		NEEDED_FILE_PATHS.forEach(function(NEEDED_FILE_PATH)
		{
			var diskPath = path.join(OUT_PATH, NEEDED_FILE_PATH.replaceAll("\\\\", "/"));
			if(!fs.existsSync(diskPath))
			{
				base.info("Missing file: %s", NEEDED_FILE_PATH);
				return;
			}
			var fileData = fs.readFileSync(diskPath, {encoding:"utf8"});
			if(diskPath.endsWith("GameStrings.txt"))
			{
				fileData.split("\n").forEach(function(line) {
					S[line.substring(0, line.indexOf("="))] = line.substring(line.indexOf("=")+1).trim();
				});
			}
			else if(diskPath.endsWith("HeroData.xml"))
			{
				heroDocs.push(libxmljs.parseXml(fileData));
			}
		});

		var heroes = getHeroNodes(heroDocs).map(processHeroNode);

		base.info("Validating %d heroes...", heroes.length);
		heroes.forEach(validateHero);
		
		base.info("Saving JSON...");

		fs.writeFile(HEROES_OUT_PATH, JSON.stringify(heroes), {encoding:"utf8"}, this);
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

function getHeroNodes(heroDocs)
{
	var heroNodes = {};

	heroDocs.forEach(function(heroDoc)
	{
		heroDoc.find("/Catalog/CHero").forEach(function(heroNode)
		{
			if(!heroNode.attr("id") || heroNode.childNodes().length===0)
				return;

			var heroid = heroNode.attr("id").value();
			if(heroid==="Random")
				return;

			if(!heroNodes.hasOwnProperty(heroid))
			{
				heroNodes[heroid] = heroNode;
				return;
			}

			mergeXML(heroNode, heroNodes[heroid]);
		});
	});

	return Object.values(heroNodes);
}

function mergeXML(fromNode, toNode)
{
	fromNode.childNodes().forEach(function(childNode)
	{
		toNode.addChild(childNode);
	});
}

function processHeroNode(heroNode)
{
	var hero = {};

	hero.id = heroNode.attr("id").value();
	hero.name = S["Unit/Name/" + getValue(heroNode, "Unit", "Hero" + hero.id)];
	hero.title =  S["Hero/Title/" + hero.id];

	hero.role = getValue(heroNode, "Role");
	if(hero.role==="Damage")
		hero.role = "Assassin";
	if(!hero.role && !!getValue(heroNode, "Melee"))
		hero.role = "Warrior";
//<Role value="Specialist"/>
		/*
title : Dominion Ghost
role : Assassin
type : Ranged
franchise : Starcraft*/
		// For hero name, see how lost vikings uses '<Unit value="HeroLostVikingsController"/>' in HEroData.xml to reference the full hero name "The Lost Vikings" in GAmeStrings


	return hero;
}

function validateHero(hero)
{
	Object.forEach(hero, function(key, val)
	{
		if(!C.FIELD_TYPES.hasOwnProperty(key))
		{
			base.warn("%s NO KNOWN TYPE REFERENCE: [%s] : [%s]", hero.id, key, val);
			return;
		}

		// Handle arrays
		if(Array.isArray(C.FIELD_TYPES[key]))
		{
			if(val.some(function(v) { return typeof v!==C.FIELD_TYPES[key][0]; }))
				base.warn("%s HAS A NON-%s IN ARRAY: [%s] : [%s]", hero.id, C.FIELD_TYPES[key][0], key, val);

			return;
		}
		
		// Handle objects
		if(Object.isObject(C.FIELD_TYPES[key]))
		{
			if(!Object.isObject(val))
				base.warn("%s INVALID TYPE: [%s] : [%s] (Not an object)", hero.id, key, val);

			return;
		}
		
		// Handle regular values
		if(typeof val!==C.FIELD_TYPES[key])
		{
			base.warn("%s INVALID TYPE: [%s] : [%s] (%s !== %s)", hero.id, key, val, typeof val, C.FIELD_TYPES[key]);
			return;
		}

		if(C.FIELD_VALID_VALUES.hasOwnProperty(key) && !C.FIELD_VALID_VALUES[key].contains(val))
			base.warn("%s HAS INVALID VALUE [%s] from possible: %s", hero.id, val, C.FIELD_VALID_VALUES[key]);

	});

	Object.keys(C.FIELD_TYPES).forEach(function(FIELD_NAME)
	{
		if(!hero.hasOwnProperty(FIELD_NAME))
			base.warn("%s is MISSING FIELD %s", hero.id, FIELD_NAME);
	});
}

function getValue(node, subnodeName, fallback)
{
	var subnode = node.get(subnodeName);
	if(!subnode)
		return fallback || undefined;

	return subnode.attr("value").value();
}
