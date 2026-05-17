import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import AppLoader from "../components/AppLoader";
import Notification from "../components/Notification";
import "../styles/login.css";

const saveSession = (authData, fallbackUser) => {
  localStorage.setItem("token", authData.token);
  localStorage.setItem("user", JSON.stringify(authData.user || fallbackUser));
};

function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [notification, setNotification] = useState({ visible: false, message: "", tone: "info" });

  const showNotification = (message, tone = "info") => {
    setNotification({ visible: true, message, tone });
  };

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;

    setSignupData((currentData) => ({
      ...currentData,
      [name]: value,
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProcessingLabel("Signing you in...");

    try {
      const response = await API.post("/auth/login", loginData);

      saveSession(response.data, {
        email: loginData.email,
      });

      showNotification("Login successful", "success");
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (error) {
      showNotification(error.response?.data?.message || "Login failed", "danger");
    } finally {
      setIsSubmitting(false);
      setProcessingLabel("");
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProcessingLabel("Creating account...");

    try {
      const response = await API.post("/auth/register", signupData);

      saveSession(response.data, {
        name: signupData.name,
        email: signupData.email,
      });

      showNotification("Account created successfully", "success");
      setTimeout(() => navigate("/dashboard"), 600);
    } catch (error) {
      showNotification(error.response?.data?.message || "Signup failed", "danger");
    } finally {
      setIsSubmitting(false);
      setProcessingLabel("");
    }
  };

  return (
    <main className="login-page">
      <AppLoader show={isSubmitting} label={processingLabel} />

      <section className="login-card" aria-label="Mini CRM authentication">
        <input type="checkbox" id="auth-toggle" className="login-toggle" />
        <div className="login-card-bg" aria-hidden="true"></div>

        <div className="login-hero login-hero--signup">
          <h2>Welcome Back!</h2>
          <p>Sign in to review your latest leads and customer activity.</p>
          <label htmlFor="auth-toggle">SIGN IN</label>
        </div>

        <div className="login-form login-form--signup">
          <h2>Create Account</h2>
          <div className="login-sso" aria-label="Social signup options">
            <button type="button" aria-label="Continue with Facebook">
              <i className="bi bi-facebook" aria-hidden="true"></i>
            </button>
            <button type="button" aria-label="Continue with Twitter">
              <i className="bi bi-twitter-x" aria-hidden="true"></i>
            </button>
            <button type="button" aria-label="Continue with LinkedIn">
              <i className="bi bi-linkedin" aria-hidden="true"></i>
            </button>
          </div>
          <p>Or use your email address</p>

          <form onSubmit={handleSignupSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={signupData.name}
              onChange={handleSignupChange}
              autoComplete="name"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={signupData.email}
              onChange={handleSignupChange}
              autoComplete="email"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={signupData.password}
              onChange={handleSignupChange}
              autoComplete="new-password"
              required
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "PLEASE WAIT" : "SIGN UP"}
            </button>
          </form>
        </div>

        <div className="login-hero login-hero--signin">
          <h2>Hey There!</h2>
          <p>Begin your CRM journey and keep every lead moving forward.</p>
          <label htmlFor="auth-toggle">SIGN UP</label>
        </div>

        <div className="login-form login-form--signin">
          <h2>Sign In</h2>
          <div className="login-sso" aria-label="Social signin options">
            <button type="button" aria-label="Continue with Facebook">
              <i className="bi bi-facebook" aria-hidden="true"></i>
            </button>
            <button type="button" aria-label="Continue with Twitter">
              <i className="bi bi-twitter-x" aria-hidden="true"></i>
            </button>
            <button type="button" aria-label="Continue with LinkedIn">
              <i className="bi bi-linkedin" aria-hidden="true"></i>
            </button>
          </div>
          <p>Or use your email address</p>

          <form onSubmit={handleLoginSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={loginData.email}
              onChange={handleLoginChange}
              autoComplete="email"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={loginData.password}
              onChange={handleLoginChange}
              autoComplete="current-password"
              required
            />
            <button type="button" className="login-forgot">
              Forgot password?
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "PLEASE WAIT" : "SIGN IN"}
            </button>
          </form>
        </div>
      </section>
        <Notification
          visible={notification.visible}
          message={notification.message}
          tone={notification.tone}
          onClose={() => setNotification({ visible: false, message: "", tone: "info" })}
        />
    </main>
  );
}

export default Login;

