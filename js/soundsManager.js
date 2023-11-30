export default class SoundManager {
    musicVolume = 0.5;
    effectVolume = 0.5;
    sounds;

    constructor() {
        this.initSounds();
    }

    initSounds() {
        this.sounds = {
            effects: {
                explosion: new Howl({
                    src: ["./assets/audio/8-bit_explosion.wav"],
                    volume: this.effectVolume
                }),
                button: new Howl({
                    src: ["./assets/audio/button_sound.wav"],
                    volume: this.effectVolume
                })
            },
            musics: {
            }
        };
    }

    changeMusicVolume(volume) {
        this.musicVolume = volume;
        for (let music in this.sounds.musics) {
            this.sounds.musics[music].volume(this.musicVolume);
        }
    }

    changeEffectVolume(volume) {
        this.effectVolume = volume;
        for (let effect in this.sounds.effects) {
            this.sounds.effects[effect].volume(this.effectVolume);
        }
    }
}