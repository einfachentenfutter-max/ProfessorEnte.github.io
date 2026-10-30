import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

/* Three.js assembly animation for the real Audi RS 6 FBX model. */
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
    var loadingCopy = document.getElementById('audiLoadingCopy');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce && replay) replay.hidden = true;

    var renderer, scene, camera, vehicleRoot = null, parts = [];
    var frameId = 0, width = 0, height = 0, visible = false;
    var startedAt = 0, lastTime = 0, elapsed = 0;
    var targetX = 0, targetY = 0, dragging = false, dragX = 0, dragY = 0, startX = 0, startY = 0;
    var baseYaw = 0, requestStarted = false, loadFailed = false, loaded = false;

    function setStatus(text) { if (state) state.textContent = text; }
    function showLoading(text, error) {
      root.classList.toggle('audi-load-error', !!error);
      root.classList.toggle('audi-model-loading', !loaded);
      if (loadingCopy) loadingCopy.textContent = text;
    }

    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
    } catch (error) {
      showLoading('Dein Browser kann die 3D-Ansicht nicht darstellen.', true);
      setStatus('3D NICHT VERFÜGBAR');
      if (replay) replay.hidden = true;
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
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

    var ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: 0x080d16, metalness: .42, roughness: .58 })
    );
    ground.rotation.x = -Math.PI / 2; ground.position.set(0, -2.08, -1.8); scene.add(ground);
    var grid = new THREE.GridHelper(30, 30, 0x1f9ab0, 0x14333c);
    grid.position.set(0, -2.06, -1.8); grid.material.transparent = true; grid.material.opacity = .33; scene.add(grid);

    function resize() {
      var box = root.getBoundingClientRect();
      if (!box.width || !box.height) return;
      width = box.width; height = box.height;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.position.z = width < 620 ? 15.5 : 13.2;
      camera.updateProjectionMatrix();
      render();
    }
    function render() { if (renderer && width && height) renderer.render(scene, camera); }
    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function placePartsAtStart() {
      parts.forEach(function (part) {
        part.mesh.position.copy(part.from);
        part.mesh.rotation.copy(part.fromRotation);
      });
    }

    function finishParts() {
      parts.forEach(function (part) {
        part.mesh.position.copy(part.target);
        part.mesh.rotation.copy(part.targetRotation);
      });
      root.classList.add('audi-complete');
      setStatus('FAHRZEUG ANSICHT');
      render();
    }

    function rebuild() {
      if (!vehicleRoot) return;
      vehicleRoot.rotation.x = 0;
      vehicleRoot.rotation.y = baseYaw;
      targetX = 0; targetY = 0;
      root.classList.remove('audi-complete');
      if (reduce) { finishParts(); return; }
      placePartsAtStart();
      startedAt = performance.now(); elapsed = 0;
      setStatus('MONTAGE LÄUFT');
      start();
    }

    function loadVehicle() {
      if (requestStarted && !loadFailed) return;
      requestStarted = true; loadFailed = false;
      showLoading('Der Audi RS 6 wird in den Showroom geladen …');
      setStatus('3D-MODELL LÄDT');
      if (replay) { replay.disabled = true; replay.textContent = 'Modell wird geladen …'; }

      var loader = new FBXLoader();
      loader.load('assets/models/Audi_RS_6_Avant.fbx', function (asset) {
        asset.updateMatrixWorld(true);
        var bounds = new THREE.Box3().setFromObject(asset);
        if (bounds.isEmpty()) throw new Error('Die FBX-Datei enthält kein sichtbares Modell.');
        var size = bounds.getSize(new THREE.Vector3());
        var center = bounds.getCenter(new THREE.Vector3());
        var scale = Math.min(10.2 / Math.max(size.x, size.z), 4.45 / Math.max(size.y, .001));
        var longestAxisIsDepth = size.z > size.x;
        var rig = new THREE.Group();
        rig.name = 'Audi RS 6 Avant – Montage';
        asset.scale.setScalar(scale);
        asset.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
        rig.rotation.y = (longestAxisIsDepth ? Math.PI / 2 : 0) - .52;
        rig.add(asset);
        scene.add(rig);
        rig.updateMatrixWorld(true);
        vehicleRoot = rig; baseYaw = rig.rotation.y;

        var meshList = [];
        asset.traverse(function (node) {
          if (!node.isMesh || !node.geometry) return;
          node.castShadow = false; node.receiveShadow = false;
          var materials = Array.isArray(node.material) ? node.material : [node.material];
          materials.forEach(function (material) {
            if (!material) return;
            if (material.map) material.map.colorSpace = THREE.SRGBColorSpace;
            if (material.isMeshPhongMaterial) material.shininess = Math.max(material.shininess || 0, 48);
          });
          meshList.push(node);
        });
        if (!meshList.length) throw new Error('In der FBX-Datei wurden keine Modellteile gefunden.');

        asset.updateMatrixWorld(true);
        meshList.forEach(function (mesh, index) {
          var target = mesh.position.clone();
          var targetRotation = mesh.rotation.clone();
          var partBounds = new THREE.Box3().setFromObject(mesh);
          var direction = partBounds.getCenter(new THREE.Vector3());
          if (direction.lengthSq() > .05) direction.normalize();
          else direction.set(Math.random() - .5, Math.random() - .25, Math.random() - .5).normalize();
          var scatteredWorld = mesh.getWorldPosition(new THREE.Vector3()).add(direction.multiplyScalar(1.6 + Math.random() * 2.2));
          var from = mesh.parent.worldToLocal(scatteredWorld.clone());
          var fromRotation = new THREE.Euler(
            targetRotation.x + (Math.random() - .5) * .8,
            targetRotation.y + (Math.random() - .5) * 1.1,
            targetRotation.z + (Math.random() - .5) * .8
          );
          parts.push({
            mesh: mesh, target: target, targetRotation: targetRotation,
            from: from, fromRotation: fromRotation,
            delay: index / Math.max(meshList.length, 1) * .65 + Math.random() * .16
          });
        });

        loaded = true;
        root.classList.remove('audi-model-loading', 'audi-load-error');
        root.classList.add('audi-model-loaded');
        if (replay) { replay.disabled = false; replay.textContent = '↻ Montage neu starten'; }
        rebuild(); resize(); render();
        if (reduce) finishParts(); else start();
      }, function (event) {
        if (event.lengthComputable) {
          var percent = Math.round(event.loaded / event.total * 100);
          setStatus('3D-MODELL ' + percent + '%');
          showLoading('Der Audi RS 6 wird geladen · ' + percent + ' %');
        } else {
          setStatus('3D-MODELL LÄDT');
        }
      }, function (error) {
        loadFailed = true;
        showLoading('Das 3D-Modell konnte nicht geladen werden.');
        setStatus('LADEN FEHLGESCHLAGEN');
        if (replay) { replay.disabled = false; replay.textContent = 'Erneut versuchen'; }
        console.warn('[ProfessorEnte] Audi-FBX konnte nicht geladen werden.', error);
      });
    }

    function tick(now) {
      frameId = 0;
      if (!visible || document.hidden || !vehicleRoot) return;
      var dt = Math.min((now - (lastTime || now)) / 1000, .05);
      lastTime = now; elapsed += dt;
      var duration = 2.25;
      parts.forEach(function (part) {
        var t = Math.max(0, Math.min(1, (now - startedAt - part.delay * 1000) / (duration * 1000)));
        var eased = easeOut(t);
        part.mesh.position.lerpVectors(part.from, part.target, eased);
        part.mesh.rotation.set(
          part.fromRotation.x + (part.targetRotation.x - part.fromRotation.x) * eased,
          part.fromRotation.y + (part.targetRotation.y - part.fromRotation.y) * eased,
          part.fromRotation.z + (part.targetRotation.z - part.fromRotation.z) * eased
        );
      });

      var complete = now - startedAt > (duration + .9) * 1000;
      if (complete) {
        vehicleRoot.rotation.y += (baseYaw + targetY + Math.sin(elapsed * .32) * .11 - vehicleRoot.rotation.y) * Math.min(1, dt * 1.1);
        vehicleRoot.rotation.x += (targetX + Math.sin(elapsed * .48) * .018 - vehicleRoot.rotation.x) * Math.min(1, dt * 1.1);
        if (!root.classList.contains('audi-complete')) {
          root.classList.add('audi-complete');
          setStatus('FAHRZEUG ANSICHT');
        }
      }
      rim.intensity = 22 + Math.sin(elapsed * 1.4) * 5;
      render();
      frameId = requestAnimationFrame(tick);
    }
    function start() {
      if (!frameId && visible && !document.hidden && !reduce && vehicleRoot) {
        lastTime = 0; frameId = requestAnimationFrame(tick);
      }
    }
    function stop() { if (frameId) cancelAnimationFrame(frameId); frameId = 0; }

    if (replay) replay.addEventListener('click', function () { if (loaded) rebuild(); else loadVehicle(); });
    canvas.addEventListener('pointerdown', function (event) {
      if (!loaded) return;
      dragging = true; startX = event.clientX; startY = event.clientY; dragX = targetY; dragY = targetX;
      canvas.setPointerCapture(event.pointerId); canvas.classList.add('dragging');
    });
    canvas.addEventListener('pointermove', function (event) {
      if (!dragging) return;
      targetY = Math.max(-.65, Math.min(.65, dragX + (event.clientX - startX) * .006));
      targetX = Math.max(-.22, Math.min(.22, dragY + (event.clientY - startY) * .003));
    });
    function endDrag() { dragging = false; canvas.classList.remove('dragging'); }
    canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
    window.addEventListener('resize', resize);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(root);
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      if (visible) { if (!requestStarted || loadFailed) loadVehicle(); start(); }
      else stop();
    }, { threshold: .05 }).observe(root);
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else start(); });
    showLoading('Der Audi RS 6 wird in den Showroom geladen …');
    resize();
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
