/**
 * Copy-to-clipboard for code blocks.
 *
 * The button is rendered by the code-block render hook (server side), so it is
 * present even if this bundle fails to load — it is simply inert. One delegated
 * listener covers every block on the page.
 */

export function initCopyButtons(i18n) {
  const labels = {
    copy: i18n.copy || 'Copy',
    copied: i18n.copied || 'Copied',
  };

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-copy-code]');
    if (!button) return;

    const block = button.closest('.highlight');
    const code = block ? block.querySelector('pre code, pre') : null;
    if (!code) return;

    const text = code.textContent;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for http:// previews, where the async clipboard is blocked.
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.append(area);
        area.select();
        document.execCommand('copy');
        area.remove();
      }
      button.dataset.copied = 'true';
      button.textContent = labels.copied;
      window.setTimeout(() => {
        button.dataset.copied = 'false';
        button.textContent = labels.copy;
      }, 1600);
    } catch (error) {
      console.error('[copy]', error);
    }
  });
}
