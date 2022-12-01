//Create a DAE on the Piercer feature, make it to Transfer to actor on Item equip
//and the effect should be a
//flags.midi-qol.onUseMacroName | CUSTOM | ItemMacro.Piercer,postDamageRoll
//with the following macro inside the ItemMacro.

if (args[0].hitTargets.length < 1 || args[0].item.system.damage.parts[0][1] !== "piercing") return {};
const roll = args[0].damageRoll;
if (!roll.terms[0].faces) return;
const dieSize = roll.terms[0].faces;
const lowDice = Math.min(... roll.terms[0].values)
const rollRatio = lowDice / dieSize;
console.log(rollRatio);

if (args[0].macroPass === "postDamageRoll" && rollRatio < 0.5) {
    let workflow = MidiQOL.Workflow.getWorkflow(args[0].uuid)
    let response = await Dialog.confirm({
        title: 'Piercer feat',
        content: `<p>${token.name} rolled a ${lowDice} on 1d${dieSize}. Reroll?</p>`,
    });
    if(!response) return;
    let damageRoll = new Roll(`1d${dieSize}`)
    await damageRoll.toMessage({flavor:"the rerolled result"});
    workflow.damageRoll.dice[0].results.find(i=>i.result === lowDice).result = damageRoll.total
}