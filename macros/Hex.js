// Based on Hunter's Mark macro posted by Tposney, midi dev, in Foundry discord
const version = "10.0.23";
try {
	if (args[0].macroPass === "DamageBonus") {
		if (actor.flags?.dae?.onUpdateTarget && args[0].hitTargets.length > 0) {
			const isMarked = actor.flags.dae.onUpdateTarget.find(flag => 
					flag.flagName === "Hex" && flag.sourceTokenUuid === args[0].hitTargetUuids[0]);
			if (isMarked) {
					// Use same roll options as the one from the damageRoll
                    const dmgOptions = args[0].damageRoll?.options ? duplicate(args[0].damageRoll.options) : {};
                    dmgOptions.critical = args[0].isCritical;
                    delete dmgOptions.configured;
                    delete dmgOptions.flavor;
                    // Construct a DamageRoll to compute critical damage using the appropriate defined method and use the resulting formula
                    const damageBonusResult = new CONFIG.Dice.DamageRoll("1d6[necrotic]", args[0].rollData, dmgOptions);
					return {damageRoll: damageBonusResult.formula, flavor: 'Hex Damage'};
			}	
		}
		return {};
	} else if (args[0].macroPass === "preItemRoll") {
		// check if we are already marking and if the marked target is dead.
        const markedTarget = actor.flags.dae.onUpdateTarget.find(flag => flag.flagName === "Hex")?.sourceTokenUuid;
		if (markedTarget) {
			const target = await fromUuid(markedTarget);
			if (!target || target.actor.system.attributes.hp.value <= 0) { //marked target is dead or removed so don't consume a resource
                const currentDuration = duplicate(actor.effects.find(ef => ef.label === game.i18n.localize("midi-qol.Concentrating")).duration);
				const useHookId = Hooks.on("dnd5e.preUseItem", (hookItem, config, options) => {
					if (hookItem !== item) return;
					options.configureDialog = false;
					config.consumeSpellLevel = false;
					Hooks.off("dnd5e.preUseItem", useHookId);
				});
				const effectHookId = Hooks.on("preCreateActiveEffect", (effect, data, options, user) => {
					if (effect.label === game.i18n.localize("midi-qol.Concentrating")) {
						effect.updateSource({"duration": currentDuration});
						Hooks.off("dnd5e.preCreateActiveEffect", effectHookId);
					}
					return true;
				})
			}
		}
		return true;
	}
} catch (err) {
	    console.error(`${args[0].itemData.name} - Hunter's Mark ${version}`, err);
		return {}
}