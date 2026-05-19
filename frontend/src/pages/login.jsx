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
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

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

        <div className="login-hero login-hero-signup">
          <h2>Welcome Back!</h2>
          <p>Sign in to review your latest leads and customer activity.</p>
          <label htmlFor="auth-toggle">SIGN IN</label>
        </div>

        <div className="login-form login-form-signup">
          <h2>Create Account</h2>

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
            <div className="login-password-field">
              <input
                type={showSignupPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={signupData.password}
                onChange={handleSignupChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowSignupPassword((currentValue) => !currentValue)}
                aria-label={showSignupPassword ? "Hide signup password" : "Show signup password"}
                aria-pressed={showSignupPassword}
              >
                <i className={`bi ${showSignupPassword ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true"></i>
              </button>
            </div>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "PLEASE WAIT" : "SIGN UP"}
            </button>
          </form>
        </div>

        <div className="login-hero login-hero-signin">
          <h2>Hey There!</h2>
          <p>Begin your CRM journey and keep every lead moving forward.</p>
          <label htmlFor="auth-toggle">SIGN UP</label>
        </div>

        <div className="login-form login-form-signin">
          <h2>Sign In</h2>
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
            <div className="login-password-field">
              <input
                type={showLoginPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={loginData.password}
                onChange={handleLoginChange}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowLoginPassword((currentValue) => !currentValue)}
                aria-label={showLoginPassword ? "Hide login password" : "Show login password"}
                aria-pressed={showLoginPassword}
              >
                <i className={`bi ${showLoginPassword ? "bi-eye-slash" : "bi-eye"}`} aria-hidden="true"></i>
              </button>
            </div>
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
