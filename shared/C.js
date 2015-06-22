"use strict";

var base = require("xbase"); // jshint ignore:line

exports.HERO_MODIFICATIONS =
{
	"Crusader" :
	[
		{ path : ":root", name : "ratings", value : { damage : 3, utility : 6, survivability : 10, complexity : 4 } }
	],
	"Chen" :
	[
		{ path : ":root", name : "releaseDate", value : "2014-09-10" }
	]
};

exports.HERO_UNIT_ID_REPLACEMENTS =
{
	"LostVikings" : "LostVikingsController"
};

exports.ADDITIONAL_HERO_SUBUNIT_IDS =
{
	"Abathur" : ["AbathurSymbiote"]
};

exports.VALID_SUBUNIT_ABILITY_IDS =
{
	"AbathurSymbiote" : ["AbathurSymbioteCancel", "AbathurSymbioteStab", "AbathurSymbioteSpikeBurst", "AbathurSymbioteCarapace"],
	"HeroBaleog" : ["LostVikingsPressA", "LostVikingsSpinToWin", "LostVikingsNorseForce"],
	"HeroErik" : ["LostVikingsPressA", "LostVikingsSpinToWin", "LostVikingsNorseForce"],
	"HeroOlaf" : ["LostVikingsPressA", "LostVikingsSpinToWin", "LostVikingsNorseForce"]
};

exports.FORMULA_PRE_REPLACEMENTS = 
[
	{
		  match : "$GalaxyVar:libGDHL_gv_bALHeroKerriganAssimilationRangedDamageModifier$",
		replace : "0.1"
	},
	{
		  match : "Behavior,CrusaderPunishStackingSlow,Modification.UnifiedMoveSpeedFactor*(-100)6",
		replace : "Behavior,CrusaderPunishStackingSlow,Modification.UnifiedMoveSpeedFactor*(-100)*6"
	}
];

exports.REMOVE_SUBUNITS =
{
	"LostVikings" : ["HeroBaleog", "HeroErik", "HeroOlaf"]
};

exports.IMPORT_ABILITIES_FROM_SUBUNIT =
{
	"LostVikings" : "HeroBaleog"
};

exports.IMPORT_ABILITIES =
{
	"HeroBaleog" :
	[
		{
			id : "LostVikingSelectOlaf",
			shortcut : "1",
			name : "Select Olaf"
		},
		{
			id : "LostVikingSelectBaleog",
			shortcut : "2",
			name : "Select Baleog"
		},
		{
			id : "LostVikingSelectErik",
			shortcut : "3",
			name : "Select Erik"
		},
		{
			id : "LostVikingSelectAll",
			shortcut : "4",
			name : "Select All Vikings"
		}
	]
};

exports.XMLREF_REPLACEMENTS =
[
	{
		from : "Effect,ArcaneIntellectBasicAttackManaRestore,VitalArray[2].Change",
		  to : "Effect,ArcaneIntellectBasicAttackManaRestore,VitalArray[0].Change",
	},
	{
		from : "Effect,ArcaneIntellectAbilityDamageManaRestore,VitalArray[2].Change",
		  to : "Effect,ArcaneIntellectAbilityDamageManaRestore,VitalArray[0].Change"
	},
	{
		from : "Effect,FrostmourneHungersManaRestoreModifyUnit,VitalArray[2].Change",
		  to : "Effect,FrostmourneHungersManaRestoreModifyUnit,VitalArray[0].Change"
	}
];

exports.HERO_MAX_LEVEL = 20;

exports.HERO_TALENT_LEVELS = [1, 4, 7, 10, 13, 16, 20];

exports.HERO_JSON_SCHEMA =
{
	name                 : "hero",
	type                 : "object",
	additionalProperties : false,
	properties           :
	{
		id          : { type : "string", minLength : 1 },
		name        : { type : "string", minLength : 1 },
		title       : { type : "string", minLength : 1 },
		role        : { type : "string", enum : ["Assassin", "Warrior", "Support", "Specialist"] },
		type        : { type : "string", enum : ["Melee", "Ranged"] },
		gender      : { type : "string", enum : ["Female", "Male"] },
		franchise   : { type : "string", minLength : 1 },
		difficulty  : { type : "string", enum : ["Easy", "Medium", "Hard", "Very Hard"] },
		releaseDate : { type : "string", pattern : "2[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]" },
		stats :
			{
				type       : "object",
				additionalProperties :
				{
					type                 : "object",
					additionalProperties : false,
					required             : ["hp", "hpPerLevel", "hpRegen", "hpRegenPerLevel", "mana", "manaPerLevel", "manaRegen", "manaRegenPerLevel"],
					properties           :
					{
						hp                : { type : "number", minimum : 0 },
						hpPerLevel        : { type : "number", minimum : 0 },
						hpRegen           : { type : "number", minimum : 0 },
						hpRegenPerLevel   : { type : "number", minimum : 0 },
						mana              : { type : "number", minimum : 0 },
						manaPerLevel      : { type : "number", minimum : 0 },
						manaRegen         : { type : "number", minimum : 0 },
						manaRegenPerLevel : { type : "number", minimum : 0 }
					}
				}
			},
		ratings     :
			{
				type : "object",
				additionalProperties : false,
				required : ["damage", "utility", "survivability", "complexity"],
				properties :
				{
					damage        : { type : "integer", minimum : 1, maximum : 10 },
					utility       : { type : "integer", minimum : 1, maximum : 10 },
					survivability : { type : "integer", minimum : 1, maximum : 10 },
					complexity    : { type : "integer", minimum : 1, maximum : 10 }
				}
			},
		talents :
			{
				type : "object",
				additionalProperties : false,
				properties : {}
			},
		abilities :
			{
				type       : "object",
				additionalProperties :
				{
					type : "array",
					minItems : 1,
					items :
					{
						type : "object",
						additionalProperties : false,
						required : ["id", "name", "description"],
						properties :
						{
							id                : { type : "string", minLength : 1 },
							name              : { type : "string", minLength : 1 },
							description       : { type : "string", minLength : 1 },
							trait             : { type : "boolean" },
							heroic            : { type : "boolean" },
							cooldown          : { type : "number", minimum : 0 },
							manaCost          : { type : "number", minimum : 0 },
							manaCostPerSecond : { type : "number", minimum : 0 },
							aimType           : { type : "string", minLength : 1 },
							shortcut          : { type : "string", minLength : 1, maxLength : 1 }
						}
					}
				}
			}
	}
};

var HERO_TALENT_TIER_JSON_SCHEMA =
{
	type : "array",
	minItems : 3,
	maxItems : 5,
	items :
		{
			type : "object",
			additionalProperties : false,
			required : ["id", "name", "description"],
			properties :
			{
				id           : { type : "string", minLength : 1 },
				name         : { type : "string", minLength : 1 },
				description  : { type : "string", minLength : 1 },
				prerequisite : { type : "string", minLength : 1 },
				cooldown     : { type : "number", minimum : 0 },
			}
		}
};

exports.HERO_TALENT_LEVELS.forEach(function(HERO_TALENT_LEVEL) { exports.HERO_JSON_SCHEMA.properties.talents.properties[HERO_TALENT_LEVEL] = base.clone(HERO_TALENT_TIER_JSON_SCHEMA, true); });
exports.HERO_JSON_SCHEMA.properties.talents.required = exports.HERO_TALENT_LEVELS.map(function(HERO_TALENT_LEVEL) { return ""+HERO_TALENT_LEVEL; });

exports.HERO_JSON_SCHEMA.required = Object.keys(exports.HERO_JSON_SCHEMA.properties);
exports.HERO_JSON_SCHEMA.required.remove("releaseDate");

exports.HERO_JSON_SCHEMA.properties.talents.properties[10].minItems = 2;
exports.HERO_JSON_SCHEMA.properties.talents.properties[10].maxItems = 2;
