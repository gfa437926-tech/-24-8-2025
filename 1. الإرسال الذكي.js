import { smartSend } from './supabase.js'

// بدلاً من insertHourlyData مباشرة
const result = await smartSend(formData, 'hourly')

if (result.success) {
    if (result.cached) {
        showAlert('تم حفظ البيانات محلياً وسيتم إرسالها لاحقاً', 'info')
    } else {
        showAlert('تم إرسال البيانات بنجاح', 'success')
    }
}