// Preview only: the API always calculates the final total from the saved trip price.
(() => {
  const travelers = document.getElementById('travelers');
  const total = document.getElementById('reservation-total');
  if (!travelers || !total) return;
  const format = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const update = () => {
    total.textContent = travelers.validity.valid
      ? format.format(Number(total.dataset.priceCents) * Number(travelers.value) / 100)
      : 'Choose 1 to 10 travelers';
  };
  travelers.addEventListener('input', update);
  update();
})();
