import { normalizeQuote } from '../utils/normalize';

const STORAGE_KEY = 'incoterm-quotes';

export async function migrateAllQuotes() {
  try {
    console.log('Starting data migration...');
    
    // 讀取現有數據
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      console.log('No existing data found, migration not needed');
      return;
    }
    
    const rawQuotes = JSON.parse(data);
    console.log(`Found ${rawQuotes.length} quotes to migrate`);
    
    // 正規化所有報價
    const migratedQuotes = rawQuotes.map((q: any) => normalizeQuote(q));
    
    // 保存正規化後的數據
    localStorage.setItem(STORAGE_KEY, JSON.stringify(migratedQuotes));
    
    console.log(`Successfully migrated ${migratedQuotes.length} quotes`);
    
    // 驗證遷移結果
    const verification = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    console.log('Migration verification:', {
      originalCount: rawQuotes.length,
      migratedCount: verification.length,
      success: rawQuotes.length === verification.length
    });
    
    return {
      success: true,
      migratedCount: migratedQuotes.length,
      message: `Successfully migrated ${migratedQuotes.length} quotes`
    };
    
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Migration failed'
    };
  }
}

// 提供一個手動觸發遷移的函數（可在開發者控制台調用）
(window as any).migrateQuotes = migrateAllQuotes;
