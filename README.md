# growi-plugin-test2

GitHub Alerts を GROWI で表示するプラグインです。GitHub Flavored Markdown の [Alerts](https://docs.github.com/ja/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts) と同じ記法を使えます。

## 対応するアラートの種類

| 種別 | 用途 |
|---|---|
| `NOTE` | スキミングしても見てほしい情報 |
| `TIP` | より良い方法・ヒント |
| `IMPORTANT` | 目標達成に必要な重要情報 |
| `WARNING` | 即座の注意が必要な警告 |
| `CAUTION` | リスクや悪影響についての注意 |

## 記法

```markdown
> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
```

**注意:** アラート種別は大文字のみ有効です（`[!note]` や `[!Note]` は通常の blockquote として表示されます）。

## インストール

GROWI 管理画面 `/admin/plugins` でこのリポジトリの URL を追加してインストールしてください。

更新後は **削除 → 再インストール** で確実に反映されます。

## ローカル開発

```bash
pnpm install
pnpm build   # dist/ を更新
# git add / commit / push はユーザーが実施
```

ビルド成果物 (`dist/`) は GROWI が直接参照するため、必ず git にコミットしてください。
