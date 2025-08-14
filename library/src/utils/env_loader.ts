import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

/**
 * Load environment variables with priority: system env > .env file
 * This ensures npm package compatibility while maintaining development convenience
 */
export function loadEnvironmentVariables(): void {
  // 只在非生產環境且 .env 檔案存在時才載入 .env
  if (process.env.NODE_ENV !== 'production') {
    try {
      // 檢查多個可能的 .env 檔案路徑
      const possiblePaths = [
        '.env',
        path.resolve(process.cwd(), '.env'),
        path.resolve(__dirname, '../../../.env'),
        path.resolve(__dirname, '../../.env'),
        path.resolve(__dirname, '../.env')
      ];
      
      for (const envPath of possiblePaths) {
        if (fs.existsSync(envPath)) {
          try {
            dotenv.config({ path: envPath });
            console.log(`📁 載入環境變數檔案: ${envPath}`);
            break;
          } catch {
            console.debug('dotenv not available, using system environment variables only');
            break;
          }
        }
      }
    } catch {
      // 如果檔案系統操作失敗，靜默忽略
      console.debug('File system operations failed, using system environment variables only');
    }
  }
}

/**
 * Get environment variable with fallback to .env file
 * @param key Environment variable key
 * @param defaultValue Default value if not found
 * @returns Environment variable value
 */
export function getEnvVar(key: string, defaultValue?: string): string | undefined {
  // 優先讀取系統環境變數
  if (process.env[key]) {
    return process.env[key];
  }
  
  // 如果系統環境變數不存在，嘗試載入 .env 檔案
  loadEnvironmentVariables();
  
  // 再次檢查系統環境變數（可能已經被 .env 載入）
  return process.env[key] || defaultValue;
}

/**
 * Get required environment variable
 * @param key Environment variable key
 * @returns Environment variable value
 * @throws Error if environment variable is not set
 */
export function getRequiredEnvVar(key: string): string {
  const value = getEnvVar(key);
  if (!value) {
    throw new Error(`${key} environment variable is required`);
  }
  return value;
}
