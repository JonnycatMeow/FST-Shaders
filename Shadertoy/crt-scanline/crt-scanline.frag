#pragma header
vec2 uv = openfl_TextureCoordv.xy;
vec2 fragCoord = openfl_TextureCoordv*openfl_TextureSize;
vec2 iResolution = openfl_TextureSize;
uniform float iTime;
#define iChannel0 bitmap
#define texture flixel_texture2D
#define fragColor gl_FragColor
//shaderlink: https://www.shadertoy.com/view/MtlyDX
vec3 scanline(vec2 coord, vec3 screen){
    const float scale = .66;
    const float amt = 0.02;// intensity of effect
    const float spd = 1.0;//speed of scrolling rows transposed per second
    
	screen.rgb += sin((coord.y / scale - (iTime * spd * 6.28))) * amt;
	return screen;
}

vec2 fisheye(vec2 uv, float str )
{
    vec2 neg1to1 = uv;
    neg1to1 = (neg1to1 - 0.5) * 2.0;		
		
    vec2 offset;
    offset.x = ( pow(neg1to1.y,2.0)) * str * (neg1to1.x);
    offset.y = ( pow(neg1to1.x,2.0)) * str * (neg1to1.y);
	
    return uv + offset;	     
}

vec3 channelSplit(sampler2D tex, vec2 coord){
    const float spread = 0.008;
	vec3 frag;
	frag.r = texture(tex, vec2(coord.x - spread * sin(iTime), coord.y)).r;
	frag.g = texture(tex, vec2(coord.x, 					  coord.y)).g;
	frag.b = texture(tex, vec2(coord.x + spread * sin(iTime), coord.y)).b;
	return frag;
}

void main(){
	vec2 fisheyeUV = fisheye(uv, 0.03);
	fragColor.rgb = channelSplit(iChannel0, fisheyeUV);
	vec2 screenSpace = fisheyeUV * iResolution.xy;
	fragColor.rgb = scanline(screenSpace, fragColor.rgb);
    //alpha support 
    gl_FragColor.a = flixel_texture2D(bitmap, openfl_TextureCoordv).a;
}