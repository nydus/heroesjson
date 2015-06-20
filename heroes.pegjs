{
	var test=2;
}

START
  = additive

additive
	= left:multiplicative _ "+" _ right:additive { return left + right; }
	/ multiplicative

multiplicative
	= left:primary _ "*" _ right:primary { return left * right; }
	/ primary

primary
	= integer
	/ xmlprimary
	/ "(" additive:additive ")" { return additive; }

xmlprimary
	= chars:[A-Za-z0-9,._\[\]-]+ { return 0; }

integer "integer"
	= digits:[0-9]+ { return parseInt(digits.join(""), 10); }

_ "whitespace"
	= whitespace*

__ "whitespace"
	= whitespace+

whitespace "whitespace"
	= [ \t\v\f\r\n\u00A0\uFEFF\u1680\u180E\u2000-\u200A\u202F\u205F\u3000]


/*
100*Behavior,TalentGatheringPowerCarry,Modification.DamageDealtFraction[Spell]


100*Behavior,TalentGatheringPowerStack,Modification.DamageDealtFraction[Spell]
((Behavior,TalentGatheringPowerStack,MaxStackCount*Behavior,TalentGatheringPowerStack,Modification.DamageDealtFraction[Spell])+Behavior,TalentGatheringPowerCarry,Modification.DamageDealtFraction[Spell])*100
100*Behavior,TalentGatheringPowerCarry,Modification.DamageDealtFraction[Spell]
Abil,TalentHealingWard,Cost[0].Cooldown.TimeUse
Effect,EnvenomDamage,Amount * (Behavior,Envenom,Duration + 1)
Behavior,Envenom,Duration
100*Behavior,NovaOneintheChamber,Modification.DamageDealtFraction[Ranged]
Effect,TripleTapLaunchPersistent,PeriodCount
Effect,TripleTapMissileDamage,Amount
Effect,PrecisionStrikeDamage,Amount*(Behavior,Artifact_AP_Base,Modification.DamageDealtFraction[Spell]+1)
Behavior,CloakMoveSpeedBuff,Modification.UnifiedMoveSpeedFactor*100
Effect,NovaAdvancedCloakingCreateHealer,RechargeVitalFraction*100
Behavior,DamageReductionSpell50Controller,DamageResponse.ModifyFraction *100
Behavior,SpellShieldActive,Duration
Behavior,SpellShieldCooldown,Duration
Abil,TalentOverdrive,Cost[0].Cooldown.TimeUse
Behavior,BucketOverdrive,Modification.DamageDealtFraction[Spell]*100
Behavior,BucketOverdrive,Duration
Abil,TalentRewind,Cost[0].Cooldown.TimeUse
Abil,FlashoftheStorms,Cost[0].Cooldown.TimeUse*/
