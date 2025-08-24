import { logEvent } from './supabase.js'

// تسجيل الأحداث المهمة
await logEvent('user_action', {
    action: 'calculate_derived_values',
    calculationTime: duration
})

// تسجيل الأخطاء
await logEvent('calculation_error', {
    error: error.message,
    inputValues: { dryTemp, wetTemp }
}, 'error')