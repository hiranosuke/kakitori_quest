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

  goldEarned: (amount: number) => `+${amount}G ゲット！`,
  goldBalance: (amount: number) => `G: ${amount}`,

  shop: {
    title: 'おみせ',
    tabConsumable: 'アイテム',
    tabDecoration: 'そうび',
    buy: 'かう',
    insufficientGold: 'おかねがたりない',
    purchased: (name: string) => `${name}をかった！`,
    alreadyOwned: 'もっている',
  },

  wardrobe: {
    title: 'そうび',
    equip: 'そうびする',
    unequip: 'はずす',
    equippedBadge: '★そうびちゅう',
    notOwned: 'もっていない',
    noItems: 'もちもののそうびはありません',
    equipped: (name: string) => `${name}をそうびした！`,
  },

  potion: {
    buttonLabel: 'かいふくやく',
    used: 'かいふくやくをつかった！',
  },

  world: {
    locked: '🔒',
    cleared: '★',
    bossStage: 'ボスせん！',
    bossLabel: (hint: string) => `${hint} ボス`,
    clearTitle: 'ワールドクリア！',
    nextUnlocked: (name: string) => `${name}が かいほうされた！`,
    lastWorld: 'すべてのワールドをクリア！',
    backToWorlds: 'ワールドせんたく',
  },
}
