#pragma header
// Author: devrique.
// Name: Old Monitor Scanlines.
// Description: Screen scanlines, like some kind of retro monitor.
//              I got the inspiration to do it playing Stay. :)

// Set to 0.0 to stop animation.
// Only integer numbers with float format, or else the animation cuts!
float scanSpeedAdd = 6.0;

// Change this value to change scanline size (> = smaller lines).
float lineCut = 0.1;

// Reduce 'anaglyphIntensity' value to reduce eye stress.
// Adding this two values should result in 1.0.
float whiteIntensity = 0.8;
float anaglyphIntensity = 0.5;

vec2 fragCoord = openfl_TextureCoordv*openfl_TextureSize;
vec2 iResolution = openfl_TextureSize;
uniform float iTime;
#define iChannel0 bitmap
#define texture flixel_texture2D
#define fragColor gl_FragColor

// Anaglyph colors.
vec3 col_r = vec3(0.0, 1.0, 1.0);
vec3 col_l = vec3(1.0, 0.0, 0.0);


void main()
{
    // Normalized pixel coordinates (from 0 to 1).
    vec2 uv = fragCoord/iResolution.xy;
    vec2 uv_right = vec2(uv.x + 0.01, uv.y + 0.01);
    vec2 uv_left = vec2(uv.x - 0.01, uv.y - 0.01);

    // Black screen.
    vec3 col = vec3(0.0);
    
    // Measure speed.
    float scanSpeed = (fract(iTime) * 2.5 / 40.0) * scanSpeedAdd;
    
    // Generate scanlines.
    vec3 scanlines = vec3(1.0) * abs(cos((uv.y + scanSpeed) * 100.0)) - lineCut;
    
    // Generate anaglyph scanlines.
    vec3 scanlines_right = col_r * abs(cos((uv_right.y + scanSpeed) * 100.0)) - lineCut;
    vec3 scanlines_left = col_l * abs(cos((uv_left.y + scanSpeed) * 100.0)) - lineCut;
    
    // First try; a strange mess.
    //vec3 scanlines = cos(cos(sqrt(uv.y)*tan(iTime / 10000.0) * 100.0 * 10.0) * vec3(1.0) * 100.0);
    
    col = smoothstep(0.1, 0.7, scanlines * whiteIntensity)
        + smoothstep(0.1, 0.7, scanlines_right * anaglyphIntensity)
        + smoothstep(0.1, 0.7, scanlines_left * anaglyphIntensity);
    
    // Deform test (WIP, thanks to 'ddoodm' for its Simple Fisheye Distortion!).
    vec2 eyefishuv = (uv - 0.5) * 2.5;
    float deform = (1.0 - eyefishuv.y*eyefishuv.y) * 0.02 * eyefishuv.x;
    //deform = 0.0;
    
    // Add texture to visualize better the effect.
    vec4 texture1 = texture(iChannel0, vec2(uv.x - deform*0.95, uv.y));
    
    // Add vignette effect.
    float bottomRight = pow(uv.x, uv.y * 100.0);
    float bottomLeft = pow(1.0 - uv.x, uv.y * 100.0);
    float topRight = pow(uv.x, (1.0 - uv.y) * 100.0);
    float topLeft = pow(uv.y, uv.x * 100.0);
    
    float screenForm = bottomRight
        + bottomLeft
        + topRight
        + topLeft;

    // Invert screenForm color.
    vec3 col2 = 1.0-vec3(screenForm);
    
    // Output to screen.
    // Invert last 0.1 and 1.0 positions for image processing.
    fragColor = texture1 + vec4((smoothstep(0.1, 0.9, col) * 0.1), 1.0);
    fragColor = vec4(fragColor.rgb * col2, fragColor.a);

    //alpha support 
    gl_FragColor.a = flixel_texture2D(bitmap, openfl_TextureCoordv).a;
}