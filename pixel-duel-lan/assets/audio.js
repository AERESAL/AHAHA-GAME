// audio.js
// 8-bit sound effects for Pixel Duel LAN

class AudioManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.music = null;
    this.isMuted = false;
    
    // Initialize audio context
    this.initAudio();
  }
  
  initAudio() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      this.createSounds();
    } catch (e) {
      console.log('Web Audio API not supported');
    }
  }
  
  createSounds() {
    // Shooting sound (8-bit laser)
    this.sounds.shoot = this.createTone(800, 0.1, 'sawtooth');
    
    // Reload sound (8-bit click)
    this.sounds.reload = this.createTone(200, 0.2, 'square');
    
    // Damage sound (8-bit explosion)
    this.sounds.damage = this.createTone(150, 0.3, 'sawtooth');
    
    // Jump sound (8-bit boop)
    this.sounds.jump = this.createTone(400, 0.1, 'sine');
    
    // Death sound (8-bit explosion)
    this.sounds.death = this.createTone(100, 0.5, 'sawtooth');
    
    // Background music (8-bit loop)
    this.createBackgroundMusic();
  }
  
  createTone(frequency, duration, type = 'sine') {
    return () => {
      if (this.isMuted || !this.audioContext) return;
      
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    };
  }
  
  createBackgroundMusic() {
    if (!this.audioContext) return;
    
    const notes = [
      { freq: 262, duration: 0.5 }, // C
      { freq: 294, duration: 0.5 }, // D
      { freq: 330, duration: 0.5 }, // E
      { freq: 349, duration: 0.5 }, // F
      { freq: 392, duration: 0.5 }, // G
      { freq: 440, duration: 0.5 }, // A
      { freq: 494, duration: 0.5 }, // B
      { freq: 523, duration: 0.5 }  // C
    ];
    
    let currentNote = 0;
    
    this.music = setInterval(() => {
      if (this.isMuted) return;
      
      const note = notes[currentNote];
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.setValueAtTime(note.freq, this.audioContext.currentTime);
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + note.duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + note.duration);
      
      currentNote = (currentNote + 1) % notes.length;
    }, 500);
  }
  
  play(soundName) {
    if (this.sounds[soundName]) {
      this.sounds[soundName]();
    }
  }
  
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.music) {
      clearInterval(this.music);
      this.music = null;
    } else if (!this.isMuted && !this.music) {
      this.createBackgroundMusic();
    }
  }
  
  stopMusic() {
    if (this.music) {
      clearInterval(this.music);
      this.music = null;
    }
  }
}

// Create global audio manager
window.audioManager = new AudioManager(); 