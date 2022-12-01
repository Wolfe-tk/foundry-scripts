const version = "10.0.10";
try {
    if(args[0].macroPass === "postDamageRoll") {
    if (args[0].hitTargets.length > 0) {
        const token = canvas.tokens.get(args[0].tokenId);
        const maxHP = args[0].actor.system.attributes.hp.max;
        const currentHP = args[0].actor.system.attributes.hp.value;
        let steal = Math.floor(args[0].damageTotal / 2);
        const newHP = Math.clamped(currentHP + steal, 0, maxHP);
    
        ui.notifications.info(`${args[0].actor.name} steals ${steal} HP`);
        const healthUpdate = {
        actor: {
            data: {
                attributes: {
                    hp: {value: newHP}
                            }
                }
            
            }
        }
    await warpgate.mutate(token.document, healthUpdate, {}, {permanent: true});
    const updates = {
        embedded: {
                Item: {
                    "Vampiric Touch (At Will)": {
                        "type": "spell",
                        "system": {
                            "description": {
                            "value": "Vampiric Touch as an action while concentrating"
                            },
                            "activation": {
                            "type": "action",
                            "cost": 1
                            },
                            "target": {
                            "value": 1,
                            "type": "creature"
                            },
                            "range": {
                            "units": "touch"
                            },
                            "actionType": "msak",
                            "damage": {
                            "parts": [
                                [
                                `${args[0].spellLevel}d6`,
                                "necrotic"
                                ]
                            ]
                            },
                            "preparation": {
                            "mode": "atwill"
                            }
                        },
                        "flags": {
                            "midi-qol": {
                            "onUseMacroName": "[postDamageRoll]ItemMacro"
                            },
                            "itemacro": {
                            "macro": {
                                "name": "Vampiric Touch",
                                "type": "script",
                                "scope": "global",
                                "command": "try {\n    if (args[0].hitTargets.length > 0) {\n        const token = canvas.tokens.get(args[0].tokenId)\n        const maxHP = args[0].actor.system.attributes.hp.max;\n        const currentHP = args[0].actor.system.attributes.hp.value;\n        let steal = Math.floor(args[0].damageTotal / 2);\n        const newHP = Math.clamped(currentHP + steal, 0, maxHP);\n      \n        ui.notifications.info(`${args[0].actor.name} steals ${steal} HP`);\n        const healthUpdate = {\n        actor: {\n            data: {\n                attributes: {\n                    hp: {value: newHP}\n                            }\n                }\n            \n            }\n    }\n    await warpgate.mutate(token.document, healthUpdate, {}, {permanent: true})\n    }\n} catch (err)  {\n    console.error(`${args[0].itemData.name} - Vampiric Touch`, err);\n}"
                            }
                            }
                        },
                        "img": "icons/magic/unholy/strike-beam-blood-red-gray.webp",
                    }
                }
                }
        }
            //update the token and create the necessary attack spell
        await warpgate.mutate(token.document, updates);
        ui.notifications.info(`Vampiric Touch (At Will) has been added to your At-Will spells.`);
        }
    }
if (args[0] === "off")
    {
        const token = canvas.tokens.get(args[1]);
        await warpgate.revert(token.document);
        ui.notifications.info(`Vampiric Touch (At Will) has been removed from your At-Will spells.`);
    }
} catch (err)  {
    console.error(`${args[0].itemData.name} - Vampiric Touch`, err);
}