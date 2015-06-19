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

exports.HERO_TALENT_LEVELS = [1, 4, 7, 10, 13, 16, 20];

exports.HERO_JSON_SCHEMA =
{
	name : "hero",
	type : "object",
	additionalProperties : false,
	properties :
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
				id          : { type : "string", minLength : 1 },
				name        : { type : "string", minLength : 1 },
				description : { type : "string", minLength : 1 }
			}
		}
};

exports.HERO_TALENT_LEVELS.forEach(function(HERO_TALENT_LEVEL) { exports.HERO_JSON_SCHEMA.properties.talents.properties[HERO_TALENT_LEVEL] = base.clone(HERO_TALENT_TIER_JSON_SCHEMA, true); });
exports.HERO_JSON_SCHEMA.properties.talents.required = exports.HERO_TALENT_LEVELS.map(function(HERO_TALENT_LEVEL) { return ""+HERO_TALENT_LEVEL; });

exports.HERO_JSON_SCHEMA.required = Object.keys(exports.HERO_JSON_SCHEMA.properties);
exports.HERO_JSON_SCHEMA.required.remove("releaseDate");

exports.HERO_JSON_SCHEMA.properties.talents.properties[10].minItems = 2;
exports.HERO_JSON_SCHEMA.properties.talents.properties[10].maxItems = 2;
