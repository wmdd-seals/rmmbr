//Task1: Toggle (1) password visibility and (2) display of eye icon, by clicking on the eye icon

// Get references to the password input fields and the eye icons
const passwordInput1: HTMLInputElement = document.getElementById('firstPass') as HTMLInputElement ;
const passwordInput2: HTMLInputElement = document.getElementById('secondPass') as HTMLInputElement ;
const passwordInputs: HTMLInputElement[] = [passwordInput1, passwordInput2];

const openEyes: NodeListOf<HTMLElement> = document.querySelectorAll('.fa-eye');
const closedEyes: NodeListOf<HTMLElement> = document.querySelectorAll('.fa-eye-slash');



  // Loop through each open eye icon and add an event listener
  openEyes.forEach((openEye: HTMLElement, index: number) => {
    // Add click event listener to the open eye icon
    openEye.addEventListener('click', () => {
      const passwordInput = passwordInputs[index];
      const closedEye = closedEyes[index];

      // Toggle password visibility
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
      } else {
        passwordInput.type = 'password';
      }

      // Hide the open eye icon and show the closed eye icon
      openEye.parentElement?.classList.add('hidden');
      closedEye.parentElement?.classList.remove('hidden');
    });
  });

  // Loop through each closed eye icon and add an event listener
  closedEyes.forEach((closedEye: HTMLElement, index: number) => {
    // Add click event listener to the closed eye icon
    closedEye.addEventListener('click', () => {
      const passwordInput = passwordInputs[index];
      const openEye = openEyes[index];

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
  });



// Task2: Validate that the password in the "Confirm password" input field matches the password in the "Password" input field

// Get references to the password input fields
const firstPassInput: HTMLInputElement = document.getElementById('firstPass') as HTMLInputElement;
const secondPassInput: HTMLInputElement = document.getElementById('secondPass') as HTMLInputElement ;


    secondPassInput.addEventListener("input", () => {
        // Get the current values of the password inputs
        const firstPass: string = firstPassInput.value;
        const secondPass: string = secondPassInput.value;

        // Check whether the passwords match
        if (firstPass === secondPass) {
            // If the passwords match, remove any previous validation message
            secondPassInput.setCustomValidity("");
        } else {
            // If passwords do not match, set custom validation message and prevent input
            secondPassInput.setCustomValidity("Passwords do not match.");
        }
    });



