import React, { useState, useEffect } from 'react';
import { devUtils, performanceMonitor, debugLogger } from '../utils/debugUtils';

/**
 * Debug panel component for development mode
 * Provides access to logs, performance metrics, and debugging tools
 */
const DebugPanel = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('logs');
  const [logs, setLogs] = useState([]);
  const [performanceMetrics, setPerformanceMetrics] = useState({});
  const [systemInfo, setSystemInfo] = useState({});
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Hide debug panel completely for now
  // TODO: Re-enable for development when needed
  return null;
  
  // Only show in development mode
  // if (!import.meta.env.DEV) {
  //   return null;
  // }

  // Refresh data
  const refreshData = () => {
    setLogs(devUtils.getLogs());
    setPerformanceMetrics(performanceMonitor.getMetrics());
    setSystemInfo(devUtils.getSystemInfo());
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(refreshData, 2000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Initial data load
  useEffect(() => {
    refreshData();
  }, [isOpen]);

  const clearLogs = () => {
    devUtils.clearLogs();
    refreshData();
  };

  const exportLogs = () => {
    const data = devUtils.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taskify-debug-${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'debug': return 'text-gray-600 dark:text-gray-400';
      case 'info': return 'text-blue-600 dark:text-blue-400';
      case 'warn': return 'text-yellow-600 dark:text-yellow-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-700 transition-colors z-50 ${className}`}
        title="Open Debug Panel"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            🐛 Taskify Debug Panel
          </h2>
          <div className="flex items-center space-x-2">
            <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="mr-1"
              />
              Auto-refresh
            </label>
            <button
              onClick={refreshData}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              Refresh
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'logs', label: 'Logs', count: logs.length },
            { id: 'performance', label: 'Performance', count: Object.keys(performanceMetrics).length },
            { id: 'system', label: 'System Info', count: null }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className="ml-1 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'logs' && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {logs.length} log entries
                </span>
                <div className="space-x-2">
                  <button
                    onClick={exportLogs}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-sm"
                  >
                    Export
                  </button>
                  <button
                    onClick={clearLogs}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-4 space-y-2">
                {logs.slice(-100).reverse().map((log, index) => (
                  <div key={index} className="text-sm font-mono border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 dark:text-gray-400">
                        {formatTimestamp(log.timestamp)}
                      </span>
                      <span className={`font-medium ${getLogLevelColor(log.level)}`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="text-purple-600 dark:text-purple-400">
                        [{log.category}]
                      </span>
                    </div>
                    <div className="text-gray-900 dark:text-gray-100 mt-1">
                      {log.message}
                    </div>
                    {Object.keys(log.data).length > 0 && (
                      <details className="mt-1">
                        <summary className="text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-800 dark:hover:text-gray-200">
                          Data
                        </summary>
                        <pre className="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="h-full overflow-auto p-4">
              <div className="space-y-4">
                {Object.entries(performanceMetrics).map(([category, metrics]) => (
                  <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3 capitalize">
                      {category} Operations
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Total:</span>
                        <span className="ml-2 font-medium">{metrics.total}</span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Success Rate:</span>
                        <span className="ml-2 font-medium text-green-600">
                          {metrics.successRate.toFixed(1)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Avg Duration:</span>
                        <span className="ml-2 font-medium">
                          {metrics.averageDuration.toFixed(2)}ms
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Max Duration:</span>
                        <span className="ml-2 font-medium">
                          {metrics.maxDuration.toFixed(2)}ms
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="h-full overflow-auto p-4">
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Browser Info</h3>
                  <div className="text-sm space-y-2">
                    <div><span className="text-gray-600 dark:text-gray-400">User Agent:</span> {systemInfo.userAgent}</div>
                    <div><span className="text-gray-600 dark:text-gray-400">Platform:</span> {systemInfo.platform}</div>
                    <div><span className="text-gray-600 dark:text-gray-400">Language:</span> {systemInfo.language}</div>
                    <div><span className="text-gray-600 dark:text-gray-400">Online:</span> {systemInfo.onLine ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Screen & Window</h3>
                  <div className="text-sm space-y-2">
                    <div><span className="text-gray-600 dark:text-gray-400">Screen:</span> {systemInfo.screen?.width}x{systemInfo.screen?.height}</div>
                    <div><span className="text-gray-600 dark:text-gray-400">Window:</span> {systemInfo.window?.innerWidth}x{systemInfo.window?.innerHeight}</div>
                    <div><span className="text-gray-600 dark:text-gray-400">Device Pixel Ratio:</span> {systemInfo.window?.devicePixelRatio}</div>
                  </div>
                </div>

                {systemInfo.memory && (
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Memory Usage</h3>
                    <div className="text-sm space-y-2">
                      <div><span className="text-gray-600 dark:text-gray-400">Used:</span> {(systemInfo.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB</div>
                      <div><span className="text-gray-600 dark:text-gray-400">Total:</span> {(systemInfo.memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB</div>
                      <div><span className="text-gray-600 dark:text-gray-400">Limit:</span> {(systemInfo.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DebugPanel;