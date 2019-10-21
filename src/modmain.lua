local require = GLOBAL.require
--Bosses that spawn and are aggresive towards players
local Bosses = {"deerclops", "bearger", "toadstool", "klaus", "stalker_atrium"}

--Bosses that passively roam around the world
local PassiveBosses = {"dragonfly", "moose", "minotaur", "antlion"}


for i,v in ipairs(Bosses) do
	AddPrefabPostInit(v, function(inst)
        print("[Boss Spawned] ", inst)
        inst:ListenForEvent("death", function(inst)
            print("[Boss Killed] ", inst)
        end)
	end)
end

for i,v in ipairs(PassiveBosses) do
	AddPrefabPostInit(v, function(inst)        
        inst:ListenForEvent("death", function(inst)
            print("[Boss Killed] ", inst)
        end)
	end)
end

AddPrefabPostInit("world", function()
    GLOBAL.TheWorld:ListenForEvent("resetruins", function()
        print("[Boss Killed] ancient_fuelweaver")
    end)
end)