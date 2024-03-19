#pragma header
vec2 fragCoord = openfl_TextureCoordv*openfl_TextureSize;
vec2 iResolution = openfl_TextureSize;
//uniform float iTime; //don't need it 
#define iChannel0 bitmap
#define texture texture2D
#define fragColor gl_FragColor
#define CRT_STRENGTH 0.8
#define CA_MAX_PIXEL_DIST 5.0
#define BORDER_SIZE 0.2
#define BORDER_STRENGTH 0.8
#define SATURATION 1.4
//shadertoy link: https://www.shadertoy.com/view/MdcfzH 
vec4 read(vec2 uv)
{
    //you might wanna do stuff here when using this in your shader
    return texture(iChannel0, uv);
}
vec3 saturation(vec3 rgb, float amount)
{
    const vec3 W = vec3(0.2125, 0.7154, 0.0721);
    vec3 intensity = vec3(dot(rgb, W));
    return mix(intensity, rgb, amount);
}
void main()
{
    vec2[3] ca;
    ca[0] = vec2(-CA_MAX_PIXEL_DIST, -CA_MAX_PIXEL_DIST);
    ca[1] = vec2(0.0);
    ca[2] = vec2(CA_MAX_PIXEL_DIST, CA_MAX_PIXEL_DIST);
    
    vec2 pixel = 1.0 / iResolution.xy;
    vec2 uv = fragCoord * pixel;


    int row = int(fragCoord.y)%2;
    int col = (int(fragCoord.x)+row)%3;
    
    vec2 nuv = 2. * abs(uv-vec2(0.5));
    vec2 caShift = (length(nuv) / sqrt(2.0)) * pixel;
    
    vec3 src = vec3(0.0);
    for(int i = 0; i < 3; i++)
    {
        src[i] = read(uv - ca[i] * caShift)[i] * ((i==col) ? 1.0 : 1.-CRT_STRENGTH);
    }
    float d = (1.-nuv.x) * (1.-nuv.y);
    d = (1.-BORDER_STRENGTH) + BORDER_STRENGTH * smoothstep(0.0, BORDER_SIZE, sqrt(d));
    src *= d;
    src = saturation(src, SATURATION);
    fragColor = vec4(src,1.0);
    gl_FragColor.a = texture2D(bitmap, openfl_TextureCoordv).a; //alpha support 
}
