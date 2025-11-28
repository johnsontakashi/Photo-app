import React from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl?: string;
  title: string;
  description?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  videoUrl,
  title,
  description,
}) => {
  if (!isOpen) return null;

  const defaultVideoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ"; // Placeholder video
  const embedUrl = videoUrl || defaultVideoUrl;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="video-modal-overlay" onClick={handleBackdropClick}>
      <div className="video-modal-container">
        <div className="video-modal-header">
          <h3 className="video-modal-title">{title}</h3>
          <button 
            onClick={onClose}
            className="video-modal-close"
            aria-label="Close video"
          >
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"/>
            </svg>
          </button>
        </div>

        {description && (
          <div className="video-modal-description">
            <p>{description}</p>
          </div>
        )}

        <div className="video-modal-content">
          <div className="video-container">
            <iframe
              src={embedUrl}
              title={title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="video-iframe"
            />
          </div>
        </div>

        <div className="video-modal-footer">
          <button 
            onClick={onClose}
            className="btn btn-secondary"
          >
            Close
          </button>
        </div>
      </div>

      <style jsx>{`
        .video-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          backdrop-filter: blur(4px);
        }

        .video-modal-container {
          background: linear-gradient(135deg, 
            rgba(255, 255, 255, 0.1) 0%, 
            rgba(255, 255, 255, 0.05) 100%
          );
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          max-width: 90vw;
          max-height: 90vh;
          width: 100%;
          max-width: 800px;
          overflow: hidden;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .video-modal-header {
          padding: 1.5rem 2rem 1rem;
          display: flex;
          align-items: center;
          justify-content: between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .video-modal-title {
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          flex: 1;
        }

        .video-modal-close {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .video-modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .video-modal-description {
          padding: 1rem 2rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .video-modal-content {
          padding: 0 2rem;
        }

        .video-container {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        }

        .video-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        .video-modal-footer {
          padding: 1.5rem 2rem 2rem;
          display: flex;
          justify-content: center;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          .video-modal-overlay {
            padding: 0.5rem;
          }

          .video-modal-container {
            max-width: 95vw;
          }

          .video-modal-header {
            padding: 1rem 1.5rem 0.75rem;
          }

          .video-modal-title {
            font-size: 1.25rem;
          }

          .video-modal-content {
            padding: 0 1.5rem;
          }

          .video-modal-description {
            padding: 0.75rem 1.5rem;
            font-size: 0.85rem;
          }

          .video-modal-footer {
            padding: 1rem 1.5rem 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

// Helper component for floating video button
interface FloatingVideoButtonProps {
  onClick: () => void;
  label: string;
  icon?: React.ReactNode;
  position?: 'top-right' | 'bottom-right' | 'inline';
  className?: string;
}

export const FloatingVideoButton: React.FC<FloatingVideoButtonProps> = ({
  onClick,
  label,
  icon,
  position = 'inline',
  className = '',
}) => {
  const defaultIcon = (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
    </svg>
  );

  const positionClasses = {
    'top-right': 'floating-video-btn floating-video-btn-top-right',
    'bottom-right': 'floating-video-btn floating-video-btn-bottom-right',
    'inline': 'video-help-btn',
  };

  return (
    <>
      <button
        onClick={onClick}
        className={`${positionClasses[position]} ${className}`}
        type="button"
      >
        {icon || defaultIcon}
        <span>{label}</span>
      </button>

      <style jsx>{`
        .floating-video-btn {
          position: fixed;
          z-index: 100;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 50px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          box-shadow: 
            0 4px 20px rgba(102, 126, 234, 0.4),
            0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }

        .floating-video-btn:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 
            0 8px 30px rgba(102, 126, 234, 0.6),
            0 4px 16px rgba(0, 0, 0, 0.2);
        }

        .floating-video-btn-top-right {
          top: 120px;
          right: 20px;
        }

        .floating-video-btn-bottom-right {
          bottom: 20px;
          right: 20px;
        }

        .video-help-btn {
          background: linear-gradient(135deg, 
            rgba(102, 126, 234, 0.1) 0%, 
            rgba(118, 75, 162, 0.1) 100%
          );
          border: 2px solid rgba(102, 126, 234, 0.3);
          color: #667eea;
          border-radius: 12px;
          padding: 12px 18px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .video-help-btn:hover {
          background: linear-gradient(135deg, 
            rgba(102, 126, 234, 0.2) 0%, 
            rgba(118, 75, 162, 0.2) 100%
          );
          border-color: rgba(102, 126, 234, 0.5);
          transform: translateY(-1px);
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 
              0 4px 20px rgba(102, 126, 234, 0.4),
              0 2px 8px rgba(0, 0, 0, 0.1);
          }
          50% {
            box-shadow: 
              0 4px 20px rgba(102, 126, 234, 0.6),
              0 2px 8px rgba(0, 0, 0, 0.1);
          }
        }

        /* Mobile adjustments */
        @media (max-width: 768px) {
          .floating-video-btn {
            padding: 10px 16px;
            font-size: 0.85rem;
          }

          .floating-video-btn-top-right {
            top: 100px;
            right: 15px;
          }

          .floating-video-btn-bottom-right {
            bottom: 15px;
            right: 15px;
          }

          .video-help-btn {
            padding: 10px 14px;
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
};