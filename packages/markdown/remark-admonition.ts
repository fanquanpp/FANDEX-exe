import { visit } from 'unist-util-visit';

export function remarkAdmonition() {
  const types = ['note', 'tip', 'warning', 'danger', 'info', 'caution', 'important'];

  return (tree: any) => {
    visit(tree, 'blockquote', (node: any) => {
      if (!node.children || node.children.length === 0) return;

      const firstChild = node.children[0];
      if (firstChild.type !== 'paragraph') return;

      const firstTextChild = firstChild.children?.[0];
      if (firstTextChild?.type !== 'text') return;

      const match = firstTextChild.value.match(/^\[!(\w+)\]\s*/i);
      if (!match) return;

      const admType = match[1].toLowerCase();
      if (!types.includes(admType)) return;

      firstTextChild.value = firstTextChild.value.replace(/^\[!\w+\]\s*/, '');

      if (firstTextChild.value.trim() === '' && firstChild.children.length === 1) {
        node.children.shift();
      }

      const titleNode = {
        type: 'paragraph',
        data: { hProperties: { className: 'admonition-title' } },
        children: [
          {
            type: 'text',
            value: admType.charAt(0).toUpperCase() + admType.slice(1),
          },
        ],
      };

      node.children.unshift(titleNode);

      node.data = {
        hName: 'div',
        hProperties: { className: `admonition admonition-${admType}` },
      };
    });
  };
}
