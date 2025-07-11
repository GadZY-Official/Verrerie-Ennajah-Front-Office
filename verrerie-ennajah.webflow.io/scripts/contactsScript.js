  window.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('suc') === 'ok';
    const fail = params.get('suc') === 'fail';

    const doneElement = document.getElementById('done');
    const failElement = document.getElementById('fail');
    const formElement = document.getElementById('contactForm');

    if (success) {
      if (doneElement) doneElement.style.display = 'block';
      if (failElement) failElement.style.display = 'none';
      if (formElement) formElement.style.display = 'none';
    } else if (fail) {
      if (doneElement) doneElement.style.display = 'none';
      if (failElement) failElement.style.display = 'block';
      if (formElement) formElement.style.display = 'none';
    }
  });