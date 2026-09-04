import React from 'react';
import styles from '../styles/MobileProctor.module.css';

export type ConnectionState = 'connecting' | 'connected' | 'disconnected';

interface Props {
  state: ConnectionState;
}

export const ConnectionStatus: React.FC<Props> = ({ state }) => {
  const getLabel = () => {
    switch (state) {
      case 'connected':
        return 'Active DualView Sync';
      case 'connecting':
        return 'Connecting...';
      case 'disconnected':
        return 'Offline';
    }
  };

  const getStyle = () => {
    switch (state) {
      case 'connected':
        return styles.statusConnected;
      case 'connecting':
        return styles.statusConnecting;
      case 'disconnected':
        return styles.statusDisconnected;
    }
  };

  return (
    <div className={`${styles.statusIndicator} ${getStyle()}`}>
      <span className={`${styles.dot} ${state === 'connected' ? styles.pulse : ''}`} />
      <span>{getLabel()}</span>
    </div>
  );
};