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

  const loadingAlert = document.querySelector('.loading');
  const form = document.querySelector('form')
  const fields = form.elements;
  const {
    sourceDT,
    date,
    time,
    format,
    output,
    customDT,
    nowDT,
  } = fields;

  loadingAlert.remove();
  form.classList.remove('disabled');

  const intObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const isStuck = entry.intersectionRatio < 1
      form.classList.toggle('is-stuck', isStuck);
    })
  }, {
    rootMargin: "-1px 100% 100% 100%",
    threshold: [0.99999, 1],
  });

  intObs.observe(form);

  const updateOnInput = () => {
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

  customDT.addEventListener('input', () => {
    date.value = '';
    date.removeAttribute('readonly');

    time.value = '';
    time.removeAttribute('readonly');
  });

  nowDT.addEventListener('input', () => {
    date.setAttribute('readonly', '');

    time.setAttribute('readonly', '')
  })
})
