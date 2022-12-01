if (args[0].tag === "OnUse") {
    const lastArg = args[args.length - 1];
    const item = await fromUuid(lastArg.itemUuid);
    MidiQOL.addConcentration(lastArg.actor, {item: item, targets: lastArg.targets});
  
  } else {
    if (args[0].actor.flags?.dae?.onUpdateTarget && args[0].hitTargets.length > 0) {
      const isMarked = args[0].actor.flags.dae.onUpdateTarget.find(flag =>
        flag.flagName === "Favored Foe" && flag.sourceTokenUuid === args[0].hitTargetUuids[0]
      );
  
      if (isMarked) {
        const targetUuid = args[0].hitTargets[0].uuid;
        if (targetUuid == getProperty(args[0].actor.flags, "midi-qol.favoredFoeHit")) {
          console.debug("Favored Foe used this turn");
          return {};
        }
  
        const favoredFoeHitData = {
          changes: [
            {
              key: "flags.midi-qol.favoredFoeHit",
              mode: CONST.ACTIVE_EFFECT_MODES.OVERRIDE,
              value: targetUuid,
              priority: 20
            }
          ],
          origin: args[0].actorUuid,
          disabled: false,
          icon: args[0].item.img,
          label: "Favored Foe Hit",
        };
        setProperty(favoredFoeHitData, "flags.dae.specialDuration", ["turnStartSource"]);
        await args[0].actor.createEmbeddedDocuments("ActiveEffect", [favoredFoeHitData]);
  
        const damageType = args[0].item.system.damage.parts[0][1];
        // const diceMult = args[0].isCritical ? 2 : 1;
        const dmgOptions = args[0].damageRoll?.options ? duplicate(args[0].damageRoll.options) : {};
        dmgOptions.critical = args[0].isCritical;
        delete dmgOptions.configured;
        delete dmgOptions.flavor;
        delete dmgOptions.criticalBonusDice;
        console.log(dmgOptions);
        // Construct a DamageRoll to compute critical damage using the appropriate defined method and use the resulting formula
        const damageBonusResult = new CONFIG.Dice.DamageRoll("@scale.ranger.favored-foe", args[0].rollData, dmgOptions);
        return {damageRoll: damageBonusResult.formula, flavor: 'Favored Foe Damage'};
        // return { damageRoll: `${diceMult}${args[0].actor._classes.ranger.scaleValues['favored-foe'].substr(1)}[${damageType}]`, flavor: "Favored Foe" };
      }
    }
  
    return {};
  }

  
                    
                    