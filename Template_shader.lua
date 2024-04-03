local shaderName = "hallucination" --Shader name (you can change) 
function onCreate()
    shaderCoordFix() -- initialize a fix for textureCoord when resizing game window

    makeLuaSprite("shader") --don't touch this
    makeGraphic("shaderImage", screenWidth, screenHeight)  --don't touch this

   setSpriteShader("shaderImage", "shader")  --don't touch this

    --don't touch this
    runHaxeCode([[
        var shaderName = "]] .. shaderName .. [[";
        
        game.initLuaShader(shaderName);
        
        var shader0 = game.createRuntimeShader(shaderName);
        game.camGame.setFilters([new ShaderFilter(shader0)]);
        game.getLuaObject("shader").shader = shader0; // setting it into temporary sprite so luas can set its shader uniforms/properties
        game.camGame.setFilters([new ShaderFilter(game.getLuaObject("shader").shader)]);
        return;
    ]])
end
 --don't touch this (unless your shader don't have iTime)
function onUpdate(elapsed)
    setShaderFloat("shader", "iTime", os.clock())
 end
 --don't touch this
function shaderCoordFix()
    runHaxeCode([[
        resetCamCache = function(?spr) {
            if (spr == null || spr.filters == null) return;
            spr.__cacheBitmap = null;
            spr.__cacheBitmapData = null;
        }
        
        fixShaderCoordFix = function(?_) {
            resetCamCache(game.camGame.flashSprite);
        }
    
        FlxG.signals.gameResized.add(fixShaderCoordFix);
        fixShaderCoordFix();
        return;
    ]])
     --don't touch this
    local temp = onDestroy
    function onDestroy()
        runHaxeCode([[
            FlxG.signals.gameResized.remove(fixShaderCoordFix);
            return;
        ]])
        if (temp) then temp() end
    end
end