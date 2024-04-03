#pragma header
vec2 fragCoord = openfl_TextureCoordv*openfl_TextureSize;
vec2 iResolution = openfl_TextureSize;
uniform float iTime;
#define iChannel0 bitmap
#define texture texture2D
#define fragColor gl_FragColor
uniform sampler2D iChannel1; //the static image texture for it 
vec3 CA(sampler2D tex, vec2 uv)
{
    float strength = 0.01;
    float r = texture(tex, uv + vec2(0.0, strength)).r;
    float g = texture(tex, uv).g;
    float b = texture(tex, uv + vec2(0.0, -strength)).b;
    vec3 final = vec3(r,g,b);
    return final;
}

vec3 Sharpen(sampler2D tex, vec2 uv)
{
    float strength = 0.0075;
    vec3 tl = CA(tex, uv + vec2(-strength, strength)).rgb;
    vec3 tm = CA(tex, uv + vec2(0.0, strength)).rgb;
    vec3 tr = CA(tex, uv + vec2(strength, strength)).rgb;
    vec3 ml = CA(tex, uv + vec2(-strength, 0.0)).rgb;
    vec3 mr = CA(tex, uv + vec2(strength, 0.0)).rgb;
    vec3 bl = CA(tex, uv + vec2(-strength, -strength)).rgb;
    vec3 bm = CA(tex, uv + vec2(0.0, -strength)).rgb;
    vec3 br = CA(tex, uv + vec2(strength, -strength)).rgb;
    vec3 final = (tl+tm+tr+ml+mr+bl+bm+br)/8.0;
    final = mix(texture(tex, uv).rgb, final, -2.0);
    return final;
}

vec3 Blur(sampler2D tex, vec2 uv)
{
    float strength = 0.0025;
    vec3 tl = Sharpen(tex, uv + vec2(-strength, strength)).rgb;
    vec3 tm = Sharpen(tex, uv + vec2(0.0, strength)).rgb;
    vec3 tr = Sharpen(tex, uv + vec2(strength, strength)).rgb;
    vec3 ml = Sharpen(tex, uv + vec2(-strength, 0.0)).rgb;
    vec3 mr = Sharpen(tex, uv + vec2(strength, 0.0)).rgb;
    vec3 bl = Sharpen(tex, uv + vec2(-strength, -strength)).rgb;
    vec3 bm = Sharpen(tex, uv + vec2(0.0, -strength)).rgb;
    vec3 br = Sharpen(tex, uv + vec2(strength, -strength)).rgb;
    vec3 final = (tl+tm+tr+ml+mr+bl+bm+br)/8.0;
    return final;
}

vec2 DistortUV(vec2 uv)
{
    float offs = texture(iChannel1, vec2(iTime, uv.y * 0.5)).r;
    offs -= 0.5;
    offs *= 2.0;
    offs *= 0.0025;
    uv.x += offs;
    return uv;
}

vec3 ColourCorrect(vec3 col)
{
    col += 0.1;
    col = clamp(col, vec3(0.0), vec3(1.0));
    col = pow(col, vec3(0.8));
    col /= 1.5;
    col = clamp(col, vec3(0.0), vec3(1.0));
    return col;
}

vec3 Finalize(vec3 col, vec2 uv)
{
    float bars = texture(iChannel1, vec2(iTime, uv.y * 0.1)).g;
    col += vec3(bars) * vec3(0.05, 0.01, 0.005);
    float n = texture(iChannel1, uv * 0.45 + (iTime * texture(iChannel1, vec2(iTime)).r)).b;
    n *= 0.05;
    return (col * n) + col / 1.1;
}

void main()
{
    vec2 uv = fragCoord/iResolution.xy;
    uv = DistortUV(uv);
    
    vec3 colour = Blur(iChannel0, uv);
    colour = ColourCorrect(colour);
    colour = Finalize(colour, uv);
    
      
    vec4 col = texture(iChannel0, uv);
    float bar = abs(uv.x - 0.5);
    bar = step(bar, 0.425);
    col *= bar;
    
    fragColor = col;
    fragColor = vec4(colour, 1.0);
    gl_FragColor.a = texture2D(bitmap, openfl_TextureCoordv).a;
}
