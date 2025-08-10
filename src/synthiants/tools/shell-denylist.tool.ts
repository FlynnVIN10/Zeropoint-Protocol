/**
 * Shell Denylist Tool - Security restrictions for shell operations
 * 
 * @fileoverview Provides secure shell operation validation and denylist enforcement
 * @author Dev Team
 * @version 1.0.0
 */

import { ToolInterface, ResourceUsage } from './index';

export interface ShellDenylistConfig {
  deniedCommands: string[];
  deniedPaths: string[];
  deniedUsers: string[];
  allowedCommands: string[];
  allowedPaths: string[];
  maxCommandLength: number;
  enableStrictMode: boolean;
  logAllOperations: boolean;
}

export interface ShellOperation {
  command: string;
  workingDirectory?: string;
  user?: string;
  environment?: Record<string, string>;
}

export interface ShellValidationResult {
  allowed: boolean;
  reason?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  suggestedAlternative?: string;
}

/**
 * Shell Denylist Tool Implementation
 * Provides secure shell operation validation and denylist enforcement
 */
export class ShellDenylistTool implements ToolInterface {
  public readonly name = 'shell-denylist';
  public readonly version = '1.0.0';
  public readonly description = 'Shell operation security validation and denylist enforcement';
  public readonly capabilities = ['validation', 'security', 'denylist', 'shell'];

  private config: ShellDenylistConfig;
  private operationCount: number = 0;
  private blockedOperations: Array<{ timestamp: number; command: string; reason: string }> = [];

  constructor(config?: Partial<ShellDenylistConfig>) {
    this.config = {
      deniedCommands: [
        'rm -rf /',
        'rm -rf /*',
        'dd if=/dev/zero',
        'mkfs.ext4',
        'fdisk',
        'parted',
        'mount',
        'umount',
        'chmod 777',
        'chown root',
        'sudo',
        'su',
        'passwd',
        'useradd',
        'userdel',
        'groupadd',
        'groupdel',
        'systemctl',
        'service',
        'init',
        'telinit',
        'reboot',
        'shutdown',
        'halt',
        'poweroff',
        'wall',
        'write',
        'mesg',
        'cryptsetup',
        'lvm',
        'mdadm',
        'iptables',
        'ufw',
        'firewalld',
        'nft',
        'tcpdump',
        'wireshark',
        'netcat',
        'nc',
        'nmap',
        'ssh-keygen',
        'openssl',
        'gpg',
        'certbot',
        'letsencrypt'
      ],
      deniedPaths: [
        '/etc',
        '/var',
        '/usr',
        '/bin',
        '/sbin',
        '/lib',
        '/lib64',
        '/boot',
        '/dev',
        '/proc',
        '/sys',
        '/root',
        '/home',
        '/tmp',
        '/opt',
        '/mnt',
        '/media'
      ],
      deniedUsers: [
        'root',
        'admin',
        'sudo',
        'wheel',
        'daemon',
        'bin',
        'sys',
        'adm',
        'lp',
        'sync',
        'shutdown',
        'halt',
        'mail',
        'news',
        'uucp',
        'operator',
        'games',
        'gopher',
        'ftp',
        'nobody',
        'systemd-network',
        'systemd-resolve',
        'systemd-timesync',
        'dbus',
        'polkitd',
        'avahi',
        'colord',
        'dnsmasq',
        'rpc',
        'rpcuser',
        'nfsnobody',
        'sshd',
        'postfix',
        'mysql',
        'postgres',
        'redis',
        'mongodb',
        'nginx',
        'apache',
        'www-data'
      ],
      allowedCommands: [
        'ls',
        'cat',
        'grep',
        'find',
        'head',
        'tail',
        'wc',
        'sort',
        'uniq',
        'cut',
        'awk',
        'sed',
        'echo',
        'printf',
        'date',
        'whoami',
        'pwd',
        'env',
        'ps',
        'top',
        'htop',
        'free',
        'df',
        'du',
        'netstat',
        'ss',
        'ping',
        'curl',
        'wget',
        'git',
        'npm',
        'node',
        'python',
        'python3',
        'pip',
        'pip3',
        'docker',
        'docker-compose',
        'kubectl',
        'helm',
        'terraform',
        'ansible'
      ],
      allowedPaths: [
        './',
        '../',
        '~/',
        '/tmp/synthiant',
        '/var/tmp/synthiant',
        '/opt/synthiant',
        '/home/synthiant'
      ],
      maxCommandLength: 1000,
      enableStrictMode: true,
      logAllOperations: true,
      ...config
    };
  }

  /**
   * Execute shell operation validation
   */
  async execute(params: ShellOperation): Promise<ShellValidationResult> {
    try {
      // Validate parameters
      if (!this.validateParams(params)) {
        throw new Error('Invalid shell operation parameters');
      }

      // Perform validation
      const result = this.validateShellOperation(params);

      // Log operation
      if (this.config.logAllOperations) {
        this.logOperation(params, result);
      }

      // Update operation count
      this.operationCount++;

      return result;

    } catch (error) {
      console.error('Shell denylist tool execution failed:', error);
      throw error;
    }
  }

  /**
   * Validate shell operation parameters
   */
  validateParams(params: any): boolean {
    if (!params || typeof params !== 'object') {
      return false;
    }

    if (!params.command || typeof params.command !== 'string') {
      return false;
    }

    if (params.command.length > this.config.maxCommandLength) {
      return false;
    }

    if (params.workingDirectory && typeof params.workingDirectory !== 'string') {
      return false;
    }

    if (params.user && typeof params.user !== 'string') {
      return false;
    }

    if (params.environment && typeof params.environment !== 'object') {
      return false;
    }

    return true;
  }

  /**
   * Get current resource usage
   */
  getQuotaUsage(): ResourceUsage {
    return {
      memory: this.blockedOperations.length * 0.01, // 0.01MB per blocked operation
      cpu: 0.05, // Low CPU usage for validation
      time: 0,
      tokens: this.operationCount * 20, // 20 tokens per operation
      network: 0,
      fileOps: 0
    };
  }

  /**
   * Validate shell operation
   */
  private validateShellOperation(operation: ShellOperation): ShellValidationResult {
    const { command, workingDirectory, user } = operation;

    // Check command length
    if (command.length > this.config.maxCommandLength) {
      return {
        allowed: false,
        reason: 'Command exceeds maximum allowed length',
        riskLevel: 'high'
      };
    }

    // Check denied commands
    for (const deniedCommand of this.config.deniedCommands) {
      if (command.includes(deniedCommand) || command.match(new RegExp(deniedCommand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))) {
        return {
          allowed: false,
          reason: `Command contains denied operation: ${deniedCommand}`,
          riskLevel: 'critical',
          suggestedAlternative: this.suggestAlternative(command, deniedCommand)
        };
      }
    }

    // Check denied users
    if (user && this.config.deniedUsers.includes(user)) {
      return {
        allowed: false,
        reason: `Operation denied for user: ${user}`,
        riskLevel: 'critical'
      };
    }

    // Check working directory
    if (workingDirectory) {
      for (const deniedPath of this.config.deniedPaths) {
        if (workingDirectory.startsWith(deniedPath) || workingDirectory.includes(deniedPath)) {
          return {
            allowed: false,
            reason: `Working directory access denied: ${deniedPath}`,
            riskLevel: 'high'
          };
        }
      }
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /(\$\(.*\))/, // Command substitution
      /(\`.*\`)/,   // Backtick command substitution
      /(&&|\|\|)/,  // Command chaining
      /(;|&)/,      // Command separators
      /(\$[A-Z_]+)/, // Environment variables
      /(\.\.\/\.\.)/, // Directory traversal
      /(\/etc\/passwd)/, // Sensitive files
      /(\/etc\/shadow)/, // Sensitive files
      /(\/proc\/)/,  // Proc filesystem
      /(\/sys\/)/,   // Sys filesystem
      /(\/dev\/)/,   // Device filesystem
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(command)) {
        return {
          allowed: false,
          reason: 'Command contains suspicious patterns',
          riskLevel: 'high'
        };
      }
    }

    // Check if command is in allowed list (strict mode)
    if (this.config.enableStrictMode) {
      let commandAllowed = false;
      for (const allowedCommand of this.config.allowedCommands) {
        if (command.startsWith(allowedCommand) || command === allowedCommand) {
          commandAllowed = true;
          break;
        }
      }

      if (!commandAllowed) {
        return {
          allowed: false,
          reason: 'Command not in allowed list (strict mode enabled)',
          riskLevel: 'medium'
        };
      }
    }

    // All checks passed
    return {
      allowed: true,
      riskLevel: 'low'
    };
  }

  /**
   * Suggest alternative command
   */
  private suggestAlternative(command: string, deniedCommand: string): string | undefined {
    const alternatives: Record<string, string> = {
      'rm -rf': 'Use specific file deletion or move to trash',
      'sudo': 'Use specific permissions or contact administrator',
      'chmod 777': 'Use specific permissions (e.g., chmod 644)',
      'dd if=/dev/zero': 'Use specific file operations',
      'systemctl': 'Contact system administrator',
      'iptables': 'Contact network administrator',
      'passwd': 'Use password change API or contact administrator'
    };

    return alternatives[deniedCommand] || 'Contact administrator for assistance';
  }

  /**
   * Log operation
   */
  private logOperation(operation: ShellOperation, result: ShellValidationResult): void {
    const logEntry = {
      timestamp: Date.now(),
      command: operation.command,
      workingDirectory: operation.workingDirectory,
      user: operation.user,
      allowed: result.allowed,
      reason: result.reason,
      riskLevel: result.riskLevel
    };

    if (!result.allowed) {
      this.blockedOperations.push({
        timestamp: logEntry.timestamp,
        command: operation.command,
        reason: result.reason || 'Unknown'
      });
    }

    console.log('Shell operation validation:', logEntry);
  }

  /**
   * Get blocked operations
   */
  getBlockedOperations(): Array<{ timestamp: number; command: string; reason: string }> {
    return [...this.blockedOperations];
  }

  /**
   * Get tool statistics
   */
  getStats(): {
    totalOperations: number;
    blockedOperations: number;
    allowedOperations: number;
    blockedRate: number;
  } {
    const blockedCount = this.blockedOperations.length;
    const allowedCount = this.operationCount - blockedCount;
    const blockedRate = this.operationCount > 0 ? (blockedCount / this.operationCount) * 100 : 0;

    return {
      totalOperations: this.operationCount,
      blockedOperations: blockedCount,
      allowedOperations: allowedCount,
      blockedRate
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ShellDenylistConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Add denied command
   */
  addDeniedCommand(command: string): void {
    if (!this.config.deniedCommands.includes(command)) {
      this.config.deniedCommands.push(command);
    }
  }

  /**
   * Remove denied command
   */
  removeDeniedCommand(command: string): void {
    this.config.deniedCommands = this.config.deniedCommands.filter(c => c !== command);
  }

  /**
   * Clear blocked operations log
   */
  clearBlockedOperations(): void {
    this.blockedOperations = [];
  }
}

// Export default instance
export const shellDenylistTool = new ShellDenylistTool();
