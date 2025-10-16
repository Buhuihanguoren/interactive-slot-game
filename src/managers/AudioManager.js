export class AudioManager {
    constructor() {
        this.sounds = new Map();  // stores loaded sounds
        this.muted = false;
    }

    loadSound(key, url) {
        // would load a sound file
        // not implemented yet but structure is here
        console.log(`Loading sound: ${key} from ${url}`);
    }

    playSound(key) {
        if (this.muted) return;  // dont play if muted
        // would play the sound
        console.log(`Playing sound: ${key}`);
    }

    setMuted(muted) {
        this.muted = muted;
    }

    toggleMute() {
        // switch between muted and unmuted
        this.muted = !this.muted;
        return this.muted;
    }
}