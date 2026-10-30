import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

/* Three.js FBX assembly montage for the Audi project card. */
(function () {
  'use strict';
  var initialized = false;

  function init() {
    var root = document.getElementById('audiMontage');
    var canvas = document.getElementById('audiMontageCanvas');
    if (initialized || !root || !canvas) return;
    initialized = true;

    var replay = document.getElementById('audiReplay');
    var state = document.getElementById('audiBuildState');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce && replay) replay.hidden = true;
    var image = new Image();
    image.src = 'assets/audi-angularfront.avif';
    image.alt = '';

    function fallback() {
      root.classList.add('audi-fallback');
      root.style.setProperty('--audi-image', 'url("assets/audi-angularfront.avif")');
      if (state) state.textContent = 'FAHRZEUG ANSICHT';
      if (replay) replay.hidden = true;
    }

    if (!THREE.WebGLRenderer) { fallback(); return; }
    var renderer, scene, camera, group, frameId = 0, width = 0, height = 0;
    var tiles = [], vehicleRoot = null, vehicleParts = [], vehicleBaseYaw = 0, modelRequestStarted = false;
    var startedAt = 0, lastTime = 0, elapsed = 0, visible = false, modelLoading = true;
    var dragging = false, pointerX = 0, pointerY = 0, targetX = 0, targetY = 0, startX = 0, startY = 0;
    var autoplay = !reduce;

    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (err) { fallback(); return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(34, 1, .1, 100);
    camera.position.set(0, .12, 13.2);
    camera.lookAt(0, 0, 0);
    scene.add(new THREE.HemisphereLight(0xd7f4ff, 0x111521, 2.15));
    var key = new THREE.DirectionalLight(0xffffff, 3.5);
    key.position.set(-3, 6, 8); scene.add(key);
    var rim = new THREE.PointLight(0x39c8ff, 25, 16, 2);
    rim.position.set(4, 1.2, 3); scene.add(rim);
    var amber = new THREE.PointLight(0xffa63d, 16, 14, 2);
    amber.position.set(-4, -1.2, 2); scene.add(amber);

    group = new THREE.Group(); scene.add(group);
    var widthWorld = 8.15;
    var heightWorld = 8.15 * 199 / 298;
    var cols = 5, rows = 3, gap = .035;
    var tileW = widthWorld / cols, tileH = heightWorld / rows;
    var edgeMat = new THREE.MeshStandardMaterial({ color: 0x193941, metalness: .8, roughness: .25, emissive: 0x0c252b, emissiveIntensity: .55 });
    var accentMat = new THREE.MeshBasicMaterial({ color: 0x62d8f2, transparent: true, opacity: .85 });

    // A luminous frame gives the assembled image a subtle physical edge.
    var frame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(widthWorld + .12, heightWorld + .12, .2)), accentMat);
    frame.position.z = -.14; group.add(frame);

    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0x080d16, metalness: .42, roughness: .58 })
    );
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, -2.08, -1.8); scene.add(ground);
    var grid = new THREE.GridHelper(30, 30, 0x1f9ab0, 0x14333c);
    grid.position.set(0, -2.06, -1.8); grid.material.transparent = true; grid.material.opacity = .33; scene.add(grid);

    function makeTile(col, row) {
      var sx = Math.floor(col * image.naturalWidth / cols);
      var sy = Math.floor(row * image.naturalHeight / rows);
      var sw = Math.ceil((col + 1) * image.naturalWidth / cols) - sx;
      var sh = Math.ceil((row + 1) * image.naturalHeight / rows) - sy;
      var bitmap = document.createElement('canvas'); bitmap.width = sw; bitmap.height = sh;
      var bctx = bitmap.getContext('2d');
      bctx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
      var texture = new THREE.CanvasTexture(bitmap);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      var face = new THREE.MeshStandardMaterial({ map: texture, metalness: .18, roughness: .3, emissive: 0x17232a, emissiveIntensity: .15 });
      var materials = [edgeMat, edgeMat, edgeMat, edgeMat, face, edgeMat];
      var geometry = new THREE.BoxGeometry(tileW - gap, tileH - gap, .16);
      var mesh = new THREE.Mesh(geometry, materials);
      var tx = (col - (cols - 1) / 2) * tileW;
      var ty = ((rows - 1) / 2 - row) * tileH;
      mesh.userData.target = new THREE.Vector3(tx, ty, .08);
      mesh.userData.rotation = new THREE.Euler(0, 0, 0);
      var direction = col % 2 ? 1 : -1;
      mesh.position.set(tx + direction * (2.8 + Math.random() * 1.9), ty + (row - 1) * 2.5 + (Math.random() - .5), -1 - Math.random() * 3.5);
      mesh.rotation.set((Math.random() - .5) * .85, direction * (.7 + Math.random() * .8), (Math.random() - .5) * .7);
      mesh.userData.from = mesh.position.clone();
      mesh.userData.fromRotation = mesh.rotation.clone();
      mesh.userData.delay = (row * cols + col) * .075 + Math.random() * .12;
      mesh.userData.float = Math.random() * Math.PI * 2;
      group.add(mesh); tiles.push(mesh);
    }

    function rebuild() {
      if (vehicleRoot) { rebuildVehicle(); return; }
      tiles.forEach(function (tile) {
        tile.position.copy(tile.userData.from);
        tile.rotation.copy(tile.userData.fromRotation);
      });
      startedAt = performance.now(); elapsed = 0;
      if (state) state.textContent = modelLoading ? '3D-MODELL LÄDT' : (reduce ? 'MONTAGE FERTIG' : 'MONTAGE LÄUFT');
      root.classList.remove('audi-complete');
      if (reduce) {
        tiles.forEach(function (tile) { tile.position.copy(tile.userData.target); tile.rotation.set(0, 0, 0); });
        root.classList.add('audi-complete');
        if (state) state.textContent = 'FAHRZEUG ANSICHT';
      }
    }

    function clearImageTiles() {
      tiles.forEach(function (tile) {
        group.remove(tile); tile.geometry.dispose();
        tile.material.forEach(function (mat) { if (mat.map) mat.map.dispose(); });
      });
      tiles = [];
      group.remove(frame);
      frame.geometry.dispose();
      frame.material.dispose();
    }

    function rebuildVehicle() {
      vehicleRoot.rotation.x = 0;
      vehicleRoot.rotation.y = vehicleBaseYaw;
      targetX = 0; targetY = 0;
      vehicleParts.forEach(function (part) {
        part.mesh.position.copy(part.from);
        part.mesh.rotation.copy(part.fromRotation);
      });
      startedAt = performance.now(); elapsed = 0;
      root.classList.remove('audi-complete');
      if (state) state.textContent = reduce ? 'FAHRZEUG ANSICHT' : 'MONTAGE LÄUFT';
      if (reduce) {
        vehicleParts.forEach(function (part) {
          part.mesh.position.copy(part.target);
          part.mesh.rotation.copy(part.targetRotation);
        });
        root.classList.add('audi-complete');
      }
    }

    function loadVehicle() {
      if (modelRequestStarted) return;
      modelRequestStarted = true;
      var loader = new FBXLoader();
      loader.load('assets/models/Audi_RS_6_Avant.fbx', function (asset) {
        asset.updateMatrixWorld(true);
        var bounds = new THREE.Box3().setFromObject(asset);
        if (bounds.isEmpty()) { modelLoading = false; return; }
        var size = bounds.getSize(new THREE.Vector3());
        var center = bounds.getCenter(new THREE.Vector3());
        var scale = Math.min(8.4 / Math.max(size.x, size.z), 4.45 / Math.max(size.y, .001));
        var longestAxisIsDepth = size.z > size.x;

        clearImageTiles();
        var rig = new THREE.Group();
        rig.name = 'Audi RS 6 Avant – Montage';
        asset.scale.setScalar(scale);
        asset.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
        rig.rotation.y = (longestAxisIsDepth ? Math.PI / 2 : 0) + .22;
        rig.add(asset);
        group.add(rig);
        rig.updateMatrixWorld(true);
        vehicleRoot = rig;
        vehicleBaseYaw = rig.rotation.y;

        var meshList = [];
        asset.traverse(function (node) {
          if (!node.isMesh || !node.geometry) return;
          node.castShadow = false; node.receiveShadow = false;
          var mats = Array.isArray(node.material) ? node.material : [node.material];
          mats.forEach(function (mat) {
            if (!mat) return;
            if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
            if (mat.isMeshPhongMaterial) mat.shininess = Math.max(mat.shininess || 0, 48);
          });
          meshList.push(node);
        });

        asset.updateMatrixWorld(true);
        var total = Math.max(meshList.length, 1);
        meshList.forEach(function (mesh, i) {
          var target = mesh.position.clone();
          var targetRotation = mesh.rotation.clone();
          var partBounds = new THREE.Box3().setFromObject(mesh);
          var partCenter = partBounds.getCenter(new THREE.Vector3());
          var direction = partCenter.lengthSq() > .05 ? partCenter.normalize() : new THREE.Vector3(Math.random() - .5, Math.random() - .25, Math.random() - .5).normalize();
          var origin = mesh.getWorldPosition(new THREE.Vector3());
          var scatter = origin.add(direction.multiplyScalar(1.6 + Math.random() * 2.2));
          var from = mesh.parent.worldToLocal(scatter.clone());
          var fromRotation = new THREE.Euler(
            targetRotation.x + (Math.random() - .5) * .8,
            targetRotation.y + (Math.random() - .5) * 1.1,
            targetRotation.z + (Math.random() - .5) * .8
          );
          vehicleParts.push({
            mesh: mesh,
            target: target,
            targetRotation: targetRotation,
            from: from,
            fromRotation: fromRotation,
            delay: i / total * .65 + Math.random() * .16,
            float: Math.random() * Math.PI * 2
          });
          mesh.position.copy(from);
          mesh.rotation.copy(fromRotation);
        });

        modelLoading = false;
        root.classList.remove('audi-fallback');
        root.classList.add('audi-ready', 'audi-model-loaded');
        if (state) state.textContent = '3D-MODELL GELADEN';
        rebuildVehicle(); resize(); render(); start();
      }, function (event) {
        if (state && event.lengthComputable) {
          state.textContent = '3D-MODELL ' + Math.round(event.loaded / event.total * 100) + '%';
        } else if (state) state.textContent = '3D-MODELL LÄDT';
      }, function (error) {
        modelLoading = false;
        console.warn('[ProfessorEnte] Audi-FBX konnte nicht geladen werden.', error);
        if (state) state.textContent = 'BILDMONTAGE';
        root.classList.add('audi-fbx-fallback');
        if (tiles.length) { rebuild(); start(); }
      });
    }

    image.onload = function () {
      if (vehicleRoot) { root.classList.add('audi-ready'); return; }
      tiles.forEach(function (tile) {
        group.remove(tile); tile.geometry.dispose();
        tile.material.forEach(function (mat) { if (mat.map) mat.map.dispose(); });
      });
      tiles = [];
      for (var row = 0; row < rows; row++) for (var col = 0; col < cols; col++) makeTile(col, row);
      resize(); rebuild(); render(); start();
      root.classList.add('audi-image-ready');
    };
    image.onerror = function () { if (vehicleRoot) root.classList.add('audi-ready'); else fallback(); };

    function resize() {
      var box = root.getBoundingClientRect();
      if (!box.width || !box.height) return;
      width = box.width; height = box.height;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 620 ? 15.5 : 13.2;
      camera.updateProjectionMatrix();
    }
    function render() { if (width && height) renderer.render(scene, camera); }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
    function tick(now) {
      frameId = 0;
      if (!visible || document.hidden) return;
      var dt = Math.min((now - (lastTime || now)) / 1000, .05); lastTime = now; elapsed += dt;
      var assemblyDuration = 2.25;
      tiles.forEach(function (tile) {
        var t = Math.max(0, Math.min(1, (now - startedAt - tile.userData.delay * 1000) / (assemblyDuration * 1000)));
        var eased = easeOut(t);
        tile.position.lerpVectors(tile.userData.from, tile.userData.target, eased);
        tile.rotation.x = tile.userData.fromRotation.x * (1 - eased);
        tile.rotation.y = tile.userData.fromRotation.y * (1 - eased);
        tile.rotation.z = tile.userData.fromRotation.z * (1 - eased);
        if (t >= 1) tile.position.y += Math.sin(elapsed * 1.25 + tile.userData.float) * .018;
      });
      vehicleParts.forEach(function (part) {
        var t = Math.max(0, Math.min(1, (now - startedAt - part.delay * 1000) / (assemblyDuration * 1000)));
        var eased = easeOut(t);
        part.mesh.position.lerpVectors(part.from, part.target, eased);
        part.mesh.rotation.set(
          part.fromRotation.x + (part.targetRotation.x - part.fromRotation.x) * eased,
          part.fromRotation.y + (part.targetRotation.y - part.fromRotation.y) * eased,
          part.fromRotation.z + (part.targetRotation.z - part.fromRotation.z) * eased
        );
      });
      var complete = now - startedAt > (assemblyDuration + .9) * 1000;
      if (complete) {
        var turntable = vehicleRoot || group;
        var baseYaw = vehicleRoot ? vehicleBaseYaw : 0;
        turntable.rotation.y += (baseYaw + targetY + Math.sin(elapsed * .32) * .055 - turntable.rotation.y) * Math.min(1, dt * 1.1);
        turntable.rotation.x += (targetX + Math.sin(elapsed * .48) * .018 - turntable.rotation.x) * Math.min(1, dt * 1.1);
        if (!root.classList.contains('audi-complete')) {
          root.classList.add('audi-complete');
          if (state) state.textContent = 'FAHRZEUG ANSICHT';
        }
      }
      rim.intensity = 22 + Math.sin(elapsed * 1.4) * 5;
      render();
      if (autoplay) frameId = requestAnimationFrame(tick);
    }
    function start() {
      if (!frameId && visible && autoplay && (tiles.length || vehicleParts.length)) { lastTime = 0; frameId = requestAnimationFrame(tick); }
    }
    function stop() { if (frameId) cancelAnimationFrame(frameId); frameId = 0; }
    function replayBuild() { autoplay = true; stop(); rebuild(); start(); }

    if (replay) replay.addEventListener('click', replayBuild);
    canvas.addEventListener('pointerdown', function (event) {
      dragging = true; startX = event.clientX; startY = event.clientY; pointerX = targetY; pointerY = targetX;
      canvas.setPointerCapture(event.pointerId); canvas.classList.add('dragging');
    });
    canvas.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      targetY = Math.max(-.48, Math.min(.48, pointerX + (event.clientX - startX) * .006));
      targetX = Math.max(-.2, Math.min(.2, pointerY + (event.clientY - startY) * .003));
    });
    function endDrag() { dragging = false; canvas.classList.remove('dragging'); }
    canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
    canvas.addEventListener('pointerleave', function () { if (!dragging) { targetY *= .97; } });
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(root);
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) {
        if (!modelRequestStarted) loadVehicle();
        if (!tiles.length && image.complete && image.naturalWidth && !vehicleRoot) image.onload();
        start();
      }
      else stop();
    }, { threshold: .05 }).observe(root);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
  }

  window.PE_AUDI_MONTAGE = { init: init };
  function attach() {
    var list = document.getElementById('projectList');
    if (!list) return;
    if (document.getElementById('audiMontage')) { init(); return; }
    var observer = new MutationObserver(function () {
      if (document.getElementById('audiMontage')) { observer.disconnect(); init(); }
    });
    observer.observe(list, { childList: true, subtree: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', attach, { once: true });
  else attach();
})();
