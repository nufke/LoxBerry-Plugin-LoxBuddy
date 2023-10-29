import { Injectable } from '@angular/core';

interface Sound {
  key: string;
  asset: string;
}

@Injectable({
  providedIn: 'root'
})
export class SoundService {

  private sounds: Sound[] = [];
  private audioPlayer: HTMLAudioElement = new Audio();

  constructor() {
    this.audioPlayer.muted = false;
    this.audioPlayer.autoplay = true;
  }

  registerSound(key: string, asset: string): void {
    let audio = new Audio();
    audio.src = asset;

    this.sounds.push({
      key: key,
      asset: asset,
    });
  }

  play(key: string): void {
    let soundToPlay = this.sounds.find((sound) => {
      return sound.key === key;
    });

    this.audioPlayer.src = soundToPlay.asset;
    let result = this.audioPlayer.play();

    if (result !== undefined) {
      result.then( _ => {
        // Autoplay successfull
      }).catch(error => {
        console.log('SoundService: Autoplay prevented.')
        // TODO: Show a "Play" button so that user can start playback.
      });
    }
  }

}
