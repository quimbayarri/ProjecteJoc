import Phaser from "phaser"

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("MenuScene")
  }

  preload() {
    // Carreguem les imatges des d'URLs públiques
    this.load.image(
      "background",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/skies/space3.png",
    )
    this.load.image(
      "background2",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/skies/underwater1.png",
    )
    this.load.image(
      "logo",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/phaser3-logo.png",
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

    // Logo
    const logo = this.add.image(centerX, centerY * 0.4, "logo")
    logo.setScale(Math.min(width / 1600, height / 1200) * 0.8)

    // Títol
    const titleText = this.add
      .text(centerX, centerY * 0.7, "AVENTURA DE PLATAFORMES", {
        fontSize: Math.floor(width / 20) + "px",
        color: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)

    // Previsualització dels nivells
    // Nivell 1
    const level1Preview = this.add.rectangle(
      centerX - width * 0.2,
      centerY * 0.9,
      width * 0.3,
      height * 0.15,
      0x000000,
      0.7,
    )
    level1Preview.setStrokeStyle(2, 0xffff00)

    this.add
      .image(centerX - width * 0.2, centerY * 0.9, "background")
      .setDisplaySize(width * 0.28, height * 0.13)
      .setAlpha(0.8)

    this.add.image(centerX - width * 0.25, centerY * 0.9, "star").setScale(width / 2000)

    this.add
      .text(centerX - width * 0.2, centerY * 0.85, "Nivell 1", {
        fontSize: Math.floor(width / 40) + "px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.add
      .text(centerX - width * 0.2, centerY * 0.95, "Espai", {
        fontSize: Math.floor(width / 50) + "px",
        color: "#ffff00",
      })
      .setOrigin(0.5)

    // Nivell 2
    const level2Preview = this.add.rectangle(
      centerX + width * 0.2,
      centerY * 0.9,
      width * 0.3,
      height * 0.15,
      0x000000,
      0.7,
    )
    level2Preview.setStrokeStyle(2, 0x00ffff)

    this.add
      .image(centerX + width * 0.2, centerY * 0.9, "background2")
      .setDisplaySize(width * 0.28, height * 0.13)
      .setAlpha(0.8)

    this.add.image(centerX + width * 0.25, centerY * 0.9, "diamond").setScale(width / 2500)

    this.add
      .text(centerX + width * 0.2, centerY * 0.85, "Nivell 2", {
        fontSize: Math.floor(width / 40) + "px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)

    this.add
      .text(centerX + width * 0.2, centerY * 0.95, "Sota l'aigua", {
        fontSize: Math.floor(width / 50) + "px",
        color: "#00ffff",
      })
      .setOrigin(0.5)

    // Instruccions
    const instructions = [
      "Fletxes: Moure/Saltar",
      "Z: Disparar",
      "Recull totes les monedes per obrir el portal",
      "Evita els enemics o dispara'ls",
    ]

    let y = centerY * 1.15
    const lineHeight = height / 25
    instructions.forEach((text) => {
      this.add
        .text(centerX, y, text, {
          fontSize: Math.floor(width / 35) + "px",
          color: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
        })
        .setOrigin(0.5)
      y += lineHeight
    })

    // Botó per començar
    const startButton = this.add
      .text(centerX, centerY * 1.6, "COMENÇAR JOC", {
        fontSize: Math.floor(width / 25) + "px",
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

    startButton.setInteractive({ useHandCursor: true })

    startButton.on("pointerover", () => {
      startButton.setStyle({ color: "#ffff00" })
    })

    startButton.on("pointerout", () => {
      startButton.setStyle({ color: "#ffffff" })
    })

    startButton.on("pointerdown", () => {
      this.scene.start("GameScene", { level: 1 })
    })

    // Efecte de pulsació per al botó
    this.tweens.add({
      targets: startButton,
      scale: { from: 1, to: 1.1 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    })
  }
}
