const NUM = 'number'
const STR = 'string'

let stdout = '';
let timer;

Module({
  onAbort(reason) {
    console.error(`WASM aborted: ${reason}`)
  },
  print(data) {
    if (data) {
      clearTimeout(timer);
      console.log('DATA');

      stdout = `${stdout}${data}`;

      timer = setTimeout(() => {
        console.dir(stdout);
        stdout = '';
      }, 5);
    }
  },
  printErr(data) {
    if (data) {
      console.log('stderr: ', data)
    }
  },
})
.then(({ccall, FS, IDBFS}) => {
  ccall('pib_init', NUM, [STR], []);

  const version = ccall('pib_exec', STR, [STR], [`phpversion();`]);
  console.log('PHP VERSION: ', version);

  const fields = document.querySelector('form').elements;
  const {
    sourceDT,
    date,
    time,
    format,
    output,
  } = fields;

  const updateOnInput = () => {
    console.log('input!');
    if (date.value && time.value && format.value) {
      const php = `(new DateTimeImmutable('${date.value} ${time.value}'))->format('${format.value}');`;
      const formatted = ccall('pib_exec', STR, [STR], [php]);
      output.value = formatted;
    }
  }

  setInterval(() => {
    if (sourceDT.value === 'now') {
      const now = new Date()
      const [nowDate, nowTime] = now.toISOString()
        .replace('Z', '')
        .split('.')[0]
        .split('T')
      date.value = nowDate;
      time.value = nowTime;
      updateOnInput();
    }
  }, 1000);

  date.addEventListener('input', updateOnInput);
  time.addEventListener('input', updateOnInput);
  format.addEventListener('input', updateOnInput);


  const formatted = ccall('pib_exec', STR, [STR], [`(new DateTimeImmutable('2000-01-01'))->format('Y-m-d H:i:s');`]);
  console.log('FORMATTED: ', formatted);
})
