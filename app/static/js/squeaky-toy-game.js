// Squeaky Toy Challenge Game

class SqueakyToyGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        this.timerElement = document.getElementById('timer');
        this.levelElement = document.getElementById('level');
        this.messageElement = document.getElementById('gameMessage');
        this.startButton = document.getElementById('startButton');
        this.resetButton = document.getElementById('resetButton');
        
        // Game state
        this.gameRunning = false;
        this.score = 0;
        this.level = 1;
        this.timeLeft = 5.0;
        this.baseTime = 5.0;
        this.toyDelivered = false;
        
        // Game objects
        this.man = {
            x: 150,
            y: 300,
            width: 60,
            height: 120,
            armExtended: false
        };
        
        this.dog = {
            x: 550,
            y: 350,
            width: 100,
            height: 80,
            mouthOpen: false,
            biting: false,
            tailWag: 0
        };
        
        this.toy = {
            x: 250,
            y: 400,
            width: 40,
            height: 40,
            isDragging: false,
            isDelivered: false
        };
        
        // Event listeners
        this.setupEventListeners();
        
        // Start animation loop
        this.animate();
    }
    
    setupEventListeners() {
        this.startButton.addEventListener('click', () => this.startGame());
        this.resetButton.addEventListener('click', () => this.resetGame());
        
        // Mouse events for dragging
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    startGame() {
        this.gameRunning = true;
        this.timeLeft = this.baseTime - (this.level - 1) * 0.5;
        this.timeLeft = Math.max(this.timeLeft, 2.0); // Minimum 2 seconds
        this.toyDelivered = false;
        this.toy.isDelivered = false;
        this.toy.x = 250;
        this.toy.y = 400;
        this.dog.biting = false;
        this.dog.mouthOpen = false;
        
        this.startButton.style.display = 'none';
        this.resetButton.style.display = 'none';
        this.messageElement.textContent = '';
        
        // Start timer
        this.startTimer();
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.scoreElement.textContent = this.score;
        this.levelElement.textContent = this.level;
        this.startGame();
    }
    
    startTimer() {
        const timerInterval = setInterval(() => {
            if (!this.gameRunning) {
                clearInterval(timerInterval);
                return;
            }
            
            this.timeLeft -= 0.1;
            this.timerElement.textContent = Math.max(0, this.timeLeft).toFixed(1);
            
            // Dog gets anxious as time runs out
            if (this.timeLeft < 2 && !this.toyDelivered) {
                this.dog.mouthOpen = true;
            }
            
            if (this.timeLeft <= 0 && !this.toyDelivered) {
                this.gameOver();
                clearInterval(timerInterval);
            }
        }, 100);
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Check if clicking on toy
        if (this.isPointInToy(x, y) && !this.toy.isDelivered && this.gameRunning) {
            this.toy.isDragging = true;
        }
    }
    
    handleMouseMove(e) {
        if (this.toy.isDragging && this.gameRunning) {
            const rect = this.canvas.getBoundingClientRect();
            this.toy.x = e.clientX - rect.left - this.toy.width / 2;
            this.toy.y = e.clientY - rect.top - this.toy.height / 2;
            
            // Check if toy is near dog
            this.checkToyDelivery();
        }
    }
    
    handleMouseUp() {
        this.toy.isDragging = false;
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        if (this.isPointInToy(x, y) && !this.toy.isDelivered && this.gameRunning) {
            this.toy.isDragging = true;
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (this.toy.isDragging && this.gameRunning) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.toy.x = touch.clientX - rect.left - this.toy.width / 2;
            this.toy.y = touch.clientY - rect.top - this.toy.height / 2;
            
            this.checkToyDelivery();
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.toy.isDragging = false;
    }
    
    isPointInToy(x, y) {
        return x >= this.toy.x && x <= this.toy.x + this.toy.width &&
               y >= this.toy.y && y <= this.toy.y + this.toy.height;
    }
    
    checkToyDelivery() {
        const distance = Math.sqrt(
            Math.pow(this.toy.x - this.dog.x, 2) + 
            Math.pow(this.toy.y - this.dog.y, 2)
        );
        
        if (distance < 80 && !this.toy.isDelivered) {
            this.toyDelivered = true;
            this.toy.isDelivered = true;
            this.toy.isDragging = false;
            this.levelComplete();
        }
    }
    
    levelComplete() {
        this.gameRunning = false;
        this.score += 100 * this.level;
        this.scoreElement.textContent = this.score;
        this.messageElement.textContent = `Good job! Level ${this.level} complete!`;
        this.messageElement.style.color = '#27ae60';
        
        this.level++;
        this.levelElement.textContent = this.level;
        
        setTimeout(() => {
            this.startButton.textContent = 'Next Level';
            this.startButton.style.display = 'inline-block';
        }, 1500);
    }
    
    gameOver() {
        this.gameRunning = false;
        this.dog.biting = true;
        this.messageElement.textContent = 'Game Over! The dog bit your hand!';
        this.messageElement.style.color = '#e74c3c';
        
        this.resetButton.style.display = 'inline-block';
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw ground
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 450, this.canvas.width, 150);
        
        // Draw man
        this.drawMan();
        
        // Draw dog
        this.drawDog();
        
        // Draw toy
        if (!this.toy.isDelivered || this.toyDelivered) {
            this.drawToy();
        }
    }
    
    drawMan() {
        const { x, y, width, height } = this.man;
        
        // Body
        this.ctx.fillStyle = '#4169E1';
        this.ctx.fillRect(x, y + 40, width, height - 40);
        
        // Head
        this.ctx.fillStyle = '#FDBCB4';
        this.ctx.beginPath();
        this.ctx.arc(x + width/2, y + 20, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Arms
        this.ctx.strokeStyle = '#FDBCB4';
        this.ctx.lineWidth = 8;
        this.ctx.beginPath();
        
        // Left arm
        this.ctx.moveTo(x + 10, y + 50);
        this.ctx.lineTo(x - 10, y + 80);
        
        // Right arm (extends when giving toy)
        this.ctx.moveTo(x + width - 10, y + 50);
        if (this.toy.isDragging || this.toyDelivered) {
            this.ctx.lineTo(x + width + 30, y + 60);
        } else {
            this.ctx.lineTo(x + width + 10, y + 80);
        }
        this.ctx.stroke();
        
        // Legs
        this.ctx.strokeStyle = '#191970';
        this.ctx.lineWidth = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 15, y + height - 40);
        this.ctx.lineTo(x + 10, y + height);
        this.ctx.moveTo(x + width - 15, y + height - 40);
        this.ctx.lineTo(x + width - 10, y + height);
        this.ctx.stroke();
    }
    
    drawDog() {
        const { x, y, width, height } = this.dog;
        
        // Body (black and white pattern)
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x, y, width * 0.6, height);
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x + width * 0.6, y, width * 0.4, height);
        
        // Head
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(x + width - 30, y + 20, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // White patch on face
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.beginPath();
        this.ctx.arc(x + width - 25, y + 15, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Eye
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(x + width - 25, y + 15, 3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Ears
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.moveTo(x + width - 50, y + 5);
        this.ctx.lineTo(x + width - 45, y - 5);
        this.ctx.lineTo(x + width - 35, y + 5);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + width - 25, y + 5);
        this.ctx.lineTo(x + width - 20, y - 5);
        this.ctx.lineTo(x + width - 10, y + 5);
        this.ctx.fill();
        
        // Mouth (open when anxious or biting)
        if (this.dog.mouthOpen || this.dog.biting) {
            this.ctx.strokeStyle = '#FF0000';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(x + width - 10, y + 25, 10, 0, Math.PI);
            this.ctx.stroke();
            
            // Teeth
            this.ctx.fillStyle = '#FFFFFF';
            for (let i = 0; i < 4; i++) {
                this.ctx.fillRect(x + width - 18 + i * 5, y + 25, 3, 5);
            }
        }
        
        // Tail (wags when happy)
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 8;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + height/2);
        
        if (this.toyDelivered && !this.dog.biting) {
            // Wagging tail
            this.dog.tailWag = (this.dog.tailWag + 0.3) % (Math.PI * 2);
            this.ctx.lineTo(x - 20, y + height/2 + Math.sin(this.dog.tailWag) * 20);
        } else {
            // Normal tail
            this.ctx.lineTo(x - 20, y + height/2 - 10);
        }
        this.ctx.stroke();
        
        // Legs
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        // Front legs
        this.ctx.moveTo(x + width * 0.7, y + height);
        this.ctx.lineTo(x + width * 0.7, y + height + 20);
        this.ctx.moveTo(x + width * 0.9, y + height);
        this.ctx.lineTo(x + width * 0.9, y + height + 20);
        // Back legs
        this.ctx.moveTo(x + width * 0.2, y + height);
        this.ctx.lineTo(x + width * 0.2, y + height + 20);
        this.ctx.moveTo(x + width * 0.4, y + height);
        this.ctx.lineTo(x + width * 0.4, y + height + 20);
        this.ctx.stroke();
    }
    
    drawToy() {
        const { x, y, width, height } = this.toy;
        
        // Toy body (bone shape)
        this.ctx.fillStyle = '#FFD700';
        
        // Main rectangle
        this.ctx.fillRect(x + 10, y + 15, width - 20, height - 30);
        
        // End circles (bone ends)
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y + 10, 8, 0, Math.PI * 2);
        this.ctx.arc(x + 10, y + height - 10, 8, 0, Math.PI * 2);
        this.ctx.arc(x + width - 10, y + 10, 8, 0, Math.PI * 2);
        this.ctx.arc(x + width - 10, y + height - 10, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Squeaker detail
        this.ctx.fillStyle = '#FF0000';
        this.ctx.beginPath();
        this.ctx.arc(x + width/2, y + height/2, 5, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    new SqueakyToyGame();
});