import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', { email, password }, { withCredentials: true });
      if (response.status === 200) {
        const adminId = response.data.adminId;
        sessionStorage.setItem("adminId", adminId); // Store adminId in sessionStorage
        toast.success('Login successful!');
        navigate('/'); // Navigate to the home route
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || 'Login failed. Please try again.');
      } else {
        toast.error('An error occurred. Please try again.');
      }
    }
  };

  return (
    <main className="main" id="top">
      <div className="container-fluid">
        <div className="row min-vh-100 flex-center g-0">
          <div className="col-lg-8 col-xxl-5 py-3 position-relative">
            <img className="bg-auth-circle-shape" src="assets/img/icons/spot-illustrations/bg-shape.png" alt="" width="250" />
            <img className="bg-auth-circle-shape-2" src="assets/img/icons/spot-illustrations/shape-1.png" alt="" width="150" />
            <div className="card overflow-hidden z-1">
              <div className="card-body p-0">
                <div className="row g-0 h-100">
                  <div className="col-md-5 text-center bg-card-gradient">
                    <div className="position-relative p-4 pt-md-5 pb-md-7" data-bs-theme="light">
                      <div className="bg-holder bg-auth-card-shape" style={{ backgroundImage: "url(assets/img/icons/spot-illustrations/half-circle.png);" }}></div>
                      <div className="z-1 position-relative">
                        <a className="link-light mb-4 font-sans-serif fs-5 d-inline-block fw-bolder" href="index-2.html">falcon</a>
                        <p className="opacity-75 text-white">With the power of Falcon, you can now focus only on functionaries for your digital products, while leaving the UI design on us!</p>
                      </div>
                    </div>
                    <div className="mt-3 mb-4 mt-md-4 mb-md-5" data-bs-theme="light">
                      <p className="text-white">Don't have an account?<br /><a className="text-decoration-underline link-light" href="register.html">Get started!</a></p>
                      <p className="mb-0 mt-4 mt-md-5 fs-10 fw-semi-bold text-white opacity-75">Read our <a className="text-decoration-underline text-white" href="#!">terms</a> and <a className="text-decoration-underline text-white" href="#!">conditions </a></p>
                    </div>
                  </div>
                  <div className="col-md-7 d-flex flex-center">
                    <div className="p-4 p-md-5 flex-grow-1">
                      <div className="row flex-between-center">
                        <div className="col-auto">
                          <h3>Account Login</h3>
                        </div>
                      </div>
                      <form onSubmit={handleLogin}>
                        <div className="mb-3">
                          <label className="form-label" htmlFor="card-email">Email address</label>
                          <input
                            className="form-control"
                            id="card-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <div className="mb-3">
                          <div className="d-flex justify-content-between">
                            <label className="form-label" htmlFor="card-password">Password</label>
                          </div>
                          <input
                            className="form-control"
                            id="card-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="row flex-between-center">
                          <div className="col-auto">
                            <div className="form-check mb-0">
                              <input className="form-check-input" type="checkbox" id="card-checkbox" />
                              <label className="form-check-label mb-0" htmlFor="card-checkbox">Remember me</label>
                            </div>
                          </div>
                          <div className="col-auto"><a className="fs-10" href="forgot-password.html">Forgot Password?</a></div>
                        </div>
                        <div className="mb-3">
                          <button className="btn btn-primary d-block w-100 mt-3" type="submit">Log in</button>
                        </div>
                      </form>
                      <ToastContainer />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
