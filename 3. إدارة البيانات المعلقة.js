import { syncPendingData, getCachedData } from './supabase.js'

// مزامنة يدوية
document.getElementById('syncButton').addEventListener('click', async () => {
    const pending = getCachedData()
    if (pending.length > 0) {
        await syncPendingData()
    }
})