const display = document.getElementById('display');
const history = document.getElementById('history');
const symbols = { '+': '+', '-': '−', '*': '×', '/': '÷' };
let current = '0';
let previous = null;
let operator = null;
let freshInput = false;

function render() {
  display.textContent = current;
}

function clear() {
  current = '0';
  previous = null;
  operator = null;
  freshInput = false;
  history.textContent = '';
  render();
}

function inputNumber(number) {
  if (current === 'Error') clear();
  if (freshInput) {
    current = '0';
    freshInput = false;
    if (!operator) history.textContent = '';
  }
  if (number === '.') {
    if (!current.includes('.')) current += '.';
  } else if (current.replace(/[-.]/g, '').length < 14) {
    current = current === '0' ? number : current + number;
  }
  render();
}

function calculate() {
  const left = previous;
  const right = Number(current);
  let result;
  switch (operator) {
    case '+': result = left + right; break;
    case '-': result = left - right; break;
    case '*': result = left * right; break;
    case '/': result = right === 0 ? NaN : left / right; break;
  }
  history.textContent = `${left} ${symbols[operator]} ${right} =`;
  current = Number.isFinite(result) ? String(Number(result.toPrecision(12))) : 'Error';
  if (current === 'Error') history.textContent = 'Hasil tidak valid (misalnya pembagian dengan nol).';
  previous = null;
  operator = null;
  freshInput = true;
  render();
}

function selectOperator(nextOperator) {
  if (current === 'Error') return;
  if (operator && !freshInput) calculate();
  if (current === 'Error') return;
  previous = Number(current);
  operator = nextOperator;
  freshInput = true;
  history.textContent = `${previous} ${symbols[operator]}`;
}

function action(name) {
  if (name === 'clear') return clear();
  if (current === 'Error') return;
  if (name === 'equals' && operator && !freshInput) calculate();
  if (name === 'delete' && !freshInput) {
    current = current.slice(0, -1);
    if (!current || current === '-') current = '0';
  }
  if (name === 'sign' && Number(current) !== 0) {
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
    if (freshInput && operator) {
      previous = Number(current);
      history.textContent = `${previous} ${symbols[operator]}`;
    } else if (freshInput) history.textContent = '';
  }
  render();
}

function scientificAction(name) {
  if (name === 'clear') return clear();
  if (current === 'Error') return;
  if (name === 'pi') {
    current = String(Number(Math.PI.toPrecision(12)));
    freshInput = true;
    history.textContent = 'π';
    render();
    return;
  }

  const value = Number(current);
  const angle = value * Math.PI / 180;
  const functions = {
    sin: Math.sin(angle),
    cos: Math.cos(angle),
    tan: Math.tan(angle),
    sqrt: value >= 0 ? Math.sqrt(value) : NaN,
    square: value ** 2,
    reciprocal: value === 0 ? NaN : 1 / value,
    log: value > 0 ? Math.log10(value) : NaN,
    ln: value > 0 ? Math.log(value) : NaN
  };
  const result = functions[name];
  current = Number.isFinite(result) ? String(Number(result.toPrecision(12))) : 'Error';
  history.textContent = `${name}(${value})`;
  if (current === 'Error') history.textContent = 'Hasil tidak valid untuk angka tersebut.';
  freshInput = true;
  render();
}

document.querySelector('.keys').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.number !== undefined) inputNumber(button.dataset.number);
  else if (button.dataset.operator) selectOperator(button.dataset.operator);
  else action(button.dataset.action);
});

document.querySelector('.scientific-keys').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (button) scientificAction(button.dataset.scientific);
});

document.addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  const key = event.key;
  if (/^[0-9.]$/.test(key)) inputNumber(key);
  else if (key === ',') inputNumber('.');
  else if (Object.hasOwn(symbols, key)) selectOperator(key);
  else if (key === 'Enter' || key === '=') action('equals');
  else if (key === 'Backspace') action('delete');
  else if (key === 'Escape' || key === 'Delete') action('clear');
  else return;
  event.preventDefault();
});
