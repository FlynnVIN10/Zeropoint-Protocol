import React, { useState, useEffect } from 'react';
import styles from './SynthiantCarousel.module.css';

const SynthiantCarousel = () => {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentPrompts = async () => {
      try {
        // Fetch recent prompts from the API
        const response = await fetch('http://localhost:3000/v1/logs/recent?type=prompt', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recent prompts');
        }

        const data = await response.json();
        
        // Mock data for demonstration since the API endpoint might not exist yet
        const mockPrompts = [
          {
            id: 1,
            prompt: "Analyze the ethical implications of AI decision-making in autonomous vehicles",
            response: "AI decision-making in autonomous vehicles raises critical ethical questions about responsibility, safety, and human values...",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            confidence: 0.95
          },
          {
            id: 2,
            prompt: "Design a sustainable urban planning solution for smart cities",
            response: "Sustainable urban planning requires integration of renewable energy, efficient transportation, and community engagement...",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            confidence: 0.88
          },
          {
            id: 3,
            prompt: "Create a blockchain-based voting system with privacy protection",
            response: "A privacy-preserving blockchain voting system can ensure transparency while protecting voter anonymity...",
            timestamp: new Date(Date.now() - 10800000).toISOString(),
            confidence: 0.92
          },
          {
            id: 4,
            prompt: "Develop an AI model for early disease detection in medical imaging",
            response: "Early disease detection using AI can significantly improve patient outcomes and reduce healthcare costs...",
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            confidence: 0.87
          },
          {
            id: 5,
            prompt: "Design a decentralized finance protocol for ethical lending",
            response: "Ethical DeFi lending protocols can provide financial inclusion while maintaining transparency and fairness...",
            timestamp: new Date(Date.now() - 18000000).toISOString(),
            confidence: 0.91
          }
        ];

        setPrompts(mockPrompts);
        setLoading(false);

        // Log to soulchain
        console.log('SOULSHOW:STORY_CAROUSEL_RENDERED', {
          timestamp: new Date().toISOString(),
          promptCount: mockPrompts.length,
          source: 'synthiant-carousel'
        });

      } catch (err) {
        console.error('Error fetching recent prompts:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRecentPrompts();
  }, []);

  const truncateText = (text, maxLength = 280) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading recent Synthiant interactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.carouselContainer}>
        <div className={styles.errorMessage}>
          <p>Unable to load recent prompts: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.carouselContainer}>
      <h2 className={styles.carouselTitle}>Recent Synthiant Interactions</h2>
      <div className={styles.carouselWrapper}>
        <div className={styles.carouselTrack}>
          {prompts.map((item, index) => (
            <div key={item.id} className={styles.carouselCard}>
              <div className={styles.cardHeader}>
                <span className={styles.timestamp}>
                  {new Date(item.timestamp).toLocaleTimeString()}
                </span>
                <span className={styles.confidence}>
                  {Math.round(item.confidence * 100)}% confidence
                </span>
              </div>
              <div className={styles.cardContent}>
                <h3 className={styles.promptTitle}>Prompt</h3>
                <p className={styles.promptText}>
                  {truncateText(item.prompt, 150)}
                </p>
                <h4 className={styles.responseTitle}>Response</h4>
                <p className={styles.responseText}>
                  {truncateText(item.response, 130)}
                </p>
              </div>
              <div className={styles.cardFooter}>
                <button className={styles.expandButton}>
                  Expand
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.carouselControls}>
        <button className={styles.controlButton} aria-label="Previous">
          ‹
        </button>
        <button className={styles.controlButton} aria-label="Next">
          ›
        </button>
      </div>
    </div>
  );
};

export default SynthiantCarousel; 