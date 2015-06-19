"use strict";

exports.HERO_JSON_SCHEMA =
{
	name : "hero",
	type : "object",
	additionalProperties : false,
	properties :
	{
		id          : { type : "string" },
		name        : { type : "string" },
		title       : { type : "string" },
		role        : { type : "string", enum : ["Assassin", "Warrior", "Support", "Specialist"] },
		type        : { type : "string", enum : ["Melee", "Ranged"] },
		gender      : { type : "string", enum : ["Female", "Male"] },
		franchise   : { type : "string" },
		difficulty  : { type : "string", enum : ["Easy", "Medium", "Hard", "Very Hard"] },
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
		releaseDate : { type : "string", pattern : "2[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]" }
	}
};

exports.HERO_JSON_SCHEMA.required = Object.keys(exports.HERO_JSON_SCHEMA.properties);
exports.HERO_JSON_SCHEMA.required.remove("releaseDate");

exports.HERO_MODIFICATIONS =
{
	"Crusader" :
	[
		{ set : { ratings : { damage : 3, utility : 6, survivability : 10, complexity : 4 } } }
	],
	"Chen" :
	[
		{ set : { releaseDate : "2014-09-10" } }
	]
};

