'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, FormEvent, useEffect } from 'react';
import styles from './landing-page.module.css';
import { AuthDialog } from '@/components/auth-dialog';
import { auth } from '@/lib/firebase'; // Import your firebase config
import { onAuthStateChanged, User } from 'firebase/auth';

const FORMSPREE_URL = "https://formspree.io/f/mwprnwge";

export default function LandingPage() {
  const router = useRouter();

  // State for contact form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    rating: 0
  });

  // State for dropdown contact form (separate from main form)
  const [dropdownFormData, setDropdownFormData] = useState({
    name: '',
    email: '',
    message: '',
    rating: 0
  });

  // State for AuthDialog
  const [authOpen, setAuthOpen] = useState(false);
  
  // State for current user
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleGetStarted = () => {
    // Check if user is authenticated using Firebase auth
    if (currentUser) {
      // User is authenticated, redirect to dashboard
      router.push('/dashboard');
    } else {
      // User is not authenticated, show sign-in dialog
      setAuthOpen(true);
    }
  };

  // Handle successful authentication - this will be called after sign in
  const handleAuthSuccess = () => {
    setAuthOpen(false);
    // After closing the auth dialog, redirect to dashboard
    router.push('/dashboard');
  };

  // Main form submit function
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('✅ Thank you! Your submission has been received.');
        setFormData({ name: '', email: '', message: '', rating: 0 });
      } else {
        alert('❌ Oops! Something went wrong, please try again.');
      }
    } catch (error) {
      alert('❌ Oops! Something went wrong, please try again.');
      console.error(error);
    }
  };

  // Dropdown form submit function
  const handleDropdownSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(FORMSPREE_URL, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dropdownFormData)
      });

      if (response.ok) {
        alert('✅ Thank you! Your quick contact has been received.');
        setDropdownFormData({ name: '', email: '', message: '', rating: 0 });
      } else {
        alert('❌ Oops! Something went wrong, please try again.');
      }
    } catch (error) {
      alert('❌ Oops! Something went wrong, please try again.');
      console.error(error);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <Link href="/" className={styles.logo}>NewsChat</Link>
          <nav className={styles.nav}>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="#about">About</Link></li>
              <li className={styles.contactItem}>
                <Link href="#contact">Contact</Link>
                <div className={styles.dropdownContact}>
                  <h3>Quick Contact</h3>
                  <form onSubmit={handleDropdownSubmit}>
                    <div className={styles.formGroup}>
                      <label htmlFor="dropdown-name">Name</label>
                      <input 
                        type="text" 
                        id="dropdown-name" 
                        required 
                        placeholder="Your name"
                        value={dropdownFormData.name}
                        onChange={(e) => setDropdownFormData({ ...dropdownFormData, name: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="dropdown-email">Email</label>
                      <input 
                        type="email" 
                        id="dropdown-email" 
                        required 
                        placeholder="your.email@example.com"
                        value={dropdownFormData.email}
                        onChange={(e) => setDropdownFormData({ ...dropdownFormData, email: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="dropdown-message">Question</label>
                      <textarea 
                        id="dropdown-message" 
                        required 
                        placeholder="How can we help?"
                        value={dropdownFormData.message}
                        onChange={(e) => setDropdownFormData({ ...dropdownFormData, message: e.target.value })}
                      ></textarea>
                    </div>
                    <div className={styles.formGroup}>
                      <label>Rate NewsChat</label>
                      <div className={styles.rating}>
                        {[5, 4, 3, 2, 1].map((star) => (
                          <span key={`dropdown-star-${star}`}>
                            <input
                              type="radio"
                              id={`dropdown-star${star}`}
                              name="dropdown-rating"
                              value={star}
                              checked={dropdownFormData.rating === star}
                              onChange={() => setDropdownFormData({ ...dropdownFormData, rating: star })}
                            />
                            <label htmlFor={`dropdown-star${star}`}></label>
                          </span>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className={styles.btn}>Submit</button>
                  </form>
                </div>
              </li>
              {/* Sign In Button or User Info */}
              <li>
                {currentUser ? (
                  <button 
                    className={styles.btn} 
                    onClick={() => router.push('/dashboard')}
                    style={{ 
                      padding: '10px 24px', 
                      fontSize: '15px',
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    Dashboard
                  </button>
                ) : (
                  <button 
                    className={styles.btn} 
                    onClick={() => setAuthOpen(true)}
                    style={{ 
                      padding: '10px 24px', 
                      fontSize: '15px',
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                    }}
                  >
                    Sign In
                  </button>
                )}
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <h1>Where AI Meets News.</h1>
          <p>Get real-time AI-powered news updates and intelligent summaries tailored to your interests.</p>
          <button className={styles.btn} onClick={handleGetStarted}>
            {loading ? 'Loading...' : currentUser ? 'Go to Dashboard →' : 'Get Started →'}
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.about} id="about">
        <div className={styles.container}>
          <h2>Unlock the Power of AI-Driven News</h2>
          <div className={styles.features}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🤖</div>
              <h3>AI News Summaries</h3>
              <p>Get concise, intelligent summaries of complex articles powered by advanced AI technology.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>⚡</div>
              <h3>Real-Time News Alerts</h3>
              <p>Receive instant notifications about breaking news and important updates as they happen.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>🎯</div>
              <h3>Customizable Topics</h3>
              <p>Follow what interests you most with personalized news feeds tailored to your preferences.</p>
            </div>
            <div className={`${styles.featureCard} ${styles.highlight}`}>
              <div className={styles.featureIcon}>📱</div>
              <h3>Multi-Device Support</h3>
              <p>Access your personalized news experience seamlessly from desktop, tablet, or mobile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contact} id="contact">
        <div className={styles.container}>
          <h2>Get in Touch</h2>
          <div className={styles.contactForm}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="message">Question</label>
                <textarea
                  id="message"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <label>Rate NewsChat</label>
                <div className={styles.rating}>
                  {[5, 4, 3, 2, 1].map((star) => (
                    <span key={`main-star-${star}`}>
                      <input
                        type="radio"
                        id={`star${star}`}
                        name="rating"
                        value={star}
                        checked={formData.rating === star}
                        onChange={() => setFormData({ ...formData, rating: star })}
                      />
                      <label htmlFor={`star${star}`}></label>
                    </span>
                  ))}
                </div>
              </div>
              <button type="submit" className={styles.btn} style={{ width: '100%' }}>Submit Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <p>&copy; {new Date().getFullYear()} NewsChat. All rights reserved.</p>
        </div>
      </footer>

      {/* Auth Dialog - Pass handleAuthSuccess to control redirection */}
      <AuthDialog 
        open={authOpen} 
        onOpenChange={setAuthOpen}
      />
    </div>
  );
}