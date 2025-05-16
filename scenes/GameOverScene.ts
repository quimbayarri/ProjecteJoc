import Phaser from "phaser"

export class GameOverScene extends Phaser.Scene {
  private score = 0

  constructor() {
    super("GameOverScene")
  }

  init(data: { score: number }) {
    this.score = data.score || 0
  }

  preload() {
    this.load.image(
      "background",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/skies/space3.png",
    )
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const centerX = width / 2
    const centerY = height / 2

    // Fons
    this.add.image(centerX, centerY, "background").setDisplaySize(width, height)

    // Efecte de partícules per al Game Over
    const particles = this.add.particles(centerX, centerY * 0.6, "star", {
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.4, end: 0 },
      lifespan: 3000,
      blendMode: "ADD",
      frequency: 100,
      tint: 0xff0000,
    })

    // Aturem les partícules després de 2 segons
    this.time.delayedCall(2000, () => {
      particles.stop()
    })

    // Text de Game Over
    this.add
      .text(centerX, centerY * 0.6, "GAME OVER", {
        fontSize: Math.floor(width / 13) + "px",
        color: "#ff0000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    // Puntuació
    this.add
      .text(centerX, centerY, `Puntuació final: ${this.score}`, {
        fontSize: Math.floor(width / 25) + "px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    // Missatge
    this.add
      .text(centerX, centerY * 1.15, "Has perdut totes les vides!", {
        fontSize: Math.floor(width / 35) + "px",
        color: "#ff9999",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    // Botó per tornar al menú
    const restartButton = this.add
      .text(centerX, centerY * 1.3, "TORNAR AL MENÚ", {
        fontSize: Math.floor(width / 28) + "px",
        color: "#ffffff",
        backgroundColor: "#6e0a0a",
        padding: {
          left: Math.floor(width / 40),
          right: Math.floor(width / 40),
          top: Math.floor(height / 60),
          bottom: Math.floor(height / 60),
        },
      })
      .setOrigin(0.5)

    restartButton.setInteractive({ useHandCursor: true })

    restartButton.on("pointerover", () => {
      restartButton.setStyle({ color: "#ffff00" })
    })

    restartButton.on("pointerout", () => {
      restartButton.setStyle({ color: "#ffffff" })
    })

    restartButton.on("pointerdown", () => {
      this.scene.start("MenuScene")
    })

    // Botó per tornar a jugar
    const playAgainButton = this.add
      .text(centerX, centerY * 1.5, "TORNAR A JUGAR", {
        fontSize: Math.floor(width / 28) + "px",
        color: "#ffffff",
        backgroundColor: "#0a6e6e",
        padding: {
          left: Math.floor(width / 40),
          right: Math.floor(width / 40),
          top: Math.floor(height / 60),
          bottom: Math.floor(height / 60),
        },
      })
      .setOrigin(0.5)

    playAgainButton.setInteractive({ useHandCursor: true })

    playAgainButton.on("pointerover", () => {
      playAgainButton.setStyle({ color: "#ffff00" })
    })

    playAgainButton.on("pointerout", () => {
      playAgainButton.setStyle({ color: "#ffffff" })
    })

    playAgainButton.on("pointerdown", () => {
      this.scene.start("GameScene", { level: 1 })
    })
  }
}
