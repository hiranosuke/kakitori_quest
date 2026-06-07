export const MSG = {
  loading: 'よみこみちゅう...',
  enemyAppeared: (name: string) => `${name}があらわれた！`,
  battle: (name: string) => `${name}にこうげき！`,
  strokeMistake: 'まちがえた！',
  nextChar: (name: string) => `${name}にこうげき！`,
  attackSuccess: (hearts: number) => `ヒット！のこりライフ：${hearts}`,
  attackFail: (char: string) => `「${char}」ミス....`,
  defeat: (word: string) => `「${word}」にまけた…もういちどちょうせん！`,
  gameOver: 'もういちどちょうせん！',
}
