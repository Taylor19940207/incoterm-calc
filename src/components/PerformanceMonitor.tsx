import React, { useEffect, useRef } from 'react';

interface PerformanceMonitorProps {
  name: string;
  enabled?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  name, 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(performance.now());

  useEffect(() => {
    if (!enabled) return;

    renderCount.current += 1;
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    lastRenderTime.current = now;

    console.log(
      `🔄 ${name} 渲染 #${renderCount.current} (${timeSinceLastRender.toFixed(2)}ms)`
    );
  });

  if (!enabled) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
        pointerEvents: 'none'
      }}
    >
      {name}: {renderCount.current}
    </div>
  );
};

export default PerformanceMonitor;

