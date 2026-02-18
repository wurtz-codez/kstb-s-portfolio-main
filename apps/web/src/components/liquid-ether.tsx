"use client";

import { useEffect, useRef } from "react";
// biome-ignore lint/performance/noNamespaceImport: THREE.js is conventionally used as a namespace import
import * as THREE from "three";

// ── GLSL Shaders ──

const FACE_VERT = `
  attribute vec3 position;
  uniform vec2 px;
  uniform vec2 boundarySpace;
  varying vec2 uv;
  precision highp float;
  void main(){
    vec3 pos = position;
    vec2 scale = 1.0 - boundarySpace * 2.0;
    pos.xy = pos.xy * scale;
    uv = vec2(0.5)+(pos.xy)*0.5;
    gl_Position = vec4(pos, 1.0);
  }
`;

const LINE_VERT = `
  attribute vec3 position;
  uniform vec2 px;
  precision highp float;
  varying vec2 uv;
  void main(){
    vec3 pos = position;
    uv = 0.5 + pos.xy * 0.5;
    vec2 n = sign(pos.xy);
    pos.xy = abs(pos.xy) - px * 1.0;
    pos.xy *= n;
    gl_Position = vec4(pos, 1.0);
  }
`;

const MOUSE_VERT = `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  uniform vec2 center;
  uniform vec2 scale;
  uniform vec2 px;
  varying vec2 vUv;
  void main(){
    vec2 pos = position.xy * scale * 2.0 * px + center;
    vUv = uv;
    gl_Position = vec4(pos, 0.0, 1.0);
  }
`;

const ADVECTION_FRAG = `
  precision highp float;
  uniform sampler2D velocity;
  uniform float dt;
  uniform bool isBFECC;
  uniform vec2 fboSize;
  uniform vec2 px;
  varying vec2 uv;
  void main(){
    vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
    if(isBFECC == false){
      vec2 vel = texture2D(velocity, uv).xy;
      vec2 uv2 = uv - vel * dt * ratio;
      vec2 newVel = texture2D(velocity, uv2).xy;
      gl_FragColor = vec4(newVel, 0.0, 0.0);
    } else {
      vec2 spot_new = uv;
      vec2 vel_old = texture2D(velocity, uv).xy;
      vec2 spot_old = spot_new - vel_old * dt * ratio;
      vec2 vel_new1 = texture2D(velocity, spot_old).xy;
      vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
      vec2 error = spot_new2 - spot_new;
      vec2 spot_new3 = spot_new - error / 2.0;
      vec2 vel_2 = texture2D(velocity, spot_new3).xy;
      vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
      vec2 newVel2 = texture2D(velocity, spot_old2).xy;
      gl_FragColor = vec4(newVel2, 0.0, 0.0);
    }
  }
`;

const COLOR_FRAG = `
  precision highp float;
  uniform sampler2D velocity;
  uniform sampler2D palette;
  uniform vec4 bgColor;
  varying vec2 uv;
  void main(){
    vec2 vel = texture2D(velocity, uv).xy;
    float lenv = clamp(length(vel), 0.0, 1.0);
    vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb;
    vec3 outRGB = mix(bgColor.rgb, c, lenv);
    float outA = mix(bgColor.a, 1.0, lenv);
    gl_FragColor = vec4(outRGB, outA);
  }
`;

const DIVERGENCE_FRAG = `
  precision highp float;
  uniform sampler2D velocity;
  uniform float dt;
  uniform vec2 px;
  varying vec2 uv;
  void main(){
    float x0 = texture2D(velocity, uv-vec2(px.x, 0.0)).x;
    float x1 = texture2D(velocity, uv+vec2(px.x, 0.0)).x;
    float y0 = texture2D(velocity, uv-vec2(0.0, px.y)).y;
    float y1 = texture2D(velocity, uv+vec2(0.0, px.y)).y;
    float divergence = (x1 - x0 + y1 - y0) / 2.0;
    gl_FragColor = vec4(divergence / dt);
  }
`;

const EXTERNAL_FORCE_FRAG = `
  precision highp float;
  uniform vec2 force;
  uniform vec2 center;
  uniform vec2 scale;
  uniform vec2 px;
  varying vec2 vUv;
  void main(){
    vec2 circle = (vUv - 0.5) * 2.0;
    float d = 1.0 - min(length(circle), 1.0);
    d *= d;
    gl_FragColor = vec4(force * d, 0.0, 1.0);
  }
`;

const POISSON_FRAG = `
  precision highp float;
  uniform sampler2D pressure;
  uniform sampler2D divergence;
  uniform vec2 px;
  varying vec2 uv;
  void main(){
    float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0.0)).r;
    float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0.0)).r;
    float p2 = texture2D(pressure, uv + vec2(0.0, px.y * 2.0)).r;
    float p3 = texture2D(pressure, uv - vec2(0.0, px.y * 2.0)).r;
    float div = texture2D(divergence, uv).r;
    float newP = (p0 + p1 + p2 + p3) / 4.0 - div;
    gl_FragColor = vec4(newP);
  }
`;

const PRESSURE_FRAG = `
  precision highp float;
  uniform sampler2D pressure;
  uniform sampler2D velocity;
  uniform vec2 px;
  uniform float dt;
  varying vec2 uv;
  void main(){
    float step = 1.0;
    float p0 = texture2D(pressure, uv + vec2(px.x * step, 0.0)).r;
    float p1 = texture2D(pressure, uv - vec2(px.x * step, 0.0)).r;
    float p2 = texture2D(pressure, uv + vec2(0.0, px.y * step)).r;
    float p3 = texture2D(pressure, uv - vec2(0.0, px.y * step)).r;
    vec2 v = texture2D(velocity, uv).xy;
    vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5;
    v = v - gradP * dt;
    gl_FragColor = vec4(v, 0.0, 1.0);
  }
`;

const VISCOUS_FRAG = `
  precision highp float;
  uniform sampler2D velocity;
  uniform sampler2D velocity_new;
  uniform float v;
  uniform vec2 px;
  uniform float dt;
  varying vec2 uv;
  void main(){
    vec2 old = texture2D(velocity, uv).xy;
    vec2 new0 = texture2D(velocity_new, uv + vec2(px.x * 2.0, 0.0)).xy;
    vec2 new1 = texture2D(velocity_new, uv - vec2(px.x * 2.0, 0.0)).xy;
    vec2 new2 = texture2D(velocity_new, uv + vec2(0.0, px.y * 2.0)).xy;
    vec2 new3 = texture2D(velocity_new, uv - vec2(0.0, px.y * 2.0)).xy;
    vec2 newv = 4.0 * old + v * dt * (new0 + new1 + new2 + new3);
    newv /= 4.0 * (1.0 + v * dt);
    gl_FragColor = vec4(newv, 0.0, 0.0);
  }
`;

// iOS detection regex (top-level for performance)
const IOS_REGEX = /(iPad|iPhone|iPod)/i;

// ── Types ──

interface LiquidEtherProps {
	mouseForce?: number;
	cursorSize?: number;
	isViscous?: boolean;
	viscous?: number;
	iterationsViscous?: number;
	iterationsPoisson?: number;
	dt?: number;
	BFECC?: boolean;
	resolution?: number;
	isBounce?: boolean;
	colors?: string[];
	autoDemo?: boolean;
	autoSpeed?: number;
	autoIntensity?: number;
	takeoverDuration?: number;
	autoResumeDelay?: number;
	autoRampDuration?: number;
}

// ── Component ──

export default function LiquidEther({
	mouseForce = 33,
	cursorSize = 100,
	isViscous = true,
	viscous = 30,
	iterationsViscous = 32,
	iterationsPoisson = 32,
	dt = 0.014,
	BFECC = true,
	resolution = 0.5,
	isBounce = false,
	colors = ["#ebf8ff", "#000000", "#676871"],
	autoDemo = true,
	autoSpeed = 0.5,
	autoIntensity = 2.2,
	takeoverDuration = 0.25,
	autoResumeDelay = 1000,
	autoRampDuration = 0.6,
}: LiquidEtherProps) {
	const mountRef = useRef<HTMLDivElement>(null);

	// Store all props in a single ref for stable useEffect deps (React Compiler)
	const propsRef = useRef({
		mouseForce,
		cursorSize,
		isViscous,
		viscous,
		iterationsViscous,
		iterationsPoisson,
		dt,
		BFECC,
		resolution,
		isBounce,
		colors,
		autoDemo,
		autoSpeed,
		autoIntensity,
		takeoverDuration,
		autoResumeDelay,
		autoRampDuration,
	});
	propsRef.current = {
		mouseForce,
		cursorSize,
		isViscous,
		viscous,
		iterationsViscous,
		iterationsPoisson,
		dt,
		BFECC,
		resolution,
		isBounce,
		colors,
		autoDemo,
		autoSpeed,
		autoIntensity,
		takeoverDuration,
		autoResumeDelay,
		autoRampDuration,
	};

	useEffect(() => {
		if (!mountRef.current) {
			return;
		}
		// Guaranteed non-null after the guard above
		const el = mountRef.current;

		let rafId: number | null = null;
		let running = false;
		const isVisibleRef = { current: true };
		let resizeRafId: number | null = null;

		// ── Palette texture ──
		function makePaletteTexture(stops: string[]): THREE.DataTexture {
			const arr = stops.length === 1 ? [stops[0], stops[0]] : [...stops];
			const w = arr.length;
			const data = new Uint8Array(w * 4);
			for (let i = 0; i < w; i++) {
				const c = new THREE.Color(arr[i]);
				data[i * 4 + 0] = Math.round(c.r * 255);
				data[i * 4 + 1] = Math.round(c.g * 255);
				data[i * 4 + 2] = Math.round(c.b * 255);
				data[i * 4 + 3] = 255;
			}
			const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
			tex.magFilter = THREE.LinearFilter;
			tex.minFilter = THREE.LinearFilter;
			tex.wrapS = THREE.ClampToEdgeWrapping;
			tex.wrapT = THREE.ClampToEdgeWrapping;
			tex.generateMipmaps = false;
			tex.needsUpdate = true;
			return tex;
		}

		const p = propsRef.current;
		const paletteTex = makePaletteTexture(p.colors);
		const bgVec4 = new THREE.Vector4(0, 0, 0, 0);

		// ── Common (renderer + timing) ──
		let commonWidth = 0;
		let commonHeight = 0;
		let commonRenderer: THREE.WebGLRenderer | null = null;
		const commonClock = new THREE.Clock();

		function commonInit(): THREE.WebGLRenderer {
			const rect = el.getBoundingClientRect();
			commonWidth = Math.max(1, Math.floor(rect.width));
			commonHeight = Math.max(1, Math.floor(rect.height));
			const renderer = new THREE.WebGLRenderer({
				antialias: true,
				alpha: true,
			});
			renderer.autoClear = false;
			renderer.setClearColor(new THREE.Color(0x00_00_00), 0);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
			renderer.setSize(commonWidth, commonHeight);
			renderer.domElement.style.width = "100%";
			renderer.domElement.style.height = "100%";
			renderer.domElement.style.display = "block";
			commonRenderer = renderer;
			commonClock.start();
			return renderer;
		}

		function commonResize() {
			const rect = el.getBoundingClientRect();
			commonWidth = Math.max(1, Math.floor(rect.width));
			commonHeight = Math.max(1, Math.floor(rect.height));
			commonRenderer?.setSize(commonWidth, commonHeight, false);
		}

		function commonUpdate() {
			commonClock.getDelta();
		}

		// ── Mouse tracking ──
		const mouseCoords = new THREE.Vector2();
		const mouseCoordsOld = new THREE.Vector2();
		const mouseDiff = new THREE.Vector2();
		const mouseTimer: ReturnType<typeof setTimeout> | null = null;
		let isHoverInside = false;
		let hasUserControl = false;
		let isAutoActive = false;
		let mouseAutoIntensity = p.autoIntensity;
		let takeoverActive = false;
		let takeoverStartTime = 0;
		let mouseTakeoverDuration = p.takeoverDuration;
		const takeoverFrom = new THREE.Vector2();
		const takeoverTo = new THREE.Vector2();
		let lastUserInteraction = performance.now();

		function isPointInside(clientX: number, clientY: number): boolean {
			const rect = el.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) {
				return false;
			}
			return (
				clientX >= rect.left &&
				clientX <= rect.right &&
				clientY >= rect.top &&
				clientY <= rect.bottom
			);
		}

		function setMouseCoords(x: number, y: number) {
			if (mouseTimer) {
				clearTimeout(mouseTimer);
			}
			const rect = el.getBoundingClientRect();
			if (rect.width === 0 || rect.height === 0) {
				return;
			}
			const nx = (x - rect.left) / rect.width;
			const ny = (y - rect.top) / rect.height;
			mouseCoords.set(nx * 2 - 1, -(ny * 2 - 1));
		}

		function setMouseNormalized(nx: number, ny: number) {
			mouseCoords.set(nx, ny);
		}

		function onInteract() {
			lastUserInteraction = performance.now();
			autoForceStop();
		}

		function onMouseMove(event: MouseEvent) {
			isHoverInside = isPointInside(event.clientX, event.clientY);
			if (!isHoverInside) {
				return;
			}
			onInteract();
			if (isAutoActive && !hasUserControl && !takeoverActive) {
				const rect = el.getBoundingClientRect();
				if (rect.width === 0 || rect.height === 0) {
					return;
				}
				const nx = (event.clientX - rect.left) / rect.width;
				const ny = (event.clientY - rect.top) / rect.height;
				takeoverFrom.copy(mouseCoords);
				takeoverTo.set(nx * 2 - 1, -(ny * 2 - 1));
				takeoverStartTime = performance.now();
				takeoverActive = true;
				hasUserControl = true;
				isAutoActive = false;
				return;
			}
			setMouseCoords(event.clientX, event.clientY);
			hasUserControl = true;
		}

		function onTouchStart(event: TouchEvent) {
			if (event.touches.length !== 1) {
				return;
			}
			const t = event.touches[0];
			isHoverInside = isPointInside(t.clientX, t.clientY);
			if (!isHoverInside) {
				return;
			}
			onInteract();
			setMouseCoords(t.clientX, t.clientY);
			hasUserControl = true;
		}

		function onTouchMove(event: TouchEvent) {
			if (event.touches.length !== 1) {
				return;
			}
			const t = event.touches[0];
			isHoverInside = isPointInside(t.clientX, t.clientY);
			if (!isHoverInside) {
				return;
			}
			onInteract();
			setMouseCoords(t.clientX, t.clientY);
		}

		function onTouchEnd() {
			isHoverInside = false;
		}

		function onDocumentLeave() {
			isHoverInside = false;
		}

		function mouseUpdate() {
			if (takeoverActive) {
				const t =
					(performance.now() - takeoverStartTime) /
					(mouseTakeoverDuration * 1000);
				if (t >= 1) {
					takeoverActive = false;
					mouseCoords.copy(takeoverTo);
					mouseCoordsOld.copy(mouseCoords);
					mouseDiff.set(0, 0);
				} else {
					const k = t * t * (3 - 2 * t);
					mouseCoords.copy(takeoverFrom).lerp(takeoverTo, k);
				}
			}
			mouseDiff.subVectors(mouseCoords, mouseCoordsOld);
			mouseCoordsOld.copy(mouseCoords);
			if (mouseCoordsOld.x === 0 && mouseCoordsOld.y === 0) {
				mouseDiff.set(0, 0);
			}
			if (isAutoActive && !takeoverActive) {
				mouseDiff.multiplyScalar(mouseAutoIntensity);
			}
		}

		// Attach mouse/touch listeners
		const win = el.ownerDocument?.defaultView ?? window;
		const doc = el.ownerDocument ?? document;
		win.addEventListener("mousemove", onMouseMove);
		win.addEventListener("touchstart", onTouchStart, { passive: true });
		win.addEventListener("touchmove", onTouchMove, { passive: true });
		win.addEventListener("touchend", onTouchEnd);
		doc.addEventListener("mouseleave", onDocumentLeave);

		// ── Auto Driver ──
		let autoEnabled = p.autoDemo;
		let autoSpeedVal = p.autoSpeed;
		let autoResumeDelayVal = p.autoResumeDelay;
		let autoRampDurationMs = p.autoRampDuration * 1000;
		let autoActive = false;
		const autoCurrent = new THREE.Vector2(0, 0);
		const autoTarget = new THREE.Vector2();
		let autoLastTime = performance.now();
		let autoActivationTime = 0;
		const autoMargin = 0.2;
		const autoTmpDir = new THREE.Vector2();

		function autoPickNewTarget() {
			autoTarget.set(
				(Math.random() * 2 - 1) * (1 - autoMargin),
				(Math.random() * 2 - 1) * (1 - autoMargin)
			);
		}
		autoPickNewTarget();

		function autoForceStop() {
			autoActive = false;
			isAutoActive = false;
		}

		function autoShouldStop(now: number): boolean {
			const idle = now - lastUserInteraction;
			if (idle < autoResumeDelayVal) {
				return true;
			}
			return isHoverInside;
		}

		function autoActivate(now: number) {
			autoActive = true;
			autoCurrent.copy(mouseCoords);
			autoLastTime = now;
			autoActivationTime = now;
		}

		function autoComputeRamp(now: number): number {
			if (autoRampDurationMs <= 0) {
				return 1;
			}
			const t = Math.min(1, (now - autoActivationTime) / autoRampDurationMs);
			return t * t * (3 - 2 * t);
		}

		function autoStep(now: number) {
			let dtSec = (now - autoLastTime) / 1000;
			autoLastTime = now;
			if (dtSec > 0.2) {
				dtSec = 0.016;
			}
			const dir = autoTmpDir.subVectors(autoTarget, autoCurrent);
			const dist = dir.length();
			if (dist < 0.01) {
				autoPickNewTarget();
				return;
			}
			dir.normalize();
			const ramp = autoComputeRamp(now);
			const step = autoSpeedVal * dtSec * ramp;
			const move = Math.min(step, dist);
			autoCurrent.addScaledVector(dir, move);
			setMouseNormalized(autoCurrent.x, autoCurrent.y);
		}

		function autoUpdate() {
			if (!autoEnabled) {
				return;
			}
			const now = performance.now();
			if (autoShouldStop(now)) {
				if (autoActive) {
					autoForceStop();
				}
				return;
			}
			if (!autoActive) {
				autoActivate(now);
			}
			isAutoActive = true;
			autoStep(now);
		}

		// ── ShaderPass base ──
		interface ShaderPassProps {
			material?: {
				vertexShader: string;
				fragmentShader: string;
				uniforms: Record<string, { value: unknown }>;
				blending?: THREE.Blending;
				depthWrite?: boolean;
			};
			output?: THREE.WebGLRenderTarget | null;
			output0?: THREE.WebGLRenderTarget | null;
			output1?: THREE.WebGLRenderTarget | null;
		}

		class ShaderPass {
			props: ShaderPassProps;
			uniforms: Record<string, { value: unknown }> | undefined;
			scene: THREE.Scene | null = null;
			camera: THREE.Camera | null = null;

			constructor(props: ShaderPassProps) {
				this.props = props;
				this.uniforms = this.props.material?.uniforms;
			}

			init() {
				this.scene = new THREE.Scene();
				this.camera = new THREE.Camera();
				if (this.uniforms && this.props.material) {
					const material = new THREE.RawShaderMaterial(this.props.material);
					const geometry = new THREE.PlaneGeometry(2.0, 2.0);
					const plane = new THREE.Mesh(geometry, material);
					this.scene.add(plane);
				}
			}

			update() {
				if (!(commonRenderer && this.scene && this.camera)) {
					return;
				}
				commonRenderer.setRenderTarget(this.props.output ?? null);
				commonRenderer.render(this.scene, this.camera);
				commonRenderer.setRenderTarget(null);
			}
		}

		// ── Advection ──
		class Advection extends ShaderPass {
			line: THREE.LineSegments | null = null;

			constructor(simProps: {
				cellScale: THREE.Vector2;
				fboSize: THREE.Vector2;
				dt: number;
				src: THREE.WebGLRenderTarget;
				dst: THREE.WebGLRenderTarget;
			}) {
				super({
					material: {
						vertexShader: FACE_VERT,
						fragmentShader: ADVECTION_FRAG,
						uniforms: {
							boundarySpace: { value: simProps.cellScale },
							px: { value: simProps.cellScale },
							fboSize: { value: simProps.fboSize },
							velocity: { value: simProps.src.texture },
							dt: { value: simProps.dt },
							isBFECC: { value: true },
						},
					},
					output: simProps.dst,
				});
				this.init();
			}

			override init() {
				super.init();
				this.createBoundary();
			}

			createBoundary() {
				const boundaryG = new THREE.BufferGeometry();
				const vertices = new Float32Array([
					-1, -1, 0, -1, 1, 0, -1, 1, 0, 1, 1, 0, 1, 1, 0, 1, -1, 0, 1, -1, 0,
					-1, -1, 0,
				]);
				boundaryG.setAttribute(
					"position",
					new THREE.BufferAttribute(vertices, 3)
				);
				const boundaryM = new THREE.RawShaderMaterial({
					vertexShader: LINE_VERT,
					fragmentShader: ADVECTION_FRAG,
					uniforms: this.uniforms ?? {},
				});
				this.line = new THREE.LineSegments(boundaryG, boundaryM);
				this.scene?.add(this.line);
			}

			updateSim(params: { dt: number; isBounce: boolean; BFECC: boolean }) {
				if (!this.uniforms) {
					return;
				}
				this.uniforms.dt.value = params.dt;
				if (this.line) {
					this.line.visible = params.isBounce;
				}
				this.uniforms.isBFECC.value = params.BFECC;
				super.update();
			}
		}

		// ── ExternalForce ──
		class ExternalForce extends ShaderPass {
			mouseMesh: THREE.Mesh | null = null;

			constructor(simProps: {
				cellScale: THREE.Vector2;
				cursor_size: number;
				dst: THREE.WebGLRenderTarget;
			}) {
				super({ output: simProps.dst });
				this.initForce(simProps);
			}

			initForce(simProps: { cellScale: THREE.Vector2; cursor_size: number }) {
				super.init();
				const mouseG = new THREE.PlaneGeometry(1, 1);
				const mouseM = new THREE.RawShaderMaterial({
					vertexShader: MOUSE_VERT,
					fragmentShader: EXTERNAL_FORCE_FRAG,
					blending: THREE.AdditiveBlending,
					depthWrite: false,
					uniforms: {
						px: { value: simProps.cellScale },
						force: { value: new THREE.Vector2(0.0, 0.0) },
						center: { value: new THREE.Vector2(0.0, 0.0) },
						scale: {
							value: new THREE.Vector2(
								simProps.cursor_size,
								simProps.cursor_size
							),
						},
					},
				});
				this.mouseMesh = new THREE.Mesh(mouseG, mouseM);
				this.scene?.add(this.mouseMesh);
			}

			updateForce(params: {
				cursor_size: number;
				mouse_force: number;
				cellScale: THREE.Vector2;
			}) {
				if (!this.mouseMesh) {
					return;
				}
				const forceX = (mouseDiff.x / 2) * params.mouse_force;
				const forceY = (mouseDiff.y / 2) * params.mouse_force;
				const cursorSizeX = params.cursor_size * params.cellScale.x;
				const cursorSizeY = params.cursor_size * params.cellScale.y;
				const centerX = Math.min(
					Math.max(mouseCoords.x, -1 + cursorSizeX + params.cellScale.x * 2),
					1 - cursorSizeX - params.cellScale.x * 2
				);
				const centerY = Math.min(
					Math.max(mouseCoords.y, -1 + cursorSizeY + params.cellScale.y * 2),
					1 - cursorSizeY - params.cellScale.y * 2
				);
				const uniforms = (this.mouseMesh.material as THREE.RawShaderMaterial)
					.uniforms;
				uniforms.force.value.set(forceX, forceY);
				uniforms.center.value.set(centerX, centerY);
				uniforms.scale.value.set(params.cursor_size, params.cursor_size);
				super.update();
			}
		}

		// ── Viscous ──
		class ViscousPass extends ShaderPass {
			constructor(simProps: {
				cellScale: THREE.Vector2;
				boundarySpace: THREE.Vector2;
				viscous: number;
				src: THREE.WebGLRenderTarget;
				dst: THREE.WebGLRenderTarget;
				dst_: THREE.WebGLRenderTarget;
				dt: number;
			}) {
				super({
					material: {
						vertexShader: FACE_VERT,
						fragmentShader: VISCOUS_FRAG,
						uniforms: {
							boundarySpace: {
								value: simProps.boundarySpace,
							},
							velocity: { value: simProps.src.texture },
							velocity_new: {
								value: simProps.dst_.texture,
							},
							v: { value: simProps.viscous },
							px: { value: simProps.cellScale },
							dt: { value: simProps.dt },
						},
					},
					output: simProps.dst,
					output0: simProps.dst_,
					output1: simProps.dst,
				});
				this.init();
			}

			updateViscous(params: {
				viscous: number;
				iterations: number;
				dt: number;
			}): THREE.WebGLRenderTarget | null {
				if (!this.uniforms) {
					return null;
				}
				let fboOut: THREE.WebGLRenderTarget | null = null;
				this.uniforms.v.value = params.viscous;
				for (let i = 0; i < params.iterations; i++) {
					const fboIn =
						(i % 2 === 0 ? this.props.output0 : this.props.output1) ?? null;
					fboOut =
						(i % 2 === 0 ? this.props.output1 : this.props.output0) ?? null;
					this.uniforms.velocity_new.value = fboIn?.texture;
					this.props.output = fboOut;
					this.uniforms.dt.value = params.dt;
					super.update();
				}
				return fboOut;
			}
		}

		// ── Divergence ──
		class DivergencePass extends ShaderPass {
			constructor(simProps: {
				cellScale: THREE.Vector2;
				boundarySpace: THREE.Vector2;
				src: THREE.WebGLRenderTarget;
				dst: THREE.WebGLRenderTarget;
				dt: number;
			}) {
				super({
					material: {
						vertexShader: FACE_VERT,
						fragmentShader: DIVERGENCE_FRAG,
						uniforms: {
							boundarySpace: {
								value: simProps.boundarySpace,
							},
							velocity: { value: simProps.src.texture },
							px: { value: simProps.cellScale },
							dt: { value: simProps.dt },
						},
					},
					output: simProps.dst,
				});
				this.init();
			}

			updateDiv(params: { vel: THREE.WebGLRenderTarget }) {
				if (!this.uniforms) {
					return;
				}
				this.uniforms.velocity.value = params.vel.texture;
				super.update();
			}
		}

		// ── Poisson ──
		class PoissonPass extends ShaderPass {
			constructor(simProps: {
				cellScale: THREE.Vector2;
				boundarySpace: THREE.Vector2;
				src: THREE.WebGLRenderTarget;
				dst: THREE.WebGLRenderTarget;
				dst_: THREE.WebGLRenderTarget;
			}) {
				super({
					material: {
						vertexShader: FACE_VERT,
						fragmentShader: POISSON_FRAG,
						uniforms: {
							boundarySpace: {
								value: simProps.boundarySpace,
							},
							pressure: { value: simProps.dst_.texture },
							divergence: { value: simProps.src.texture },
							px: { value: simProps.cellScale },
						},
					},
					output: simProps.dst,
					output0: simProps.dst_,
					output1: simProps.dst,
				});
				this.init();
			}

			updatePoisson(params: {
				iterations: number;
			}): THREE.WebGLRenderTarget | null {
				if (!this.uniforms) {
					return null;
				}
				let pOut: THREE.WebGLRenderTarget | null = null;
				for (let i = 0; i < params.iterations; i++) {
					const pIn =
						(i % 2 === 0 ? this.props.output0 : this.props.output1) ?? null;
					pOut =
						(i % 2 === 0 ? this.props.output1 : this.props.output0) ?? null;
					this.uniforms.pressure.value = pIn?.texture;
					this.props.output = pOut;
					super.update();
				}
				return pOut;
			}
		}

		// ── Pressure ──
		class PressurePass extends ShaderPass {
			constructor(simProps: {
				cellScale: THREE.Vector2;
				boundarySpace: THREE.Vector2;
				src_p: THREE.WebGLRenderTarget;
				src_v: THREE.WebGLRenderTarget;
				dst: THREE.WebGLRenderTarget;
				dt: number;
			}) {
				super({
					material: {
						vertexShader: FACE_VERT,
						fragmentShader: PRESSURE_FRAG,
						uniforms: {
							boundarySpace: {
								value: simProps.boundarySpace,
							},
							pressure: { value: simProps.src_p.texture },
							velocity: { value: simProps.src_v.texture },
							px: { value: simProps.cellScale },
							dt: { value: simProps.dt },
						},
					},
					output: simProps.dst,
				});
				this.init();
			}

			updatePressure(params: {
				vel: THREE.WebGLRenderTarget;
				pressure: THREE.WebGLRenderTarget;
			}) {
				if (!this.uniforms) {
					return;
				}
				this.uniforms.velocity.value = params.vel.texture;
				this.uniforms.pressure.value = params.pressure.texture;
				super.update();
			}
		}

		// ── Simulation ──
		const simOptions = {
			iterations_poisson: p.iterationsPoisson,
			iterations_viscous: p.iterationsViscous,
			mouse_force: p.mouseForce,
			resolution: p.resolution,
			cursor_size: p.cursorSize,
			viscous: p.viscous,
			isBounce: p.isBounce,
			dt: p.dt,
			isViscous: p.isViscous,
			BFECC: p.BFECC,
		};

		const fboSize = new THREE.Vector2();
		const cellScale = new THREE.Vector2();
		const boundarySpace = new THREE.Vector2();

		function getFloatType(): THREE.TextureDataType {
			const isIOS = IOS_REGEX.test(navigator.userAgent);
			return isIOS ? THREE.HalfFloatType : THREE.FloatType;
		}

		function calcSize() {
			const width = Math.max(
				1,
				Math.round(simOptions.resolution * commonWidth)
			);
			const height = Math.max(
				1,
				Math.round(simOptions.resolution * commonHeight)
			);
			cellScale.set(1.0 / width, 1.0 / height);
			fboSize.set(width, height);
		}

		calcSize();

		const fboType = getFloatType();
		const fboOpts = {
			type: fboType,
			depthBuffer: false,
			stencilBuffer: false,
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			wrapS: THREE.ClampToEdgeWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
		} as const;

		const fbos = {
			vel_0: new THREE.WebGLRenderTarget(fboSize.x, fboSize.y, fboOpts),
			vel_1: new THREE.WebGLRenderTarget(fboSize.x, fboSize.y, fboOpts),
			vel_viscous0: new THREE.WebGLRenderTarget(fboSize.x, fboSize.y, fboOpts),
			vel_viscous1: new THREE.WebGLRenderTarget(fboSize.x, fboSize.y, fboOpts),
			div: new THREE.WebGLRenderTarget(fboSize.x, fboSize.y, fboOpts),
			pressure_0: new THREE.WebGLRenderTarget(fboSize.x, fboSize.y, fboOpts),
			pressure_1: new THREE.WebGLRenderTarget(fboSize.x, fboSize.y, fboOpts),
		};

		const advection = new Advection({
			cellScale,
			fboSize,
			dt: simOptions.dt,
			src: fbos.vel_0,
			dst: fbos.vel_1,
		});

		const externalForce = new ExternalForce({
			cellScale,
			cursor_size: simOptions.cursor_size,
			dst: fbos.vel_1,
		});

		const viscousPass = new ViscousPass({
			cellScale,
			boundarySpace,
			viscous: simOptions.viscous,
			src: fbos.vel_1,
			dst: fbos.vel_viscous1,
			dst_: fbos.vel_viscous0,
			dt: simOptions.dt,
		});

		const divergencePass = new DivergencePass({
			cellScale,
			boundarySpace,
			src: fbos.vel_viscous0,
			dst: fbos.div,
			dt: simOptions.dt,
		});

		const poissonPass = new PoissonPass({
			cellScale,
			boundarySpace,
			src: fbos.div,
			dst: fbos.pressure_1,
			dst_: fbos.pressure_0,
		});

		const pressurePass = new PressurePass({
			cellScale,
			boundarySpace,
			src_p: fbos.pressure_0,
			src_v: fbos.vel_viscous0,
			dst: fbos.vel_0,
			dt: simOptions.dt,
		});

		function simResize() {
			calcSize();
			for (const fbo of Object.values(fbos)) {
				fbo.setSize(fboSize.x, fboSize.y);
			}
		}

		function simUpdate() {
			if (simOptions.isBounce) {
				boundarySpace.set(0, 0);
			} else {
				boundarySpace.copy(cellScale);
			}
			advection.updateSim({
				dt: simOptions.dt,
				isBounce: simOptions.isBounce,
				BFECC: simOptions.BFECC,
			});
			externalForce.updateForce({
				cursor_size: simOptions.cursor_size,
				mouse_force: simOptions.mouse_force,
				cellScale,
			});
			let vel: THREE.WebGLRenderTarget = fbos.vel_1;
			if (simOptions.isViscous) {
				const result = viscousPass.updateViscous({
					viscous: simOptions.viscous,
					iterations: simOptions.iterations_viscous,
					dt: simOptions.dt,
				});
				if (result) {
					vel = result;
				}
			}
			divergencePass.updateDiv({ vel });
			const pressure = poissonPass.updatePoisson({
				iterations: simOptions.iterations_poisson,
			});
			if (pressure) {
				pressurePass.updatePressure({ vel, pressure });
			}
		}

		// ── Output scene ──
		const outputScene = new THREE.Scene();
		const outputCamera = new THREE.Camera();
		const outputMesh = new THREE.Mesh(
			new THREE.PlaneGeometry(2, 2),
			new THREE.RawShaderMaterial({
				vertexShader: FACE_VERT,
				fragmentShader: COLOR_FRAG,
				transparent: true,
				depthWrite: false,
				uniforms: {
					velocity: { value: fbos.vel_0.texture },
					boundarySpace: { value: new THREE.Vector2() },
					palette: { value: paletteTex },
					bgColor: { value: bgVec4 },
				},
			})
		);
		outputScene.add(outputMesh);

		function outputRender() {
			if (!commonRenderer) {
				return;
			}
			commonRenderer.setRenderTarget(null);
			commonRenderer.render(outputScene, outputCamera);
		}

		// ── Init ──
		const initialRenderer = commonInit();
		el.prepend(initialRenderer.domElement);

		// Apply current props
		function applyProps() {
			const cp = propsRef.current;
			const prevRes = simOptions.resolution;
			Object.assign(simOptions, {
				mouse_force: cp.mouseForce,
				cursor_size: cp.cursorSize,
				isViscous: cp.isViscous,
				viscous: cp.viscous,
				iterations_viscous: cp.iterationsViscous,
				iterations_poisson: cp.iterationsPoisson,
				dt: cp.dt,
				BFECC: cp.BFECC,
				resolution: cp.resolution,
				isBounce: cp.isBounce,
			});
			autoEnabled = cp.autoDemo;
			autoSpeedVal = cp.autoSpeed;
			autoResumeDelayVal = cp.autoResumeDelay;
			autoRampDurationMs = cp.autoRampDuration * 1000;
			mouseAutoIntensity = cp.autoIntensity;
			mouseTakeoverDuration = cp.takeoverDuration;
			if (cp.resolution !== prevRes) {
				simResize();
			}
		}
		applyProps();

		// ── Render loop ──
		function loop() {
			if (!running) {
				return;
			}
			applyProps();
			autoUpdate();
			mouseUpdate();
			commonUpdate();
			simUpdate();
			outputRender();
			rafId = requestAnimationFrame(loop);
		}

		function start() {
			if (running) {
				return;
			}
			running = true;
			loop();
		}

		function pause() {
			running = false;
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
				rafId = null;
			}
		}

		function handleResize() {
			commonResize();
			simResize();
		}

		window.addEventListener("resize", handleResize);

		function handleVisibility() {
			if (document.hidden) {
				pause();
			} else if (isVisibleRef.current) {
				start();
			}
		}
		document.addEventListener("visibilitychange", handleVisibility);

		// IntersectionObserver to pause when not visible
		const io = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				const visible = entry.isIntersecting && entry.intersectionRatio > 0;
				isVisibleRef.current = visible;
				if (visible && !document.hidden) {
					start();
				} else {
					pause();
				}
			},
			{ threshold: [0, 0.01, 0.1] }
		);
		io.observe(el);

		// ResizeObserver for el size changes
		const ro = new ResizeObserver(() => {
			if (resizeRafId !== null) {
				cancelAnimationFrame(resizeRafId);
			}
			resizeRafId = requestAnimationFrame(() => {
				handleResize();
			});
		});
		ro.observe(el);

		start();

		// ── Cleanup ──
		return () => {
			pause();
			window.removeEventListener("resize", handleResize);
			document.removeEventListener("visibilitychange", handleVisibility);
			win.removeEventListener("mousemove", onMouseMove);
			win.removeEventListener("touchstart", onTouchStart);
			win.removeEventListener("touchmove", onTouchMove);
			win.removeEventListener("touchend", onTouchEnd);
			doc.removeEventListener("mouseleave", onDocumentLeave);
			io.disconnect();
			ro.disconnect();
			if (resizeRafId !== null) {
				cancelAnimationFrame(resizeRafId);
			}
			if (commonRenderer) {
				const canvas = commonRenderer.domElement;
				if (canvas.parentNode) {
					canvas.parentNode.removeChild(canvas);
				}
				commonRenderer.dispose();
			}
			for (const fbo of Object.values(fbos)) {
				fbo.dispose();
			}
			paletteTex.dispose();
		};
	}, []);

	return <div className="liquid-ether-el" ref={mountRef} />;
}
