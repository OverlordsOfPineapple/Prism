export function initFounderMode({ trigger, panel, close, brand }) {
  trigger.onclick = () => { panel.hidden = false; };
  close.onclick = () => { panel.hidden = true; };
  let clicks = 0;
  let timer;
  brand.addEventListener('click', () => {
    clicks += 1;
    clearTimeout(timer);
    timer = setTimeout(() => { clicks = 0; }, 1600);
    if (clicks >= 5) { panel.hidden = false; clicks = 0; }
  });
}
