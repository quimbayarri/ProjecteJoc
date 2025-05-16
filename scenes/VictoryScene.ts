import Phaser from "phaser"

export class VictoryScene extends Phaser.Scene {
  private score = 0

  constructor() {
    super("VictoryScene")
  }

  init(data: { score: number }) {
    this.score = data.score || 0
  }

  preload() {
    this.load.image(
      "background",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/skies/space3.png",
    )
    this.load.image(
      "star",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/star.png",
    )
    this.load.image(
      "diamond",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/diamond.png",
    )
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const centerX = width / 2
    const centerY = height / 2

    // Fons
    this.add.image(centerX, centerY, "background").setDisplaySize(width, height)

    // Efectes d'estrelles i diamants
    for (let i = 0; i < 10; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const star = this.add.image(x, y, "star").setScale(width / 1600)

      // Animem cada estrella individualment
      this.tweens.add({
        targets: star,
        y: star.y + height * 0.4,
        alpha: { from: 1, to: 0 },
        scale: { from: width / 1600, to: width / 6400 },
        duration: Phaser.Math.Between(1500, 3000),
        ease: "Sine.easeIn",
        repeat: -1,
        delay: Phaser.Math.Between(0, 1000),
      })
    }

    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(0, width)
      const y = Phaser.Math.Between(0, height)
      const diamond = this.add.image(x, y, "diamond").setScale(width / 2000)

      // Animem cada diamant individualment
      this.tweens.add({
        targets: diamond,
        y: diamond.y + height * 0.4,
        alpha: { from: 1, to: 0 },
        scale: { from: width / 2000, to: width / 8000 },
        duration: Phaser.Math.Between(1500, 3000),
        ease: "Sine.easeIn",
        repeat: -1,
        delay: Phaser.Math.Between(0, 1000),
      })
    }

    // Text de victòria
    this.add
      .text(centerX, centerY * 0.4, "VICTÒRIA COMPLETA!", {
        fontSize: Math.floor(width / 15) + "px",
        color: "#ffff00",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    // Missatge de felicitació
    this.add
      .text(centerX, centerY * 0.65, "Has completat tots els nivells!", {
        fontSize: Math.floor(width / 28) + "px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    // Puntuació final
    this.add
      .text(centerX, centerY * 0.85, `Puntuació final: ${this.score}`, {
        fontSize: Math.floor(width / 22) + "px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)

    // Botó per tornar al menú
    const menuButton = this.add
      .text(centerX, centerY * 1.2, "TORNAR AL MENÚ", {
        fontSize: Math.floor(width / 28) + "px",
        color: "#ffffff",
        backgroundColor: "#1a6e0a",
        padding: {
          left: Math.floor(width / 40),
          right: Math.floor(width / 40),
          top: Math.floor(height / 60),
          bottom: Math.floor(height / 60),
        },
      })
      .setOrigin(0.5)

    menuButton.setInteractive({ useHandCursor: true })

    menuButton.on("pointerover", () => {
      menuButton.setStyle({ color: "#ffff00" })
    })

    menuButton.on("pointerout", () => {
      menuButton.setStyle({ color: "#ffffff" })
    })

    menuButton.on("pointerdown", () => {
      this.scene.start("MenuScene")
    })

    // Botó per jugar de nou
    const playAgainButton = this.add
      .text(centerX, centerY * 1.4, "JUGAR DE NOU", {
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
