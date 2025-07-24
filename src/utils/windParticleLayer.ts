import mapboxgl from 'mapbox-gl';
import { getDTNToken } from '@/utils/dtnTokenManager';

interface WindParticleLayerOptions {
  id: string;
  dtnLayerId: string;
  tileSetId: string;
  map: mapboxgl.Map;
  // Add any other options you might need for particle styling or behavior
}

class WindParticleLayer implements mapboxgl.CustomLayerInterface {
  id: string;
  type: 'custom';
  renderingMode?: '2d' | '3d';
  map: mapboxgl.Map;

  private dtnLayerId: string;
  private tileSetId: string;
  private gl: WebGLRenderingContext | null = null;
  private program: WebGLProgram | null = null;
  private buffer: WebGLBuffer | null = null;
  private windData: any[] = []; // To store fetched wind data
  private animationFrameId: number | null = null;
  private particlePositions: Float32Array | null = null;
  private particleVelocities: Float32Array | null = null;
  private particleCount: number = 5000; // Example particle count
  private animationSpeed: number = 0.05; // Example animation speed

  constructor(options: WindParticleLayerOptions) {
    this.id = options.id;
    this.type = 'custom';
    this.renderingMode = '2d'; // Or '3d' if you need perspective
    this.map = options.map;
    this.dtnLayerId = options.dtnLayerId;
    this.tileSetId = options.tileSetId;
  }

  onAdd(map: mapboxgl.Map, gl: WebGLRenderingContext) {
    this.gl = gl;

    // Basic WebGL setup (will be expanded later)
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
        gl_PointSize = 2.0;
      }
    `;
    const fragmentShaderSource = `
      void main() {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White particles
      }
    `;

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vertexShader);
    gl.attachShader(this.program, fragmentShader);
    gl.linkProgram(this.program);

    this.buffer = gl.createBuffer();

    // Fetch wind data
    this.fetchWindData();
  }

  onRemove(map: mapboxgl.Map, gl: WebGLRenderingContext) {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.program) {
      gl.deleteProgram(this.program);
    }
    if (this.buffer) {
      gl.deleteBuffer(this.buffer);
    }
    this.gl = null;
    this.program = null;
    this.buffer = null;
    this.windData = [];
    this.particlePositions = null;
    this.particleVelocities = null;
  }

  render(gl: WebGLRenderingContext, matrix: number[]) {
    if (!this.program || !this.buffer || !this.particlePositions) {
      return;
    }

    gl.useProgram(this.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
    gl.bufferData(gl.ARRAY_BUFFER, this.particlePositions, gl.DYNAMIC_DRAW);

    const a_position = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(a_position);
    gl.vertexAttribPointer(a_position, 2, gl.FLOAT, false, 0, 0);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, this.particleCount);

    this.map.triggerRepaint(); // Request a new frame for animation
  }

  private async fetchWindData() {
    try {
      const token = getDTNToken();
      const authToken = token.replace('Bearer ', '');
      
      // Assuming this endpoint provides vector data for wind
      // You might need to adjust the URL and parsing based on actual DTN API for vector wind data
      const response = await fetch(`https://map.api.dtn.com/v2/tiles/${this.dtnLayerId}/${this.tileSetId}/0/0/0.pbf?token=${authToken}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wind data: ${response.status} ${response.statusText}`);
      }

      // For a real implementation, you'd parse the PBF (vector tile) data
      // and extract wind vectors (direction and speed) for each point.
      // For now, we'll simulate some data.
      this.windData = this.generateMockWindData(this.particleCount);
      this.initializeParticles();
      this.startAnimation();

    } catch (error) {
      console.error('Error fetching wind data for particle layer:', error);
    }
  }

  private generateMockWindData(count: number) {
    const mockData = [];
    for (let i = 0; i < count; i++) {
      // Mock position (normalized device coordinates for simplicity)
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      // Mock direction (0-360 degrees) and speed
      const direction = Math.random() * 360;
      const speed = Math.random() * 10 + 1; // 1 to 11 units
      mockData.push({ position: [x, y], direction, speed });
    }
    return mockData;
  }

  private initializeParticles() {
    this.particlePositions = new Float32Array(this.particleCount * 2); // x, y for each particle
    this.particleVelocities = new Float32Array(this.particleCount * 2); // vx, vy for each particle

    this.windData.forEach((wind, i) => {
      const angleRad = (wind.direction - 90) * Math.PI / 180; // Convert to radians, adjust for GLSL coords
      const vx = Math.cos(angleRad) * wind.speed * 0.001; // Scale speed for animation
      const vy = Math.sin(angleRad) * wind.speed * 0.001;

      this.particlePositions[i * 2] = wind.position[0];
      this.particlePositions[i * 2 + 1] = wind.position[1];
      this.particleVelocities[i * 2] = vx;
      this.particleVelocities[i * 2 + 1] = vy;
    });
  }

  private startAnimation() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    const animate = () => {
      if (!this.particlePositions || !this.particleVelocities) return;

      for (let i = 0; i < this.particleCount; i++) {
        this.particlePositions[i * 2] += this.particleVelocities[i * 2] * this.animationSpeed;
        this.particlePositions[i * 2 + 1] += this.particleVelocities[i * 2 + 1] * this.animationSpeed;

        // Simple boundary wrap-around (normalize to -1 to 1 range)
        if (this.particlePositions[i * 2] > 1) this.particlePositions[i * 2] = -1;
        if (this.particlePositions[i * 2] < -1) this.particlePositions[i * 2] = 1;
        if (this.particlePositions[i * 2 + 1] > 1) this.particlePositions[i * 2 + 1] = -1;
        if (this.particlePositions[i * 2 + 1] < -1) this.particlePositions[i * 2 + 1] = 1;
      }

      this.map.triggerRepaint(); // Request a new frame
      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }
}

export default WindParticleLayer;
