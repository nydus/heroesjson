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
var OUT_MODS_PATH = path.join(OUT_PATH, "mods");

var HEROES_OUT_PATH = path.join(OUT_PATH, "heroes.json");

var EXTRA_HEROES = ["anubarak", "chen", "crusader", "jaina", "kaelthas", "lostvikings", "murky", "sonyarework", "sylvanas", "thrall"];
var NODE_MAPS = {};
var NODE_MAP_TYPES = ["Hero", "Talent", "Behavior", "Effect", "Abil", "Unit", "Validator", "Weapon", "Button" ];

var HERO_LEVEL_SCALING_MODS = {};

var NEEDED_SUBFIXES = [ "enus.stormdata\\LocalizedData\\GameStrings.txt" ];
NODE_MAP_TYPES.forEach(function(NODE_MAP_TYPE)
{
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
		heroes.sort(function(a, b) { return (a.name.startsWith("The ") ? a.name.substring(4) : a.name).localeCompare((b.name.startsWith("The ") ? b.name.substring(4) : b.name)); });

		base.info("Validating %d heroes...", heroes.length);
		heroes.forEach(validateHero);
		
		base.info("Saving JSON...");

		fs.writeFile(HEROES_OUT_PATH, JSON.stringify(heroes), {encoding:"utf8"}, this);
	},
	function cleanup()
	{
		base.info("Cleaning up 'out' directory...");
		rimraf(OUT_MODS_PATH, this);
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
	hero.description = S["Hero/Description/" + hero.id];

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

	var heroUnitids = [];
	var alternateUnitArrayNodes = heroNode.find("AlternateUnitArray");
	if(alternateUnitArrayNodes && alternateUnitArrayNodes.length>0)
	{
		alternateUnitArrayNodes.forEach(function(alternateUnitArrayNode)
		{
			var alternateHeroid = attributeValue(alternateUnitArrayNode, "value");
			heroUnitids.push(alternateHeroid);
		});
	}
	else
	{
		heroUnitids.push(hero.id);
	}

	heroUnitids = heroUnitids.concat(C.ADDITIONAL_HERO_SUBUNIT_IDS[hero.id] || []);

	// Level Scaling Info
	HERO_LEVEL_SCALING_MODS[hero.id] = [];

	heroNode.find("LevelScalingArray/Modifications").forEach(function(modNode)
	{
		var modType = getValue(modNode, "Catalog", attributeValue(modNode, "Catalog"));
		if(!NODE_MAP_TYPES.contains(modType))
			throw new Error("Unsupported LevelScalingArray Modification Catalog modType: " + modType);

		var modKey = getValue(modNode, "Entry", attributeValue(modNode, "Entry"));
		if(!modKey)
			throw new Error("No Entry node in LevelScalingArray Modification (" + modKey + ") for hero: " + hero.id);

		var modTarget = getValue(modNode, "Field", attributeValue(modNode, "Field"));
		if(!modTarget)
			throw new Error("No Field node in LevelScalingArray Modification (" + modTarget + ") for hero: " + hero.id);

		var modValue = getValue(modNode, "Value", attributeValue(modNode, "Value"));
		if(!modValue)
			return;

		HERO_LEVEL_SCALING_MODS[hero.id].push({type:modType,key:modKey,target:modTarget,value:(+modValue)});
	});

	// Hero Stats
	hero.stats = {};
	heroUnitids.forEach(function(heroUnitid)
	{
		hero.stats[heroUnitid] = getHeroStats(heroUnitid);
		if(Object.keys(hero.stats[heroUnitid]).length===0)
			delete hero.stats[heroUnitid];
	});

	// Abilities
	hero.abilities = getHeroAbilities(hero.id, heroUnitids);

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

		var talentDescription = S["Button/Tooltip/" + faceid];

		if(!talentDescription && faceid==="TyrandeHuntersMarkTrueshotAuraTalent")
			talentDescription = S["Button/Tooltip/TyrandeTrueshotBowTalent"];

		if(!talentDescription)
		{
			base.warn("Missing talent description for hero [%s] and talentid [%s] and faceid [%s]", hero.id, talent.id, faceid);
			return;
		}

		talent.name = talentDescription.replace(/<s val="StandardTooltipHeader">([^<]+)<.+/, "$1").replace(/<s\s*val\s*=\s*"StandardTooltip">/gm, "").trim();
		talent.description = getFullDescription(talentDescription, hero.id, 0);
		talent.icon = getValue(NODE_MAPS["Button"][faceid], "Icon");
		if(!talent.icon)
			delete talent.icon;
		else
			talent.icon = talent.icon.replace(/Assets\\Textures\\/, "");

		addCooldownInfo(talent, "description");

		var talentPrerequisiteNode = talentTreeNode.get("PrerequisiteTalentArray");
		if(talentPrerequisiteNode)
			talent.prerequisite = attributeValue(talentPrerequisiteNode, "value");

		hero.talents[C.HERO_TALENT_LEVELS[((+attributeValue(talentTreeNode, "Tier"))-1)]].push(talent);
	});
	
	// Final modifications
    performHeroModifications(hero);
	
	return hero;
}

function getHeroAbilities(heroid, heroUnitids)
{
	var abilities = {};

	var heroHeroicAbilityids = [];
	var heroTraitAbilityids = [];
	var heroAbilityids = [];
	var heroNode = NODE_MAPS["Hero"][heroid];
	heroNode.find("HeroAbilArray").forEach(function(heroAbilNode)
	{
		if(!heroAbilNode.get("Flags[@index='ShowInHeroSelect' and @value='1']"))
			return;

		var abilityIsTrait = !!heroAbilNode.get("Flags[@index='Trait' and @value='1']");

		var abilid = attributeValue(heroAbilNode, "Abil");
		if(!abilid)
		{
			var buttonid = attributeValue(heroAbilNode, "Button");
			if(!buttonid)
				throw new Error("No abil or button for: " + heroAbilNode.toString());

			var descriptionIdsToTry = [];
			var buttonidShort = ["HeroSelect", "HeroSelectButton"].mutateOnce(function(buttonSuffix) { if(buttonid.endsWith(buttonSuffix)) { return buttonid.substring(0, buttonid.length-buttonSuffix.length); } });
			descriptionIdsToTry.push(buttonidShort);
			descriptionIdsToTry.push(heroid + buttonidShort);
			if(abilityIsTrait)
			{
				descriptionIdsToTry.push(buttonidShort + "Trait");
				if(buttonidShort.contains(heroid))
					descriptionIdsToTry.push(buttonidShort.replace(heroid, heroid + "Trait"));
			}
			descriptionIdsToTry.push(buttonidShort + "Talent");

			abilid = descriptionIdsToTry.mutateOnce(function(descriptionIdToTry) { if(S["Button/Tooltip/" + descriptionIdToTry]) { return descriptionIdToTry; }});
		}

		if(abilityIsTrait)
			heroTraitAbilityids.push(abilid);

		if(heroAbilNode.get("Flags[@index='Heroic' and @value='1']"))
			heroHeroicAbilityids.push(abilid);

		heroAbilityids.push(abilid);
	});

	abilities[heroid] = getUnitAbilities(heroid, heroAbilityids, heroHeroicAbilityids, heroTraitAbilityids, "Hero" + (C.HERO_UNIT_ID_REPLACEMENTS[heroid] || heroid));

	heroUnitids.forEach(function(heroUnitid)
	{
		if(heroUnitid===heroid)
			return;

		abilities[heroUnitid] = getUnitAbilities(heroid, heroAbilityids.concat((C.VALID_SUBUNIT_ABILITY_IDS[heroUnitid] || [])), heroHeroicAbilityids, heroTraitAbilityids, heroUnitid);
	});

	heroUnitids.concat([heroid]).forEach(function(heroUnitid)
	{
		Object.forEach(C.IMPORT_ABILITIES_FROM_SUBUNIT, function(importToid, importFromid)
		{
			if(importToid!==heroUnitid)
				return;

			abilities[importToid] = abilities[importFromid];
		});
	});

	(C.REMOVE_SUBUNITS[heroid] || []).forEach(function(REMOVE_SUBUNIT)
	{
		delete abilities[REMOVE_SUBUNIT];
	});

	return abilities;
}

function getUnitAbilities(heroid, heroAbilityids, heroHeroicAbilityids, heroTraitAbilityids, unitid)
{
	var SHORTCUT_KEY_ORDER = ["Q", "W", "E", "R", "D", "1", "2", "3", "4", "5"];
	var abilities = [];

	var unitNode = NODE_MAPS["Unit"][unitid];
	if(!unitNode)
		throw new Error("Could not find unit for: " + unitid);

	(unitNode.find("CardLayouts[@index='0']/LayoutButtons") || []).forEach(function(layoutButtonNode)
	{
		var buttonRow = attributeValue(layoutButtonNode, "Row", getValue(layoutButtonNode, "Row", null));
		var buttonColumn = attributeValue(layoutButtonNode, "Column", getValue(layoutButtonNode, "Column", null));
		if(buttonRow===null || buttonColumn===null)
			return;

		buttonRow = +buttonRow;
		buttonColumn = +buttonColumn;

		var ability = {};
		ability.id = attributeValue(layoutButtonNode, "Face", getValue(layoutButtonNode, "Face"));

		var abilityCmdid = attributeValue(layoutButtonNode, "AbilCmd", getValue(layoutButtonNode, "AbilCmd"));
		if(abilityCmdid)
			abilityCmdid = abilityCmdid.split(",")[0];

		if(!heroAbilityids.contains(ability.id) && !heroAbilityids.contains(abilityCmdid))
			return;

		var abilNode = NODE_MAPS["Abil"][ability.id];
		if(!abilNode && abilityCmdid)
			abilNode = NODE_MAPS["Abil"][abilityCmdid];

		if(heroTraitAbilityids.contains(ability.id) || heroTraitAbilityids.contains(abilityCmdid))
			ability.trait = true;

		if(!ability.trait && !abilNode)
			throw new Error("Failed to find ability node: " + layoutButtonNode.toString());
		
		if(abilNode)
		{
			var cmdButtonNode = abilNode.get("CmdButtonArray[@index='Execute']");
			if(cmdButtonNode)
				ability.icon = getValue(NODE_MAPS["Button"][attributeValue(cmdButtonNode, "DefaultButtonFace")], "Icon");

			var energyCostNode = abilNode.get("Cost/Vital[@index='Energy']");
			if(energyCostNode)
				ability.manaCost = +attributeValue(energyCostNode, "value");
		}

		if(!ability.icon)
			ability.icon = getValue(NODE_MAPS["Button"][ability.id], "Icon");

		if(!ability.icon)
			delete ability.icon;
		else
			ability.icon = ability.icon.replace(/Assets\\Textures\\/, "");

		if(heroHeroicAbilityids.contains(ability.id) || heroHeroicAbilityids.contains(abilityCmdid))
			ability.heroic = true;

		addAbilityDetails(ability, heroid, abilityCmdid);

		ability.tempSortOrder = (buttonRow*5)+buttonColumn;

		if(!ability.trait)
		{
			ability.shortcut = SHORTCUT_KEY_ORDER[ability.tempSortOrder];
	
			if(!NODE_MAPS["Abil"][ability.id] && NODE_MAPS["Abil"][abilityCmdid])
				ability.id = abilityCmdid;
		}
		else
		{
			if(!heroTraitAbilityids.contains(ability.id) && heroTraitAbilityids.contains(abilityCmdid))
				ability.id = abilityCmdid;
		}

		if(abilities.filter(function (existingAbility) { return existingAbility.id===ability.id; }).length===0)
			abilities.push(ability);
	});

	(C.IMPORT_ABILITIES[unitid] || []).forEach(function(abilityToAdd)
	{
		var ability = {};
		ability.id = abilityToAdd.id;
		ability.icon = abilityToAdd.icon;

		addAbilityDetails(ability, heroid, undefined, abilityToAdd.name);

		if(abilityToAdd.shortcut)
			ability.shortcut = abilityToAdd.shortcut;

		abilities.push(ability);
	});

	abilities.sort(function(a, b) { return a.tempSortOrder-b.tempSortOrder; });
	abilities.forEach(function(ability)
	{
		delete ability.tempSortOrder;
	});

	return abilities;
}

function addAbilityDetails(ability, heroid, abilityCmdid, abilityName)
{
	ability.name = abilityName || S["Button/Name/" + ability.id] || S["Button/Name/" + abilityCmdid];
	if(!ability.name)
		throw new Error("Failed to get ability name: " + ability.id + " and " + abilityCmdid);

	var abilityDescription = S["Button/Tooltip/" + ability.id] || S["Button/Tooltip/" + abilityCmdid];
	if(!abilityDescription)
		throw new Error("Failed to get ability description: " + ability.id + " and " + abilityCmdid);
	
	ability.description = getFullDescription(abilityDescription, heroid, 0);

	ability.description = ability.description.replace("Heroic Ability\n", "").replace("Trait\n", "");

	addCooldownInfo(ability, "description");

	var manaPerSecondMatch = ability.description.match(/Mana:\s*([0-9]+)\s+per\s+second\n/m);
	if(manaPerSecondMatch)
	{
		ability.manaCostPerSecond = +manaPerSecondMatch[1];
		ability.description = ability.description.replace(manaPerSecondMatch[0], "");
	}

	var aimTypeMatch = ability.description.match(/((?:Skillshot)|(?:Area of Effect)|(?:Cone))\n/);
	if(aimTypeMatch)
	{
		ability.aimType = aimTypeMatch[1];
		ability.description = ability.description.replace(aimTypeMatch[0], "");
	}
}

function addCooldownInfo(o, field)
{
	var cooldownMatch = o[field].match(/(?:Charge )?Cooldown:\s*([0-9]+)\s+[sS]econds?\n/m);
	if(cooldownMatch)
	{
		o.cooldown = +cooldownMatch[1];
		o[field] = o[field].replace(cooldownMatch[0], "");
	}
}

function getHeroStats(heroUnitid)
{
	var heroStats = {};

	var heroUnitNode = NODE_MAPS["Unit"][(!heroUnitid.startsWith("Hero") ? "Hero" : "") + heroUnitid];
	if(heroUnitNode)
	{
		heroStats.hp = +getValue(heroUnitNode, "LifeMax");
		heroStats.hpPerLevel = 0;
		heroStats.hpRegen = +getValue(heroUnitNode, "LifeRegenRate");
		heroStats.hpRegenPerLevel = 0;

		heroStats.mana = +getValue(heroUnitNode, "EnergyMax", 500);
		heroStats.manaPerLevel = 0;
		heroStats.manaRegen = +getValue(heroUnitNode, "EnergyRegenRate", 3);
		heroStats.manaRegenPerLevel = 0;

		(heroUnitNode.find("BehaviorArray") || []).forEach(function(behaviorArrayNode)
		{
			var behaviorNode = NODE_MAPS["Behavior"][attributeValue(behaviorArrayNode, "Link")];
			if(!behaviorNode)
				return;

			if(attributeValue(behaviorNode, "parent")!=="HeroXPCurve")
				return;

			var levelOneNode = behaviorNode.get("VeterancyLevelArray[@index='1']/Modification");
			if(!levelOneNode)
				return;

			var hpPerLevelAttribute = levelOneNode.get("VitalMaxArray[@index='Life']/@value");
			if(hpPerLevelAttribute)
				heroStats.hpPerLevel = (heroStats.hpPerLevel || 0) + (+hpPerLevelAttribute.value());

			var hpRegenPerLevelAttribute = levelOneNode.get("VitalRegenArray[@index='Life']/@value");
			if(hpRegenPerLevelAttribute)
				heroStats.hpRegenPerLevel = (heroStats.hpRegenPerLevel || 0) + (+hpRegenPerLevelAttribute.value());

			var manaPerLevelAttribute = levelOneNode.get("VitalMaxArray[@index='Energy']/@value");
			if(manaPerLevelAttribute)
				heroStats.manaPerLevel = (heroStats.manaPerLevel || 0) + (+manaPerLevelAttribute.value());

			var manaRegenPerLevelAttribute = levelOneNode.get("VitalRegenArray[@index='Energy']/@value");
			if(manaRegenPerLevelAttribute)
				heroStats.manaRegenPerLevel = (heroStats.manaRegenPerLevel || 0) + (+manaRegenPerLevelAttribute.value());
		});
	}

	return heroStats;
}

function getFullDescription(_fullDescription, heroid, heroLevel)
{
	var fullDescription = _fullDescription;

	fullDescription = fullDescription.replace(/<s val="StandardTooltipHeader">[^<]+(<.+)/, "$1").replace(/<s val="StandardTooltip">?(.+)/, "$1");
	fullDescription = fullDescription.replace(/<s val="StandardTooltipHeader">/g, "");

	(fullDescription.match(/<d ref="[^"]+"[^/]*\/>/g) || []).forEach(function(dynamic)
	{
		var formula = dynamic.match(/ref\s*=\s*"([^"]+)"/)[1];
		if(formula.endsWith(")") && !formula.contains("("))
			formula = formula.substring(0, formula.length-1);
		try
		{
			C.FORMULA_PRE_REPLACEMENTS.forEach(function(FORMULA_PRE_REPLACEMENT)
			{
				if(formula.contains(FORMULA_PRE_REPLACEMENT.match))
					formula = formula.replace(FORMULA_PRE_REPLACEMENT.match, FORMULA_PRE_REPLACEMENT.replace);
			});

			var result = FORMULA_PARSER.parse(formula, {heroid:heroid, heroLevel:heroLevel, lookupXMLRef : lookupXMLRef});
			//if(heroid==="Anubarak") { base.info("Formula: %s\nResult: %d", formula, result); }
		
			var MAX_PRECISION = 4;
			if(result.toFixed(MAX_PRECISION).length<(""+result).length)
				result = +result.toFixed(MAX_PRECISION);

			//var precision = dynamic.match(/precision\s*=\s*"([^"]+)"/) ? +dynamic.match(/precision\s*=\s*"([^"]+)"/)[1] : null;
			//if(precision!==null && Math.floor(result)!==result)
			//	result = result.toFixed(precision);

			fullDescription = fullDescription.replace(dynamic, result);
		}
		catch(err)
		{
			base.error("Failed to parse: %s", formula);
			throw err;
		}

	});

	fullDescription = fullDescription.replace(/<\/?n\/?>/g, "\n");
	fullDescription = fullDescription.replace(/<s\s*val\s*=\s*"StandardTooltipDetails">/gm, "").replace(/<s\s*val\s*=\s*"StandardTooltip">/gm, "").replace(/<\/?[cs]\/?>/g, "");
	fullDescription = fullDescription.replace(/<c\s*val\s*=\s*"[^"]+">/gm, "").replace(/<\/?if\/?>/g, "").trim();
	fullDescription = fullDescription.replace(/ [.]/g, ".");
	while(fullDescription.indexOf("\n\n")!==-1) { fullDescription = fullDescription.replace(/\n\n/gm, "\n"); } 

	if(heroLevel===0)
	{
		var fullDescriptionLevel1 = getFullDescription(_fullDescription, heroid, 1);
		if(fullDescription!==fullDescriptionLevel1)
		{
			var beforeWords = fullDescription.split(" ");
			var afterWords = fullDescriptionLevel1.split(" ");
			if(beforeWords.length!==afterWords.length)
				throw new Error("Talent description words length MISMATCH " + beforeWords.length + " vs " + afterWords.length + " for hero (" + heroid + ") and talent: " + fullDescription);

			var updatedWords = [];
			beforeWords.forEach(function(beforeWord, i)
			{
				var afterWord = afterWords[i];
				if(beforeWord===afterWord)
				{
					updatedWords.push(beforeWord);
					return;
				}

				var endWithPeriod = beforeWord.endsWith(".");
				if(endWithPeriod)
				{
					beforeWord = beforeWord.substring(0, beforeWord.length-1);
					afterWord = afterWord.substring(0, afterWord.length-1);
				}

				var isPercentage = beforeWord.endsWith("%");
				if(isPercentage)
				{
					beforeWord = beforeWord.substring(0, beforeWord.length-1);
					afterWord = afterWord.substring(0, afterWord.length-1);
				}

				var valueDifference = (+afterWord).subtract(+beforeWord);

				var resultWord = beforeWord + (isPercentage ? "%" : "") + " (" + (valueDifference>0 ? "+" : "") + valueDifference + (isPercentage ? "%" : "") + " per level)" + (endWithPeriod ? "." : "");

				updatedWords.push(resultWord);
			});

			fullDescription = updatedWords.join(" ");
		}
	}

	return fullDescription;
}

function lookupXMLRef(heroid, heroLevel, query, negative)
{
	var result = 0;

	C.XMLREF_REPLACEMENTS.forEach(function(XMLREF_REPLACEMENT)
	{
		if(query===XMLREF_REPLACEMENT.from)
			query = XMLREF_REPLACEMENT.to;
	});

	//if(heroid==="Rehgar") { base.info("QUERY: %s", query); }

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
		if(attributeValue(target, "id")!=="Artifact_AP_Base")
			base.warn("No child nodes for nodeMapType XML parts [%s] with xml:", mainParts, target.toString());
		return result;
	}

	var subparts = mainParts[2].split(".");

	var additionalAmount = 0;
	HERO_LEVEL_SCALING_MODS[heroid].forEach(function(HERO_LEVEL_SCALING_MOD)
	{
		if(HERO_LEVEL_SCALING_MOD.type!==mainParts[0])
			return;

		if(HERO_LEVEL_SCALING_MOD.key!==mainParts[1])
			return;

		if(HERO_LEVEL_SCALING_MOD.target!==subparts[0])
			return;

		additionalAmount = heroLevel*HERO_LEVEL_SCALING_MOD.value;
	});

	//if(heroid==="Rehgar") { base.info("Start (negative:%s): %s", negative, subparts); }
	subparts.forEach(function(subpart)
	{
		var xpath = !subpart.match(/\[[0-9]+\]/) ? subpart.replace(/([^[]+)\[([^\]]+)]/, "$1[@index = '$2']") : subpart.replace(/\[([0-9]+)\]/, "[" + (+subpart.match(/\[([0-9]+)\]/)[1]+1) + "]");
		//if(heroid==="Rehgar") { base.info("Next xpath: %s\nCurrent target: %s\n", xpath, target.toString()); }
		var nextTarget = target.get(xpath);
		if(!nextTarget)
			result = +attributeValue(target, xpath.replace(/([^\[]+).*/, "$1"));
		target = nextTarget;
	});

	if(target)
		result = +attributeValue(target, "value");

	if(isNaN(result))
	{
		if(query.contains("AttributeFactor"))	// These are only set at runtime with talent choices
			result = 0;
		else
			throw new Error("Failed to get XML ref [" + query + "], result is NaN for hero: " + heroid);
	}

	result += additionalAmount;
	//if(heroid==="Rehgar") { base.info("%s => %d", query, result); }

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
	if(!node)
		return defaultValue || undefined;

	var subnode = node.get(subnodeName);
	if(!subnode)
		return defaultValue || undefined;

	return attributeValue(subnode, "value", defaultValue);
}

function attributeValue(node, attrName, defaultValue)
{
	if(!node)
		return defaultValue || undefined;

	var attr = node.attr(attrName);
	if(!attr)
		return defaultValue || undefined;

	return attr.value();
}
