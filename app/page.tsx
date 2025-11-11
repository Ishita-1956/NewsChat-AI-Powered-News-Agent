'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, FormEvent, useEffect } from 'react';
import styles from './landing-page.module.css';
import { AuthDialog } from '@/components/auth-dialog';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

const FORMSPREE_URL = "https://formspree.io/f/mwprnwge";

export default function LandingPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    rating: 0
  });

  const [dropdownFormData, setDropdownFormData] = useState({
    name: '',
    email: '',
    message: '',
    rating: 0
  });

  const [authOpen, setAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleGetStarted = () => {
    if (currentUser) {
      router.push('/dashboard');
    } else {
      setAuthOpen(true);
    }
  };

  const handleAuthSuccess = () => {
    setAuthOpen(false);
    router.push('/dashboard');
  };

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
    <div style={{ backgroundColor: '#f8f9fa', fontSize: '16px' }}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContainer}>
          <Link href="/" className={styles.logo} style={{ fontSize: '20px' }}>NewsChat</Link>
          <nav className={styles.nav}>
            <ul style={{ fontSize: '14px' }}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="#about">About</Link></li>
              <li className={styles.contactItem}>
                <Link href="#contact">Contact</Link>
                <div className={styles.dropdownContact}>
                  <h3 style={{ fontSize: '16px' }}>Quick Contact</h3>
                  <form onSubmit={handleDropdownSubmit}>
                    <div className={styles.formGroup}>
                      <label htmlFor="dropdown-name" style={{ fontSize: '13px' }}>Name</label>
                      <input 
                        type="text" 
                        id="dropdown-name" 
                        required 
                        placeholder="Your name"
                        style={{ fontSize: '13px', color: 'black' }}
                        value={dropdownFormData.name}
                        onChange={(e) => setDropdownFormData({ ...dropdownFormData, name: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="dropdown-email" style={{ fontSize: '13px' }}>Email</label>
                      <input 
                        type="email" 
                        id="dropdown-email" 
                        required 
                        placeholder="your.email@example.com"
                        style={{ fontSize: '13px', color: 'black' }}
                        value={dropdownFormData.email}
                        onChange={(e) => setDropdownFormData({ ...dropdownFormData, email: e.target.value })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="dropdown-message" style={{ fontSize: '13px' }}>Question</label>
                      <textarea 
                        id="dropdown-message" 
                        required 
                        placeholder="How can we help?"
                        style={{ fontSize: '13px', color: 'black' }}
                        value={dropdownFormData.message}
                        onChange={(e) => setDropdownFormData({ ...dropdownFormData, message: e.target.value })}
                      ></textarea>
                    </div>
                    <div className={styles.formGroup}>
                      <label style={{ fontSize: '13px' }}>Rate NewsChat</label>
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
                    <button type="submit" className={styles.btn} style={{ fontSize: '13px' }}>Submit</button>
                  </form>
                </div>
              </li>
              <li>
                {currentUser ? (
                  <button 
                    className={styles.btn} 
                    onClick={() => router.push('/dashboard')}
                    style={{ 
                      padding: '8px 20px', 
                      fontSize: '14px',
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
                      padding: '8px 20px', 
                      fontSize: '14px',
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
          <h1 style={{ fontSize: '42px' }}>Where AI Meets News.</h1>
          <p style={{ fontSize: '18px' }}>Get real-time AI-powered news updates and intelligent summaries tailored to your interests.</p>
          <button className={styles.btn} onClick={handleGetStarted} style={{ fontSize: '15px', padding: '12px 32px' }}>
            {loading ? 'Loading...' : currentUser ? 'Go to Dashboard →' : 'Get Started →'}
          </button>
        </div>
      </section>

      {/* About Section */}
      <section className={styles.about} id="about">
        <div className={styles.container}>
          <h2 style={{ fontSize: '32px' }}>Unlock the Power of AI-Driven News</h2>
          <div className={styles.features}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} style={{ fontSize: '32px' }}>🤖</div>
              <h3 style={{ fontSize: '18px' }}>AI News Summaries</h3>
              <p style={{ fontSize: '14px' }}>Get concise, intelligent summaries of complex articles powered by advanced AI technology.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} style={{ fontSize: '32px' }}>⚡</div>
              <h3 style={{ fontSize: '18px' }}>Real-Time News Alerts</h3>
              <p style={{ fontSize: '14px' }}>Receive instant notifications about breaking news and important updates as they happen.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon} style={{ fontSize: '32px' }}>🎯</div>
              <h3 style={{ fontSize: '18px' }}>Customizable Topics</h3>
              <p style={{ fontSize: '14px' }}>Follow what interests you most with personalized news feeds tailored to your preferences.</p>
            </div>
            <div className={`${styles.featureCard} ${styles.highlight}`}>
              <div className={styles.featureIcon} style={{ fontSize: '32px' }}>📱</div>
              <h3 style={{ fontSize: '18px' }}>Multi-Device Support</h3>
              <p style={{ fontSize: '14px' }}>Access your personalized news experience seamlessly from desktop, tablet, or mobile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className={styles.contact} id="contact">
        <div className={styles.container}>
          <h2 style={{ fontSize: '32px' }}>Get in Touch</h2>
          <div className={styles.contactForm}>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="name" style={{ fontSize: '14px' }}>Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your full name"
                  style={{ fontSize: '14px', color: 'black' }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="email" style={{ fontSize: '14px' }}>Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="your.email@example.com"
                  style={{ fontSize: '14px', color: 'black' }}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="message" style={{ fontSize: '14px' }}>Question</label>
                <textarea
                  id="message"
                  placeholder="How can we help you?"
                  style={{ fontSize: '14px', color: 'black' }}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className={styles.formGroup}>
                <label style={{ fontSize: '14px' }}>Rate NewsChat</label>
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
              <button type="submit" className={styles.btn} style={{ width: '100%', fontSize: '14px' }}>Submit Message</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.container}>
          <p style={{ fontSize: '13px' }}>&copy; {new Date().getFullYear()} NewsChat. All rights reserved.</p>
        </div>
      </footer>

      <AuthDialog 
        open={authOpen} 
        onOpenChange={setAuthOpen}
      />
    </div>
  );
}
