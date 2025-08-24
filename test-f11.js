// اختبار اتصال Supabase مباشرة
async function testSupabase() {
    try {
        const { data, error } = await supabase
            .from('stations')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('❌ فشل الاتصال:', error);
            return false;
        } else {
            console.log('✅ الاتصال ناجح!', data);
            return true;
        }
    } catch (error) {
        console.error('❌ خطأ غير متوقع:', error);
        return false;
    }
}

// تشغيل الاختبار
testSupabase();