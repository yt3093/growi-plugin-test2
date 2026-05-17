import type { Plugin } from 'unified';
import type { Root, Blockquote, Paragraph, PhrasingContent, LinkReference } from 'mdast';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import { ALERT_TYPES, ICONS_HAST, LABELS, type AlertType } from './icons';

type AnyParent = { type: string; children: unknown[] };

function detectAlertType(
  para: Paragraph,
): { type: AlertType; remaining: PhrasingContent[] } | null {
  const { children } = para;
  if (children.length === 0) return null;

  const first = children[0];

  // [!NOTE] は remark-parse によって linkReference ノードに変換される（CLAUDE.md ハマりどころ #4）
  if (first.type === 'linkReference') {
    const lr = first as LinkReference;
    // label は "[!NOTE]" 中の "!NOTE"（大文字で保持される）
    // toString(lr) は children のテキストを返すので "!NOTE" が得られる
    const rawLabel = lr.label ?? toString(lr);
    if (!rawLabel.startsWith('!')) return null;
    const typeStr = rawLabel.slice(1);
    if (!(ALERT_TYPES as readonly string[]).includes(typeStr)) return null;
    const type = typeStr as AlertType;

    // [!TYPE] だけの行の後に本文が続く場合、次の node が break または text になる
    let rest = children.slice(1) as PhrasingContent[];
    if (rest.length > 0 && rest[0].type === 'break') {
      rest = rest.slice(1);
    }
    return { type, remaining: rest };
  }

  // text ノードとして来た場合のフォールバック
  if (first.type === 'text') {
    const textNode = first as { type: 'text'; value: string };
    const m = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/.exec(textNode.value);
    if (!m) return null;
    const type = m[1] as AlertType;
    const tail = textNode.value.slice(m[0].length).replace(/^\n/, '');
    let rest: PhrasingContent[] = children.slice(1);
    if (tail) {
      rest = [{ type: 'text', value: tail }, ...rest];
    }
    return { type, remaining: rest };
  }

  return null;
}

const remarkGithubAlerts: Plugin<[], Root> = () => (tree) => {
  visit(tree, 'blockquote', (node: Blockquote, _index, parent) => {
    // GitHub 仕様: ネスト blockquote 内の [!TYPE] は変換しない
    if ((parent as AnyParent | undefined)?.type === 'blockquote') return;
    if (node.children.length === 0) return;

    const first = node.children[0];
    if (first.type !== 'paragraph') return;

    const detected = detectAlertType(first as Paragraph);
    if (!detected) return;
    const { type, remaining } = detected;

    // 先頭 paragraph を除去し、本文が残っていれば paragraph として戻す
    node.children.shift();
    if (remaining.length > 0) {
      node.children.unshift({ type: 'paragraph', children: remaining });
    }

    // タイトル (SVG アイコン + ラベルテキスト) を div.github-alert-title として先頭に挿入
    // data.hChildren に hast の Element を直接渡すことで remark-rehype が変換する
    const titleNode: Paragraph & { data: Record<string, unknown> } = {
      type: 'paragraph',
      children: [],
      data: {
        hName: 'div',
        hProperties: { className: ['github-alert-title'] },
        hChildren: [ICONS_HAST[type], { type: 'text', value: LABELS[type] }],
      },
    };
    node.children.unshift(titleNode);

    // blockquote 自体を div.github-alert.github-alert-{type} に変換
    node.data = {
      ...node.data,
      hName: 'div',
      hProperties: { className: ['github-alert', `github-alert-${type.toLowerCase()}`] },
    };
  });
};

export default remarkGithubAlerts;
