import '@testing-library/jest-dom'
import { vi, beforeAll, afterAll } from 'vitest'

// Mock WebGL and Three.js related APIs
const mockWebGL = () => {
  const canvas = document.createElement('canvas')
  const gl = {
    createShader: vi.fn(),
    shaderSource: vi.fn(),
    compileShader: vi.fn(),
    getShaderParameter: vi.fn(() => true),
    createProgram: vi.fn(),
    attachShader: vi.fn(),
    linkProgram: vi.fn(),
    getProgramParameter: vi.fn(() => true),
    useProgram: vi.fn(),
    getExtension: vi.fn(),
    getParameter: vi.fn(),
    disable: vi.fn(),
    enable: vi.fn(),
    blendFunc: vi.fn(),
    blendEquation: vi.fn(),
    cullFace: vi.fn(),
    frontFace: vi.fn(),
    depthFunc: vi.fn(),
    depthMask: vi.fn(),
    depthRange: vi.fn(),
    clearDepth: vi.fn(),
    clearColor: vi.fn(),
    clear: vi.fn(),
    viewport: vi.fn(),
    scissor: vi.fn(),
    drawArrays: vi.fn(),
    drawElements: vi.fn(),
    createBuffer: vi.fn(),
    bindBuffer: vi.fn(),
    bufferData: vi.fn(),
    createTexture: vi.fn(),
    bindTexture: vi.fn(),
    activeTexture: vi.fn(),
    texParameteri: vi.fn(),
    texImage2D: vi.fn(),
    createFramebuffer: vi.fn(),
    bindFramebuffer: vi.fn(),
    framebufferTexture2D: vi.fn(),
    createRenderbuffer: vi.fn(),
    bindRenderbuffer: vi.fn(),
    renderbufferStorage: vi.fn(),
    framebufferRenderbuffer: vi.fn(),
    generateMipmap: vi.fn(),
    getUniformLocation: vi.fn(),
    getAttribLocation: vi.fn(),
    uniformMatrix4fv: vi.fn(),
    uniform1i: vi.fn(),
    uniform1f: vi.fn(),
    uniform2f: vi.fn(),
    uniform3f: vi.fn(),
    uniform4f: vi.fn(),
    vertexAttribPointer: vi.fn(),
    enableVertexAttribArray: vi.fn(),
    deleteShader: vi.fn(),
    deleteProgram: vi.fn(),
    deleteBuffer: vi.fn(),
    deleteTexture: vi.fn(),
    deleteFramebuffer: vi.fn(),
    deleteRenderbuffer: vi.fn(),
    pixelStorei: vi.fn(),
    stencilOp: vi.fn(),
    stencilFunc: vi.fn(),
    stencilMask: vi.fn(),
    colorMask: vi.fn(),
    getShaderInfoLog: vi.fn(() => ''),
    getProgramInfoLog: vi.fn(() => ''),
  }
  
  // @ts-ignore
  canvas.getContext = vi.fn(() => gl)
  
  // @ts-ignore
  global.WebGLRenderingContext = vi.fn()
  // @ts-ignore
  global.WebGL2RenderingContext = vi.fn()
  
  // Mock HTMLCanvasElement
  HTMLCanvasElement.prototype.getContext = vi.fn(() => gl) as any
}

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb: any) => {
  setTimeout(cb, 0)
  return 0
})

global.cancelAnimationFrame = vi.fn()

// Initialize WebGL mocks
mockWebGL()

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: any) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-url')
global.URL.revokeObjectURL = vi.fn()

// Suppress console errors for expected Three.js warnings in tests
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('THREE') || args[0].includes('WebGL'))
    ) {
      return
    }
    originalError(...args)
  }
})

afterAll(() => {
  console.error = originalError
})