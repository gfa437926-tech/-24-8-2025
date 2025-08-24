// اختبار تسجيل الدخول
async function testAuth() {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'admin@meteo.gov.sy',
            password: 'admin123'
        });
        
        if (error) {
            console.error('❌ فشل تسجيل الدخول:', error);
            return false;
        } else {
            console.log('✅ تسجيل الدخول ناجح:', data.user.email);
            return true;
        }
    } catch (error) {
        console.error('❌ خطأ غير متوقع:', error);
        return false;
    }
}

// تشغيل اختبار المصادقة
testAuth();