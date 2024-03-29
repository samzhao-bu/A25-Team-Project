import React, { useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faGooglePlusG, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import axios, { AxiosError } from "axios";
import { useSearchParams, useNavigate } from 'react-router-dom';

interface ServerResponse {
  message: string;
}


function SignInForm({ onAuthenticate }: { onAuthenticate: (isAuth: boolean) => void }) {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Save the token in localStorage or context
      localStorage.setItem('jwtToken', token);
      // Update authentication state
      onAuthenticate(true);
      // Redirect user to home page
      navigate('/'); 
    }
  }, [searchParams, navigate, onAuthenticate]);

  const [state, setState] = React.useState({
    email: "",
    password: ""
  });

  const handleGoogleSignIn = () => {
    window.location.href = 'http://localhost:3000/api/auth/google';
  };


  const handleChange = (evt: { target: { value: any; name: any; }; }) => {
    const value = evt.target.value;
    setState({
      ...state,
      [evt.target.name]: value
    });
  };

  const handleOnSubmit = async (evt: { preventDefault: () => void; }) => {
    evt.preventDefault();

    const { email, password } = state;

     // Check if all fields are filled
     if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    
    alert(`You are login with email: ${email} and password: ${password}`);

    try {
      const response = await axios.post('http://localhost:3000/api/login', {
        email,
        password,
      });

      alert(`${response.data.message}`);

      // set authenticated state to true used the func in arg
      onAuthenticate(true);
      // navigate to homepage
      navigate('/');
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError; // Type assertion
        if (serverError && serverError.response) {
          // Ensure the data is of the expected type
          const responseData = serverError.response.data as ServerResponse;
          if (serverError.response.status === 404) {
            alert(`${responseData.message}`);
          } else {
            alert(`${responseData.message}`);
          }
        }
      } else {
        // Handle non-Axios errors
        alert(`An unknown error occurred`);
      }
    }

    for (const key in state) {
      setState({
        ...state,
        [key]: ""
      });
    }
  };

  return (
    <div className="form-container sign-in-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Sign in</h1>
        <div className="social-container">
          <a href="#" className="social">
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a href="#" className="social" onClick={handleGoogleSignIn}>
            <FontAwesomeIcon icon={faGooglePlusG} />
          </a>
          <a href="#" className="social">
            <FontAwesomeIcon icon={faLinkedinIn} />
          </a>
        </div>
        <span>or use your account</span>
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={state.email}
          onChange={handleChange}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={state.password}
          onChange={handleChange}
        />
        <a href="#">Forgot your password?</a>
        <button>Sign In</button>
      </form>
    </div>
  );
}

export default SignInForm;
