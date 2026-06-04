// @k1low/kakitori-data のデータが誤っている文字の終端をオーバーライドする。
// ライブラリ側への Issue 報告と並行して管理する。
//
// 形式: StrokeEnding[] = [{ types: StrokeEndingType[] }, ...]
// 画数ぶんのエントリが必要。types が空 or 省略 = その画はチェックしない。

export const STROKE_ENDING_OVERRIDES: Record<string, { types: string[] }[]> = {
  // kakitori-data では 1画目=tome, 2画目=hane だが正しくは逆。
  // 参考: https://nihongokyoshi-net.com/2020/09/25/hiragana-ka/
  か: [
    { types: ['hane'] },
    { types: ['tome'] },
    { types: ['tome'] },
  ],
}
