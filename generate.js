"use strict";

var base = require("xbase"),
	fs = require("fs"),
	path = require("path"),
	runUtil = require("xutil").run,
	fileUtil = require("xutil").file,
	moment = require("moment"),
	jsen = require("jsen"),
	jsonselect = require("JSONSelect"),
	libxmljs = require("libxmljs"),
	C = require("C"),
	PEG = require("pegjs"),
	rimraf = require("rimraf"),
	tiptoe = require("tiptoe");

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

var OUT_PATH = path.join(__dirname, "out");
var HEROES_OUT_PATH = path.join(OUT_PATH, "heroes.json");

var EXTRA_HEROES = ["anubarak", "chen", "crusader", "jaina", "kaelthas", "lostvikings", "murky", "sonyarework", "sylvanas", "thrall"];
var NODE_MAPS = {};
var NODE_MAP_TYPES = ["Hero", "Talent", "Behavior", "Effect", "Abil", "Unit", "Validator", "Weapon" ];

var NEEDED_SUBFIXES = [ "enus.stormdata\\LocalizedData\\GameStrings.txt" ];
NODE_MAP_TYPES.forEach(function(NODE_MAP_TYPE) {
	NODE_MAPS[NODE_MAP_TYPE] = {};
	NEEDED_SUBFIXES.push("base.stormdata\\GameData\\" + NODE_MAP_TYPE.toProperCase() + "Data.xml");
});

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

NEEDED_FILE_PATHS.push("mods\\heroesdata.stormmod\\base.stormdata\\GameData\\Heroes\\ZagaraData.xml");
NEEDED_FILE_PATHS.remove("mods\\heromods\\sonyarework.stormmod\\base.stormdata\\GameData\\UnitData.xml");
NEEDED_FILE_PATHS.remove("mods\\heromods\\sonyarework.stormmod\\base.stormdata\\GameData\\WeaponData.xml");

var FORMULA_PARSER = PEG.buildParser(fs.readFileSync(path.join(__dirname, "heroes.pegjs"), {encoding:"utf8"}));

var S = {};
var IGNORED_NODE_TYPE_IDS = {"Hero" : ["Random", "AI", "_Empty"]};

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
		var xmlDocs = [];

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
			else if(diskPath.endsWith(".xml"))
			{
				xmlDocs.push(libxmljs.parseXml(fileData));
			}
		});

		loadMergedNodeMap(xmlDocs);

		var heroes = Object.values(NODE_MAPS["Hero"]).map(function(heroNode) { return processHeroNode(heroNode); });

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

function loadMergedNodeMap(xmlDocs)
{
	xmlDocs.forEach(function(xmlDoc)
	{
		xmlDoc.find("/Catalog/*").forEach(function(node)
		{
			if(!node.attr("id"))
				return;

			var nodeType = NODE_MAP_TYPES.filter(function(NODE_MAP_TYPE) { return node.name().startsWith("C" + NODE_MAP_TYPE); });
			if(!nodeType || nodeType.length!==1)
				return;

			nodeType = nodeType[0];

			var nodeid = attributeValue(node, "id");
			if(IGNORED_NODE_TYPE_IDS.hasOwnProperty(nodeType) && IGNORED_NODE_TYPE_IDS[nodeType].contains(nodeid))
				return;

			if(!NODE_MAPS[nodeType].hasOwnProperty(nodeid))
			{
				NODE_MAPS[nodeType][nodeid] = node;
				return;
			}

			mergeXML(node, NODE_MAPS[nodeType][nodeid]);
		});
	});
}

function mergeXML(fromNode, toNode)
{
	fromNode.childNodes().forEach(function(childNode)
	{
		if(childNode.name()==="TalentTreeArray")
		{
			var existingChildNode = toNode.get("TalentTreeArray[@Tier='" + attributeValue(childNode, "Tier") + "' and @Column='" + attributeValue(childNode, "Column") + "']");
			if(existingChildNode)
				existingChildNode.remove();
		}

		toNode.addChild(childNode);
	});
}

function processHeroNode(heroNode)
{
	var hero = {};

	// Core hero data
	hero.id = heroNode.attr("id").value();
	hero.name = S["Unit/Name/" + getValue(heroNode, "Unit", "Hero" + hero.id)];

	base.info("Processing hero: %s", hero.name);
	hero.title =  S["Hero/Title/" + hero.id];

	hero.role = getValue(heroNode, "Role");
	if(hero.role==="Damage")
		hero.role = "Assassin";
	if(!hero.role && !!getValue(heroNode, "Melee"))
		hero.role = "Warrior";

	hero.type = !!getValue(heroNode, "Melee") ? "Melee" : "Ranged";
	hero.gender = getValue(heroNode, "Gender", "Male");
	hero.franchise = getValue(heroNode, "Universe", "Starcraft");
	hero.difficulty = getValue(heroNode, "Difficulty", "Easy");
	if(hero.difficulty==="VeryHard")
		hero.difficulty = "Very Hard";

	var ratingsNode = heroNode.get("Ratings");
	if(ratingsNode)
	{
		hero.ratings =
		{
			damage        : +getValue(ratingsNode, "Damage", attributeValue(ratingsNode, "Damage", 1)),
			utility       : +getValue(ratingsNode, "Utility", attributeValue(ratingsNode, "Utility", 1)),
			survivability : +getValue(ratingsNode, "Survivability", attributeValue(ratingsNode, "Survivability", 1)),
			complexity    : +getValue(ratingsNode, "Complexity", attributeValue(ratingsNode, "Complexity", 1)),
		};
	}

	var releaseDateNode = heroNode.get("ReleaseDate");
	if(releaseDateNode)
		hero.releaseDate = moment(attributeValue(releaseDateNode, "Month", 1) + "-" + attributeValue(releaseDateNode, "Day", 1) + "-" + attributeValue(releaseDateNode, "Year", "2014"), "M-D-YYYY").format("YYYY-MM-DD");

	// Talents
	hero.talents = {};
	C.HERO_TALENT_LEVELS.forEach(function(HERO_TALENT_LEVEL) { hero.talents[HERO_TALENT_LEVEL] = []; });
	var talentTreeNodes = heroNode.find("TalentTreeArray").filter(function(talentTreeNode) { return !!!attributeValue(talentTreeNode, "removed"); });
	talentTreeNodes.sort(function(a, b) { return (+((+attributeValue(a, "Tier"))*10)+(+attributeValue(a, "Column")))-(+((+attributeValue(b, "Tier"))*10)+(+attributeValue(b, "Column"))); });

	talentTreeNodes.forEach(function(talentTreeNode)
	{
		var talent = {};

		talent.id = attributeValue(talentTreeNode, "Talent");

		var talentNode = NODE_MAPS["Talent"][talent.id];
		var faceid = getValue(talentNode, "Face");

		talent.description = S["Button/Tooltip/" + faceid];

		if(!talent.description && faceid==="TyrandeHuntersMarkTrueshotAuraTalent")
			talent.description = S["Button/Tooltip/TyrandeTrueshotBowTalent"];

		if(!talent.description)
		{
			base.warn("Missing talent description for hero [%s] and talentid [%s] and faceid [%s]", hero.id, talent.id, faceid);
			return;
		}

		talent.name = talent.description.replace(/<s val="StandardTooltipHeader">([^<]+)<.+/, "$1").trim();
		talent.description = talent.description.replace(/<s val="StandardTooltipHeader">[^<]+(<.+)/, "$1").replace(/<s val="StandardTooltip">?(.+)/, "$1");

		//if(hero.id==="LiLi") {
		var dynamics = talent.description.match(/<d ref="[^"]+"[^/]*\/>/g);
		if(dynamics)
		{
			dynamics.forEach(function(dynamic)
			{
				var formula = dynamic.match(/ref\s*=\s*"([^"]+)"/)[1];
				if(formula.endsWith(")") && !formula.contains("("))
					formula = formula.substring(0, formula.length-1);
				try
				{
					var result = FORMULA_PARSER.parse(formula, {lookupXMLRef : lookupXMLRef});
					talent.description = talent.description.replace(dynamic, result);
				}
				catch(err)
				{
					base.error("Failed to parse: %s", formula);
					throw err;
				}
				/*var precision = dynamic.match(/precision\s*=\s*"([^"]+)"/) ? +dynamic.match(/precision\s*=\s*"([^"]+)"/)[1] : null;
				if(precision!==null)
				{
					base.info("%s (precision=%s)", result, precision);
					result = result.toFixed(precision);
				}*/

			});
		}
		//}
		talent.description = talent.description.replace(/<\/?n\/?><\/?n\/?>/g, "\n").replace(/<\/?n\/?>/g, "");
		talent.description = talent.description.replace(/<s\s*val\s*=\s*"StandardTooltipDetails">/gm, "").replace(/<s\s*val\s*=\s*"StandardTooltip">/gm, "").replace(/<\/?s\/?>/g, "").trim();

		var talentPrerequisiteNode = talentTreeNode.get("PrerequisiteTalentArray");
		if(talentPrerequisiteNode)
			talent.prerequisite = attributeValue(talentPrerequisiteNode, "value");

		//if(hero.id==="LiLi") { base.info("AFTER: %s\n", talent.description); }

		hero.talents[C.HERO_TALENT_LEVELS[((+attributeValue(talentTreeNode, "Tier"))-1)]].push(talent);
	});
	
	// Final modifications
    performHeroModifications(hero);
	
	return hero;
}

function lookupXMLRef(query, negative)
{
	var result = 0;

	C.XMLREF_REPLACEMENTS.forEach(function(XMLREF_REPLACEMENT)
	{
		if(query===XMLREF_REPLACEMENT.from)
			query = XMLREF_REPLACEMENT.to;
	});

	//base.info("QUERY: %s", query);

	var mainParts = query.split(",");

	if(!NODE_MAP_TYPES.contains(mainParts[0]))
		throw new Error("No valid node map type for XML query: " + query);

	var nodeMap = NODE_MAPS[mainParts[0]];
	if(!nodeMap.hasOwnProperty(mainParts[1]))
	{
		base.warn("No valid id for nodeMapType XML parts: %s", mainParts);
		return result;
	}

	var target = nodeMap[mainParts[1]];

	if(target.childNodes().length===0)
	{
		base.warn("No child nodes for nodeMapType XML parts [%s] with xml:", mainParts, target.toString());
		return result;
	}

	var subparts = mainParts[2].split(".");
	//base.info("Start (negative:%s): %s", negative, subparts);
	subparts.forEach(function(subpart)
	{
		var xpath = !subpart.match(/\[[0-9]+\]/) ? subpart.replace(/([^[]+)\[([^\]]+)]/, "$1[@index = '$2']") : subpart.replace(/\[([0-9]+)\]/, "[" + (+subpart.match(/\[([0-9]+)\]/)[1]+1) + "]");
		//base.info("Next xpath: %s\nCurrent target: %s\n", xpath, target.toString());
		var nextTarget = target.get(xpath);
		if(!nextTarget)
			result = +attributeValue(target, xpath);
		target = nextTarget;
	});

	if(target)
		result = +attributeValue(target, "value");

	//base.info("%s => %d", query, result);

	if(negative)
		result = result*-1;

	return result;
}

function performHeroModifications(hero)
{
	if(!C.HERO_MODIFICATIONS.hasOwnProperty(hero.id))
		return;

	C.HERO_MODIFICATIONS[hero.id].forEach(function(HERO_MODIFICATION)
	{
		var match = jsonselect.match(HERO_MODIFICATION.path, hero);
		if(!match || match.length<1)
		{
			base.error("Failed to match [%s] to: %s", HERO_MODIFICATION.path, hero);
			return;
		}

		match[0][HERO_MODIFICATION.name] = HERO_MODIFICATION.value;
	});
}

function validateHero(hero)
{
	var validator = jsen(C.HERO_JSON_SCHEMA);
	if(!validator(hero))
	{
		base.warn("Hero %s (%s) has FAILED VALIDATION", hero.id, hero.name);
		base.info(validator.errors);
	}
}

function getValue(node, subnodeName, defaultValue)
{
	var subnode = node.get(subnodeName);
	if(!subnode)
		return defaultValue || undefined;

	return attributeValue(subnode, "value", defaultValue);
}

function attributeValue(node, attrName, defaultValue)
{
	var attr = node.attr(attrName);
	if(!attr)
		return defaultValue || undefined;

	return attr.value();
}