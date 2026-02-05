import {supaBase} from './supabase.js'

const signupBtn = document.getElementById('signup-btn');

signupBtn.addEventListener('click', async() => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const username = document.getElementById.value;
  

  const {data, error } = await supaBase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {display_name: username}
    }
  });

  if (error) {
    alert(error.message);
  } else {
    alert('check your email for a confirmation linK!')
  }
})


 export async function  checkUser (supaBase)  {
  const {data: {session}} = await supaBase.auth.getSession();

  if(!session) {
    window.location.href = './index.html'
  } else {
    console.log("Welcome", session.user.email)
  }
}