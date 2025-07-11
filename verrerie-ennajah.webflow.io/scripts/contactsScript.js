  window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('suc') === 'ok';
    const fail = params.get('suc') === 'fail';

    const doneElement = document.getElementById('done');
    const failElement = document.getElementById('fail');

    if (success) {
      if (doneElement) doneElement.style.display = 'block';
      if (failElement) failElement.style.display = 'none';
    } else if (fail) {
      if (doneElement) doneElement.style.display = 'none';
      if (failElement) failElement.style.display = 'block';
    }
  });