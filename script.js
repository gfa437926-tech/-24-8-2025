// دالة تسجيل الخروج
function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    // إضافة زر تسجيل الخروج
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn btn-outline-light btn-sm';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt me-1"></i>تسجيل الخروج';
    logoutBtn.onclick = logout;

    const header = document.querySelector('header .container');
    if (header) {
        const logoutDiv = document.createElement('div');
        logoutDiv.className = 'text-center mt-2';
        logoutDiv.appendChild(logoutBtn);
        header.appendChild(logoutDiv);
    }

    // تهيئة باقي المكونات
    initializeApplication();
});

// دالة تهيئة التطبيق
function initializeApplication() {
    updateDate();

    // تعيين تاريخ اليوم كقيمة افتراضية
    const observationDate = document.getElementById('observationDate');
    if (observationDate) {
        observationDate.valueAsDate = new Date();
    }

    // تحديث معلومات المحطة عند التغيير
    const stationSelect = document.getElementById('station');
    if (stationSelect) {
        stationSelect.addEventListener('change', updateStationInfo);
    }

    // إضافة المستمعات الأساسية للأحداث
    addEventListeners();

    // تحميل رموز الطقس عند الحاجة فقط
    loadWeatherCodesOnDemand();
}

// دالة تحديث التاريخ
function updateDate() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    };

    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('ar-SY', options);
    }
}

// دالة تحديث معلومات المحطة
function updateStationInfo() {
    const stationSelect = document.getElementById('station');
    if (!stationSelect) return;

    const station = stationSelect.options[stationSelect.selectedIndex];

    if (station.value) {
        document.getElementById('stationCode').value = station.value;
        document.getElementById('stationName').value = station.dataset.name || '';

        const elevation = parseFloat(station.dataset.elevation) || 0;
        document.getElementById('elevation').value = elevation;
    } else {
        document.getElementById('stationCode').value = '';
        document.getElementById('stationName').value = '';
        document.getElementById('elevation').value = '';
    }
}

// دالة إضافة المستمعات للأحداث
function addEventListeners() {
    // إضافة مستمعات لحقول الإدخال
    const dryTemp = document.getElementById('dryTemp');
    if (dryTemp) {
        dryTemp.addEventListener('blur', function() {
            formatTemperature(this);
            validateTemperature(this, true);
        });
    }

    const wetTemp = document.getElementById('wetTemp');
    if (wetTemp) {
        wetTemp.addEventListener('blur', function() {
            formatTemperature(this);
            validateTemperature(this, false, document.getElementById('dryTemp'));
        });
    }

    // إضافة مستمعات لأزرار التحكم
    const calculateBtn = document.getElementById('calculateBtn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', calculateDerivedValues);
    }

    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            if (validateForm()) {
                sendData();
            }
        });
    }

    const downloadBtn = document.getElementById('downloadDataBtn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', downloadData);
    }

    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetForm);
    }

    // إضافة مستمعات للرياح
    const windDirSurface = document.getElementById('windDirSurface');
    const windDirMean = document.getElementById('windDirMean');
    const windSpeedSurface = document.getElementById('windSpeedSurface');
    const windSpeedMean = document.getElementById('windSpeedMean');

    if (windDirSurface) {
        windDirSurface.addEventListener('blur', function() {
            validateWindDirection(this);
        });
    }

    if (windDirMean) {
        windDirMean.addEventListener('blur', function() {
            validateWindDirection(this);
        });
    }

    if (windSpeedSurface) {
        windSpeedSurface.addEventListener('blur', function() {
            validateWindSpeed(this);
        });
    }

    if (windSpeedMean) {
        windSpeedMean.addEventListener('blur', function() {
            validateWindSpeed(this);
        });
    }

    // إضافة مستمعات للضغط
    const stationPressure = document.getElementById('stationPressure');
    const stationPressureMSL = document.getElementById('stationPressureMSL');

    if (stationPressure) {
        stationPressure.addEventListener('blur', function() {
            formatPressure(this);
            validatePressure(this);
        });
    }

    if (stationPressureMSL) {
        stationPressureMSL.addEventListener('blur', function() {
            formatPressure(this);
            validatePressure(this);
        });
    }

    // إضافة مستمعات للسحب
    for (let i = 1; i <= 3; i++) {
        const select = document.getElementById(`cloudType${i}`);
        if (select) {
            select.addEventListener('change', function() {
                showCloudDescription(this, i);
            });
        }
    }

    // إضافة مستمعات للطقس الحاضر
    const currentWeather = document.getElementById('currentWeather');
    if (currentWeather) {
        currentWeather.addEventListener('input', function() {
            const code = this.value.trim();
            showWeatherCodeDescription(code);
        });

        currentWeather.addEventListener('blur', function() {
            const code = this.value.trim();
            showWeatherCodeDescription(code);
        });
    }

    // إضافة مستمعات للوقت
    const observationTime = document.getElementById('observationTime');
    if (observationTime) {
        observationTime.addEventListener('change', function() {
            const time = parseInt(this.value);
            if (isNaN(time) || time < 0 || time > 23) {
                showAlert("وقت الرصد يجب أن يكون بين 00 و 23", "warning");
                this.value = "";
                this.focus();
            } else {
                this.value = time.toString().padStart(2, '0');
                showUTCTime(this.value);
            }
        });

        observationTime.addEventListener('input', function() {
            const time = this.value.trim();
            if (time.length === 2) {
                showUTCTime(time);
            } else {
                document.getElementById('utcTimeInfo').style.display = 'none';
            }
        });

        observationTime.addEventListener('blur', function() {
            const time = this.value.trim();
            if (time.length === 2) {
                showUTCTime(time);
            }
        });
    }
}

// دالة لتنسيق درجة الحرارة (XX.X)
function formatTemperature(input) {
    try {
        let value = input.value.replace(/[^\d.-]/g, '');

        // إزالة أي علامات سالبة متعددة
        value = value.replace(/(\-)+/g, '-');

        // إذا كانت القيمة تبدأ بنقطة، أضف صفر قبلها
        if (value.startsWith('.')) {
            value = '0' + value;
        }

        // إذا كانت القيمة تحتوي على أكثر من نقطة، احتفظ بالأولى فقط
        const dotCount = (value.match(/\./g) || []).length;
        if (dotCount > 1) {
            value = value.replace(/\.+$/, '');
            const parts = value.split('.');
            value = parts[0] + '.' + parts.slice(1).join('');
        }

        // إذا كانت القيمة تحتوي على نقطة، تأكد من وجود رقم واحد بعدها
        if (value.includes('.')) {
            const parts = value.split('.');
            if (parts[1].length > 1) {
                value = parts[0] + '.' + parts[1].charAt(0);
            }
        }

        // إذا كانت القيمة لا تحتوي على نقطة وكانت مكونة من رقم واحد، أضف صفر قبلها ونقطة وصفر بعدها
        if (!value.includes('.') && value.length === 1 && value !== '-') {
            value = '0' + value + '.0';
        }

        // إذا كانت القيمة لا تحتوي على نقطة وكانت مكونة من رقمين، أضف نقطة وصفر
        if (!value.includes('.') && value.length === 2 && value !== '-') {
            value = value + '.0';
        }

        // إذا كانت القيمة سالبة وتحتوي على نقطة في البداية
        if (value.startsWith('-.')) {
            value = '-0.' + value.slice(2);
        }

        // إذا كانت القيمة سالبة ومكونة من رقم واحد، أضف صفر ونقطة وصفر
        if (value.startsWith('-') && value.length === 2) {
            value = value + '0.0';
        }

        // إذا كانت القيمة سالبة ومكونة من رقمين بعد الإشارة، أضف نقطة وصفر
        if (value.startsWith('-') && value.length === 3) {
            value = value + '.0';
        }

        input.value = value;
    } catch (error) {
        console.error('خطأ في تنسيق درجة الحرارة:', error);
    }
}

// دالة للتحقق من صحة درجة الحرارة
function validateTemperature(input, isDryTemp = false, compareWith = null) {
    try {
        let value = input.value;

        // إذا كانت القيمة فارغة، لا تفعل شيئاً
        if (!value) return true;

        // التحقق من التنسيق XX.X
        const temperatureRegex = /^-?\d{2}\.\d$/;
        if (!temperatureRegex.test(value)) {
            showFieldError(
                input,
                'التنسيق غير صحيح. يجب أن يكون بالصيغة XX.X (مثال: 25.3)'
            );
            return false;
        }

        // تحويل إلى رقم للتحقق من القيم
        const numValue = parseFloat(value);

        // التحقق من النطاق (-20 إلى 60)
        if (numValue < -20 || numValue > 60) {
            showFieldError(input, 'يجب أن تكون القيمة بين -20 و 60');
            return false;
        }

        // إذا كانت هذه درجة حرارة جافة، التحقق من عدم وجود علامة سالبة
        if (isDryTemp && numValue < 0) {
            showFieldError(input, 'درجة الحرارة الجافة لا يمكن أن تكون سالبة');
            return false;
        }

        // إذا كانت هناك قيمة للمقارنة (الرطبة يجب أن تكون أقل من الجافة)
        if (compareWith !== null) {
            const compareValue = parseFloat(compareWith.value);
            if (!isNaN(compareValue)) {
                if (numValue > compareValue) {
                    showFieldError(
                        input,
                        'درجة الحرارة الرطبة يجب أن تكون أقل من أو تساوي الجافة'
                    );
                    return false;
                }

                // التحقق من أن الفرق لا يتجاوز 25 درجة
                const difference = compareValue - numValue;
                if (difference > 25) {
                    showFieldError(
                        input,
                        'الفرق بين الحرارة الجافة والرطبة لا يمكن أن يتجاوز 25 درجة'
                    );
                    return false;
                }
            }
        }

        // إذا كانت كل الشروط صحيحة، إخفاء أي أخطاء
        hideFieldError(input);
        return true;
    } catch (error) {
        console.error('خطأ في التحقق من درجة الحرارة:', error);
        return false;
    }
}

// دالة محسنة لتنسيق ضغط المحطة
function formatPressure(input) {
    try {
        let value = input.value.replace(/[^\d.]/g, '');

        // إذا كانت القيمة فارغة
        if (!value) return;

        // منع القيم التي تبدأ بأرقام عالية جداً
        if (value.length >= 2) {
            const firstTwoDigits = parseInt(value.substring(0, 2));
            if (firstTwoDigits > 10) {
                showFieldError(input, 'القيمة لا يمكن أن تتجاوز 1050.0');
                return;
            }
        }

        // فصل الأجزاء قبل وبعد الفاصلة
        let integerPart = '';
        let decimalPart = '';

        if (value.includes('.')) {
            const parts = value.split('.');
            integerPart = parts[0];
            decimalPart = parts[1] || '0';
        } else {
            integerPart = value;
            decimalPart = '0';
        }

        // تقييد الجزء العشري إلى رقم واحد
        decimalPart = decimalPart.charAt(0);

        // التأكد من أن الجزء الصحيح مكون من 4 أرقام
        integerPart = integerPart.padStart(4, '0');

        // إذا تجاوز 4 أرقام، نأخذ آخر 4 أرقام
        if (integerPart.length > 4) {
            integerPart = integerPart.slice(-4);
        }

        // التحقق من عدم تجاوز 1050
        const numericValue = parseFloat(integerPart + '.' + decimalPart);
        if (numericValue > 1050.0) {
            showFieldError(input, 'القيمة لا يمكن أن تتجاوز 1050.0');
            input.value = '1050.0';
            return;
        }

        input.value = integerPart + '.' + decimalPart;
    } catch (error) {
        console.error('خطأ في تنسيق الضغط:', error);
    }
}

// دالة للتحقق من صحة ضغط المحطة (معدلة)
function validatePressure(input) {
    try {
        let value = input.value;

        // إذا كانت القيمة فارغة، لا تفعل شيئاً
        if (!value) return true;

        // التحقق من التنسيق XXXX.X
        const pressureRegex = /^\d{4}\.\d$/;
        if (!pressureRegex.test(value)) {
            showFieldError(
                input,
                'التنسيق غير صحيح. يجب أن يكون بالصيغة XXXX.X (مثال: 1013.5)'
            );
            return false;
        }

        // تحويل إلى رقم للتحقق من القيم
        const numValue = parseFloat(value);

        // التحقق من النطاق (850.0 إلى 1050.0)
        if (numValue < 850.0) {
            showFieldError(input, 'يجب أن تكون القيمة بين 850.0 و 1050.0');
            return false;
        }

        if (numValue > 1050.0) {
            showFieldError(input, 'القيمة لا يمكن أن تتجاوز 1050.0');
            // إعادة تعيين القيمة إلى الحد الأقصى
            input.value = '1050.0';
            return false;
        }

        // إذا كانت كل الشروط صحيحة، إخفاء أي أخطاء
        hideFieldError(input);
        return true;
    } catch (error) {
        console.error('خطأ في التحقق من الضغط:', error);
        return false;
    }
}

// دالة للتحقق من صحة تغطية الغيوم
function validateCloudCover(input) {
    try {
        let value = input.value;

        // إذا كانت القيمة فارغة، لا تفعل شيئاً
        if (!value) return true;

        // التحقق من أن القيمة رقمية بين 0 و 8
        if (!/^[0-8]$/.test(value)) {
            showFieldError(input, 'يجب إدخال رقم بين 0 و 8');
            return false;
        }

        // إذا كانت القيمة 0، تعطيل حقلي نوع وارتفاع السحب
        const cloudIndex = input.id.replace('cloudAmount', '');
        if (value === '0') {
            document.getElementById(`cloudType${cloudIndex}`).disabled = true;
            document.getElementById(`cloudHeight${cloudIndex}`).disabled = true;
        } else {
            document.getElementById(`cloudType${cloudIndex}`).disabled = false;
            document.getElementById(`cloudHeight${cloudIndex}`).disabled = false;
        }

        // إذا كانت كل الشروط صحيحة، إخفاء أي أخطاء
        hideFieldError(input);
        return true;
    } catch (error) {
        console.error('خطأ في التحقق من تغطية الغيوم:', error);
        return false;
    }
}

// دالة للتحقق من صحة اتجاه الرياح
function validateWindDirection(input) {
    try {
        let value = input.value;

        // إذا كانت القيمة فارغة، لا تفعل شيئاً
        if (!value) return true;

        // التحقق من أن القيمة رقمية
        if (!/^\d+$/.test(value)) {
            showFieldError(input, 'يجب إدخال أرقام فقط');
            return false;
        }

        // التأكد من أن القيمة مكونة من رقمين
        if (value.length < 2) {
            value = value.padStart(2, '0');
            input.value = value;
        }

        // التحقق من النطاق (00 إلى 36)
        const numValue = parseInt(value);
        if (numValue < 0 || numValue > 36) {
            showFieldError(input, 'يجب أن تكون القيمة بين 00 و 36');
            return false;
        }

        // إذا كانت كل الشروط صحيحة، إخفاء أي أخطاء
        hideFieldError(input);
        return true;
    } catch (error) {
        console.error('خطأ في التحقق من اتجاه الرياح:', error);
        return false;
    }
}

// دالة للتحقق من صحة سرعة الرياح
function validateWindSpeed(input) {
    try {
        let value = input.value;

        // إذا كانت القيمة فارغة، لا تفعل شيئاً
        if (!value) return true;

        // التحقق من أن القيمة رقمية
        if (!/^\d+$/.test(value)) {
            showFieldError(input, 'يجب إدخال أرقام فقط');
            return false;
        }

        // التأكد من أن القيمة مكونة من رقمين
        if (value.length < 2) {
            value = value.padStart(2, '0');
            input.value = value;
        }

        // التحقق من النطاق (00 إلى 99)
        const numValue = parseInt(value);
        if (numValue < 0 || numValue > 99) {
            showFieldError(input, 'يجب أن تكون القيمة بين 00 و 99');
            return false;
        }

        // إذا كانت كل الشروط صحيحة، إخفاء أي أخطاء
        hideFieldError(input);
        return true;
    } catch (error) {
        console.error('خطأ في التحقق من سرعة الرياح:', error);
        return false;
    }
}

// دالة للتحقق من صحة الطقس الغابر (خانة واحدة)
function validatePastWeather(input) {
    try {
        let value = input.value;

        // إذا كانت القيمة فارغة، لا تفعل شيئاً
        if (!value) return true;

        // التحقق من أن القيمة رقمية بين 0 و 9
        if (!/^[0-9]$/.test(value)) {
            showFieldError(input, 'يجب إدخال رقم واحد بين 0 و 9');
            return false;
        }

        // إذا كانت كل الشروط صحيحة، إخفاء أي أخطاء
        hideFieldError(input);
        return true;
    } catch (error) {
        console.error('خطأ في التحقق من الطقس الغابر:', error);
        return false;
    }
}

// دالة لعرض خطأ للحقل
function showFieldError(input, message) {
    try {
        // إزالة أي رسائل خطأ سابقة
        hideFieldError(input);

        // إضافة صنف الخطأ للحقل
        input.classList.add('is-invalid');

        // إضافة تأثير اهتزاز
        input.classList.add('shake');
        setTimeout(() => {
            input.classList.remove('shake');
        }, 500);

        // إنشاء عنصر رسالة الخطأ
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        errorDiv.id = input.id + 'Error';
        errorDiv.style.display = 'block';
        errorDiv.style.opacity = '1';

        // إضافة رسالة الخطأ بعد الحقل
        input.parentNode.appendChild(errorDiv);

        // جعل الرسالة تظهر بشكل سلس
        setTimeout(() => {
            errorDiv.style.opacity = '1';
        }, 10);
    } catch (error) {
        console.error('خطأ في عرض خطأ الحقل:', error);
    }
}

// دالة لإخفاء خطأ الحقل
function hideFieldError(input) {
    try {
        // إزالة صنف الخطأ
        input.classList.remove('is-invalid');

        // إزالة رسالة الخطأ إذا كانت موجودة
        const errorDiv = document.getElementById(input.id + 'Error');
        if (errorDiv) {
            errorDiv.remove();
        }
    } catch (error) {
        console.error('خطأ في إخفاء خطأ الحقل:', error);
    }
}

// دالة لتحويل التوقيت المحلي إلى التوقيت العالمي
function convertToUTC(localTime) {
    try {
        const localHour = parseInt(localTime);
        if (isNaN(localHour) || localHour < 0 || localHour > 23) return null;

        // سوريا في التوقيت الشتوي (UTC+2) والصيفي (UTC+3)
        // سنفترض أننا نستخدم التوقيت الشتوي (UTC+2) كافتراضي
        const utcOffset = 2; // UTC+2 للتوقيت الشتوي في سوريا
        let utcHour = (localHour - utcOffset + 24) % 24;

        // التأكد من أن القيمة مكونة من رقمين
        return utcHour.toString().padStart(2, '0');
    } catch (error) {
        console.error('خطأ في تحويل التوقيت:', error);
        return null;
    }
}

// دالة لعرض التوقيت العالمي
function showUTCTime(localTime) {
    try {
        const utcTime = convertToUTC(localTime);
        const utcInfoElement = document.getElementById('utcTimeInfo');
        const utcTimeElement = document.getElementById('utcTime');

        if (utcTime) {
            utcTimeElement.textContent = utcTime;
            utcInfoElement.style.display = 'block';
        } else {
            utcInfoElement.style.display = 'none';
        }
    } catch (error) {
        console.error('خطأ في عرض التوقيت العالمي:', error);
    }
}

// متغير عام لتخزين رموز الطقس
let weatherCodes = null;

// دالة لتحميل رموز الطقس عند الحاجة فقط
async function loadWeatherCodesOnDemand() {
    // سيتم تحميل الرموز عند الحاجة فقط
}

// دالة لتحميل وتفسير رموز الطقس الحاضر
async function getWeatherCodes() {
    try {
        if (!weatherCodes) {
            const response = await fetch('طقس-حاضر.json');
            if (!response.ok) {
                throw new Error(`خطأ في تحميل الملف: ${response.status}`);
            }
            weatherCodes = await response.json();
            console.log('تم تحميل رموز الطقس:', weatherCodes.length, 'رمز');
        }
        return weatherCodes;
    } catch (error) {
        console.error('خطأ في تحميل رموز الطقس:', error);
        // إنشاء بيانات افتراضية للطوارئ
        return [
            {
                code: '00',
                description: 'رقم يدل على حالة الغيوم و الجو صافي خلال الساعة السابقة لوقت النشرة',
            },
            {
                code: '10',
                description: 'رقم يدل على شابورة مائية يعني ضباب الرؤية أقل من 1000م',
            },
            {
                code: '20',
                description: 'رزاز غير متجمد او حبيبات ثلجية فوق المحطة خلال الساعة السابقة',
            },
        ];
    }
}

// دالة لعرض شرح رمز الطقس الحاضر
async function showWeatherCodeDescription(code) {
    try {
        // التأكد من أن الرمز مكون من رقمين
        if (code.length !== 2) {
            hideWeatherDescription();
            return;
        }

        // الحصول على رموز الطقس
        const codes = await getWeatherCodes();

        // البحث عن الرمز في المصفوفة
        const weatherInfo = codes.find(item => item.code === code);

        // إنشاء أو الحصول على عنصر عرض الشرح
        let descriptionElement = document.getElementById('weatherCodeDescription');

        if (!descriptionElement) {
            descriptionElement = document.createElement('div');
            descriptionElement.id = 'weatherCodeDescription';
            descriptionElement.className =
                'weather-description alert alert-info mt-2 p-2';
            document
                .getElementById('currentWeather-group')
                .appendChild(descriptionElement);
        }

        if (weatherInfo) {
            // عرض الشرح إذا وجد الرمز
            descriptionElement.textContent = weatherInfo.description;
            descriptionElement.className =
                'weather-description alert alert-info mt-2 p-2';
            descriptionElement.style.display = 'block';
        } else {
            // إذا كان الرمز غير معروف
            descriptionElement.textContent =
                'رمز الطقس غير معروف - تأكد من إدخال رمز صحيح مكون من رقمين';
            descriptionElement.className =
                'weather-description alert alert-warning mt-2 p-2';
            descriptionElement.style.display = 'block';
        }
    } catch (error) {
        console.error('خطأ في عرض شرح رمز الطقس:', error);
    }
}

// دالة لإخفاء شرح الطقس
function hideWeatherDescription() {
    try {
        const descriptionElement = document.getElementById('weatherCodeDescription');
        if (descriptionElement) {
            descriptionElement.style.display = 'none';
        }
    } catch (error) {
        console.error('خطأ في إخفاء شرح الطقس:', error);
    }
}

// دالة لحساب القيم المشتقة
function calculateDerivedValues() {
    try {
        const dryTemp = parseFloat(document.getElementById('dryTemp').value);
        const wetTemp = parseFloat(document.getElementById('wetTemp').value);
        const stationPressure = parseFloat(
            document.getElementById('stationPressure').value
        );

        if (isNaN(dryTemp) || isNaN(wetTemp) || isNaN(stationPressure)) {
            showAlert(
                'يجب إدخال قيم صحيحة لدرجة الحرارة الجافة والرطبة وضغط المحطة',
                'warning'
            );
            return;
        }

        // حساب ضغط بخار الماء (معادلة مبسطة)
        const vaporPressure = 6.11 * Math.pow(10, 7.5 * wetTemp / (237.3 + wetTemp));

        // حساب درجة الندى (معادلة مبسطة)
        const dewPoint =
            237.3 *
            Math.log(vaporPressure / 6.11) /
            (7.5 - Math.log(vaporPressure / 6.11));

        // حساب الرطوبة النسبية
        const saturationVaporPressure =
            6.11 * Math.pow(10, 7.5 * dryTemp / (237.3 + dryTemp));
        const relativeHumidity = vaporPressure / saturationVaporPressure * 100;

        // حساب فرق ضغط بخار الماء عن الإشباع
        const vaporPressureDiff = saturationVaporPressure - vaporPressure;

        // عرض النتائج
        document.getElementById(
            'vaporPressureResult'
        ).textContent = vaporPressure.toFixed(2);
        document.getElementById('dewPointResult').textContent = dewPoint.toFixed(2);
        document.getElementById(
            'humidityResult'
        ).textContent = relativeHumidity.toFixed(2);
        document.getElementById(
            'vaporDiffResult'
        ).textContent = vaporPressureDiff.toFixed(2);

        // تحديث ملخص النتائج
        document.getElementById('summaryVapor').textContent =
            vaporPressure.toFixed(2) + ' ميلبار';
        document.getElementById('summaryDew').textContent =
            dewPoint.toFixed(2) + ' سْ';
        document.getElementById('summaryHumidity').textContent =
            relativeHumidity.toFixed(2) + '%';
        document.getElementById('summaryDiff').textContent =
            vaporPressureDiff.toFixed(2) + ' ميلبار';

        // إضافة تأثير للنتائج المحسوبة
        const results = document.querySelectorAll('.calculated-value');
        results.forEach(result => {
            result.classList.add('pulse');
            setTimeout(() => {
                result.classList.remove('pulse');
            }, 1000);
        });

        showAlert('تم حساب القيم المشتقة بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في حساب القيم المشتقة:', error);
        showAlert('حدث خطأ في الحساب', 'danger');
    }
}

// التحقق من صحة البيانات قبل الإرسال
function validateForm() {
    try {
        // إعادة تعيين جميع أخطاء التحقق
        resetAllValidationErrors();

        let isValid = true;
        let missingFields = [];
        let invalidFields = [];

        // 1. التحقق من الحقول المطلوبة الأساسية
        const requiredFields = [
            { id: 'station', name: 'اسم المحطة' },
            { id: 'observationTime', name: 'توقيت الرصد المحلي' },
            { id: 'observationDate', name: 'تاريخ الرصد' },
            { id: 'observer', name: 'اسم الراصد' },
            { id: 'station-password', name: 'كلمة مرور المحطة' },
            { id: 'dryTemp', name: 'درجة الحرارة الجافة' },
            { id: 'wetTemp', name: 'درجة الحرارة الرطبة' },
            { id: 'stationPressure', name: 'ضغط المحطة' },
            { id: 'stationPressureMSL', name: 'ضغط المحطة المحول لسطح البحر' },
        ];

        requiredFields.forEach(field => {
            const fieldElement = document.getElementById(field.id);
            if (!fieldElement.value.trim()) {
                isValid = false;
                missingFields.push(field.name);
                fieldElement.classList.add('is-invalid');

                // إضافة رسالة خطأ محددة
                showFieldError(fieldElement, 'هذا الحقل مطلوب');
            }
        });

        // 2. التحقق من صحة التوقيت
        const observationTime = document.getElementById('observationTime').value;
        if (observationTime && !/^([0-1][0-9]|2[0-3])$/.test(observationTime)) {
            isValid = false;
            invalidFields.push('توقيت الرصد المحلي');
            showFieldError(
                document.getElementById('observationTime'),
                'يجب أن يكون الوقت بين 00 و 23'
            );
        }

        // 3. التحقق من صحة درجات الحرارة
        const dryTemp = document.getElementById('dryTemp');
        const wetTemp = document.getElementById('wetTemp');

        if (dryTemp.value) {
            if (!validateTemperature(dryTemp, true)) {
                isValid = false;
                invalidFields.push('درجة الحرارة الجافة');
            }
        }

        if (wetTemp.value) {
            if (!validateTemperature(wetTemp, false, dryTemp)) {
                isValid = false;
                invalidFields.push('درجة الحرارة الرطبة');
            }
        }

        // 4. التحقق من صحة الضغط
        const stationPressure = document.getElementById('stationPressure');
        const stationPressureMSL = document.getElementById('stationPressureMSL');

        if (stationPressure.value && !validatePressure(stationPressure)) {
            isValid = false;
            invalidFields.push('ضغط المحطة');
        }

        if (stationPressureMSL.value && !validatePressure(stationPressureMSL)) {
            isValid = false;
            invalidFields.push('ضغط المحطة المحول لسطح البحر');
        }

        // 5. التحقق من صحة اتجاه الرياح
        const windDirSurface = document.getElementById('windDirSurface');
        const windDirMean = document.getElementById('windDirMean');

        if (windDirSurface.value && !validateWindDirection(windDirSurface)) {
            isValid = false;
            invalidFields.push('اتجاه الرياح السطحية');
        }

        if (windDirMean.value && !validateWindDirection(windDirMean)) {
            isValid = false;
            invalidFields.push('اتجاه المتوسط الساعي');
        }

        // 6. التحقق من صحة سرعة الرياح
        const windSpeedSurface = document.getElementById('windSpeedSurface');
        const windSpeedMean = document.getElementById('windSpeedMean');

        if (windSpeedSurface.value && !validateWindSpeed(windSpeedSurface)) {
            isValid = false;
            invalidFields.push('سرعة الرياح السطحية');
        }

        if (windSpeedMean.value && !validateWindSpeed(windSpeedMean)) {
            isValid = false;
            invalidFields.push('سرعة المتوسط الساعي');
        }

        // 7. التحقق من صحة الرؤية
        const visibility = document.getElementById('visibility');
        if (visibility.value && !validateVisibility(visibility)) {
            isValid = false;
            invalidFields.push('الرؤية السطحية الأفقية');
        }

        // 8. التحقق من صحة الطقس الحاضر
        const currentWeather = document.getElementById('currentWeather');
        if (currentWeather.value && !validateCurrentWeather(currentWeather)) {
            isValid = false;
            invalidFields.push('الطقس الحاضر');
        }

        // 9. التحقق من صحة الطقس الغابر
        const pastWeather = document.getElementById('pastWeather');
        if (pastWeather.value && !validatePastWeather(pastWeather)) {
            isValid = false;
            invalidFields.push('الطقس الغابر');
        }

        // 10. التحقق من صحة تغطية السحب
        for (let i = 1; i <= 4; i++) {
            const cloudAmount = document.getElementById(`cloudAmount${i}`);
            if (cloudAmount.value && !validateCloudCover(cloudAmount)) {
                isValid = false;
                invalidFields.push(`كمية السحب الطبقة ${i}`);
            }
        }

        // 11. التحقق من صحة ارتفاع السحب
        for (let i = 1; i <= 3; i++) {
            const cloudHeight = document.getElementById(`cloudHeight${i}`);
            const cloudAmount = document.getElementById(`cloudAmount${i}`);

            // التحقق من الارتفاع فقط إذا كانت كمية السحب > 0
            if (cloudAmount.value && cloudAmount.value !== '0' && cloudHeight.value) {
                if (!validateCloudHeight(cloudHeight)) {
                    isValid = false;
                    invalidFields.push(`ارتفاع السحب الطبقة ${i}`);
                }
            }
        }

        // 12. التحقق من الحقول الجديدة (cloudSum12 و cloudSum123)
        const cloudSum12 = document.getElementById('cloudSum12');
        const cloudSum123 = document.getElementById('cloudSum123');

        if (cloudSum12.value && !validateCloudSum(cloudSum12)) {
            isValid = false;
            invalidFields.push('مجموع السحب 1+2');
        }

        if (cloudSum123.value && !validateCloudSum(cloudSum123)) {
            isValid = false;
            invalidFields.push('مجموع السحب 1+2+3');
        }

        // 13. التحقق من تأكيد المسؤولية
        if (!document.getElementById('responsibilityCheckbox').checked) {
            isValid = false;
            showAlert('يجب الموافقة على تحمل المسؤولية قبل الإرسال', 'warning');

            // تسليط الضوء على خانة التأكيد
            const checkbox = document.getElementById('responsibilityCheckbox');
            checkbox.classList.add('is-invalid');
            const label = checkbox.nextElementSibling;
            if (label) {
                label.style.color = '#dc3545';
            }
        }

        // 14. إذا كان هناك أخطاء، عرض رسالة تفصيلية
        if (!isValid) {
            let errorMessage = '';

            if (missingFields.length > 0) {
                errorMessage +=
                    'الحقول المطلوبة التالية غير مملوءة: ' +
                    missingFields.join(', ') +
                    '. ';
            }

            if (invalidFields.length > 0) {
                errorMessage +=
                    'الحقول التالية تحتوي على قيم غير صحيحة: ' +
                    invalidFields.join(', ') +
                    '. ';
            }

            showAlert(errorMessage || 'يوجد أخطاء في النموذج', 'warning');

            // الانتقال إلى أول حقل به خطأ
            const firstErrorField = document.querySelector('.is-invalid');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                });
                firstErrorField.focus();
            }
        }

        return isValid;
    } catch (error) {
        console.error('خطأ في التحقق من النموذج:', error);
        showAlert('حدث خطأ أثناء التحقق من النموذج', 'danger');
        return false;
    }
}

// دالة إعادة تعيين أخطاء التحقق
function resetAllValidationErrors() {
    try {
        // إزالة جميع أخطاء التحقق من الحقول
        const invalidFields = document.querySelectorAll('.is-invalid');
        invalidFields.forEach(field => {
            field.classList.remove('is-invalid');
        });

        // إزالة جميع رسائل الخطأ
        const errorMessages = document.querySelectorAll('.invalid-feedback');
        errorMessages.forEach(msg => {
            msg.remove();
        });

        // إعادة تنسيق خانة التأكيد
        const checkbox = document.getElementById('responsibilityCheckbox');
        if (checkbox) {
            checkbox.classList.remove('is-invalid');
            const label = checkbox.nextElementSibling;
            if (label) {
                label.style.color = '';
            }
        }
    } catch (error) {
        console.error('خطأ في إعادة تعيين أخطاء التحقق:', error);
    }
}

// دالة التحقق من صحة الرؤية
function validateVisibility(input) {
    try {
        let value = input.value;

        // إذا كانت القيمة فارغة، لا تفعل شيئاً
        if (!value) return true;

        // التحقق من أن القيمة رقمية
        if (!/^\d+$/.test(value)) {
            showFieldError(input, 'يجب إدخال أرقام فقط');
            return false;
        }

        // التأكد من أن القيمة مكونة من 4 أرقام
        if (value.length < 4) {
            value = value.padStart(4, '0');
            input.value = value;
        }

        // التحقق من النطاق (0000 إلى 9999)
        const numValue = parseInt(value);
        if (numValue < 0 || numValue > 9999) {
            showFieldError(input, 'يجب أن تكون القيمة بين 0000 و 9999');
            return false;
        }

        // إذا كانت كل الشروط صحيحة، إخفاء أي أخطاء
        hideFieldError(input);
        return true;
    } catch (error) {
        console.error('خطأ في التحقق من الرؤية:', error);
        return false;
    }
}

// دالة التحقق من صحة الطقس الحاضر
function validateCurrentWeather(input) {
    try {
        let value = input.value;

        // إذا كانت القيمة فارغة، لا تفعل شيئاً
        if (!value) return true;

        // التحقق من أن القيمة رقمية ومكونة من رقمين
        if (!/^\d{2}$/.test(value)) {
            showFieldError(input, 'يجب إدخال رمز مكون من رقمين');
            return false;
        }

        // التحقق من النطاق (00 إلى 99)
        const numValue = parseInt(value);
        if (numValue < 0 || numValue > 99) {
            showFieldError(input, 'يجب أن تكون القيمة بين 00 و 99');
            return false;
        }

        // إذا كانت كل الشروط صحيحة، إخفاء أي أخطاء
        hideFieldError(input);
        return true;
    } catch (error) {
        console.error('خطأ في التحقق من الطقس الحاضر:', error);
        return false;
    }
}

// دالة التحقق من صحة ارتفاع السحب
function validateCloudHeight(input) {
    try {
        let value = input.value;

        // إذا كانت القيمة فارغة، لا تفعل شيئاً
        if (!value) return true;

        // التحقق من أن القيمة رقمية
        if (!/^\d+$/.test(value)) {
            showFieldError(input, 'يجب إدخال أرقام فقط');
            return false;
        }

        // التأكد من أن القيمة مكونة من 3 أرقام
        if (value.length < 3) {
            value = value.padStart(3, '0');
            input.value = value;
        }

        // التحقق من النطاق (000 إلى 999)
        const numValue = parseInt(value);
        if (numValue < 0 || numValue > 999) {
            showFieldError(input, 'يجب أن تكون القيمة بين 000 و 999');
            return false;
        }

        // إذا كانت كل الشروط صحيحة، إخفاء أي أخطاء
        hideFieldError(input);
        return true;
    } catch (error) {
        console.error('خطأ في التحقق من ارتفاع السحب:', error);
        return false;
    }
}

// دالة التحقق من صحة مجموع السحب
function validateCloudSum(input) {
    try {
        let value = input.value;

        // إذا كانت القيمة فارغة، لا تفعل شيئاً
        if (!value) return true;

        // التحقق من أن القيمة رقمية بين 0 و 9
        if (!/^[0-9]$/.test(value)) {
            showFieldError(input, 'يجب إدخال رقم واحد بين 0 و 9');
            return false;
        }

        // إذا كانت كل الشروط صحيحة، إخفاء أي أخطاء
        hideFieldError(input);
        return true;
    } catch (error) {
        console.error('خطأ في التحقق من مجموع السحب:', error);
        return false;
    }
}

// دالة إظهار وصف السحب
function showCloudDescription(select, cloudIndex) {
    try {
        const selectedOption = select.options[select.selectedIndex];
        const description = selectedOption.dataset.description;

        // إنشاء أو الحصول على عنصر عرض الشرح
        let descriptionElement = document.getElementById(
            `cloudDescription${cloudIndex}`
        );

        if (!descriptionElement) {
            descriptionElement = document.createElement('div');
            descriptionElement.id = `cloudDescription${cloudIndex}`;
            descriptionElement.className = 'cloud-description alert alert-info mt-2 p-2';
            select.parentNode.appendChild(descriptionElement);
        }

        if (description) {
            // عرض الشرح إذا وجد
            descriptionElement.textContent = description;
            descriptionElement.style.display = 'block';
        } else {
            // إخفاء الشرح إذا لم يوجد
            descriptionElement.style.display = 'none';
        }
    } catch (error) {
        console.error('خطأ في عرض وصف السحب:', error);
    }
}

// دالة إظهار رسالة تنبيه
function showAlert(message, type = 'info') {
    try {
        // إنشاء عنصر التنبيه
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
        alertDiv.style.position = 'fixed';
        alertDiv.style.top = '20px';
        alertDiv.style.right = '20px';
        alertDiv.style.zIndex = '9999';
        alertDiv.style.minWidth = '300px';
        alertDiv.style.maxWidth = '500px';
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translateX(100px)';
        alertDiv.style.transition = 'opacity 0.5s, transform 0.5s';

        // إضافة محتوى التنبيه
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

        // إضافة التنبيه إلى الصفحة
        document.body.appendChild(alertDiv);

        // إظهار التنبيه بسلاسة
        setTimeout(() => {
            alertDiv.style.opacity = '1';
            alertDiv.style.transform = 'translateX(0)';
        }, 10);

        // إخفاء التنبيه تلقائياً بعد 5 ثوانٍ
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.style.opacity = '0';
                alertDiv.style.transform = 'translateX(100px)';
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.parentNode.removeChild(alertDiv);
                    }
                }, 500);
            }
        }, 5000);

        // إضافة مستمع لإغلاق التنبيه يدوياً
        const closeButton = alertDiv.querySelector('.btn-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                alertDiv.style.opacity = '0';
                alertDiv.style.transform = 'translateX(100px)';
                setTimeout(() => {
                    if (alertDiv.parentNode) {
                        alertDiv.parentNode.removeChild(alertDiv);
                    }
                }, 500);
            });
        }
    } catch (error) {
        console.error('خطأ في إظهار التنبيه:', error);
    }
}

// دالة إظهار/إخفاء مؤشر التحميل
function showLoading(show) {
    try {
        let loadingElement = document.getElementById('loadingIndicator');

        if (show) {
            // إنشاء مؤشر التحميل إذا لم يكن موجوداً
            if (!loadingElement) {
                loadingElement = document.createElement('div');
                loadingElement.id = 'loadingIndicator';
                loadingElement.className = 'loading-indicator';
                loadingElement.innerHTML = `
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">جاري التحميل...</span>
                    </div>
                    <p class="mt-2">جاري معالجة البيانات...</p>
                `;
                loadingElement.style.position = 'fixed';
                loadingElement.style.top = '0';
                loadingElement.style.left = '0';
                loadingElement.style.width = '100%';
                loadingElement.style.height = '100%';
                loadingElement.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                loadingElement.style.display = 'flex';
                loadingElement.style.flexDirection = 'column';
                loadingElement.style.justifyContent = 'center';
                loadingElement.style.alignItems = 'center';
                loadingElement.style.zIndex = '9999';
                document.body.appendChild(loadingElement);
            } else {
                loadingElement.style.display = 'flex';
            }
        } else if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    } catch (error) {
        console.error('خطأ في التحكم بمؤشر التحميل:', error);
    }
}

// دالة إعادة تعيين النموذج
function resetForm() {
    try {
        // إعادة تعيين جميع حقول النموذج
        const form = document.getElementById('weatherForm');
        if (form) {
            form.reset();
        }

        // إعادة تعيين القيم المحسوبة
        document.getElementById('vaporPressureResult').textContent = '0.00';
        document.getElementById('dewPointResult').textContent = '0.00';
        document.getElementById('humidityResult').textContent = '0.00';
        document.getElementById('vaporDiffResult').textContent = '0.00';

        // إعادة تعيين ملخص النتائج
        document.getElementById('summaryVapor').textContent = '0.00 ميلبار';
        document.getElementById('summaryDew').textContent = '0.00 سْ';
        document.getElementById('summaryHumidity').textContent = '0.00%';
        document.getElementById('summaryDiff').textContent = '0.00 ميلبار';

        // إعادة تعيين معلومات المحطة
        updateStationInfo();

        // إخفاء جميع أخطاء التحقق
        resetAllValidationErrors();

        // إخفاء أوصاف السحب
        for (let i = 1; i <= 3; i++) {
            const descriptionElement = document.getElementById(`cloudDescription${i}`);
            if (descriptionElement) {
                descriptionElement.style.display = 'none';
            }
        }

        // إخفاء وصف الطقس الحاضر
        hideWeatherDescription();

        // إخفاء التوقيت العالمي
        document.getElementById('utcTimeInfo').style.display = 'none';

        // إعادة تعيين الوقت إلى الوقت الحالي
        const now = new Date();
        document.getElementById('observationTime').value = now
            .getHours()
            .toString()
            .padStart(2, '0');

        // إعادة تعيين التاريخ إلى اليوم
        document.getElementById('observationDate').valueAsDate = now;

        // إعادة تمكين حقول السحب
        for (let i = 1; i <= 3; i++) {
            document.getElementById(`cloudType${i}`).disabled = false;
            document.getElementById(`cloudHeight${i}`).disabled = false;
        }

        // إعادة تعيين خانة التأكيد
        document.getElementById('responsibilityCheckbox').checked = false;

        showAlert('تم إعادة تعيين النموذج بنجاح', 'info');
    } catch (error) {
        console.error('خطأ في إعادة تعيين النموذج:', error);
        showAlert('حدث خطأ أثناء إعادة تعيين النموذج', 'danger');
    }
}

// دالة تنزيل البيانات
function downloadData() {
    try {
        // التحقق من صحة البيانات
        if (!validateForm()) {
            showAlert('يوجد أخطاء في النموذج، يرجى التصحيح', 'warning');
            return;
        }

        // جمع البيانات
        const formData = collectFormData();

        // إنشاء محتوى الملف
        const content = JSON.stringify(formData, null, 2);

        // إنشاء ملف للتنزيل
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weather_data_${formData.stationId}_${formData.observationDate}_${formData.observationTime}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showAlert('تم تنزيل البيانات بنجاح', 'success');
    } catch (error) {
        console.error('خطأ في تنزيل البيانات:', error);
        showAlert('حدث خطأ أثناء تنزيل البيانات', 'danger');
    }
}

// دالة جمع بيانات النموذج
function collectFormData() {
    const { data: { user } } = supabase.auth.getUser()  
  return {
    stationId: document.getElementById('station').value,
    userId: user?.id,
    observationDate: document.getElementById('observationDate').value,
    observationTime: document.getElementById('observationTime').value,
    dryTemp: parseFloat(document.getElementById('dryTemp').value),
    wetTemp: parseFloat(document.getElementById('wetTemp').value),
    stationPressure: parseFloat(document.getElementById('stationPressure').value),
    stationPressureMSL: parseFloat(document.getElementById('stationPressureMSL').value),
    windDirSurface: document.getElementById('windDirSurface').value,
    windSpeedSurface: document.getElementById('windSpeedSurface').value,
    windDirMean: document.getElementById('windDirMean').value,
    windSpeedMean: document.getElementById('windSpeedMean').value,
    visibility: document.getElementById('visibility').value,
    currentWeather: document.getElementById('currentWeather').value,
    pastWeather: document.getElementById('pastWeather').value,
    cloudCoverTotal: document.getElementById('cloudCoverTotal').value,
    cloudAmount1: document.getElementById('cloudAmount1').value,
    cloudType1: document.getElementById('cloudType1').value,
    cloudHeight1: document.getElementById('cloudHeight1').value,
    cloudAmount2: document.getElementById('cloudAmount2').value,
    cloudType2: document.getElementById('cloudType2').value,
    cloudHeight2: document.getElementById('cloudHeight2').value,
    cloudAmount3: document.getElementById('cloudAmount3').value,
    cloudType3: document.getElementById('cloudType3').value,
    cloudHeight3: document.getElementById('cloudHeight3').value,
    cloudAmount4: document.getElementById('cloudAmount4').value,
    cloudSum12: document.getElementById('cloudSum12').value,
    cloudSum123: document.getElementById('cloudSum123').value,
    vaporPressure: parseFloat(document.getElementById('vaporPressureResult').textContent),
    dewPoint: parseFloat(document.getElementById('dewPointResult').textContent),
    relativeHumidity: parseFloat(document.getElementById('humidityResult').textContent),
    vaporPressureDiff: parseFloat(document.getElementById('vaporDiffResult').textContent),
    stationPassword: document.getElementById('station-password').value,
    responsibilityAccepted: document.getElementById('responsibilityCheckbox').checked
  }
}

// دالة إرسال البيانات المعدلة
async function sendData() {
  try {
    // التحقق من صحة البيانات
    if (!validateForm()) {
      showAlert('يوجد أخطاء في النموذج، يرجى التصحيح', 'warning')
      return
    }

    // جمع البيانات
    const formData = collectFormData()
    
    // التحقق من كلمة مرور المحطة
    const passwordValid = await validateStationPassword(
      formData.stationId,
      formData.stationPassword
    )
    
    if (!passwordValid) {
      showAlert('كلمة مرور المحطة غير صحيحة', 'danger')
      return
    }

    // إظهار مؤشر التحميل
    showLoading(true)

    // إرسال البيانات إلى Supabase
    const result = await insertHourlyData(formData)

    if (result.success) {
      showAlert('تم إرسال البيانات بنجاح إلى قاعدة البيانات', 'success')
      
      // إعادة تعيين النموذج بعد نجاح الإرسال
      setTimeout(() => {
        resetForm()
        showLoading(false)
      }, 2000)
    } else {
      throw new Error(result.error)
    }

  } catch (error) {
    console.error('Error in sendData:', error)
    showAlert(`فشل في إرسال البيانات: ${error.message}`, 'danger')
    showLoading(false)
  }
}

// دالة التحقق من كلمة مرور المحطة
async function validateStationPassword(stationCode, password) {
  try {
    // في الإصدار الحقيقي، يمكن التحقق من كلمة المرور في قاعدة البيانات
    // هذا مثال للتحقق الأساسي
    const { data, error } = await supabase
      .from('stations')
      .select('auth_password')
      .eq('code', stationCode)
      .single()

    if (error) throw error
    
    // مقارنة كلمة المرور (في الإنتاج استخدم مقارنة آمنة)
    return data.auth_password === password
    
  } catch (error) {
    console.error('Error validating password:', error)
    return false
  }
}

// دالة إدراج البيانات في قاعدة البيانات
async function insertHourlyData(formData) {
    try {
        // إرسال البيانات إلى Supabase
        const { data, error } = await supabase
            .from('hourly_data')
            .insert([
                {
                    station_id: formData.stationId,
                    user_id: formData.userId,
                    observation_date: formData.observationDate,
                    observation_time: formData.observationTime,
                    dry_temp: formData.dryTemp,
                    wet_temp: formData.wetTemp,
                    station_pressure: formData.stationPressure,
                    station_pressure_msl: formData.stationPressureMSL,
                    wind_dir_surface: formData.windDirSurface,
                    wind_speed_surface: formData.windSpeedSurface,
                    wind_dir_mean: formData.windDirMean,
                    wind_speed_mean: formData.windSpeedMean,
                    visibility: formData.visibility,
                    current_weather: formData.currentWeather,
                    past_weather: formData.pastWeather,
                    cloud_cover_total: formData.cloudCoverTotal,
                    cloud_amount1: formData.cloudAmount1,
                    cloud_type1: formData.cloudType1,
                    cloud_height1: formData.cloudHeight1,
                    cloud_amount2: formData.cloudAmount2,
                    cloud_type2: formData.cloudType2,
                    cloud_height2: formData.cloudHeight2,
                    cloud_amount3: formData.cloudAmount3,
                    cloud_type3: formData.cloudType3,
                    cloud_height3: formData.cloudHeight3,
                    cloud_amount4: formData.cloudAmount4,
                    cloud_sum12: formData.cloudSum12,
                    cloud_sum123: formData.cloudSum123,
                    vapor_pressure: formData.vaporPressure,
                    dew_point: formData.dewPoint,
                    relative_humidity: formData.relativeHumidity,
                    vapor_pressure_diff: formData.vaporPressureDiff,
                    responsibility_accepted: formData.responsibilityAccepted,
                },
            ])
            .select();

        if (error) {
            throw error;
        }

        return { success: true, data };
    } catch (error) {
        console.error('Error inserting data:', error);
        return { success: false, error: error.message };
    }
}
// كل الدوال الأخرى التي لديك في script.js تبقى كما هي
// ... [جميع دوالك الحالية] ...

// =============================================================================
// تهيئة التطبيق عند تحميل الصفحة
// =============================================================================
document.addEventListener('DOMContentLoaded', async function() {
  try {
    console.log('جاري تهيئة التطبيق...')
    
    // التحقق من حالة المصادقة
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.error('خطأ في المصادقة:', authError)
      window.location.href = 'login.html'
      return
    }
    
    if (!user) {
      console.log('لم يتم تسجيل الدخول، التوجيه إلى صفحة التسجيل')
      window.location.href = 'login.html'
      return
    }
    
    console.log('المستخدم مسجل:', user.email)
    
    // تحميل البيانات الأولية
    await loadStations()
    await loadClouds()
    
    // تحديث التاريخ والوقت
    updateDate()
    
    // تعيين تاريخ اليوم كقيمة افتراضية
    const observationDate = document.getElementById('observationDate')
    if (observationDate) {
      observationDate.valueAsDate = new Date()
    }
    
    // بدء مزامنة البيانات المخزنة محلياً (إذا كانت الدالة موجودة)
    if (typeof syncCachedData === 'function') {
      await syncCachedData()
    } else if (typeof syncPendingData === 'function') {
      // إذا كنت تستخدم الدالة من supabase.js الجديدة
      await syncPendingData()
    }
    
    // إضافة زر تسجيل الخروج إذا لم يكن موجوداً
    addLogoutButton()
    
    console.log('تم تهيئة التطبيق بنجاح')
    
  } catch (error) {
    console.error('خطأ في تهيئة التطبيق:', error)
    showAlert('حدث خطأ في تهيئة التطبيق، يرجى تحديث الصفحة', 'danger')
  }
})

// دالة إضافة زر تسجيل الخروج
function addLogoutButton() {
  // التحقق إذا كان زر تسجيل الخروج موجوداً بالفعل
  if (document.getElementById('logoutBtn')) return
  
  const logoutBtn = document.createElement('button')
  logoutBtn.id = 'logoutBtn'
  logoutBtn.className = 'btn btn-outline-light btn-sm'
  logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt me-1"></i>تسجيل الخروج'
  logoutBtn.onclick = logout

  const header = document.querySelector('header .container')
  if (header) {
    const logoutDiv = document.createElement('div')
    logoutDiv.className = 'text-center mt-2'
    logoutDiv.appendChild(logoutBtn)
    header.appendChild(logoutDiv)
  }
}

// دالة تسجيل الخروج
async function logout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    localStorage.removeItem('loggedIn')
    localStorage.removeItem('username')
    window.location.href = 'login.html'
  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error)
    showAlert('حدث خطأ أثناء تسجيل الخروج', 'danger')
  }
}