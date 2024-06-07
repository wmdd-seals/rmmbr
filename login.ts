//Task1: Toggle (1) password visibility and (2) display of eye icon, by clicking on the eye icon

// Get references to the password input fields and the eye icons
const passwordInput: HTMLInputElement = document.getElementById('password') as HTMLInputElement ;

const openEye: HTMLElement = document.querySelector('.fa-eye') as HTMLElement;
const closedEye: HTMLElement = document.querySelector('.fa-eye-slash') as HTMLElement;

    // Add click event listener to the open eye icon
    openEye.addEventListener('click', () => {
      // Toggle password visibility
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
      } else {
        passwordInput.type = 'password';
      }
      console.log('hello!');
      console.log("openEye.parentElement")


      // Hide the open eye icon and show the closed eye icon
      openEye.parentElement?.classList.add('hidden');
      closedEye.parentElement?.classList.remove('hidden');
    });

  
    // Add click event listener to the closed eye icon
    closedEye!.addEventListener('click', () => {

      // Toggle password visibility
      if (passwordInput.type === 'text') {
        passwordInput.type = 'password';
      } else {
        passwordInput.type = 'text';
      }

      // Hide the closed eye icon and show the open eye icon
      closedEye.parentElement?.classList.add('hidden');
      openEye.parentElement?.classList.remove('hidden');
    });
