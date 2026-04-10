import React, { useState } from 'react';
import useSettingsStore from '../../stores/settingsStore.js';
import './Settings.css';

function Toggle({ label, value, onChange }) {
  return (
    <label className="settings-toggle">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-track">
        <span className="toggle-thumb" />
      </span>
    </label>
  );
}

export default function Settings({ onClose }) {
  const settings = useSettingsStore();
  const [testStatus, setTestStatus] = useState(null);

  async function handleTestWebhook() {
    if (!settings.webhookUrl) {
      setTestStatus('Enter a webhook URL first');
      return;
    }
    setTestStatus('Sending...');
    try {
      if (window.electronAPI && window.electronAPI.testWebhook) {
        const result = await window.electronAPI.testWebhook(settings.webhookUrl);
        setTestStatus(result.ok ? 'Sent successfully!' : `Failed: ${result.error}`);
      } else {
        setTestStatus('Webhook test requires Electron');
      }
    } catch (err) {
      setTestStatus(`Error: ${err.message}`);
    }
    setTimeout(() => setTestStatus(null), 3000);
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="settings-close" onClick={onClose}>x</button>
        </div>

        <div className="settings-section">
          <h3>Notifications</h3>
          <Toggle
            label="Desktop notifications"
            value={settings.notificationsEnabled}
            onChange={settings.setNotificationsEnabled}
          />
          <Toggle
            label="Notification sound"
            value={settings.soundEnabled}
            onChange={settings.setSoundEnabled}
          />
        </div>

        <div className="settings-section">
          <h3>Notify on</h3>
          <Toggle
            label="Session completed"
            value={settings.notifyOnCompleted}
            onChange={settings.setNotifyOnCompleted}
          />
          <Toggle
            label="Session errored"
            value={settings.notifyOnErrored}
            onChange={settings.setNotifyOnErrored}
          />
          <Toggle
            label="Waiting for input"
            value={settings.notifyOnWaiting}
            onChange={settings.setNotifyOnWaiting}
          />
        </div>

        <div className="settings-section">
          <h3>Webhook Push</h3>
          <Toggle
            label="Enable webhook"
            value={settings.webhookEnabled}
            onChange={settings.setWebhookEnabled}
          />
          <div className="settings-field">
            <label>Webhook URL</label>
            <input
              type="url"
              placeholder="https://hooks.slack.com/services/..."
              value={settings.webhookUrl}
              onChange={(e) => settings.setWebhookUrl(e.target.value)}
              disabled={!settings.webhookEnabled}
            />
          </div>
          <div className="webhook-actions">
            <button
              className="test-webhook-btn"
              onClick={handleTestWebhook}
              disabled={!settings.webhookEnabled || !settings.webhookUrl}
            >
              Test Webhook
            </button>
            {testStatus && <span className="test-status">{testStatus}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
