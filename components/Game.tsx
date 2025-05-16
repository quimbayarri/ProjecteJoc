"use client"

import { useEffect, useRef, useState } from "react"
import Phaser from "phaser"
import { MenuScene } from "../scenes/MenuScene"
import { GameScene } from "../scenes/GameScene"
import { GameOverScene } from "../scenes/GameOverScene"
import { VictoryScene } from "../scenes/VictoryScene"

export default function Game() {
  const gameRef = useRef<Phaser.Game | null>(null)
  const [gameSize, setGameSize] = useState({ width: 800, height: 600 }) // Tamaño inicial más grande

  useEffect(() => {
    // Función para calcular el tamaño óptimo del juego (más grande)
    const calculateGameSize = () => {
      const maxWidth = Math.min(window.innerWidth, 1600) // Aumentamos el ancho máximo
      const maxHeight = Math.min(window.innerHeight, 1200) // Aumentamos el alto máximo

      // Mantenemos la relación de aspecto 4:3
      const aspectRatio = 4 / 3

      let width, height

      if (maxWidth / maxHeight > aspectRatio) {
        // Si la pantalla es más ancha que alta
        height = maxHeight * 0.95 // Usamos más espacio de la pantalla
        width = height * aspectRatio
      } else {
        // Si la pantalla es más alta que ancha
        width = maxWidth * 0.95 // Usamos más espacio de la pantalla
        height = width / aspectRatio
      }

      return { width: Math.floor(width), height: Math.floor(height) }
    }

    // Calculamos el tamaño inicial
    const size = calculateGameSize()
    setGameSize(size)

    if (typeof window !== "undefined" && !gameRef.current) {
      try {
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: size.width,
          height: size.height,
          parent: "game-container",
          physics: {
            default: "arcade",
            arcade: {
              gravity: { x: 0, y: 320 },
              debug: false,
            },
          },
          scene: [MenuScene, GameScene, GameOverScene, VictoryScene],
          scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          pixelArt: true,
        }

        gameRef.current = new Phaser.Game(config)

        // Función para redimensionar el juego cuando cambia el tamaño de la ventana
        const handleResize = () => {
          const newSize = calculateGameSize()
          setGameSize(newSize)

          if (gameRef.current) {
            gameRef.current.scale.resize(newSize.width, newSize.height)
          }
        }

        // Añadimos el event listener para redimensionar
        window.addEventListener("resize", handleResize)

        // Limpieza cuando el componente se desmonta
        return () => {
          window.removeEventListener("resize", handleResize)
          if (gameRef.current) {
            gameRef.current.destroy(true)
            gameRef.current = null
          }
        }
      } catch (error) {
        console.error("Error al inicializar Phaser:", error)
      }
    }
  }, [])

  return (
    <div
      id="game-container"
      className="w-full h-full flex items-center justify-center"
      style={{
        maxWidth: `${gameSize.width}px`,
        maxHeight: `${gameSize.height}px`,
        margin: "0 auto",
      }}
    />
  )
}
