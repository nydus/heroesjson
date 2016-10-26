"use strict";

var base = require("xbase"); // jshint ignore:line

// Extra heroes in the 'heromods' folder
exports.EXTRA_HEROES_HEROMODS = ["chogall"];

// Extra hero files in "mods/heromods/" + heroName + ".stormmod/base.stormdata/GameData/" + gameDataName + "Data.xml"
exports.EXTRA_HEROES_HEROMODS_NAMED =
{
	"chogall" : "ChoGall",
	"wizard"  : "Wizard",
	"necromancer" : "Necromancer",
	"dehaka"  : "Dehaka",
	"tracer"  : "Tracer",
	"chromie" : "Chromie",
  "medivh"  : "Medivh",
  "guldan"	: "Guldan",
  "auriel"	: "Auriel",
  "alarak"	: "Alarak",
  "zarya"		: "Zarya",
  "samuro"		: "Samuro"
};

exports.SKIP_HERO_IDS = ["GreymaneWorgen", "ChoGallBundleProduct"];

exports.HERO_ID_TEXTURE_RENAMES = { };
// { "Dryad" : "lunara"};

exports.EXTRA_XML_FILE_PATHS = [];

// Extra mount data files in GameData/Mounts/<key>Data/Mount_<array value>Data.xml
exports.EXTRA_MOUNT_DATA_FILES = {
	"Cloud9Nexagon"        : ["Ridesurf_Cloud9Nexagon"],
	"Felstalker"           : ["Ride_Felstalker"],
	"Horse"                : ["Horse_ArmoredWarSteed",
				   			  "Horse_Common",
				   			  "Horse_HeadlessHorseman",
				   			  "Horse_IllidansNightmare",
				   			  "Horse_JudgementCharger",
				   			  "Horse_MalthaelsPhantom",
				   			  "Horse_MarshalsOutrider",
				   			  "Horse_Nazeebra",
				   			  "Horse_NexusCharger",
				   			  "Horse_RainbowUnicorn",
				   			  "Horse_TyraelsCharger",
				   			  "Horse_Demonic" ],
	"LionGreymane"         : ["Ride_LionGreymane"],
	"LunarDragon"          : ["Ride_LunarDragon"],
	"StarChariot"     	   : ["Ridesurf_StarChariot"],
	"Starbreaker"          : ["Ridebike_Starbreaker"],
	"TreasureGoblinWinter" : ["Ride_TreasureGoblinWinter"]
};

// Extra hero data files GameData/Heroes/<hero>Data.xml
exports.EXTRA_HEROES_GAMEDATA_FILES = ["Zagara"];

// Extra hero subfolder files GameData/Heroes/<hero>Data/<hero>Data.xml
// "Expansion" heroes that have moved into "main" modules.
exports.EXTRA_HEROES_GAMEDATA_FOLDERS = [
	"Anubarak",
	"Artanis",
	"Azmodan",
	"Butcher",
	"Chen",
	"Crusader",
	"DemonHunter",
	"Dryad",
	"Genn",
	"Jaina",
	"Kaelthas",
	"Leoric",
	"LostVikings",
	"Medic",
	"Monk",
	"Murky",
	"Necromancer",
	"Rexxar",
	"Stitches",
	"Sylvanas",
	"Thrall",
	"Uther",
	"WitchDoctor",
	"Wizard",
	"Tinker"
];

exports.HERO_MODIFICATIONS =
{
	"Crusader" : [ { path : ":root", name : "ratings", value : { damage : 3, utility : 6, survivability : 10, complexity : 4 } } ],
	"Chen" : [ { path : ":root", name : "releaseDate", value : "2014-09-10" } ],
	"Abathur" : [ { path : ":root .abilities .AbathurSymbiote *:nth-child(1)", name : "aimType", value : "Skillshot"} ],
	"Azmodan" :
	[
		{ path : ":root .abilities .Azmodan *:nth-child(3)", name : "manaCostPerSecond", value : 16}	// Unknown where this can be found
	],
	"Arthas" :
	[
		{ path : ":root .abilities .Arthas *:nth-child(2)", name : "manaCostPerSecond", value : 15}		// Somehow 'ArthasDeathAndDecayTog' leads to CBehaviorBuff 'DeathAndDecay' which has a <VitalRegenArray index="Energy" value="-15"/>
	],
	"Medic" : [ { path : ":root .abilities .Medic *:nth-child(6)", remove : ["cooldown"]} ],
	"Wizard" : [ { path : ":root", name : "releaseDate", value : "2016-02-02" } ],
	"Guldan" : [ { path : ":root", name : "ratings", value : { damage : 8, utility : 3, survivability : 5, complexity : 6 } } ],
};

exports.MOUNT_MODIFICATIONS =
{
	"Random" : [ 
		{ path : ":root", name : "description", value : "A random mount."}, 
		{ path : ":root", name : "category", value : "Random"}
	],
	"Mechanospider" : [ { path : ":root", name : "franchise", value : "Warcraft"} ],
	"CountessKerriganBatForm" : [ { path : ":root", name : "franchise", value : "Starcraft"} ],
	"ZagaraWings" : [ { path : ":root", name : "franchise", value : "Starcraft"} ],
	"CyberWolf" : [ { path : ":root", name : "franchise", value : "Starcraft"} ],
	"Felstalker" : [ { path : ":root", name : "franchise", value : "Warcraft"} ],
	"CyberWolfGold" : [ { path : ":root", name : "franchise", value : "Starcraft"} ],
	"CyberWolfBlack" : [ { path : ":root", name : "franchise", value : "Starcraft"} ],
	"MarshallRaynorHorse" : [ { path : ":root", name : "franchise", value : "Starcraft"} ],
	"MechaTassadarMorphForm" : [ { path : ":root", name : "franchise", value : "Starcraft"} ],
	"VoidSpeeder" : [ { path : ":root", name : "franchise", value : "Starcraft"} ],
	"Vulture" : [ { path : ":root", name : "franchise", value : "Starcraft"} ]
};

exports.FULLY_PARENTHESIZE = ["StitchesCombatStyleToxicGas"];

exports.HERO_UNIT_ID_REPLACEMENTS =
{
	"LostVikings" : "LostVikingsController"
};

exports.ADDITIONAL_HERO_SUBUNIT_IDS =
{
  // "Chen"    : ["ChenStormEarthFire"],
	"Uther"   : ["UtherSpirit"],
	"Rexxar"  : ["RexxarMisha"]
};

exports.VALID_UNIT_ABILITY_IDS =
{
	"AbathurSymbiote" : ["AbathurSymbioteCancel", "AbathurSymbioteStab", "AbathurSymbioteSpikeBurst", "AbathurSymbioteCarapace"],
	"HeroBaleog"      : ["LostVikingsPressA", "LostVikingsSpinToWin", "LostVikingsNorseForce", "LostVikingsNordicAttackSquad", "LostVikingsVikingBribery"],
	"HeroErik"        : ["LostVikingsPressA", "LostVikingsSpinToWin", "LostVikingsNorseForce", "LostVikingsNordicAttackSquad", "LostVikingsVikingBribery"],
	"HeroOlaf"        : ["LostVikingsPressA", "LostVikingsSpinToWin", "LostVikingsNorseForce", "LostVikingsNordicAttackSquad", "LostVikingsVikingBribery"],
  // "Chen" : ["ChenStormEarthFireRetargetSpirits", "ChenStormEarthFireSpread", "ChenStormEarthFireTriAttack"],
	"TychusOdin"      : ["TychusCommandeerOdinAnnihilate", "TychusCommandeerOdinRagnarokMissiles"],
	"Tychus"          : ["TychusOdinThrusters"],
	"Uther"           : ["UtherFlashofLight"],
	"Rexxar"          : ["RexxarMishaFollow", "RexxarMishaFollowCancel"],
	"Greymane"        : ["GreymaneDisengage", "GreymaneRazorSwipe"],
  "Xul"             : ["NecromancerBoneArmor"]
};

exports.ACTIVATABLE_ABILITY_IDS =
{
  "Xul"    : ["NecromancerBoneArmor"],
	"Rexxar" : ["RexxarMishaFollow", "RexxarMishaFollowCancel"]
};

exports.ABILITY_SHORTCUT_REMAPS =
{
	"RexxarMishaFollow"       : "D",
	"RexxarMishaFollowCancel" : "D"
};

exports.ALLOWED_EMPTY_XML_REF_IDS = ["Artifact_AP_Base", "TalentGatheringPowerCarry", "GreymaneWizenedDuelistCarry"];

exports.HERO_SUBUNIT_ABILITIES_MOVE =
{
	"Tychus" : { "Tychus" : { "TychusOdinThrusters" : "TychusOdin" } },
	"Uther"  : { "Uther"  : { "UtherFlashofLight"   : "UtherSpirit" } }
};

exports.HERO_MOUNT_UNIT_ID_REPLACEMENTS =
{
	"LostVikings" : "Baleog"
};

exports.HERO_SKIP_ABILITY_IDS =
{
	"Rehgar" : ["RehgarGhostWolfActivate"]
};

exports.MOUNT_ABILITY_IDS =
{
	"Abathur"      : "AbathurDeepTunnel",
	"FaerieDragon" : "FaerieDragonPhaseShiftFlight",
	"Falstad"      : "FalstadFlight",
	"SgtHammer"    : "Thrusters",
	"LostVikings"  : "LostVikingsGoGoGo",
	"Rehgar"       : "RehgarGhostWolfActivate",
	"Gall"         : "GallHurryUpOaf"
};

exports.FORMULA_PRE_REPLACEMENTS =
[
	// { // deprecated 2016-05-12
	// 	  match : "$GalaxyVar:libGDHL_gv_bALHeroKerriganAssimilationRangedDamageModifier$",
	// 	replace : "0.1"
	// },
	// { // deprecated 2016-05-12
	// 	  match : "$GalaxyVar:libGDHL_gv_bALHeroKerriganAssimilationBaseModifier$",
	// 	replace : "0.1"
	// },
	{
		  match : "Behavior,CrusaderPunishStackingSlow,Modification.UnifiedMoveSpeedFactor*(-100)6",
		replace : "Behavior,CrusaderPunishStackingSlow,Modification.UnifiedMoveSpeedFactor*(-100)*6"
	},
	{
		  match : "Behavior,LostVikingVikingHoardCarryBehavior,Modification.VitalRegenArray[Life]",
		replace : "1"
	},
	{
		  match : "1-*Behavior,RexxarBarkskinBuff,DamageResponse.ModifyFraction*100",
		replace : "1-Behavior,RexxarBarkskinBuff,DamageResponse.ModifyFraction*100"
	},
	// { // deprecated 2016-05-12
	// 	  match : "Effect,ClairvoyanceRevealedPersistent,ExpireDelay",
	// 	replace : "4"
	// },
	{
		  match : "Effect,ChoConsumingBlazeTalentBlazingBulwarkApplyBlockStack,Count",
		replace : "1"
	},
	{
		  match : "Behavior,GreymaneHuntersBlunderbussCarryBehavior,DamageResponse.ModifyFraction",
		replace : "1"
	},
	{
		  match : "Behavior,ToothAndClawCarryBehavior,DamageResponse.ModifyFraction",
		replace : "1"
	},
	{
		  match : "Upgrade,NovaSnipeMasterDamageUpgrade,EffectArray[2].Value*100",
		replace : "12"
	},
	{
		  match : "Upgrade,NovaSnipeMasterDamageUpgrade,MaxLevel",
		replace : "5"
	},
	{   // 42742
		  match : "Behavior,ArthasFrozenTempestFrigidWindsAttackSpeedDebuff,Modification.AdditiveAttackSpeedFactor*(1/Behavior,ArthasFrozenTempestCaster,Period)(-100)",
		replace : "Behavior,ArthasFrozenTempestFrigidWindsAttackSpeedDebuff,Modification.AdditiveAttackSpeedFactor*(1/Behavior,ArthasFrozenTempestCaster,Period)*(-100)"
	},
	{   // 42742
		  match : "Behavior,ChromieTimeTrapChronoSicknessSlow,MaxStackCount",
		replace : "1"
	},
	{   // 42742
		  match : "$BehaviorTokenCount:AurielRayOfHeavenReservoirOfHopeQuestToken$*Behavior,AurielRayOfHeavenReservoirOfHopeBonusEnergy,Modification.VitalMaxArray[Energy])",
		replace : "Behavior,AurielRayOfHeavenReservoirOfHopeBonusEnergy,Modification.VitalMaxArray[Energy])"
	},
	{   // 42742
		  match : "((Effect,ZaryaExpulsionZoneInitialSearchArea,AreaArray[0].Radius+.Value+Talent,ZaryaExpulsionZoneClearOut,AbilityModificationArray[0].Modifications[1].Value)/Effect,ZaryaExpulsionZoneInitialSearchArea,AreaArray[0].Radius)-1)*100",
		replace : "((Effect,ZaryaExpulsionZoneInitialSearchArea,AreaArray[0].Radius+Talent,ZaryaExpulsionZoneClearOut,AbilityModificationArray[0].Modifications[1].Value)/Effect,ZaryaExpulsionZoneInitialSearchArea,AreaArray[0].Radius)-1)*100"
	}
	


];

exports.XMLREF_REPLACEMENTS =
[
	// { // deprecated 2016-05-12
	// 	from : "Effect,ArcaneIntellectBasicAttackManaRestore,VitalArray[2].Change",
	// 	  to : "Effect,ArcaneIntellectBasicAttackManaRestore,VitalArray[0].Change",
	// },
	// { // deprecated 2016-05-12
	// 	from : "Effect,ArcaneIntellectAbilityDamageManaRestore,VitalArray[2].Change",
	// 	  to : "Effect,ArcaneIntellectAbilityDamageManaRestore,VitalArray[0].Change"
	// },
	// { // deprecated 2016-05-12
	// 	from : "Effect,FrostmourneHungersManaRestoreModifyUnit,VitalArray[2].Change",
	// 	  to : "Effect,FrostmourneHungersManaRestoreModifyUnit,VitalArray[0].Change"
	// },
	// { // deprecated 2016-05-12
	// 	from : "Behavior,FeralHeartCarryBehavior,Modification.VitalRegenMultiplier[2]",
	// 	  to : "Behavior,FeralHeartCarryBehavior,Modification.VitalRegenMultiplier[1]"
	// },
	{
		from : "Behavior,TalentBucketVigorousAssault,Modification.VitalDamageLeechArray[0].KindArray[2]",
		  to : "Behavior,TalentBucketVigorousAssault,Modification.VitalDamageLeechArray[0].KindArray[0]"
	},
	// { // deprecated 2016-05-12
	// 	from : "Behavior,TalentBucketVampiricAssaultTychus,Modification.VitalDamageLeechArray[0].KindArray[2]",
	// 	  to : "Behavior,TalentBucketVampiricAssaultTychus,Modification.VitalDamageLeechArray[0].KindArray[0]"
	// },
	// { // deprecated 2016-05-12
	// 	from : "Effect,StormBoltRefundMasteryModifyUnit,Cost[0].Fraction.Vital[2]",
	// 	  to : "Effect,StormBoltRefundMasteryModifyUnit,Cost[0].Fraction.Vital[0]"
	// },
	// { // deprecated 2016-05-12
	// 	from : "Abil,MuradinStormBolt,Cost[0].Vital[2]",
	// 	  to : "Abil,MuradinStormBolt,Cost[0].Vital[0]"
	// },
	{
		from : "Behavior,TalentBucketVigorousStrike,Modification.VitalDamageLeechArray[0].KindArray[2]",
		  to : "Behavior,TalentBucketVigorousStrike,Modification.VitalDamageLeechArray[0].KindArray[0]"
	},
	{
		from : "Effect,OdinRagnarokMissilesDamage,Amount",
		  to : "Effect,TychusOdinRagnarokMissilesDamage,Amount"
	},
	{
		from : "Effect,JainaArcaneIntellectBasicAttackManaRestore,VitalArray[2].Change",
		  to : "Effect,JainaArcaneIntellectBasicAttackManaRestore,VitalArray[0].Change"
	},
	{
		from : "Effect,JainaArcaneIntellectAbilityDamageManaRestore,VitalArray[2].Change",
		  to : "Effect,JainaArcaneIntellectAbilityDamageManaRestore,VitalArray[0].Change"
	},
	{	// 42742
		from : 'Behavior,FalstadHammerGains,Modification.VitalDamageLeechArray[0].KindArray[2]',
		  to : 'Behavior,FalstadHammerGains,Modification.VitalDamageLeechArray[0].KindArray[0]'
	},
	{	// 42742
		from : 'Unit,HeroChromie,Sight',
		  to : 'Behavior,ChromieDragonsBreathDeepBreathingMaxStack,Modification.SightBonus'
	}
];

exports.REMOVE_SUBUNITS =
{
	"LostVikings" : ["HeroBaleog", "HeroErik", "HeroOlaf"],
	"Chen"        : ["HeroChenEarth", "HeroChenFire", "HeroChenStorm"],
	"Medic"       : ["MedicMedivacDropship"],
	"Medivh"			: ["HeroMedivhRaven"]
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
			name : "Select Olaf",
			icon : "storm_ui_icon_lostvikings_selectolaf.dds"
		},
		{
			id : "LostVikingSelectBaleog",
			shortcut : "2",
			name : "Select Baleog",
			icon : "storm_ui_icon_lostvikings_selectbaleog.dds"
		},
		{
			id : "LostVikingSelectErik",
			shortcut : "3",
			name : "Select Erik",
			icon : "storm_ui_icon_lostvikings_selecterik.dds"
		},
		{
			id : "LostVikingSelectAll",
			shortcut : "4",
			name : "Select All Vikings",
			icon : "storm_ui_icon_lostvikings_selectall.dds"
		}
	]
};

exports.USE_ABILITY_NAME =
[
	"FaerieDragon", "Tassadar"
];

exports.ABILITY_ID_DESCRIPTION_IDS =
{
	"Rehgar" : {"RehgarGhostWolfActivate" : "RehgarGhostWolf"},
	"Jaina" : {"JainaConeOfCold" : "JainaConeofCold"}
};

exports.HERO_MAX_LEVEL = 20;

exports.HERO_TALENT_LEVELS = [1, 4, 7, 10, 13, 16, 20];

exports.MOUNT_JSON_SCHEMA =
{
	name : "mount",
	type : "object",
	additionalProperties : true,
	properties           :
	{
		id          : { type : "string", minLength : 1 },
		attributeid : { type : "string", minLength : 1 },
		name        : { type : "string", minLength : 1 },
		description : { type : "string", minLength : 1 },
		releaseDate : { type : "string", pattern : "2[0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]" },
		variation   : { type : "boolean" },
		productid   : { type : "integer" },
		category    : { type : "string", minLength : 1 },
	}
};

exports.MOUNT_JSON_SCHEMA.required = Object.keys(exports.MOUNT_JSON_SCHEMA.properties);
exports.MOUNT_JSON_SCHEMA.required.remove("productid");

exports.HERO_JSON_SCHEMA =
{
	name                 : "hero",
	type                 : "object",
	additionalProperties : false,
	properties           :
	{
		id          : { type : "string", minLength : 1 },
		attributeid : { type : "string", minLength : 1 },
		name        : { type : "string", minLength : 1 },
		title       : { type : "string", minLength : 1 },
		description : { type : "string", minLength : 1 },
		icon        : { type : "string", minLength : 1 },
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
						required : ["id", "name", "description", "icon"],
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
							shortcut          : { type : "string", minLength : 1, maxLength : 1 },
							icon              : { type : "string", minLength : 1 }
						}
					}
				}
			}
	}
};

var HERO_TALENT_TIER_JSON_SCHEMA =
{
	type : "array",
	minItems : 1,
	maxItems : 7,
	items :
		{
			type : "object",
			additionalProperties : false,
			required : ["id", "name", "description", "icon"],
			properties :
			{
				id           : { type : "string", minLength : 1 },
				name         : { type : "string", minLength : 1 },
				description  : { type : "string", minLength : 1 },
				prerequisite : { type : "string", minLength : 1 },
				cooldown     : { type : "number", minimum : 0 },
				icon         : { type : "string", minLength : 1 }
			}
		}
};

exports.HERO_TALENT_LEVELS.forEach(function(HERO_TALENT_LEVEL) { exports.HERO_JSON_SCHEMA.properties.talents.properties[HERO_TALENT_LEVEL] = base.clone(HERO_TALENT_TIER_JSON_SCHEMA, true); });
exports.HERO_JSON_SCHEMA.properties.talents.required = exports.HERO_TALENT_LEVELS.map(function(HERO_TALENT_LEVEL) { return ""+HERO_TALENT_LEVEL; });

exports.HERO_JSON_SCHEMA.required = Object.keys(exports.HERO_JSON_SCHEMA.properties);

exports.HERO_JSON_SCHEMA.properties.talents.properties[10].minItems = 2;
exports.HERO_JSON_SCHEMA.properties.talents.properties[10].maxItems = 3;
