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

  constructor(){}

  preload(key: string, asset: string): void {
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
    this.audioPlayer.play();
  }

}
