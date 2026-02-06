import {supaBase} from './supabase.js'


 supaBase.auth.onAuthStateChange((event, session) => {
     const path = window.location.pathname
    const isChatPage = path.includes('chatroom.html');
    const isLoginPage = path.includes('index.html') || path.endsWith('/')

    if (session) {
      document.body.style.display = 'flex'
      if (isLoginPage) {
        console.log('user is logged in ', session.user)
        window.location.href = "chatroom.html";
      } 
    } else {
      document.body.style.display = 'flex'
      console.log('no active session')
      if (isChatPage) {
        window.location.href = 'index.html';
      } 
    }
}); 
  

const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn')


 if (logoutBtn) {
logoutBtn.addEventListener('click', async () =>{

  const confirmed = confirm("Are you sure you want to logout?")
  if (confirmed) {
   
   const {error} = await supaBase.auth.signOut();
    if (error) {
    console.error("logout error: ", error)
  } else {
    console.log('successfully logged out ')
    window.location.href = "./index.html"
  }

  } else {
    console.log('logout cancelled')
  }


})
 }

if (loginBtn && signupBtn) {

loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const {data, error } = await supaBase.auth.signInWithPassword({
    email,
    password
  });
  if (error) {
    alert(error.message)
  }else {
    window.location.href = './chatroom.html'
  }
})

signupBtn.addEventListener('click', async() => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const username = document.getElementById('username').value;
  

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

}
