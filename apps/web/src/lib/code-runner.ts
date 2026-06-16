const SVG_PLAY = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>运行`;
const SVG_LOADING = `<svg width="14" height="14" viewBox="0 0 24 24" style="animation:code-run-spin 1s linear infinite"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="31.4" stroke-dashoffset="10"/></svg>运行中`;

const UNSAFE_PATTERNS = [
  'export ',
  'import ',
  'document.write',
  'fetch(',
  'XMLHttpRequest',
  'eval(',
  'setTimeout',
  'setInterval',
  'new Worker',
  'importScripts',
  'SharedArrayBuffer',
  'Atomics.',
  'postMessage',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'navigator.serviceWorker',
];

function resetButton(btn: HTMLButtonElement) {
  btn.removeAttribute('aria-busy');
  btn.innerHTML = SVG_PLAY;
}

export function initCodeRunners() {
  document.querySelectorAll('pre code.language-js, pre code.language-ts').forEach((codeBlock) => {
    const code = codeBlock.textContent?.trim() || '';
    const parent = codeBlock.parentElement;
    if (!parent) return;

    const isSafeToRun = !UNSAFE_PATTERNS.some((p) => code.includes(p));
    if (!isSafeToRun) return;
    if (!code.includes('console.' + 'log')) return;

    const wrapper = parent.closest('.code-block');
    if (!wrapper) return;

    const runButton = document.createElement('button');
    runButton.className = 'code-run-btn';
    runButton.setAttribute('aria-label', '运行代码');
    runButton.innerHTML = SVG_PLAY;

    wrapper.appendChild(runButton);

    runButton.addEventListener('click', () => {
      if (runButton.getAttribute('aria-busy') === 'true') return;

      runButton.setAttribute('aria-busy', 'true');
      runButton.innerHTML = SVG_LOADING;

      const workerCode = `
        self.onmessage = function(e) {
          try {
            var consoleLog = [];
            var originalLog = console['log'];
            console['log'] = function() {
              var args = Array.prototype.slice.call(arguments);
              consoleLog.push(args.map(function(arg) {
                if (typeof arg === 'object') return JSON.stringify(arg, null, 2);
                return String(arg);
              }).join(' '));
              originalLog.apply(console, args);
            };
            ${code}
            postMessage({ success: true, output: consoleLog.join('\\n') });
          } catch (error) {
            postMessage({ success: false, error: error.message });
          }
          close();
        };
      `;

      try {
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const worker = new Worker(URL.createObjectURL(blob));

        const timeout = setTimeout(() => {
          worker.terminate();
          resetButton(runButton);
          const existing = wrapper.querySelector('.code-result');
          if (existing) existing.remove();
          const resultEl = document.createElement('div');
          resultEl.className = 'code-result code-result-error';
          resultEl.textContent = '执行超时（5秒）';
          wrapper.appendChild(resultEl);
        }, 5000);

        worker.onmessage = (e) => {
          clearTimeout(timeout);
          resetButton(runButton);

          const result = e.data;
          const resultEl = document.createElement('div');
          resultEl.className = 'code-result';
          if (result.success) {
            resultEl.classList.add('code-result-success');
            resultEl.textContent = result.output || '(无输出)';
          } else {
            resultEl.classList.add('code-result-error');
            resultEl.textContent = result.error;
          }

          const existing = wrapper.querySelector('.code-result');
          if (existing) existing.remove();
          wrapper.appendChild(resultEl);
        };

        worker.onerror = () => {
          clearTimeout(timeout);
          resetButton(runButton);
        };

        worker.postMessage({});
      } catch {
        resetButton(runButton);
      }
    });
  });
}
