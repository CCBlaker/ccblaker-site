const canvas = document.getElementById("shaderCanvas");
const gl = canvas.getContext("webgl");

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = canvas.clientWidth * dpr;
  canvas.height = canvas.clientHeight * dpr;
  gl.viewport(0, 0, canvas.width, canvas.height);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Load frag shader
fetch("/data/shaders/shader.frag")
  .then(res => res.text())
  .then(fragmentShaderSource => {
    start(fragmentShaderSource);
  });

function start(fragmentShaderSource) {

  const vertexShaderSource = `
    attribute vec2 aPos;
    void main() {
      gl_Position = vec4(aPos, 0.0, 1.0);
    }
  `;

  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(type === gl.FRAGMENT_SHADER ? "Fragment" : "Vertex", "Shader Error:", gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexShaderSource));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentShaderSource));
  gl.linkProgram(program);
  gl.useProgram(program);

  // Fullscreen quad
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1
  ]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Uniforms
  const uResolution = gl.getUniformLocation(program, "u_resolution");
  const uTime = gl.getUniformLocation(program, "u_time");
  const uMouse = gl.getUniformLocation(program, "u_mouse");

  let mouseX = 0;
  let mouseY = 0;

  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = rect.height - (e.clientY - rect.top);
  });

  canvas.addEventListener("mouseleave", () => {
    mouseX = 0;
    mouseY = 0;
  });

  function render(time) {
    resizeCanvas();
    gl.uniform2f(uResolution, canvas.width, canvas.height);
    gl.uniform1f(uTime, time * 0.001);
    gl.uniform2f(uMouse, mouseX, mouseY);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }

  render(0);
}