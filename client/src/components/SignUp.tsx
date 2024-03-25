import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faGooglePlusG, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import axios, { AxiosError } from "axios";

interface ServerResponse {
  message: string;
  // include other fields that you expect in the response
}


function SignUpForm() {
  const [state, setState] = React.useState({
    name: "",
    email: "",
    password: ""
  });
  const handleChange = (evt: { target: { value: any; name: any; }; }) => {
    const value = evt.target.value;
    setState({
      ...state,
      [evt.target.name]: value
    });
  };

  const handleOnSubmit = async (evt: { preventDefault: () => void; }) => {
    evt.preventDefault();

    const { name, email, password } = state;

    // Check if all fields are filled
    if (!name || !email || !password) {
      alert("Please fill in all fields");
      return;
    }
    
    try {
      const response = await axios.post('http://localhost:3000/api/register', {
        name,
        email,
        password,
      });

      alert(`${response.data.message}`);
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError; // Type assertion
        if (serverError && serverError.response) {
          // Ensure the data is of the expected type
          const responseData = serverError.response.data as ServerResponse;
          if (serverError.response.status === 400) {
            alert(`Failed to create user: ${responseData.message}`);
          } else {
            alert(`An error occurred: ${responseData.message}`);
          }
        }
      } else {
        // Handle non-Axios errors
        alert(`An unknown error occurred`);
      }
    }

    // Reset the form fields
    for (const key in state) {
      setState({
        ...state,
        [key]: ""
      });
    }
};

  return (
    <div className="form-container sign-up-container">
      <form onSubmit={handleOnSubmit}>
        <h1>Create Account</h1>
        <div className="social-container">
        <a href="#" className="social">
            <FontAwesomeIcon icon={faFacebookF} />
          </a>
          <a href="#" className="social">
            <FontAwesomeIcon icon={faGooglePlusG} />
          </a>
          <a href="#" className="social">
            <FontAwesomeIcon icon={faLinkedinIn} />
          </a>
        </div>
        <span>or use your email for registration</span>
        <input
          type="text"
          name="name"
          value={state.name}
          onChange={handleChange}
          placeholder="Name"
        />
        <input
          type="email"
          name="email"
          value={state.email}
          onChange={handleChange}
          placeholder="Email"
        />
        <input
          type="password"
          name="password"
          value={state.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <button>Sign Up</button>
      </form>
    </div>
  );
}

export default SignUpForm;
