import React, { useState, useEffect, useRef } from 'react'
import { Button } from '../components/UI'

function GamePage() {
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const timerIntervalRef = useRef(null)
  
  // Game state
  const [gameRunning, setGameRunning] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [timeLeft, setTimeLeft] = useState(5.0)
  const [message, setMessage] = useState('')
  const [messageColor, setMessageColor] = useState('#27ae60')
  const [showStartButton, setShowStartButton] = useState(true)
  const [showResetButton, setShowResetButton] = useState(false)
  const [buttonText, setButtonText] = useState('Start Game')
  
  // Game objects state
  const [man] = useState({
    x: 150,
    y: 300,
    width: 60,
    height: 120,
    armExtended: false
  })
  
  const [dog, setDog] = useState({
    x: 550,
    y: 350,
    width: 100,
    height: 80,
    mouthOpen: false,
    biting: false,
    tailWag: 0
  })
  
  const [toy, setToy] = useState({
    x: 250,
    y: 400,
    width: 40,
    height: 40,
    isDragging: false,
    isDelivered: false
  })
  
  const baseTime = 5.0
  const toyDeliveredRef = useRef(false)

  // Initialize canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      // Draw background
      ctx.fillStyle = '#87CEEB'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      // Draw ground
      ctx.fillStyle = '#228B22'
      ctx.fillRect(0, 450, canvas.width, 150)
      
      // Draw game objects
      drawMan(ctx)
      drawDog(ctx)
      if (!toy.isDelivered || toyDeliveredRef.current) {
        drawToy(ctx)
      }
      
      animationFrameRef.current = requestAnimationFrame(draw)
    }
    
    draw()
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [man, dog, toy])

  // Handle timer
  useEffect(() => {
    if (!gameRunning) return
    
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = Math.max(0, prevTime - 0.1)
        
        // Dog gets anxious as time runs out
        if (newTime < 2 && !toyDeliveredRef.current) {
          setDog(prev => ({ ...prev, mouthOpen: true }))
        }
        
        if (newTime <= 0 && !toyDeliveredRef.current) {
          gameOver()
        }
        
        return newTime
      })
    }, 100)
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [gameRunning])

  const startGame = () => {
    const newTimeLeft = Math.max(2.0, baseTime - (level - 1) * 0.5)
    setTimeLeft(newTimeLeft)
    setGameRunning(true)
    toyDeliveredRef.current = false
    setToy({
      x: 250,
      y: 400,
      width: 40,
      height: 40,
      isDragging: false,
      isDelivered: false
    })
    setDog(prev => ({ ...prev, biting: false, mouthOpen: false }))
    setShowStartButton(false)
    setShowResetButton(false)
    setMessage('')
  }

  const resetGame = () => {
    setScore(0)
    setLevel(1)
    setButtonText('Start Game')
    startGame()
  }

  const gameOver = () => {
    setGameRunning(false)
    setDog(prev => ({ ...prev, biting: true }))
    setMessage('Game Over! The dog bit your hand!')
    setMessageColor('#e74c3c')
    setShowResetButton(true)
    
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
  }

  const levelComplete = () => {
    setGameRunning(false)
    setScore(prev => prev + 100 * level)
    setMessage(`Good job! Level ${level} complete!`)
    setMessageColor('#27ae60')
    setLevel(prev => prev + 1)
    
    setTimeout(() => {
      setButtonText('Next Level')
      setShowStartButton(true)
    }, 1500)
  }

  const checkToyDelivery = (toyX, toyY) => {
    const distance = Math.sqrt(
      Math.pow(toyX - dog.x, 2) + 
      Math.pow(toyY - dog.y, 2)
    )
    
    if (distance < 80 && !toy.isDelivered) {
      toyDeliveredRef.current = true
      setToy(prev => ({ ...prev, isDelivered: true, isDragging: false }))
      levelComplete()
    }
  }

  const isPointInToy = (x, y) => {
    return x >= toy.x && x <= toy.x + toy.width &&
           y >= toy.y && y <= toy.y + toy.height
  }

  // Mouse event handlers
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    if (isPointInToy(x, y) && !toy.isDelivered && gameRunning) {
      setToy(prev => ({ ...prev, isDragging: true }))
    }
  }

  const handleMouseMove = (e) => {
    if (toy.isDragging && gameRunning) {
      const rect = canvasRef.current.getBoundingClientRect()
      const newX = e.clientX - rect.left - toy.width / 2
      const newY = e.clientY - rect.top - toy.height / 2
      
      setToy(prev => ({ ...prev, x: newX, y: newY }))
      checkToyDelivery(newX, newY)
    }
  }

  const handleMouseUp = () => {
    setToy(prev => ({ ...prev, isDragging: false }))
  }

  // Touch event handlers
  const handleTouchStart = (e) => {
    e.preventDefault()
    const touch = e.touches[0]
    const rect = canvasRef.current.getBoundingClientRect()
    const x = touch.clientX - rect.left
    const y = touch.clientY - rect.top
    
    if (isPointInToy(x, y) && !toy.isDelivered && gameRunning) {
      setToy(prev => ({ ...prev, isDragging: true }))
    }
  }

  const handleTouchMove = (e) => {
    e.preventDefault()
    if (toy.isDragging && gameRunning) {
      const touch = e.touches[0]
      const rect = canvasRef.current.getBoundingClientRect()
      const newX = touch.clientX - rect.left - toy.width / 2
      const newY = touch.clientY - rect.top - toy.height / 2
      
      setToy(prev => ({ ...prev, x: newX, y: newY }))
      checkToyDelivery(newX, newY)
    }
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()
    setToy(prev => ({ ...prev, isDragging: false }))
  }

  // Drawing functions
  const drawMan = (ctx) => {
    const { x, y, width, height } = man
    
    // Body
    ctx.fillStyle = '#4169E1'
    ctx.fillRect(x, y + 40, width, height - 40)
    
    // Head
    ctx.fillStyle = '#FDBCB4'
    ctx.beginPath()
    ctx.arc(x + width/2, y + 20, 20, 0, Math.PI * 2)
    ctx.fill()
    
    // Arms
    ctx.strokeStyle = '#FDBCB4'
    ctx.lineWidth = 8
    ctx.beginPath()
    
    // Left arm
    ctx.moveTo(x + 10, y + 50)
    ctx.lineTo(x - 10, y + 80)
    
    // Right arm (extends when giving toy)
    ctx.moveTo(x + width - 10, y + 50)
    if (toy.isDragging || toyDeliveredRef.current) {
      ctx.lineTo(x + width + 30, y + 60)
    } else {
      ctx.lineTo(x + width + 10, y + 80)
    }
    ctx.stroke()
    
    // Legs
    ctx.strokeStyle = '#191970'
    ctx.lineWidth = 10
    ctx.beginPath()
    ctx.moveTo(x + 15, y + height - 40)
    ctx.lineTo(x + 10, y + height)
    ctx.moveTo(x + width - 15, y + height - 40)
    ctx.lineTo(x + width - 10, y + height)
    ctx.stroke()
  }

  const drawDog = (ctx) => {
    const { x, y, width, height } = dog
    
    // Body (black and white pattern)
    ctx.fillStyle = '#000000'
    ctx.fillRect(x, y, width * 0.6, height)
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(x + width * 0.6, y, width * 0.4, height)
    
    // Head
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(x + width - 30, y + 20, 25, 0, Math.PI * 2)
    ctx.fill()
    
    // White patch on face
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(x + width - 25, y + 15, 10, 0, Math.PI * 2)
    ctx.fill()
    
    // Eye
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.arc(x + width - 25, y + 15, 3, 0, Math.PI * 2)
    ctx.fill()
    
    // Ears
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.moveTo(x + width - 50, y + 5)
    ctx.lineTo(x + width - 45, y - 5)
    ctx.lineTo(x + width - 35, y + 5)
    ctx.fill()
    
    ctx.beginPath()
    ctx.moveTo(x + width - 25, y + 5)
    ctx.lineTo(x + width - 20, y - 5)
    ctx.lineTo(x + width - 10, y + 5)
    ctx.fill()
    
    // Mouth (open when anxious or biting)
    if (dog.mouthOpen || dog.biting) {
      ctx.strokeStyle = '#FF0000'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.arc(x + width - 10, y + 25, 10, 0, Math.PI)
      ctx.stroke()
      
      // Teeth
      ctx.fillStyle = '#FFFFFF'
      for (let i = 0; i < 4; i++) {
        ctx.fillRect(x + width - 18 + i * 5, y + 25, 3, 5)
      }
    }
    
    // Tail (wags when happy)
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(x, y + height/2)
    
    if (toyDeliveredRef.current && !dog.biting) {
      // Wagging tail
      const newTailWag = (dog.tailWag + 0.3) % (Math.PI * 2)
      setDog(prev => ({ ...prev, tailWag: newTailWag }))
      ctx.lineTo(x - 20, y + height/2 + Math.sin(newTailWag) * 20)
    } else {
      // Normal tail
      ctx.lineTo(x - 20, y + height/2 - 10)
    }
    ctx.stroke()
    
    // Legs
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 6
    ctx.beginPath()
    // Front legs
    ctx.moveTo(x + width * 0.7, y + height)
    ctx.lineTo(x + width * 0.7, y + height + 20)
    ctx.moveTo(x + width * 0.9, y + height)
    ctx.lineTo(x + width * 0.9, y + height + 20)
    // Back legs
    ctx.moveTo(x + width * 0.2, y + height)
    ctx.lineTo(x + width * 0.2, y + height + 20)
    ctx.moveTo(x + width * 0.4, y + height)
    ctx.lineTo(x + width * 0.4, y + height + 20)
    ctx.stroke()
  }

  const drawToy = (ctx) => {
    const { x, y, width, height } = toy
    
    // Toy body (bone shape)
    ctx.fillStyle = '#FFD700'
    
    // Main rectangle
    ctx.fillRect(x + 10, y + 15, width - 20, height - 30)
    
    // End circles (bone ends)
    ctx.beginPath()
    ctx.arc(x + 10, y + 10, 8, 0, Math.PI * 2)
    ctx.arc(x + 10, y + height - 10, 8, 0, Math.PI * 2)
    ctx.arc(x + width - 10, y + 10, 8, 0, Math.PI * 2)
    ctx.arc(x + width - 10, y + height - 10, 8, 0, Math.PI * 2)
    ctx.fill()
    
    // Squeaker detail
    ctx.fillStyle = '#FF0000'
    ctx.beginPath()
    ctx.arc(x + width/2, y + height/2, 5, 0, Math.PI * 2)
    ctx.fill()
  }

  return (
    <div className="game-container">
      <h1>Squeaky Toy Challenge</h1>
      <p className="game-instructions">
        Click the squeaky toy and drag it to the dog before time runs out!
      </p>
      
      <div className="game-stats">
        <div className="stat-item">
          <span className="stat-label">Score:</span>
          <span className="stat-value">{score}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Time:</span>
          <span className="stat-value">{timeLeft.toFixed(1)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Level:</span>
          <span className="stat-value">{level}</span>
        </div>
      </div>
      
      <canvas
        ref={canvasRef}
        id="gameCanvas"
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      <div className="game-controls">
        {showStartButton && (
          <Button onClick={startGame} variant="primary">
            {buttonText}
          </Button>
        )}
        {showResetButton && (
          <Button onClick={resetGame} variant="danger">
            Play Again
          </Button>
        )}
      </div>
      
      {message && (
        <div className="game-message" style={{ color: messageColor }}>
          {message}
        </div>
      )}
    </div>
  )
}

export default GamePage