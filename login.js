// login.js - معالجة تسجيل الدخول مع Supabase
import { supabase } from './supabase.js';

document.addEventListener('DOMContentLoaded', function() {
    initializeLoginForm();
    checkExistingSession();
});

// التحقق من الجلسة النشطة
async function checkExistingSession() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            console.log('لا يوجد جلسة نشطة أو حدث خطأ:', error.message);
            return;
        }
        
        if (user) {
            console.log('المستخدم مسجل بالفعل، التوجيه إلى الصفحة الرئيسية');
            window.location.href = 'index.html';
        }
    } catch (error) {
        console.error('خطأ في التحقق من الجلسة:', error);
    }
}

// تهيئة نموذج تسجيل الدخول
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await handleLogin();
        });
    }

    // إضافة مستمع للأحداث لحقول الإدخال
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput && passwordInput) {
        // السماح بالدخول بالضغط على Enter
        usernameInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                passwordInput.focus();
            }
        });
        
        passwordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    }
}

// معالجة عملية تسجيل الدخول
async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    // التحقق من صحة البيانات المدخلة
    if (!validateInputs(username, password)) {
        return;
    }

    try {
        // إظهار مؤشر التحميل
        showLoading(true);
        
        // تسجيل الدخول باستخدام Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email: username.includes('@') ? username : `${username}@meteo.gov.sy`,
            password: password,
        });

        if (error) {
            throw error;
        }

        if (data.user) {
            // حفظ معلومات المستخدم في localStorage
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('userEmail', data.user.email);
            
            showLoginAlert('تم تسجيل الدخول بنجاح!', 'success');
            
            // الانتقال إلى الصفحة الرئيسية بعد تأخير بسيط
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    } catch (error) {
        console.error('خطأ في تسجيل الدخول:', error);
        handleLoginError(error);
    } finally {
        // إخفاء مؤشر التحميل
        showLoading(false);
    }
}

// التحقق من صحة البيانات المدخلة
function validateInputs(username, password) {
    if (!username) {
        showLoginAlert('يرجى إدخال اسم المستخدم أو البريد الإلكتروني', 'warning');
        document.getElementById('username').focus();
        return false;
    }

    if (!password) {
        showLoginAlert('يرجى إدخال كلمة المرور', 'warning');
        document.getElementById('password').focus();
        return false;
    }

    if (password.length < 6) {
        showLoginAlert('كلمة المرور يجب أن تكون على الأقل 6 أحرف', 'warning');
        document.getElementById('password').focus();
        return false;
    }

    return true;
}

// معالجة أخطاء تسجيل الدخول
function handleLoginError(error) {
    switch (error.message) {
        case 'Invalid login credentials':
            showLoginAlert('اسم المستخدم أو كلمة المرور غير صحيحة', 'danger');
            break;
        case 'Email not confirmed':
            showLoginAlert('البريد الإلكتروني لم يتم تأكيده بعد', 'warning');
            break;
        case 'Too many requests':
            showLoginAlert('عدد محاولات الدخول exceeded، يرجى المحاولة لاحقاً', 'danger');
            break;
        default:
            showLoginAlert('حدث خطأ أثناء تسجيل الدخول: ' + error.message, 'danger');
    }
    
    // إعادة تعيين كلمة المرور
    document.getElementById('password').value = '';
    document.getElementById('password').focus();
}

// عرض تنبيهات في صفحة تسجيل الدخول
function showLoginAlert(message, type = 'info') {
    // إزالة أي تنبيهات سابقة
    hideLoginAlert();
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show mt-3`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas ${getAlertIcon(type)} me-2"></i>
            <div>${message}</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    const loginCard = document.querySelector('.login-card .card-body');
    if (loginCard) {
        loginCard.insertBefore(alertDiv, loginCard.firstChild);
        
        // إضافة تأثير الظهور
        setTimeout(() => {
            alertDiv.classList.add('show');
        }, 10);
    }
}

// الحصول على الأيقونة المناسبة لنوع التنبيه
function getAlertIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'danger': return 'fa-times-circle';
        default: return 'fa-info-circle';
    }
}

// إخفاء تنبيهات تسجيل الدخول
function hideLoginAlert() {
    const existingAlert = document.querySelector('.login-card .alert');
    if (existingAlert) {
        existingAlert.remove();
    }
}

// إظهار/إخفاء مؤشر التحميل
function showLoading(show) {
    let loadingIndicator = document.getElementById('loadingIndicator');
    const submitButton = document.querySelector('#loginForm button[type="submit"]');
    
    if (show) {
        if (!loadingIndicator) {
            loadingIndicator = document.createElement('div');
            loadingIndicator.id = 'loadingIndicator';
            loadingIndicator.className = 'loading-overlay';
            loadingIndicator.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">جاري التحميل...</span>
                </div>
            `;
            loadingIndicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            `;
            document.body.appendChild(loadingIndicator);
        } else {
            loadingIndicator.style.display = 'flex';
        }
        
        // تعطيل زر الإرسال أثناء التحميل
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>جاري التسجيل...';
        }
    } else {
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
        
        // تمكين زر الإرسال بعد الانتهاء
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = 'دخول';
        }
    }
}

// دالة تسجيل الخروج
export async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('خطأ في تسجيل الخروج:', error);
        }
        
        // مسح بيانات localStorage
        localStorage.removeItem('loggedIn');
        localStorage.removeItem('username');
        localStorage.removeItem('userEmail');
        
        // التوجيه إلى صفحة تسجيل الدخول
        window.location.href = 'login.html';
    } catch (error) {
        console.error('خطأ في تسجيل الخروج:', error);
        window.location.href = 'login.html';
    }
}

// دالة للتحقق من حالة المصادقة (للاستخدام في الملفات الأخرى)
export async function checkAuth() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            throw error;
        }
        
        return { isAuthenticated: !!user, user };
    } catch (error) {
        console.error('خطأ في التحقق من المصادقة:', error);
        return { isAuthenticated: false, user: null };
    }
}