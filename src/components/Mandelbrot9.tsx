import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const Mandelbrot9: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    
    const container = containerRef.current;
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(2, 2);
    
    const fragmentShader = `
      uniform float u_time;
      uniform vec2 u_resolution;
      
      // SDF for a 9 - Refined for boldness and scale
      float sdNine(vec2 p) {
          p *= 1.1; // Internal scale adjustment
          
          // Circle part (top of 9)
          float outerRadius = 0.45;
          float innerRadius = 0.15; // Smaller inner radius = bolder look
          float d1 = length(p - vec2(0.0, 0.4)) - outerRadius;
          float d2 = length(p - vec2(0.0, 0.4)) - innerRadius;
          float circle = max(d1, -d2);
          
          // Stem part (right vertical bar)
          vec2 stemP = p - vec2(0.35, -0.15);
          float stemWidth = 0.12; // Wider for bold effect
          float stemHeight = 0.65;
          float d3 = length(max(abs(stemP) - vec2(stemWidth, stemHeight), 0.0));
          
          float shape = min(circle, d3);
          
          // Curve at bottom (tail of 9)
          float d4 = length(p - vec2(0.15, -0.75)) - 0.3;
          float d5 = length(p - vec2(0.15, -0.75)) - 0.12;
          float curve = max(d4, -d5);
          // Only take the bottom-left quadrant of the curve
          if (p.x > 0.15 || p.y > -0.75) curve = 1e10;
          
          return min(shape, curve);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
          
          // Spiral transformation (rotation)
          float angle = u_time * 0.2;
          float s = sin(angle);
          float c = cos(angle);
          mat2 rot = mat2(c, -s, s, c);
          
          vec2 p = rot * uv;
          
          // Dynamic zoom
          float zoom = exp(-mod(u_time * 0.3, 12.0) + 2.0); 
          vec2 center = vec2(-0.745, 0.186); // Nice fractal spot
          
          vec2 z = vec2(0.0);
          vec2 c_val = (p * zoom) + center;
          
          float iter = 0.0;
          const float MAX_ITER = 200.0;
          
          // Mandelbrot loop
          for(float i = 0.0; i < MAX_ITER; i++) {
              z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c_val;
              if(length(z) > 4.0) break;
              iter++;
          }
          
          // Coloring fractal
          vec3 col = vec3(0.0);
          if (iter < MAX_ITER) {
              float val = iter / MAX_ITER;
              // Electric blue/purple palette
              col = 0.5 + 0.5 * cos(3.0 + val * 30.0 + vec3(0.0, 0.4, 0.8));
              // Add some glow
              col *= (0.8 + 0.2 * sin(u_time * 2.0 + length(uv) * 10.0));
          } else {
              // Inside the set
              col = vec3(0.02, 0.0, 0.05);
          }
          
          // Displaying the number 9
          // Smaller multiplier = bigger shape in screen space
          float d9 = sdNine(uv * 2.2); 
          float edge = 0.1 + 0.02 * sin(u_time * 2.5); // Thicker edge
          
          if (d9 < edge) {
              // Highlight the 9 with high-contrast energy
              vec3 energeticColor = 0.6 + 0.4 * cos(u_time * 1.5 + vec3(0.0, 2.0, 4.0));
              col = mix(col, energeticColor, 0.8);
              // Strong glow inside and around the 9
              col += 0.4 / (1.0 + d9 * 25.0);
          }
          
          // Vignette
          col *= 1.2 - length(uv) * 0.7;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `;

    const vertexShader = `
      void main() {
          gl_Position = vec4(position, 1.0);
      }
    `;

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(container.clientWidth, container.clientHeight) }
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const animate = (time: number) => {
      uniforms.u_time.value = time / 1000;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      renderer.setSize(width, height);
      uniforms.u_resolution.value.set(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
};

export default Mandelbrot9;
