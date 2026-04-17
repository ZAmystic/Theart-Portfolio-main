const commands = {
  
'/help': `Available commands:
/help       - List available commands
/about      - More information about me
/education  - My education background
/experience - My work experience
/projects   - My projects
/contact    - Contact information
cl          - Clear the terminal screen`,
  '/about': `Hello I am Theart Jooste. I am currently studying Software Engineering at Belgium Campus iTversity.`,
  '/education': `Education:\n- Belgium Campus iTversity: Software Engineering`,
  '/experience': `Experience:\n- Student projects and portfolio development.`,
  '/projects': `Projects:\n- Portfolio website\n- Terminal-style interface`,
  '/contact': `Contact:\n- Email: example@example.com\n- LinkedIn: linkedin.com/in/theart`,
};

const outputEl = document.getElementById('output');
const inputEl = document.getElementById('input-line');
const initialOutputHtml = outputEl.innerHTML;

function appendLine(text) {
  const line = document.createElement('div');
  line.textContent = text;
  outputEl.appendChild(line);
}

function appendResponse(text) {
  const response = document.createElement('div');
  response.textContent = text;
  response.style.whiteSpace = 'pre-wrap';
  outputEl.appendChild(response);
}

function scrollToBottom() {
  const terminalBody = document.getElementById('terminal-body');
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function clearTerminal() {
  outputEl.innerHTML = initialOutputHtml;
}

function handleCommand(input) {
  const command = input.trim();

  if (command.length === 0) {
    appendLine(`C:\\Users\\Theart> ${command}`);
    return;
  }

  if (command === 'cl') {
    clearTerminal();
    return;
  }

  appendLine(`C:\\Users\\Theart> ${command}`);
  
  if (commands[command]){
    appendResponse(commands[command]);
  }else if (command.toLowerCase() === '/bug') {
    appendResponse('Nuhh Uhh, its a feature!');
  } else {
    appendResponse(`'${command}' is not recognized as an internal or external command. Type /help for a list of commands.`);
  } 
}

function resetInput() {
  inputEl.textContent = '';
}

function focusInput() {
  inputEl.focus();
  const range = document.createRange();
  range.selectNodeContents(inputEl);
  range.collapse(false);
  const sel = window.getSelection();
  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
}

inputEl.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    const value = inputEl.textContent || '';
    handleCommand(value);
    resetInput();
    scrollToBottom();
  }
});

inputEl.addEventListener('paste', (event) => {
  event.preventDefault();
  const paste = (event.clipboardData || window.clipboardData).getData('text');
  document.execCommand('insertText', false, paste);
});

window.addEventListener('load', () => {
  focusInput();
  scrollToBottom();
});

outputEl.addEventListener('click', focusInput);
inputEl.addEventListener('blur', () => setTimeout(focusInput, 0));
