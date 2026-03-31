import React, { useEffect, useState } from 'react';
import { MdCheckCircle, MdError, MdWarning, MdInfo, MdClose } from 'react-icons/md';

const ICONS = {
  success: MdCheckCircle,
  error: MdError,
  warning: MdWarning,
  info: MdInfo,
};

const STYLES = {
  success: {
    color: '#10b981',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.2)',
  },
  error: {
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.2)',
  },
  warning: {
    color: '#f59e0b',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
  },
  info: {
    color: '#3b82f6',
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.2)',
  },
};

export function Alert({ id, type = 'info', title, message, onRemove }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  
  const style = STYLES[type];
  const Icon = ICONS[type];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      clearTimeout(t);
      observer.disconnect();
    };
  }, []);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(() => onRemove(id), 400);
  };

  useEffect(() => {
    const t = setTimeout(handleClose, 4000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        transform: visible && !leaving ? 'translateY(0) scale(1)' : 'translateY(-20px) scale(0.95)',
        opacity: visible && !leaving ? 1 : 0,
        transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
        background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px) saturate(180%)',
        border: `1px solid ${isDark ? style.border : 'rgba(0,0,0,0.05)'}`,
        borderRadius: '12px',
        padding: '12px 16px',
        minWidth: '280px',
        maxWidth: '340px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: isDark 
          ? '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        marginBottom: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Type-based background glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: style.bg,
        zIndex: -1,
      }} />

      {/* Side accent */}
      <div style={{
        position: 'absolute',
        left: 0,
        top: '20%',
        bottom: '20%',
        width: '3px',
        background: style.color,
        borderRadius: '0 4px 4px 0',
        boxShadow: `0 0 10px ${style.color}`,
      }} />

      {/* Icon */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: style.color,
      }}>
        <Icon size={20} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ 
          color: isDark ? 'white' : '#1e293b', 
          fontSize: '13px', 
          fontWeight: 600, 
          margin: 0,
          lineHeight: '1.2'
        }}>
          {title}
        </p>
        <p style={{ 
          color: isDark ? 'rgba(255, 255, 255, 0.7)' : '#64748b', 
          fontSize: '12px', 
          margin: '2px 0 0 0',
          lineHeight: '1.4'
        }}>
          {message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={handleClose}
        style={{
          background: 'transparent',
          border: 'none',
          color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)',
          cursor: 'pointer',
          padding: '4px',
          display: 'flex',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = isDark ? 'white' : 'black'}
        onMouseLeave={e => e.currentTarget.style.color = isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}
      >
        <MdClose size={16} />
      </button>

      {/* Minimal Progress Bar */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        height: '2px',
        background: style.color,
        opacity: 0.5,
        animation: 'alertLoading 4s linear border-box',
      }} />

      <style>{`
        @keyframes alertLoading {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export function AlertContainer({ alerts, removeAlert }) {
  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-end',
      pointerEvents: 'none',
    }}>
      {alerts.map(alert => (
        <div key={alert.id} style={{ pointerEvents: 'auto' }}>
          <Alert {...alert} onRemove={removeAlert} />
        </div>
      ))}
    </div>
  );
}
