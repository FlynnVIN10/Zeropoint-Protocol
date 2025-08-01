import React, { useState, useEffect } from 'react';
import styles from './FeedbackBadge.module.css';

const FeedbackBadge = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Show badge after page load
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  const handleFeedbackClick = () => {
    // Log to soulchain
    logFeedbackSubmission();
    
    // Open Typeform widget
    if (window.tf) {
      window.tf.createWidget('YOUR_FORM_ID', {
        container: '#feedback-widget',
        hideHeaders: true,
        hideFooter: true,
        opacity: 0,
        buttonText: "✨ Send Feedback",
        onSubmit: function() {
          // Additional logging on form submission
          logFeedbackFormSubmission();
        }
      });
    } else {
      // Fallback to direct link
      window.open('https://form.typeform.com/to/YOUR_FORM_ID', '_blank');
    }
  };

  const logFeedbackSubmission = () => {
    // Log to soulchain if available
    try {
      const logData = {
        action: 'feedback_badge_click',
        metadata: {
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
          userAgent: navigator.userAgent
        },
        data: 'User clicked feedback badge'
      };

      // Try to log to soulchain endpoint
      fetch('/v1/soulchain/persist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      }).catch(() => {
        // Silently fail if soulchain is not available
      });
    } catch (error) {
      // Silently fail if logging fails
    }
  };

  const logFeedbackFormSubmission = () => {
    // Log form submission to soulchain
    try {
      const logData = {
        action: 'feedback_form_submitted',
        metadata: {
          timestamp: new Date().toISOString(),
          page: window.location.pathname
        },
        data: 'Feedback form submitted successfully'
      };

      fetch('/v1/soulchain/persist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(logData)
      }).catch(() => {
        // Silently fail if soulchain is not available
      });
    } catch (error) {
      // Silently fail if logging fails
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.feedbackBadgeContainer}>
      <div 
        className={`${styles.feedbackBadge} ${isHovered ? styles.hovered : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button 
          className={styles.feedbackButton}
          onClick={handleFeedbackClick}
          aria-label="Send feedback about this page"
          title="Share your feedback with us"
        >
          <span className={styles.feedbackIcon}>✨</span>
          <span className={styles.feedbackText}>Send Feedback</span>
        </button>
        
        {/* Tooltip */}
        <div className={`${styles.tooltip} ${isHovered ? styles.tooltipVisible : ''}`}>
          <div className={styles.tooltipContent}>
            <h4>Share Your Thoughts</h4>
            <p>Help us improve the Zeropoint Protocol website with your feedback.</p>
            <div className={styles.tooltipFeatures}>
              <span>• Design suggestions</span>
              <span>• Bug reports</span>
              <span>• Feature requests</span>
            </div>
          </div>
          <div className={styles.tooltipArrow}></div>
        </div>
      </div>
      
      {/* Feedback widget container */}
      <div id="feedback-widget" className={styles.feedbackWidget}></div>
    </div>
  );
};

export default FeedbackBadge;