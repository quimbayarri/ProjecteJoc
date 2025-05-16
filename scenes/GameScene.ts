import Phaser from "phaser"

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private platforms!: Phaser.Physics.Arcade.StaticGroup
  private coins!: Phaser.Physics.Arcade.Group
  private enemies!: Phaser.Physics.Arcade.Group
  private bullets!: Phaser.Physics.Arcade.Group
  private portal!: Phaser.Physics.Arcade.Sprite
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private shootKey!: Phaser.Input.Keyboard.Key
  private scoreText!: Phaser.GameObjects.Text
  private livesText!: Phaser.GameObjects.Text
  private levelText!: Phaser.GameObjects.Text
  private coinsText!: Phaser.GameObjects.Text
  private score = 0
  private lives = 3
  private playerDirection = "right"
  private currentLevel = 1
  private totalCoins = 0
  private collectedCoins = 0
  private portalVisible = false
  private invulnerable = false
  private spikes!: Phaser.Physics.Arcade.StaticGroup
  private background!: Phaser.GameObjects.TileSprite
  private lastHitTime = 0 // Para controlar el tiempo entre daños

  constructor() {
    super("GameScene")
  }

  init(data: { level?: number; score?: number; lives?: number }) {
    // Inicializamos el nivel y mantenemos la puntuación y vidas entre niveles
    this.currentLevel = data.level || 1
    this.score = data.score || 0
    this.lives = data.lives || 3
    this.collectedCoins = 0
    this.portalVisible = false
    this.invulnerable = false
    this.lastHitTime = 0
  }

  preload() {
    // Cargamos las imágenes desde URLs públicas
    this.load.image(
      "background1",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/skies/space3.png",
    )
    this.load.image(
      "background2",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/skies/sky4.png",
    )
    this.load.image(
      "ground1",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/platform.png",
    )
    this.load.image(
      "ground2",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/block.png",
    )
    this.load.image(
      "star",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/star.png",
    )
    this.load.image(
      "diamond",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/diamond.png",
    )
    this.load.image(
      "enemy1",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/space-baddie.png",
    )
    this.load.image(
      "enemy2",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/ghost.png",
    )
    this.load.image(
      "enemy3",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/ufo.png",
    )
    this.load.image(
      "enemy4",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/mushroom2.png",
    )
    this.load.image(
      "bullet1",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/bullets/bullet6.png",
    )
    this.load.image(
      "bullet2",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/bullets/bullet7.png",
    )
    this.load.image(
      "portal",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/orb-blue.png",
    )
    this.load.image(
      "spikes",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/saw.png",
    )
    this.load.image(
      "bigspikes",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/spike.png",
    )
    this.load.spritesheet(
      "dude",
      "https://raw.githubusercontent.com/photonstorm/phaser3-examples/master/public/assets/sprites/dude.png",
      {
        frameWidth: 32,
        frameHeight: 48,
      },
    )
  }

  create() {
    const width = this.cameras.main.width
    const height = this.cameras.main.height
    const centerX = width / 2
    const centerY = height / 2

    // Configuramos el mundo para que sea más extenso
    const worldWidth = width * 4 // Mundo más grande
    const worldHeight = height * 2 // Mundo más alto

    // Configuramos los límites del mundo físico
    try {
      this.physics.world.setBounds(0, 0, worldWidth, worldHeight)
    } catch (error) {
      console.error("Error al configurar los límites del mundo:", error)
    }

    // Configuración específica para cada nivel
    if (this.currentLevel === 1) {
      // Nivel 1: Espacio - Usamos un TileSprite para que cubra todo el nivel
      this.background = this.add.tileSprite(0, 0, worldWidth, worldHeight, "background1")
      this.background.setOrigin(0, 0)
      this.background.setScrollFactor(0.1) // Efecto parallax suave

      // Gravedad normal
      this.physics.world.gravity.y = 300
    } else {
      // Nivel 2: Planeta con pinchos - Usamos un TileSprite para que cubra todo el nivel
      this.background = this.add.tileSprite(0, 0, worldWidth, worldHeight, "background2")
      this.background.setOrigin(0, 0)
      this.background.setScrollFactor(0.1) // Efecto parallax suave

      // Gravedad normal
      this.physics.world.gravity.y = 300
    }

    // Plataformas
    this.platforms = this.physics.add.staticGroup()

    // Pinchos
    this.spikes = this.physics.add.staticGroup()

    // Configuración de las plataformas según el nivel
    this.setupLevel(width, height)

    // Jugador
    this.player = this.physics.add.sprite(width * 0.15, height * 0.5, "dude")
    this.player.setSize(20, 32)
    this.player.setBounce(0.2)
    this.player.setCollideWorldBounds(true)
    this.player.setDepth(1) // Aseguramos que el jugador esté visualmente por encima

    // Configuramos la cámara para que siga al jugador
    try {
      this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)
      this.cameras.main.startFollow(this.player, true, 0.08, 0.08)
      this.cameras.main.setDeadzone(width * 0.1, height * 0.1)
    } catch (error) {
      console.error("Error al configurar la cámara:", error)
    }

    // Animaciones del jugador
    try {
      this.setupPlayerAnimations()
    } catch (error) {
      console.error("Error al configurar las animaciones:", error)
    }

    // Monedas (estrellas o diamantes según el nivel)
    this.coins = this.physics.add.group({
      allowGravity: false, // Desactivamos la gravedad para todas las monedas
    })

    // Enemigos
    this.enemies = this.physics.add.group()
    this.addEnemies(width, height)

    // Portal (inicialmente oculto)
    this.portal = this.physics.add.sprite(width * 0.94, height * 0.25, "portal")
    this.portal.setScale(width / 800)
    this.portal.setVisible(false)
    this.portal.body.enable = false

    // Sistema de balas
    this.bullets = this.physics.add.group()

    // Controles
    this.cursors = this.input.keyboard?.createCursorKeys() || ({} as Phaser.Types.Input.Keyboard.CursorKeys)
    this.shootKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.Z) || ({} as Phaser.Input.Keyboard.Key)

    // Colisiones
    this.physics.add.collider(this.player, this.platforms)
    this.physics.add.collider(this.enemies, this.platforms)
    this.physics.add.collider(this.portal, this.platforms)
    this.physics.add.collider(this.enemies, this.enemies)

    // Colisiones con pinchos - Usamos overlap para mejor control
    this.physics.add.overlap(this.player, this.spikes, this.hitSpikes, undefined, this)

    // Recoger monedas
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, undefined, this)

    // Colisión con enemigos
    this.physics.add.overlap(this.player, this.enemies, this.hitEnemy, undefined, this)

    // Colisión de balas con enemigos
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemyWithBullet, undefined, this)
    this.physics.add.collider(this.bullets, this.platforms, this.bulletHitPlatform, undefined, this)

    // Colisión con el portal
    this.physics.add.overlap(this.player, this.portal, this.enterPortal, undefined, this)

    // Interfaz de usuario
    const fontSize = Math.max(14, Math.floor(width / 35)) // Texto más grande

    this.scoreText = this.add
      .text(16, 16, `Puntuació: ${this.score}`, {
        fontSize: fontSize + "px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setScrollFactor(0) // Fijamos el texto para que no se mueva con la cámara

    this.livesText = this.add
      .text(16, 16 + fontSize * 1.5, `Vides: ${this.lives}`, {
        fontSize: fontSize + "px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setScrollFactor(0) // Fijamos el texto para que no se mueva con la cámara

    // Texto del nivel actual
    this.levelText = this.add
      .text(width - 16, 16, `Nivell: ${this.currentLevel}/2`, {
        fontSize: fontSize + "px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0) // Fijamos el texto para que no se mueva con la cámara

    // Texto de monedas recogidas
    this.coinsText = this.add
      .text(width - 16, 16 + fontSize * 1.5, `Monedes: ${this.collectedCoins}/${this.totalCoins}`, {
        fontSize: fontSize + "px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(1, 0)
      .setScrollFactor(0) // Fijamos el texto para que no se mueva con la cámara

    // Añadimos las monedas después de crear las plataformas
    this.addCoins(width, height)

    // Instrucciones en pantalla
    this.add
      .text(centerX, height * 0.96, "Fletxes: Moure/Saltar | Z: Disparar", {
        fontSize: Math.max(12, Math.floor(width / 45)) + "px",
        color: "#ffffff",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setScrollFactor(0) // Fijamos el texto para que no se mueva con la cámara
  }

  setupPlayerAnimations() {
    try {
      this.anims.create({
        key: "left",
        frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1,
      })

      this.anims.create({
        key: "turn",
        frames: [{ key: "dude", frame: 4 }],
        frameRate: 20,
      })

      this.anims.create({
        key: "right",
        frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1,
      })
    } catch (error) {
      console.error("Error al crear animaciones:", error)
    }
  }

  setupLevel(width: number, height: number) {
    if (this.currentLevel === 1) {
      // Nivel 1: Plataformas metálicas en el espacio
      const groundScale = width / 800
      const platformScale = width / 1600

      // Suelo completo sin huecos - Hacemos las plataformas más largas para eliminar los huecos
      // Mantenemos las posiciones originales pero aumentamos la escala
      this.platforms
        .create(width * 0.25, height * 0.94, "ground1")
        .setScale(groundScale * 1.5, groundScale) // Más ancha
        .refreshBody()
        .setTint(0xaaaaaa)
      this.platforms
        .create(width * 0.62, height * 0.94, "ground1")
        .setScale(groundScale * 1.5, groundScale) // Más ancha
        .refreshBody()
        .setTint(0xaaaaaa)
      this.platforms
        .create(width * 0.94, height * 0.94, "ground1")
        .setScale(groundScale * 1.5, groundScale) // Más ancha
        .refreshBody()
        .setTint(0xaaaaaa)

      // Añadimos más plataformas para extender el nivel
      this.platforms
        .create(width * 1.25, height * 0.94, "ground1")
        .setScale(groundScale * 1.5, groundScale) // Más ancha
        .refreshBody()
        .setTint(0xaaaaaa)
      this.platforms
        .create(width * 1.62, height * 0.94, "ground1")
        .setScale(groundScale * 1.5, groundScale) // Más ancha
        .refreshBody()
        .setTint(0xaaaaaa)
      this.platforms
        .create(width * 1.94, height * 0.94, "ground1")
        .setScale(groundScale * 1.5, groundScale) // Más ancha
        .refreshBody()
        .setTint(0xaaaaaa)
      this.platforms
        .create(width * 2.25, height * 0.94, "ground1")
        .setScale(groundScale * 1.5, groundScale) // Más ancha
        .refreshBody()
        .setTint(0xaaaaaa)
      this.platforms
        .create(width * 2.62, height * 0.94, "ground1")
        .setScale(groundScale * 1.5, groundScale) // Más ancha
        .refreshBody()
        .setTint(0xaaaaaa)
      this.platforms
        .create(width * 2.94, height * 0.94, "ground1")
        .setScale(groundScale * 1.5, groundScale) // Más ancha
        .refreshBody()
        .setTint(0xaaaaaa)
      this.platforms
        .create(width * 3.25, height * 0.94, "ground1")
        .setScale(groundScale * 1.5, groundScale) // Más ancha
        .refreshBody()
        .setTint(0xaaaaaa)
      this.platforms
        .create(width * 3.62, height * 0.94, "ground1")
        .setScale(groundScale * 1.5, groundScale) // Más ancha
        .refreshBody()
        .setTint(0xaaaaaa)

      // Plataformas flotantes - aseguramos que no se puedan atravesar desde abajo
      const createPlatform = (x: number, y: number) => {
        const platform = this.platforms
          .create(width * x, height * y, "ground1")
          .setScale(platformScale * 1.2, platformScale) // Más ancha para tener más espacio para monedas
          .refreshBody()
          .setTint(0xaaaaaa)

        // Solo bloqueamos colisiones desde arriba, permitiendo pasar a través desde abajo
        platform.body.checkCollision.down = false
        platform.body.checkCollision.left = false
        platform.body.checkCollision.right = false

        return platform
      }

      // Plataformas originales
      createPlatform(0.78, 0.73)
      createPlatform(0.08, 0.42)
      createPlatform(0.94, 0.38)
      createPlatform(0.5, 0.58)
      createPlatform(0.28, 0.79)

      // Nuevas plataformas para extender el nivel
      createPlatform(1.2, 0.65)
      createPlatform(1.5, 0.5)
      createPlatform(1.8, 0.7)
      createPlatform(2.1, 0.45)
      createPlatform(2.4, 0.6)
      createPlatform(2.7, 0.75)
      createPlatform(2.9, 0.4)
      createPlatform(3.2, 0.55)
      createPlatform(3.5, 0.7)
      createPlatform(3.8, 0.45)
    } else {
      // Nivel 2: Planeta sin pinchos
      const worldWidth = width * 4
      const worldHeight = height * 2
      const groundScale = width / 800
      const platformScale = width / 1600

      // Suelo principal sin pinchos
      const createGroundSection = (x: number) => {
        return this.platforms
          .create(width * x, height * 0.94, "ground1")
          .setScale(groundScale * 1.5, groundScale) // Más ancha
          .refreshBody()
          .setTint(0x996633) // Color marrón para el suelo
      }

      // Creamos secciones de suelo continuas
      createGroundSection(0.25)
      createGroundSection(0.62)
      createGroundSection(0.94)
      createGroundSection(1.25)
      createGroundSection(1.62)
      createGroundSection(1.94)
      createGroundSection(2.25)
      createGroundSection(2.62)
      createGroundSection(2.94)
      createGroundSection(3.25)
      createGroundSection(3.62)

      // Función para crear plataformas
      const createPlatform = (x: number, y: number) => {
        const platform = this.platforms
          .create(width * x, height * y, "ground1")
          .setScale(platformScale * 1.2, platformScale)
          .refreshBody()
          .setTint(0x996633)

        // Solo bloqueamos colisiones desde arriba
        platform.body.checkCollision.down = false
        platform.body.checkCollision.left = false
        platform.body.checkCollision.right = false

        return platform
      }

      // Plataformas sin pinchos
      createPlatform(0.78, 0.73)
      createPlatform(0.08, 0.42)
      createPlatform(0.94, 0.38)
      createPlatform(0.5, 0.58)
      createPlatform(0.28, 0.79)
      createPlatform(1.2, 0.65)
      createPlatform(1.5, 0.5)
      createPlatform(1.8, 0.7)
      createPlatform(2.1, 0.45)
      createPlatform(2.4, 0.6)
      createPlatform(2.7, 0.75)
      createPlatform(2.9, 0.4)
      createPlatform(3.2, 0.55)
      createPlatform(3.5, 0.7)
      createPlatform(3.8, 0.45)
    }
  }

  addCoins(width: number, height: number) {
    // Limpiamos las monedas existentes
    this.coins.clear(true, true)

    // Configuración según el nivel
    const coinType = this.currentLevel === 1 ? "star" : "diamond"
    this.totalCoins = this.currentLevel === 1 ? 25 : 30

    // Ajustamos el tamaño de las monedas según el nivel
    // Estrellas más pequeñas en el nivel 1, diamantes normales en el nivel 2
    const coinScale = this.currentLevel === 1 ? width / 2400 : width / 1600

    // Obtenemos todas las plataformas para colocar las monedas sobre ellas
    const platformBodies = this.platforms.getChildren()

    // Aseguramos que todas las monedas se generen correctamente
    let coinsCreated = 0
    const maxAttempts = this.totalCoins * 3 // Permitimos varios intentos por moneda
    let attempts = 0

    while (coinsCreated < this.totalCoins && attempts < maxAttempts) {
      attempts++

      // Seleccionamos una plataforma aleatoria
      const platformIndex = Phaser.Math.Between(0, platformBodies.length - 1)
      const platform = platformBodies[platformIndex] as Phaser.Physics.Arcade.Sprite

      // Calculamos una posición sobre la plataforma
      const platformWidth = platform.width * platform.scaleX
      const platformX = platform.x
      const platformY = platform.y

      // Posición aleatoria sobre la plataforma, con margen para evitar bordes
      const margin = 30
      const minX = Math.max(platformX - platformWidth / 2 + margin, 20)
      const maxX = Math.min(platformX + platformWidth / 2 - margin, width * 4 - 20)

      // Solo continuamos si la plataforma es lo suficientemente ancha
      if (maxX <= minX) continue

      const x = Phaser.Math.Between(minX, maxX)
      const y = platformY - (platform.height * platform.scaleY) / 2 - 25 // Un poco más arriba para evitar colisiones

      // Verificamos que no haya otra moneda muy cerca
      let tooClose = false
      this.coins.getChildren().forEach((otherCoin) => {
        const coin = otherCoin as Phaser.Physics.Arcade.Sprite
        const distance = Phaser.Math.Distance.Between(x, y, coin.x, coin.y)
        if (distance < 40) {
          tooClose = true
        }
      })

      if (tooClose) continue

      // Creamos la moneda
      const coin = this.coins.create(x, y, coinType)
      coin.setScale(coinScale)

      // Desactivamos la gravedad para las monedas para que no caigan
      coin.body.setAllowGravity(false)

      // Efecto de rotación diferente según el nivel
      if (this.currentLevel === 1) {
        // Nivel 1: Rotación simple
        coin.setData("rotationSpeed", 1)
      } else {
        // Nivel 2: Diamantes con rotación simple
        coin.setData("rotationSpeed", 2)
        coin.setTint(0xffff00) // Amarillo más visible
      }

      coinsCreated++
    }

    // Si no pudimos crear todas las monedas, ajustamos el total
    if (coinsCreated < this.totalCoins) {
      console.warn(`Solo se pudieron crear ${coinsCreated} monedas de ${this.totalCoins}`)
      this.totalCoins = coinsCreated
    }

    // Actualizamos el texto de monedas
    if (this.coinsText) {
      this.coinsText.setText(`Monedes: ${this.collectedCoins}/${this.totalCoins}`)
    }
  }

  addEnemies(width: number, height: number) {
    // Limpiamos los enemigos existentes
    this.enemies.clear(true, true)

    // Calculamos las dimensiones del mundo
    const worldWidth = width * 4
    const worldHeight = height * 2

    if (this.currentLevel === 1) {
      // Nivel 1: Enemigos espaciales
      const enemyCount = 15 // Más enemigos para un nivel más grande

      for (let i = 0; i < enemyCount; i++) {
        try {
          // Distribuimos los enemigos por todo el mundo
          const x = Phaser.Math.Between(width * 0.1, worldWidth * 0.9)
          const y = Phaser.Math.Between(height * 0.1, height * 0.7)
          const enemy = this.enemies.create(x, y, "enemy1")
          enemy.setBounce(1)
          enemy.setCollideWorldBounds(true)
          enemy.setVelocity(Phaser.Math.Between(-100, 100), 20)

          // Añadimos un contorno para hacerlos más visibles
          const graphics = this.add.graphics()
          graphics.lineStyle(2, 0xffff00, 1)
          graphics.strokeCircle(0, 0, 16)
          graphics.generateTexture("enemy-outline", 32, 32)
          graphics.destroy()

          const outline = this.add.image(enemy.x, enemy.y, "enemy-outline")
          enemy.setData("outline", outline)
        } catch (error) {
          console.error("Error al crear enemigo nivel 1:", error)
        }
      }
    } else {
      // Nivel 2: Más variedad de enemigos
      const enemyCount = 30 // Aumentamos el número de enemigos

      // Altura del suelo para evitar crear enemigos debajo
      const floorHeight = height * 0.94 - 20 // Un poco por encima del suelo

      for (let i = 0; i < enemyCount; i++) {
        try {
          // Distribuimos los enemigos por todo el mundo, pero aseguramos que estén por encima del suelo
          const x = Phaser.Math.Between(worldWidth * 0.1, worldWidth * 0.9)

          // Aseguramos que los enemigos se creen por encima del suelo
          // Limitamos la altura mínima para que no aparezcan debajo de la plataforma principal
          const minY = height * 0.1
          const maxY = height * 0.8
          const y = Phaser.Math.Between(minY, maxY)

          // Si la posición Y está cerca del suelo, la ajustamos para que esté claramente por encima
          const adjustedY = y > floorHeight ? y - 50 : y

          // Elegimos entre 4 tipos de enemigos
          const enemyTypes = ["enemy1", "enemy2", "enemy3", "enemy4"]
          const enemyType = enemyTypes[i % enemyTypes.length]
          const enemy = this.enemies.create(x, adjustedY, enemyType)

          // Configuración según el tipo de enemigo
          switch (enemyType) {
            case "enemy1": // Enemigos que saltan
              enemy.setBounce(1)
              enemy.setCollideWorldBounds(true)
              enemy.setVelocity(Phaser.Math.Between(-100, 100), Phaser.Math.Between(-200, -100))
              enemy.setTint(0xff0000) // Color rojo
              enemy.setData("type", "jumper")
              enemy.body.setAllowGravity(true)
              enemy.body.gravity.y = 300
              break

            case "enemy2": // Enemigos flotantes
              enemy.setScale(0.8)
              enemy.setTint(0x00ffff) // Color cian
              enemy.setData("type", "floater")
              enemy.body.setAllowGravity(false)
              enemy.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-50, 50))
              enemy.setCollideWorldBounds(true)
              enemy.setBounce(1)
              break

            case "enemy3": // UFOs que persiguen al jugador
              enemy.setScale(0.6)
              enemy.setTint(0x00ff00) // Color verde
              enemy.setData("type", "follower")
              enemy.body.setAllowGravity(false)
              enemy.setCollideWorldBounds(true)

              // Añadimos un efecto de brillo
              const glow = this.add.sprite(enemy.x, enemy.y, enemyType).setScale(0.8).setAlpha(0.3).setTint(0x00ff00)

              enemy.setData("glow", glow)

              // Animación de pulsación para el brillo
              this.tweens.add({
                targets: glow,
                scale: 1,
                alpha: 0.2,
                duration: 800,
                yoyo: true,
                repeat: -1,
              })
              break

            case "enemy4": // Hongos que se mueven rápido
              enemy.setScale(0.5)
              enemy.setTint(0xff00ff) // Color magenta
              enemy.setData("type", "rusher")
              enemy.body.setAllowGravity(true)
              enemy.body.gravity.y = 300
              enemy.setBounce(0.8)
              enemy.setCollideWorldBounds(true)
              break
          }

          // Añadimos un contorno para mayor visibilidad
          const graphics = this.add.graphics()
          graphics.lineStyle(2, 0xffffff, 1)
          graphics.strokeCircle(0, 0, 16)
          graphics.generateTexture(enemyType + "-outline", 32, 32)
          graphics.destroy()

          const outline = this.add.image(enemy.x, enemy.y, enemyType + "-outline")
          enemy.setData("outline", outline)
        } catch (error) {
          console.error("Error al crear enemigo nivel 2:", error)
        }
      }
    }
  }

  update() {
    // Actualizamos el efecto parallax del fondo
    if (this.background) {
      this.background.tilePositionX = this.cameras.main.scrollX * 0.1
      this.background.tilePositionY = this.cameras.main.scrollY * 0.1
    }

    // Movimiento del jugador
    const playerSpeed = 160
    const jumpForce = -350

    if (this.cursors.left?.isDown) {
      this.player.setVelocityX(-playerSpeed)
      this.player.anims.play("left", true)
      this.playerDirection = "left"
    } else if (this.cursors.right?.isDown) {
      this.player.setVelocityX(playerSpeed)
      this.player.anims.play("right", true)
      this.playerDirection = "right"
    } else {
      this.player.setVelocityX(0)
      this.player.anims.play("turn")
    }

    // Salto
    if (this.cursors.up?.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(jumpForce)
    }

    // Disparar
    if (Phaser.Input.Keyboard.JustDown(this.shootKey)) {
      this.fireBullet()
    }

    // Actualizamos los enemigos
    if (this.enemies) {
      this.enemies.children.iterate((child) => {
        if (!child) return true

        const enemy = child as Phaser.Physics.Arcade.Sprite
        if (enemy.active) {
          // Actualizamos la posición de los contornos
          const outline = enemy.getData("outline") as Phaser.GameObjects.Image
          if (outline) {
            outline.x = enemy.x
            outline.y = enemy.y
          }

          // Actualizamos el brillo si existe
          const glow = enemy.getData("glow") as Phaser.GameObjects.Sprite
          if (glow) {
            glow.x = enemy.x
            glow.y = enemy.y
          }

          // Comportamiento específico según el tipo de enemigo en el nivel 2
          if (this.currentLevel === 2) {
            const type = enemy.getData("type")

            switch (type) {
              case "floater":
                // Enemigos flotantes: movimiento aleatorio
                if (Phaser.Math.Between(0, 100) < 2) {
                  const speedX = Phaser.Math.Between(-50, 50)
                  const speedY = Phaser.Math.Between(-50, 50)
                  enemy.setVelocity(speedX, speedY)
                }
                // Efecto de flotación
                enemy.y += Math.sin(this.time.now / 500) * 0.5
                break

              case "jumper":
                // Enemigos saltarines: si están en el suelo, les damos un impulso aleatorio
                if (enemy.body.touching.down && Phaser.Math.Between(0, 100) < 5) {
                  enemy.setVelocityY(Phaser.Math.Between(-300, -200))
                  enemy.setVelocityX(Phaser.Math.Between(-100, 100))
                }
                break

              case "follower":
                // UFOs que persiguen al jugador
                const dx = this.player.x - enemy.x
                const dy = this.player.y - enemy.y
                const distance = Math.sqrt(dx * dx + dy * dy)

                // Solo persiguen si están a cierta distancia
                if (distance < 300 && distance > 50) {
                  const speed = 60
                  const vx = (dx / distance) * speed
                  const vy = (dy / distance) * speed
                  enemy.setVelocity(vx, vy)

                  // Rotamos el enemigo hacia el jugador
                  enemy.rotation = Math.atan2(dy, dx)
                } else if (distance <= 50) {
                  // Si están muy cerca, se alejan un poco
                  enemy.setVelocity(-dx * 0.5, -dy * 0.5)
                }
                break

              case "rusher":
                // Hongos que se mueven rápido en dirección horizontal
                if (enemy.body.touching.down) {
                  // Si están en el suelo, saltan y se mueven rápido
                  if (Phaser.Math.Between(0, 100) < 3) {
                    const direction = Phaser.Math.Between(0, 1) ? 1 : -1
                    enemy.setVelocityX(direction * 200)
                    enemy.setVelocityY(-150)
                  }
                }
                break
            }
          }
        }
        return true
      })
    }

    // Hacemos que las monedas giren
    if (this.coins) {
      this.coins.children.iterate((child) => {
        if (!child) return true

        const coin = child as Phaser.Physics.Arcade.Sprite
        if (coin.active) {
          const rotationSpeed = coin.getData("rotationSpeed") || 1
          coin.angle += rotationSpeed
        }
        return true
      })
    }

    // Efecto de pulsación para el portal si es visible
    if (this.portalVisible && this.portal) {
      this.portal.rotation += 0.02
    }
  }

  collectCoin(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    coin: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ) {
    const coinSprite = coin as Phaser.Physics.Arcade.Sprite
    coinSprite.disableBody(true, true)

    // Actualizamos la puntuación (más puntos en el nivel 2)
    const points = this.currentLevel === 1 ? 10 : 15
    this.score += points
    this.scoreText.setText(`Puntuació: ${this.score}`)

    // Actualizamos el contador de monedas
    this.collectedCoins++
    if (this.coinsText) {
      this.coinsText.setText(`Monedes: ${this.collectedCoins}/${this.totalCoins}`)
    }

    // Efecto visual
    try {
      this.tweens.add({
        targets: coinSprite,
        scale: 0,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          coinSprite.destroy()
        },
      })
    } catch (error) {
      console.error("Error en efecto visual de moneda:", error)
      coinSprite.destroy()
    }

    // Comprobamos si hemos recogido todas las monedas
    if (this.collectedCoins >= this.totalCoins && !this.portalVisible) {
      this.showPortal()
    }
  }

  hitSpikes(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    spike: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ) {
    // Si el jugador es invulnerable, no hacemos nada
    if (this.invulnerable) return

    // Verificamos que la colisión sea real y no a distancia
    // Comprobamos que el jugador esté realmente tocando el pincho visualmente
    const playerSprite = player as Phaser.Physics.Arcade.Sprite
    const spikeSprite = spike as Phaser.Physics.Arcade.Sprite

    // Obtenemos los bounds reales (visuales) de ambos sprites
    const playerBounds = playerSprite.getBounds()
    const spikeBounds = spikeSprite.getBounds()

    // Calculamos la intersección real
    const intersection = Phaser.Geom.Rectangle.Intersection(playerBounds, spikeBounds)

    // Solo aplicamos daño si hay una intersección significativa
    // Esto evita daño a distancia
    if (intersection.width < 5 || intersection.height < 5) {
      return
    }

    // Actualizamos el tiempo del último golpe
    this.lastHitTime = this.time.now

    // Reducimos las vidas - Aseguramos que se quite 1 vida
    this.lives = Math.max(0, this.lives - 1)
    this.livesText.setText(`Vides: ${this.lives}`)

    // Efecto visual para mostrar el daño
    this.cameras.main.shake(200, 0.02)
    playerSprite.setTint(0xff0000)

    // Hacemos el jugador invulnerable temporalmente
    this.invulnerable = true

    // Efecto de parpadeo más visible
    try {
      this.tweens.add({
        targets: playerSprite,
        alpha: 0.3,
        duration: 100,
        ease: "Linear",
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          playerSprite.alpha = 1
          playerSprite.clearTint()
          this.invulnerable = false
        },
      })
    } catch (error) {
      console.error("Error en efecto de parpadeo:", error)
      // Aseguramos que el jugador vuelva a ser visible y vulnerable
      playerSprite.alpha = 1
      playerSprite.clearTint()
      this.invulnerable = false
    }

    // Damos un pequeño impulso al jugador para alejarlo del peligro
    playerSprite.setVelocity(this.playerDirection === "left" ? 150 : -150, -200)

    // Comprobamos si el jugador ha perdido todas las vidas
    if (this.lives <= 0) {
      // Asegurar que se llame a gameOver después de un pequeño retraso
      this.time.delayedCall(300, () => {
        this.gameOver()
      })
    }
  }

  showPortal() {
    try {
      // Calculamos las dimensiones del mundo
      const width = this.cameras.main.width
      const height = this.cameras.main.height
      const worldWidth = width * 4
      const worldHeight = height * 2

      // Colocamos el portal al final del nivel
      if (this.currentLevel === 1) {
        this.portal.x = worldWidth * 0.9
        this.portal.y = height * 0.5
      } else {
        this.portal.x = worldWidth * 0.9
        this.portal.y = height * 0.5
      }

      // Hacemos visible el portal
      this.portalVisible = true
      this.portal.setVisible(true)
      this.portal.body.enable = true

      // Hacemos el portal más grande para mejor visibilidad
      const portalScale = (this.cameras.main.width / 800) * 1.5 // Más grande para mejor visibilidad

      // Efecto de aparición
      this.portal.setScale(0)
      this.portal.setAlpha(0)
      this.portal.setTint(0x00ffff) // Color cian para mejor visibilidad

      if (this.tweens) {
        this.tweens.add({
          targets: this.portal,
          scale: portalScale,
          alpha: 1,
          duration: 1000,
          ease: "Bounce.Out",
        })
      }

      // Efecto de luz alrededor del portal
      if (this.add) {
        const portalLight = this.add.circle(this.portal.x, this.portal.y, 80, 0x00ffff, 0.6)

        if (this.tweens) {
          this.tweens.add({
            targets: portalLight,
            scale: 1.5,
            alpha: 0.2,
            duration: 1500,
            repeat: -1,
          })
        }
      }

      // Mensaje que indica que el portal ha aparecido
      if (this.add && this.tweens) {
        const portalText = this.add
          .text(width / 2, height * 0.2, "Portal obert! Completa el nivell!", {
            fontSize: Math.floor(width / 25) + "px", // Texto más grande
            color: "#ffff00",
            stroke: "#000000",
            strokeThickness: 6, // Contorno más grueso
          })
          .setOrigin(0.5)
          .setAlpha(0)
          .setScrollFactor(0) // Fijamos el texto para que no se mueva con la cámara

        this.tweens.add({
          targets: portalText,
          alpha: 1,
          y: height * 0.15,
          duration: 1000,
          ease: "Power2",
          onComplete: () => {
            if (this.tweens) {
              this.tweens.add({
                targets: portalText,
                alpha: 0,
                delay: 3000, // Más tiempo visible
                duration: 1000,
              })
            }
          },
        })
      }
    } catch (error) {
      console.error("Error al mostrar el portal:", error)
    }
  }

  hitEnemy(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ) {
    // Si el jugador es invulnerable, no hacemos nada
    if (this.invulnerable) return

    const playerSprite = player as Phaser.Physics.Arcade.Sprite
    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite

    // Reducimos las vidas
    this.lives -= 1
    this.livesText.setText(`Vides: ${this.lives}`)

    // Hacemos el jugador invulnerable temporalmente
    this.invulnerable = true

    // Efecto de parpadeo
    try {
      this.tweens.add({
        targets: playerSprite,
        alpha: 0.5,
        duration: 100,
        ease: "Linear",
        yoyo: true,
        repeat: 5,
        onComplete: () => {
          playerSprite.alpha = 1
          this.invulnerable = false
        },
      })
    } catch (error) {
      console.error("Error en efecto de parpadeo:", error)
      // Aseguramos que el jugador vuelva a ser visible y vulnerable
      playerSprite.alpha = 1
      this.invulnerable = false
    }

    // Damos un pequeño impulso al jugador para alejarlo del peligro
    const direction = playerSprite.x < enemySprite.x ? -1 : 1
    playerSprite.setVelocity(direction * 200, -200)

    // Comprobamos si el jugador ha perdido todas las vidas
    if (this.lives <= 0) {
      // Asegurar que se llame a gameOver después de un pequeño retraso
      this.time.delayedCall(300, () => {
        this.gameOver()
      })
    }
  }

  hitEnemyWithBullet(
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    enemy: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ) {
    const bulletSprite = bullet as Phaser.Physics.Arcade.Sprite
    const enemySprite = enemy as Phaser.Physics.Arcade.Sprite

    // Destruimos la bala
    bulletSprite.destroy()

    // Obtenemos el outline del enemigo
    const outline = enemySprite.getData("outline") as Phaser.GameObjects.Image
    const glow = enemySprite.getData("glow") as Phaser.GameObjects.Sprite

    // Efecto visual
    try {
      this.tweens.add({
        targets: [enemySprite, outline, glow].filter(Boolean),
        scale: 1.5,
        alpha: 0,
        duration: 200,
        onComplete: () => {
          if (outline) outline.destroy()
          if (glow) glow.destroy()
          enemySprite.destroy()
        },
      })
    } catch (error) {
      console.error("Error en efecto visual de enemigo:", error)
      if (outline) outline.destroy()
      if (glow) glow.destroy()
      enemySprite.destroy()
    }

    // Actualizamos la puntuación (más puntos en el nivel 2)
    const points = this.currentLevel === 1 ? 20 : 30
    this.score += points
    this.scoreText.setText(`Puntuació: ${this.score}`)
  }

  bulletHitPlatform(
    bullet: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    platform: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ) {
    const bulletSprite = bullet as Phaser.Physics.Arcade.Sprite
    bulletSprite.destroy()
  }

  enterPortal(
    player: Phaser.Types.Physics.Arcade.GameObjectWithBody,
    portal: Phaser.Types.Physics.Arcade.GameObjectWithBody,
  ) {
    // Solo podemos entrar al portal si es visible (todas las monedas recogidas)
    if (!this.portalVisible) return

    const playerSprite = player as Phaser.Physics.Arcade.Sprite

    // Efecto de desaparición
    try {
      this.tweens.add({
        targets: playerSprite,
        alpha: 0,
        scale: 0,
        duration: 800,
        onComplete: () => {
          if (this.currentLevel === 1) {
            // Si estamos en el nivel 1, pasamos al nivel 2
            this.scene.start("GameScene", { level: 2, score: this.score, lives: this.lives })
          } else {
            // Si estamos en el nivel 2, hemos completado el juego
            this.victory()
          }
        },
      })
    } catch (error) {
      console.error("Error en efecto de desaparición:", error)
      // Aseguramos que se cambie de nivel incluso si hay un error
      if (this.currentLevel === 1) {
        this.scene.start("GameScene", { level: 2, score: this.score, lives: this.lives })
      } else {
        this.victory()
      }
    }
  }

  fireBullet() {
    // Sistema de disparar
    const direction = this.playerDirection === "left" ? -1 : 1
    const bulletType = this.currentLevel === 1 ? "bullet1" : "bullet2"

    try {
      // Creamos una nueva bala
      const bullet = this.physics.add.sprite(this.player.x + direction * 20, this.player.y - 5, bulletType)

      // Añadimos la bala al grupo
      this.bullets.add(bullet)

      // Configuramos la bala
      const bulletSpeed = 400
      bullet.setVelocityX(direction * bulletSpeed)
      bullet.setScale(1)

      // Añadimos un efecto visual
      const tint = this.currentLevel === 1 ? 0xff0000 : 0x00ffff
      bullet.setTint(tint)

      // Destruimos la bala después de 2 segundos
      this.time.delayedCall(2000, () => {
        if (bullet.active) {
          bullet.destroy()
        }
      })

      // Añadimos un efecto de flash cuando disparamos
      this.cameras.main.flash(100, (tint >> 16) & 0xff, (tint >> 8) & 0xff, tint & 0xff)
    } catch (error) {
      console.error("Error al disparar:", error)
    }
  }

  gameOver() {
    // Limpiamos los contornos de los enemigos antes de cambiar de escena
    try {
      this.enemies.children.iterate((child) => {
        const enemy = child as Phaser.Physics.Arcade.Sprite
        const outline = enemy.getData("outline") as Phaser.GameObjects.Image
        const glow = enemy.getData("glow") as Phaser.GameObjects.Sprite
        if (outline) outline.destroy()
        if (glow) glow.destroy()
        return true
      })

      this.coins.children.iterate((child) => {
        const coin = child as Phaser.Physics.Arcade.Sprite
        const glow = coin.getData("glow") as Phaser.GameObjects.Sprite
        if (glow) glow.destroy()
        return true
      })
    } catch (error) {
      console.error("Error al limpiar efectos visuales:", error)
    }

    this.scene.start("GameOverScene", { score: this.score })
  }

  victory() {
    // Limpiamos los contornos de los enemigos antes de cambiar de escena
    try {
      this.enemies.children.iterate((child) => {
        const enemy = child as Phaser.Physics.Arcade.Sprite
        const outline = enemy.getData("outline") as Phaser.GameObjects.Image
        const glow = enemy.getData("glow") as Phaser.GameObjects.Sprite
        if (outline) outline.destroy()
        if (glow) glow.destroy()
        return true
      })

      this.coins.children.iterate((child) => {
        const coin = child as Phaser.Physics.Arcade.Sprite
        const glow = coin.getData("glow") as Phaser.GameObjects.Sprite
        if (glow) glow.destroy()
        return true
      })
    } catch (error) {
      console.error("Error al limpiar efectos visuales:", error)
    }

    this.scene.start("VictoryScene", { score: this.score })
  }
}

export default GameScene
