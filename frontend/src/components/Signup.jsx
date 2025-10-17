import React, { useState } from 'react'
import { signupStyles } from '../assets/dummyStyles'
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';


const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); // wheather email has @ or not

const Signup = ({ onSignupSuccess = null }) => {

    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState("");
    const [loading, setLoading] = useState(false);

    // EMAIL VALIDATION FUNCTION
    const validate = () => {
        const e = {};
        if (!name.trim()) e.name = "Name is required";
        if (!email) e.email = "Email is required";
        else if (!isValidEmail(email)) e.email = "Please enter a valid email";
        if (!password) e.password = "Password is required";
        else if (password.length < 6)
            e.password = "Password must be at least 6 characters";
        return e;
    };

    const API_BASE = 'http://localhost:4000';

    const handleSubmit = async (ev) => {
        ev.preventDefault();
        setSubmitError("");
        const v = validate();
        setErrors(v);
        if (Object.keys(v).length) return;

        setLoading(true);

        try {
            const payload = {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                password,
            };

            const resp = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            let data = null;

            try {
                data = await resp.json();
            }
            catch (e) {
                // ignore all the error
            }

            if (!resp.ok) {
                const msg = data?.message || "Registeration failed";
                setSubmitError(msg);
                return;
            }

            if (data?.token) {
                try {
                    localStorage.setItem('autoToken', data.token);
                    localStorage.setItem(
                        'currentUser',
                        JSON.stringify(
                            data.user || {
                                name: name.trim(),
                                email: email.trim().toLowerCase(),
                            }
                        )
                    );
                } catch (err) {
                    // ignore all the error
                }
            }

            if (typeof onSignupSuccess === 'function') {
                try {
                    onSignupSuccess(
                        data.user || {
                            name: name.trim(),
                            email: email.trim().toLowerCase(),
                        }
                    )
                } catch (err) { }
            }

            navigate("/login", { replace: true });
        } catch (err) {
            console.error("Signup error:", err);
            setSubmitError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={signupStyles.pageContainer}>
            <Link to="/login" className={signupStyles.backButton}>
                <ArrowLeft className={signupStyles.backButtonIcon} />
                <span className={signupStyles.backButtonText}>Back</span>
            </Link>

            <div className={signupStyles.formContainer}>
                <form onSubmit={handleSubmit}>
                    <div className={signupStyles.animatedBorder}>
                        <div className={signupStyles.formContent}>
                            <h2 className={signupStyles.formContent}>
                                <span className={signupStyles.headingIcon}>
                                    <CheckCircle className={signupStyles.headingIconInner} />
                                </span>
                                <span className={signupStyles.headingText}>Create Account</span>
                            </h2>

                            <p className={signupStyles.subtitle}>
                                Sign in to continue to QuizMaster. Light, clean UI - smooth
                                animations, and easy validation.
                            </p>

                            <label className={signupStyles.label}>
                                <span className={signupStyles.labelText}>Full Name</span>
                                <div className={signupStyles.inputContainer}>
                                    <span className={signupStyles.inputIcon}>
                                        <User className={signupStyles.inputIconInner} />
                                    </span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            if (errors.name)
                                                setErrors((s) => ({
                                                    ...s,
                                                    name: undefined,
                                                }));
                                        }}

                                        className={`${signupStyles.input} ${errors.name
                                            ? signupStyles.inputError
                                            : signupStyles.inputNormal
                                            }`}
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>
                                {errors.name && (
                                    <p className={signupStyles.errorText}>{errors.name}</p>
                                )}
                            </label>

                            <label className={signupStyles.label}>
                                <span className={signupStyles.labelText}>Email</span>
                                <div className={signupStyles.inputContainer}>
                                    <span className={signupStyles.inputIcon}>
                                        <Mail className={signupStyles.inputIconInner} />
                                    </span>
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email)
                                                setErrors((s) => ({
                                                    ...s,
                                                    email: undefined,
                                                }));
                                        }}

                                        className={`${signupStyles.input} ${errors.email
                                            ? signupStyles.inputError
                                            : signupStyles.inputNormal
                                            }`}
                                        placeholder="your@example.com"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className={signupStyles.errorText}>{errors.email}</p>
                                )}
                            </label>

                            <label className={signupStyles.label}>
                                <span className={signupStyles.labelText}>Password</span>
                                <div className={signupStyles.inputContainer}>
                                    <span className={signupStyles.inputIcon}>
                                        <Lock className={signupStyles.inputIconInner} />
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="Password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password)
                                                setErrors((s) => ({
                                                    ...s,
                                                    password: undefined,
                                                }));
                                        }}

                                        className={`${signupStyles.input} ${signupStyles.passwordInput} ${errors.password
                                            ? signupStyles.inputError
                                            : signupStyles.inputNormal
                                            }`}
                                        placeholder="Create a strong password"
                                        required
                                    />
                                    {/* toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className={signupStyles.passwordToggle}
                                    >
                                        {showPassword ? (
                                            <EyeOff className={signupStyles.passwordToggleIcon} />
                                        ) : (
                                            <Eye className={signupStyles.passwordToggleIcon} />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className={signupStyles.errorText}>{errors.password}</p>
                                )}
                            </label>

                            {submitError && (
                                <p className={signupStyles.submitError} role="alert">{submitError}</p>
                            )}

                            <div className={signupStyles.buttonsContainer}>
                               <button type="submit" disabled={loading} className={signupStyles.submitButton}>
                                 { loading ? "Creating Account..." : "Create Account" }
                               </button>
                            </div>
                        </div>
                    </div>
                </form>

                <div className={signupStyles.loginPromptContainer}>
                  <div className={signupStyles.loginPromptContent}>
                    <span className={signupStyles.loginPromptText}>
                        Already have an account?
                    </span>
                    <Link to='/login' className={signupStyles.loginPromptLink}>
                     Login
                    </Link>
                  </div>
                </div>
            </div>
        </div>
    );
};

export default Signup