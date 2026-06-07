export const MSG = {
  loading: 'よみこみちゅう...',
  enemyAppeared: (name: string) => `${name}があらわれた！`,
  battle: (char: string) => `${char}にこうげき！`,
  strokeMistake: 'まちがえた！',
  nextChar: (char: string) => `${char}にこうげき！`,
  attackSuccess: (hearts: number) => `ヒット！のこり${hearts}こころ`,
  attackFail: 'ミス....',
  defeat: (word: string) => `「${word}」にまけた…もういちどちょうせん！`,
  gameOver: 'もういちどちょうせん！',
}
