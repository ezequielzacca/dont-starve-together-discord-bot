local require = GLOBAL.require
-- Bosses that spawn and are aggresive towards players
local Bosses = {"deerclops", "bearger", "toadstool", "klaus", "stalker_atrium"}

-- Bosses that passively roam around the world
local PassiveBosses = {"dragonfly", "moose", "minotaur", "antlion"}

for i, v in ipairs(Bosses) do
    AddPrefabPostInit(v, function(inst)
        print("[Boss Spawned] :", inst)
        inst:ListenForEvent("death", function(inst)
            local killers = ""
            local mobPosition = inst:GetPosition()
            for k, v in pairs(GLOBAL.FindPlayersInRange(mobPosition.x,
                                                        mobPosition.y,
                                                        mobPosition.z, 20, true)) do
                killers = killers .. v.userid .. "@" .. v.name .. "@" ..
                              v.prefab .. "|"
            end
            print("[Boss Killed] : ", inst, " : ", killers)
        end)
    end)
end

for i, v in ipairs(PassiveBosses) do
    AddPrefabPostInit(v, function(inst)
        inst:ListenForEvent("death", function(inst)
            local killers = ""
            local mobPosition = inst:GetPosition()
            for k, v in pairs(GLOBAL.FindPlayersInRange(mobPosition.x,
                                                        mobPosition.y,
                                                        mobPosition.z, 20, true)) do
                killers = killers .. v.userid .. "@" .. v.name .. "@" ..
                              v.prefab .. "|"
            end
            print("[Boss Killed] : ", inst, " : ", killers)
        end)
    end)
end

AddPrefabPostInit("world", function()
    GLOBAL.TheWorld:ListenForEvent("resetruins", function(inst)
        print("[World Event] Ruins Reset")
    end)

    GLOBAL.TheWorld:ListenForEvent("ms_playerjoined", function(inst, player)
        print("ms_playerjoined")
        if player.prefab ~= nil then
            local playerData = player.userid .. "@" .. player.name .. "@" ..
                                   player.prefab
            print("[Player Connected] : ", playerData)
        end
    end)

    GLOBAL.TheWorld:ListenForEvent("ms_playerdisconnected", function(inst, data)
        print("ms_playerdisconnected")
        if data.player.prefab ~= nil then
            local playerData = data.player.userid .. "@" .. data.player.name ..
                                   "@" .. data.player.prefab
            print("[Player Disconnected] : ", playerData)
        end
    end)

    GLOBAL.TheWorld:ListenForEvent("ms_newplayercharacterspawned",
                                   function(inst, data)
        print("ms_newplayercharacterspawned")
        local playerData =
            data.player.userid .. "@" .. data.player.name .. "@" ..
                data.player.prefab
        print("[Player Picked] : ", playerData)
    end)

    --  season change
    GLOBAL.TheWorld:ListenForEvent("seasontick", function(inst, data)
        if data.remainingdaysinseason == 4 then
            print("[Season End Close] : ", data.season)
        end
    end)

    --  cycle change    
    GLOBAL.TheWorld:ListenForEvent("cycleschanged", function(inst, cycle)
        print("[Cycle Changed] : ", cycle)

        -- if isFullMoonNear then print("[Moon Phase Close] : full") end
        -- if isNewMoonNear then print("[Moon Phase Close] : new") end
    end)
end)
