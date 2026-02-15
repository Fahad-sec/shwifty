import {supaBase} from './supabase.js'

const loader  = document.getElementById('loading-screen')
const loadingMsg = document.querySelector('.loading-msg')
    
    const toggleLoader = (show, msg) => {
      if (!loader) return ;
      if (show) {
        loadingMsg.innerText = msg
        loader.style.display = 'flex';
        loader.classList.remove( 'loader-hidden')
      } else {
        loader.classList.add('loader-hidden')
        setTimeout(() => loader.style.display = 'none', 500)
      }
    }


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
      toggleLoader(false)

      if (isChatPage) {
        window.location.href = 'index.html';
      } 
    }
}); 
  
let isLoginMode = true;

const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn')
const authToggle = document.getElementById('auth-toggle')
const userName = document.getElementById('username')




authToggle?.addEventListener('click', () => {
  isLoginMode = !isLoginMode;

  if (isLoginMode) {
    authToggle.innerHTML = "Don't have an account?"
    signupBtn.style.display = 'none'
    userName.style.display = 'none'
    loginBtn.style.display = 'flex'
  } else {
    loginBtn.style.display = 'none'
    signupBtn.style.display = 'flex'
    userName.style.display = 'flex'
    authToggle.innerHTML = "Already have an account?"
  }
})


 if (logoutBtn) {
logoutBtn.addEventListener('click', async () =>{
  const confirmed = confirm("Are you sure you want to logout?")
  if (confirmed) {
     toggleLoader(true, 'See you soon!')
  logoutBtn.disabled = true;
  logoutBtn.style.opacity = "0.7";
  logoutBtn.style.cursor = "not-allowed";
   
   const {error} = await supaBase.auth.signOut();
   toggleLoader(false)
  if (error) {
    toggleLoader(false)
      logoutBtn.disabled = false;
      logoutBtn.style.opacity = "1";
      logoutBtn.style.cursor = "pointer";
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
  toggleLoader(true, 'Verifying your account...' );

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  loginBtn.disabled = true;
  loginBtn.innerText = "Authenticating..."
  loginBtn.style.opacity = "0.7";
  loginBtn.style.cursor = "not-allowed";

  const {data, error } = await supaBase.auth.signInWithPassword({
    email,
    password
  });

  toggleLoader(false)
  if (error) {
    toggleLoader(false)
  loginBtn.disabled = false;
  loginBtn.innerText = "Login"
  loginBtn.style.opacity = "1";
  loginBtn.style.cursor = "pointer";
    alert(error.message)
  }else {
    window.location.href = './chatroom.html'
  }
})

signupBtn.addEventListener('click', async() => {
  toggleLoader(true, 'Creating you account...' )

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const username = document.getElementById('username').value;

      signupBtn.disabled = true;
      signupBtn.innerText = "Signing up..."
      signupBtn.style.opacity = "0.7";
      signupBtn.style.cursor = "not-allowed";
  

  const {data, error } = await supaBase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {username: username, display_name: username}
    }
  });
   toggleLoader(false)
  if (error) {
    toggleLoader(false)
      signupBtn.disabled = false;
      signupBtn.innerText = "Sign up"
      signupBtn.style.opacity = "1";
      signupBtn.style.cursor = "pointer";
    alert(error.message);
  } else {
    alert('check your email for a confirmation linK!')
  }
})

}
