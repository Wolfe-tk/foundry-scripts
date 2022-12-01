// Clear out spell effects in the spell details tab, and set target to self
// Create a new AE for the spell and add the following options to the effects tab
// flags.midi-qol.onUseMacroName | Custom | ItemMacro.Zephyr Strike,preAttackRoll
// flags.midi-qol.onUseMacroName | Custom | ItemMacro.Zephyr Strike,postAttackRoll
// flags.dnd5e.DamageBonusMacro | Custom | ItemMacro

let active = args[0].actor.effects.find(e => e.label === "Zephyr Strike Advantage Active");
let used = args[0].actor.effects.find(e => e.label === "Zephyr Strike").getFlag('world','zephyrStrikeUsed');
try {
    if (args[0].macroPass === "DamageBonus") {
        if (active && args[0].hitTargets.length > 0) {
            // Use same roll options as the one from the damageRoll
            const dmgOptions = args[0].damageRoll?.options ? duplicate(args[0].damageRoll.options) : {};
            dmgOptions.critical = args[0].isCritical;
            delete dmgOptions.configured;
            delete dmgOptions.flavor;
            delete dmgOptions.criticalBonusDice;
            // Construct a DamageRoll to compute critical damage using the appropriate defined method and use the resulting formula
            const damageBonusResult = new CONFIG.Dice.DamageRoll("1d8[force]", args[0].rollData, dmgOptions);
            return {damageRoll: damageBonusResult.formula, flavor: "Zephyr Strike Damage"};
        }
        return;	
    }
    //
    if (args[0].macroPass === "postAttackRoll" && active && !args[0].hitTargets.length){
        active.delete();
        return;
    }

    if (args[0].macroPass === "preAttackRoll"){
        if (args[0].itemData.type === "weapon" && !used){
            let dialog = new Promise((resolve, reject) => {
                new Dialog({
                    title: "Use Zephyr Strike?",
                    content: "Do you want to use Zephyr Strike Advantage and Extra Dice?",
                    buttons: {
                        one: {
                            icon: '<i class="fas fa-check"></i>',
                            label: "Yes",
                            callback: () => resolve(true)
                        },
                        two: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "No",
                            callback: () => {resolve(false)}
                        }
                    },
                    default: "two"
                }).render(true);
            });
            let result = await dialog;
            if(result === false) return;

            const zephyrStrikeAdvantage = {
                changes: [
                {
                    key: "flags.midi-qol.advantage.attack.mwak",
                    mode: 0,
                    value: 1,
                    priority: 0
                },
                {
                    key: "flags.midi-qol.advantage.attack.rwak",
                    mode: 0,
                    value: 1,
                    priority: 0
                }
                ],
                origin: args[0].actorUuid,
                disabled: false,
                icon: args[0].item.img,
                label: "Zephyr Strike Advantage Active",
            };
            setProperty(zephyrStrikeAdvantage, "flags.dae.specialDuration", ["1Attack"]);
            await args[0].actor.createEmbeddedDocuments("ActiveEffect", [zephyrStrikeAdvantage]);

            const zephyrStrikeSpeed = {
                changes: [
                {
                    key: "system.attributes.movement.walk",
                    mode: 2,
                    value: 30,
                    priority: 20
                }
                ],
                origin: args[0].actorUuid,
                disabled: false,
                icon: args[0].item.img,
                label: "Zephyr Strike Speed Buff Active",
            };
            setProperty(zephyrStrikeSpeed, "flags.dae.specialDuration", ["turnStartSource"]);
            await args[0].actor.createEmbeddedDocuments("ActiveEffect", [zephyrStrikeSpeed]);

            actor.effects.find(e => e.label === "Zephyr Strike").setFlag('world', 'zephyrStrikeUsed', true);
        }
    }
} 
catch (err) {
    console.error(`${args[0].itemData.name} - Zephyr Strike`, err);
    return {}
}



                
                    