Hooks.on("midi-qol.preAttackRoll", function (workflow) {
    let targetActor = workflow.targets.first().actor;
    let effect = !!targetActor.effects.find(i=> i.label === "Protection from Good and Evil" || i.label === "Protection from Evil and Good");
    let attackerType = ["aberration", "celestial", "elemental", "fey", "fiend", "undead"].includes(workflow.actor.data.data.details?.type.value);
    if(!(effect && attackerType)) return {};
    workflow.disadvantage = true;
  });