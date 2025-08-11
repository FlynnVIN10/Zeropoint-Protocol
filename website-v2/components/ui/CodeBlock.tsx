'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Copy, Check, Code, ExternalLink } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
  showLineNumbers?: boolean;
  className?: string;
}

export function CodeBlock({ 
  code, 
  language = 'typescript', 
  title, 
  showLineNumbers = true, 
  className = '' 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getLanguageIcon = () => {
    switch (language.toLowerCase()) {
      case 'typescript':
      case 'ts':
        return 'TS';
      case 'javascript':
      case 'js':
        return 'JS';
      case 'python':
      case 'py':
        return 'PY';
      case 'bash':
      case 'shell':
        return 'SH';
      case 'json':
        return '{}';
      case 'css':
        return 'CSS';
      case 'html':
        return 'HTML';
      default:
        return language.toUpperCase().slice(0, 2);
    }
  };

  const getLanguageColor = () => {
    switch (language.toLowerCase()) {
      case 'typescript':
      case 'ts':
        return 'bg-blue-600';
      case 'javascript':
      case 'js':
        return 'bg-yellow-500';
      case 'python':
      case 'py':
        return 'bg-green-600';
      case 'bash':
      case 'shell':
        return 'bg-gray-600';
      case 'json':
        return 'bg-purple-600';
      case 'css':
        return 'bg-pink-600';
      case 'html':
        return 'bg-orange-600';
      default:
        return 'bg-accent';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`blackops-card overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-muted bg-panel">
        <div className="flex items-center space-x-3">
          <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-mono text-white ${getLanguageColor()}`}>
            {getLanguageIcon()}
          </div>
          {title && (
            <span className="text-fg font-medium">{title}</span>
          )}
          <span className="text-sm text-muted">({language})</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleCopy}
            className="p-2 text-muted hover:text-fg transition-colors"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-ok" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative">
        {showLineNumbers && (
          <div className="absolute left-0 top-0 w-12 h-full bg-muted/30 border-r border-muted select-none">
            <div className="p-4 font-mono text-xs text-muted">
              {code.split('\n').map((_, index) => (
                <div key={index} className="text-right">
                  {index + 1}
                </div>
              ))}
            </div>
          </div>
        )}
        
        <pre className={`p-4 font-mono text-sm text-fg overflow-x-auto ${showLineNumbers ? 'pl-16' : ''}`}>
          <code className={`language-${language}`}>
            {code}
          </code>
        </pre>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-muted/20 border-t border-muted text-xs text-muted">
        <div className="flex items-center justify-between">
          <span>{code.split('\n').length} lines</span>
          <span>{code.length} characters</span>
        </div>
      </div>
    </motion.div>
  );
}
