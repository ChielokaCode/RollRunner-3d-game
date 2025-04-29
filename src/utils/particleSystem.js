import * as THREE from "three";

export class ParticleSystem {
  constructor(scene, type = "generic") {
    this.scene = scene;
    this.type = type;
    this.particles = [];

    this.material = new THREE.PointsMaterial({
      color: type === "jump" ? 0x00ffff : 0xffa500,
      size: 0.2,
    });

    this.geometry = new THREE.BufferGeometry();
    this.maxParticles = 100;
    this.positions = new Float32Array(this.maxParticles * 3);
    this.geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.positions, 3)
    );
    this.points = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.points);
  }

  emit(x, y, z) {
    for (let i = 0; i < this.maxParticles; i++) {
      this.positions[i * 3] = x + (Math.random() - 0.5);
      this.positions[i * 3 + 1] = y + (Math.random() - 0.5);
      this.positions[i * 3 + 2] = z + (Math.random() - 0.5);
    }
    this.geometry.attributes.position.needsUpdate = true;

    setTimeout(() => {
      for (let i = 0; i < this.maxParticles; i++) {
        this.positions[i * 3] = 9999;
        this.positions[i * 3 + 1] = 9999;
        this.positions[i * 3 + 2] = 9999;
      }
      this.geometry.attributes.position.needsUpdate = true;
    }, 500);
  }
}
