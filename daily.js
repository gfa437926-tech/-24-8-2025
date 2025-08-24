// daily.js - معالجات خاصة بالقسم اليومي مع التحقق من الصحة

document.addEventListener('DOMContentLoaded', function() {
  // تحميل معلومات المحطات من ملف JSON للقسم اليومي
  loadStationsForDaily();

  // تحديث معلومات المحطة عند التغيير
  const stationSelect = document.getElementById('dailyStation');
  if (stationSelect) {
    stationSelect.addEventListener('change', updateDailyStationInfo);
  }

  // تعيين التاريخ الحالي
  document.getElementById('dailyObservationDate').valueAsDate = new Date();

  // إضافة خيارات التوقيت
  const observationTimeSelect = document.getElementById('dailyObservationTime');
  if (observationTimeSelect) {
    observationTimeSelect.innerHTML = '';
    ['06', '18', '24 ساعة'].forEach(time => {
      const option = document.createElement('option');
      option.value = time === '24 ساعة' ? '24' : time;
      option.textContent = time;
      observationTimeSelect.appendChild(option);
    });
  }

  // إضافة معالجات لأزرار القسم اليومي
  const dailySendBtn = document.getElementById('dailySendBtn');
  if (dailySendBtn) {
    dailySendBtn.addEventListener('click', validateAndSendDailyForm);
  }

  const dailyDownloadBtn = document.getElementById('dailyDownloadBtn');
  if (dailyDownloadBtn) {
    dailyDownloadBtn.addEventListener('click', downloadDailyData);
  }

  const dailyResetBtn = document.getElementById('dailyResetBtn');
  if (dailyResetBtn) {
    dailyResetBtn.addEventListener('click', resetDailyForm);
  }

  // إضافة مستمعات الأحداث للتحقق أثناء الكتابة
  addDailyValidationListeners();
});

// تحميل معلومات المحطات من ملف JSON للقسم اليومي
function loadStationsForDaily() {
  fetch('stations.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const stationSelect = document.getElementById('dailyStation');
      if (stationSelect) {
        // مسح الخيارات الحالية (باستثناء الخيار الأول)
        while (stationSelect.options.length > 1) {
          stationSelect.remove(1);
        }

        // إضافة المحطات من ملف JSON
        data.stations.forEach(station => {
          const option = document.createElement('option');
          option.value = station.code;
          option.textContent = `${station.name} (${station.code})`;
          option.dataset.name = station.name;
          option.dataset.elevation = station.elevation;
          stationSelect.appendChild(option);
        });

        console.log('تم تحميل المحطات بنجاح للقسم اليومي');
      }
    })
    .catch(error => {
      console.error('Error loading stations for daily section:', error);
      showDailyAlert('حدث خطأ في تحميل قائمة المحطات', 'danger');
    });
}

// تحديث معلومات المحطة في القسم اليومي
function updateDailyStationInfo() {
  const stationSelect = document.getElementById('dailyStation');
  const station = stationSelect.options[stationSelect.selectedIndex];

  if (station.value) {
    document.getElementById('dailyStationCode').value = station.value;
    document.getElementById('dailyStationName').value = station.dataset.name || '';

    const elevation = parseFloat(station.dataset.elevation) || 0;
    document.getElementById('dailyElevation').value = elevation;
  } else {
    document.getElementById('dailyStationCode').value = '';
    document.getElementById('dailyStationName').value = '';
    document.getElementById('dailyElevation').value = '';
  }
}

// إضافة مستمعات الأحداث للتحقق من الصحة
function addDailyValidationListeners() {
  // درجات الحرارة
  const minTemp = document.getElementById('minTemp');
  const maxTemp = document.getElementById('maxTemp');
  
  if (minTemp) minTemp.addEventListener('blur', function() {
    formatDailyTemperature(this, true); // مسموح بالسالب
  });

  if (maxTemp) maxTemp.addEventListener('blur', function() {
    formatDailyTemperature(this, false); // غير مسموح بالسالب
  });

  // الهطول والثلوج
  const precipitation = document.getElementById('precipitation');
  const snowThickness = document.getElementById('snowThickness');
  
  if (precipitation) precipitation.addEventListener('blur', function() {
    formatDailyPrecipitation(this);
  });

  if (snowThickness) snowThickness.addEventListener('blur', function() {
    formatDailySnow(this);
  });

  // التبخر
  const evaporationRecord = document.getElementById('evaporationRecord');
  const evaporationLeach = document.getElementById('evaporationLeach');
  
  if (evaporationRecord) evaporationRecord.addEventListener('blur', function() {
    formatDailyEvaporation(this);
  });

  if (evaporationLeach) evaporationLeach.addEventListener('blur', function() {
    formatDailyEvaporation(this);
  });

  // سطوع الشمس
  const actualSunshine = document.getElementById('actualSunshine');
  const totalSunshine = document.getElementById('totalSunshine');
  const sunshinePercentage = document.getElementById('sunshinePercentage');
  
  if (actualSunshine) actualSunshine.addEventListener('blur', function() {
    formatDailySunshine(this);
  });

  if (totalSunshine) totalSunshine.addEventListener('blur', function() {
    formatDailySunshine(this);
  });

  if (sunshinePercentage) sunshinePercentage.addEventListener('blur', function() {
    formatDailyPercentage(this);
  });

  // أكبر نفخة
  const gustSpeed = document.getElementById('gustSpeed');
  const gustDirection = document.getElementById('gustDirection');
  const gustTime = document.getElementById('gustTime');
  
  if (gustSpeed) gustSpeed.addEventListener('blur', function() {
    formatDailyGustSpeed(this);
  });

  if (gustDirection) gustDirection.addEventListener('blur', function() {
    formatDailyGustDirection(this);
  });

  if (gustTime) gustTime.addEventListener('blur', function() {
    formatDailyGustTime(this);
  });

  // الرطوبة
  const maxHumidity = document.getElementById('maxHumidity');
  const maxHumidityTime = document.getElementById('maxHumidityTime');
  const minHumidity = document.getElementById('minHumidity');
  const minHumidityTime = document.getElementById('minHumidityTime');
  const dewAmount = document.getElementById('dewAmount');
  
  if (maxHumidity) maxHumidity.addEventListener('blur', function() {
    formatDailyMaxHumidity(this);
  });

  if (maxHumidityTime) maxHumidityTime.addEventListener('blur', function() {
    formatDailyHumidityTime(this);
  });

  if (minHumidity) minHumidity.addEventListener('blur', function() {
    formatDailyMinHumidity(this);
  });

  if (minHumidityTime) minHumidityTime.addEventListener('blur', function() {
    formatDailyHumidityTime(this);
  });

  if (dewAmount) dewAmount.addEventListener('blur', function() {
    formatDailyDewAmount(this);
  });
}

// دالة لتنسيق درجة الحرارة اليومية
function formatDailyTemperature(input, allowNegative = false) {
  let value = input.value.replace(/[^\d.-]/g, '');

  // إذا كانت القيمة فارغة
  if (!value) return;

  // التحقق من وجود إشارة سالبة إذا كان غير مسموح
  if (!allowNegative && value.includes('-')) {
    showDailyFieldError(input, 'القيمة لا يمكن أن تكون سالبة');
    input.value = '';
    return;
  }

  // فصل الأجزاء قبل وبعد الفاصلة
  let integerPart = '';
  let decimalPart = '0';

  if (value.includes('.')) {
    const parts = value.split('.');
    integerPart = parts[0];
    decimalPart = parts[1] || '0';
  } else {
    integerPart = value;
  }

  // تقييد الجزء العشري إلى رقم واحد
  decimalPart = decimalPart.charAt(0);

  // التأكد من أن الجزء الصحيح مكون من رقمين
  if (allowNegative && integerPart.startsWith('-')) {
    // إذا كانت سالبة، التأكد من أن القيمة المطلقة مكونة من رقمين
    const absValue = integerPart.substring(1);
    if (absValue.length > 2) {
      integerPart = integerPart.charAt(0) + absValue.slice(0, 2);
    } else if (absValue.length < 2) {
      integerPart = integerPart.charAt(0) + absValue.padStart(2, '0');
    }
  } else {
    // إذا كانت موجبة، التأكد من أنها مكونة من رقمين
    if (integerPart.length > 2) {
      integerPart = integerPart.slice(0, 2);
    } else if (integerPart.length < 2) {
      integerPart = integerPart.padStart(2, '0');
    }
  }

  input.value = integerPart + '.' + decimalPart;
  hideDailyFieldError(input);
}

// دالة لتنسيق الهطول
function formatDailyPrecipitation(input) {
  let value = input.value.replace(/[^\d.]/g, '');

  // إذا كانت القيمة فارغة
  if (!value) return;

  // فصل الأجزاء قبل وبعد الفاصلة
  let integerPart = '';
  let decimalPart = '0';

  if (value.includes('.')) {
    const parts = value.split('.');
    integerPart = parts[0];
    decimalPart = parts[1] || '0';
  } else {
    integerPart = value;
  }

  // تقييد الجزء العشري إلى رقم واحد
  decimalPart = decimalPart.charAt(0);

  // التأكد من أن الجزء الصحيح مكون من 3 أرقام
  if (integerPart.length > 3) {
    integerPart = integerPart.slice(0, 3);
  } else if (integerPart.length < 3) {
    integerPart = integerPart.padStart(3, '0');
  }

  input.value = integerPart + '.' + decimalPart;
  hideDailyFieldError(input);
}

// دالة لتنسيق سماكة الثلوج
function formatDailySnow(input) {
  let value = input.value.replace(/[^\d]/g, '');

  // إذا كانت القيمة فارغة
  if (!value) return;

  // التأكد من أن القيمة مكونة من رقمين
  if (value.length > 2) {
    value = value.slice(0, 2);
  } else if (value.length < 2) {
    value = value.padStart(2, '0');
  }

  input.value = value;
  hideDailyFieldError(input);
}

// دالة لتنسيق التبخر
function formatDailyEvaporation(input) {
  let value = input.value.replace(/[^\d.]/g, '');

  // إذا كانت القيمة فارغة
  if (!value) return;

  // فصل الأجزاء قبل وبعد الفاصلة
  let integerPart = '';
  let decimalPart = '0';

  if (value.includes('.')) {
    const parts = value.split('.');
    integerPart = parts[0];
    decimalPart = parts[1] || '0';
  } else {
    integerPart = value;
  }

  // تقييد الجزء العشري إلى رقم واحد
  decimalPart = decimalPart.charAt(0);

  // التأكد من أن الجزء الصحيح مكون من رقمين
  if (integerPart.length > 2) {
    integerPart = integerPart.slice(0, 2);
  } else if (integerPart.length < 2) {
    integerPart = integerPart.padStart(2, '0');
  }

  input.value = integerPart + '.' + decimalPart;
  hideDailyFieldError(input);
}

// دالة لتنسيق سطوع الشمس
function formatDailySunshine(input) {
  let value = input.value.replace(/[^\d.]/g, '');

  // إذا كانت القيمة فارغة
  if (!value) return;

  // فصل الأجزاء قبل وبعد الفاصلة
  let integerPart = '';
  let decimalPart = '0';

  if (value.includes('.')) {
    const parts = value.split('.');
    integerPart = parts[0];
    decimalPart = parts[1] || '0';
  } else {
    integerPart = value;
  }

  // تقييد الجزء العشري إلى رقم واحد
  decimalPart = decimalPart.charAt(0);

  // التأكد من أن الجزء الصحيح مكون من رقمين
  if (integerPart.length > 2) {
    integerPart = integerPart.slice(0, 2);
  } else if (integerPart.length < 2) {
    integerPart = integerPart.padStart(2, '0');
  }

  input.value = integerPart + '.' + decimalPart;
  hideDailyFieldError(input);
}

// دالة لتنسيق النسبة المئوية
function formatDailyPercentage(input) {
  let value = input.value.replace(/[^\d]/g, '');

  // إذا كانت القيمة فارغة
  if (!value) return;

  // التأكد من أن القيمة مكونة من 3 أرقام
  if (value.length > 3) {
    value = value.slice(0, 3);
  } else if (value.length < 3) {
    value = value.padStart(3, '0');
  }

  input.value = value;
  hideDailyFieldError(input);
}

// دالة لتنسيق سرعة النفخة
function formatDailyGustSpeed(input) {
  let value = input.value.replace(/[^\d]/g, '');

  // إذا كانت القيمة فارغة
  if (!value) return;

  // التأكد من أن القيمة مكونة من رقمين
  if (value.length > 2) {
    value = value.slice(0, 2);
  } else if (value.length < 2) {
    value = value.padStart(2, '0');
  }

  input.value = value;
  hideDailyFieldError(input);
}

// دالة لتنسيق اتجاه النفخة
function formatDailyGustDirection(input) {
  let value = input.value.replace(/[^\d]/g, '');

  // إذا كانت القيمة فارغة
  if (!value) return;

  // التأكد من أن القيمة بين 00 و 36
  const numValue = parseInt(value);
  if (numValue < 0 || numValue > 36) {
    showDailyFieldError(input, 'يجب أن تكون القيمة بين 00 و 36');
    return;
  }

  // التأكد من أن القيمة مكونة من رقمين
  if (value.length > 2) {
    value = value.slice(0, 2);
  } else if (value.length < 2) {
    value = value.padStart(2, '0');
  }

  input.value = value;
  hideDailyFieldError(input);
}

// دالة لتنسيق وقت النفخة
function formatDailyGustTime(input) {
  let value = input.value.replace(/[^\d.]/g, '');

  // إذا كانت القيمة فارغة
  if (!value) return;

  // فصل الأجزاء قبل وبعد الفاصلة
  let integerPart = '';
  let decimalPart = '0';

  if (value.includes('.')) {
    const parts = value.split('.');
    integerPart = parts[0];
    decimalPart = parts[1] || '0';
  } else {
    integerPart = value;
  }

  // تقييد الجزء العشري إلى رقم واحد
  decimalPart = decimalPart.charAt(0);

  // التأكد من أن الجزء الصحيح مكون من رقمين وبين 00 و 23
  const hourValue = parseInt(integerPart);
  if (hourValue < 0 || hourValue > 23) {
    showDailyFieldError(input, 'يجب أن تكون الساعة بين 00 و 23');
    return;
  }

  if (integerPart.length > 2) {
    integerPart = integerPart.slice(0, 2);
  } else if (integerPart.length < 2) {
    integerPart = integerPart.padStart(2, '0');
  }

  input.value = integerPart + '.' + decimalPart;
  hideDailyFieldError(input);
}

// دالة لتنسيق أقصى رطوبة
function formatDailyMaxHumidity(input) {
  let value = input.value.replace(/[^\d]/g, '');

  // إذا كانت القيمة فارغة
  if (!value) return;

  // التأكد من أن القيمة بين 0 و 100
  const numValue = parseInt(value);
  if (numValue < 0 || numValue > 100) {
    showDailyFieldError(input, 'يجب أن تكون القيمة بين 000 و 100');
    return;
  }

  // التأكد من أن القيمة مكونة من 3 أرقام
  if (value.length > 3) {
    value = value.slice(0, 3);
  } else if (value.length < 3) {
    value = value.padStart(3, '0');
  }

  input.value = value;
  hideDailyFieldError(input);
}

// دالة لتنسيق وقت الرطوبة
function formatDailyHumidityTime(input) {
  let value = input.value.replace(/[^\d.]/g, '');

  // إذا كانت القيمة فارغة
  if (!value) return;

  // فصل الأجزاء قبل وبعد الفاصلة
  let integerPart = '';
  let decimalPart = '0';

  if (value.includes('.')) {
    const parts = value.split('.');
    integerPart = parts[0];
    decimalPart = parts[1] || '0';
  } else {
    integerPart = value;
  }

  // تقييد الجزء العشري إلى رقم واحد
  decimalPart = decimalPart.charAt(0);

  // التأكد من أن الجزء الصحيح مكون من رقمين وبين 00 و 23
  const hourValue = parseInt(integerPart);
  if (hourValue < 0 || hourValue > 23) {
    showDailyFieldError(input, 'يجب أن تكون الساعة بين 00 و 23');
    return;
  }

  if (integerPart.length > 2) {
    integerPart = integerPart.slice(0, 2);
  } else if (integerPart.length < 2) {
    integerPart = integerPart.padStart(2, '0');
  }

  input.value = integerPart + '.' + decimalPart;
  hideDailyFieldError(input);
}

// دالة لتنسيق أدنى رطوبة
function formatDailyMinHumidity(input) {
  let value = input.value.replace(/[^\d]/g, '');

  // إذا كانت القيمة فارغة
  if (!value) return;

  // التأكد من أن القيمة بين 0 و 100
  const numValue = parseInt(value);
  if (numValue < 0 || numValue > 100) {
    showDailyFieldError(input, 'يجب أن تكون القيمة بين 00 و 100');
    return;
  }

  // التأكد من أن القيمة مكونة من رقمين
  if (value.length > 2) {
    value = value.slice(0, 2);
  } else if (value.length < 2) {
    value = value.padStart(2, '0');
  }

  input.value = value;
  hideDailyFieldError(input);
}

// دالة لتنسيق كمية الندى
function formatDailyDewAmount(input) {
  let value = input.value.replace(/[^\d.]/g, '');

  // إذا كانت القيمة فارغة
  if (!value) return;

  // فصل الأجزاء قبل وبعد الفاصلة
  let integerPart = '';
  let decimalPart = '0';

  if (value.includes('.')) {
    const parts = value.split('.');
    integerPart = parts[0];
    decimalPart = parts[1] || '0';
  } else {
    integerPart = value;
  }

  // تقييد الجزء العشري إلى رقم واحد
  decimalPart = decimalPart.charAt(0);

  // التأكد من أن الجزء الصحيح مكون من رقمين
  if (integerPart.length > 2) {
    integerPart = integerPart.slice(0, 2);
  } else if (integerPart.length < 2) {
    integerPart = integerPart.padStart(2, '0');
  }

  input.value = integerPart + '.' + decimalPart;
  hideDailyFieldError(input);
}

// التحقق من صحة النموذج اليومي وإرساله
function validateAndSendDailyForm() {
  // إعادة تعيين جميع أخطاء التحقق
  resetAllDailyValidationErrors();

  let isValid = true;
  let missingFields = [];

  // 1. التحقق من الحقول المطلوبة الأساسية
  const requiredFields = [
    {id: 'dailyStation', name: 'اسم المحطة'},
    {id: 'dailyObservationDate', name: 'تاريخ الرصد'},
    {id: 'dailyObservationTime', name: 'وقت الرصد'},
    {id: 'dailyObserver', name: 'اسم الراصد'},
    {id: 'dailyStationPassword', name: 'كلمة مرور المحطة'},
  ];

  requiredFields.forEach(field => {
    const fieldElement = document.getElementById(field.id);
    if (!fieldElement || !fieldElement.value.trim()) {
      isValid = false;
      missingFields.push(field.name);
      if (fieldElement) showDailyFieldError(fieldElement, 'هذا الحقل مطلوب');
    }
  });

  // 2. التحقق من تأكيد المسؤولية
  const responsibilityCheckbox = document.getElementById('dailyResponsibilityCheckbox');
  if (!responsibilityCheckbox || !responsibilityCheckbox.checked) {
    isValid = false;
    showDailyAlert('يجب الموافقة على تحمل المسؤولية قبل الإرسال', 'warning');

    // تسليط الضوء على خانة التأكيد
    if (responsibilityCheckbox) {
      responsibilityCheckbox.classList.add('is-invalid');
      const label = responsibilityCheckbox.nextElementSibling;
      if (label) label.classList.add('text-danger', 'fw-bold');
    }
  }

  // 3. إذا كان هناك أخطاء، عرض رسالة تفصيلية
  if (!isValid) {
    let errorMessage = 'يوجد أخطاء في النموذج:\n';

    if (missingFields.length > 0) {
      errorMessage += `\n• الحقول المطلوبة: ${missingFields.join('، ')}`;
    }

    showDailyAlert(errorMessage, 'warning');

    // التمرير إلى أول حقل به خطأ
    scrollToFirstDailyError();
  } else {
    // إذا كان النموذج صحيحاً، المتابعة للإرسال
    sendDailyData();
  }

  return isValid;
}

// دالة لعرض خطأ للحقل في القسم اليومي
function showDailyFieldError(input, message) {
  // إزالة أي رسائل خطأ سابقة
  hideDailyFieldError(input);

  // إضافة صنف الخطأ للحقل
  input.classList.add('is-invalid');

  // إنشاء عنصر رسالة الخطأ
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback';
  errorDiv.textContent = message;
  errorDiv.id = input.id + 'Error';

  // إضافة رسالة الخطأ بعد الحقل
  input.parentNode.appendChild(errorDiv);
}

// دالة لإخفاء خطأ الحقل في القسم اليومي
function hideDailyFieldError(input) {
  // إزالة صنف الخطأ
  input.classList.remove('is-invalid');

  // إزالة رسالة الخطأ إذا كانت موجودة
  const errorDiv = document.getElementById(input.id + 'Error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// دالة مساعدة لإعادة تعيين جميع أخطاء التحقق في القسم اليومي
function resetAllDailyValidationErrors() {
  // إزالة جميع أخطاء التحقق
  document.querySelectorAll('#daily .is-invalid').forEach(element => {
    element.classList.remove('is-invalid');
  });

  // إزالة جميع رسائل الخطأ
  document.querySelectorAll('#daily .invalid-feedback').forEach(element => {
    element.remove();
  });

  // إعادة تعيين تنسيق خانة التأكيد
  const checkbox = document.getElementById('dailyResponsibilityCheckbox');
  if (checkbox) {
    checkbox.classList.remove('is-invalid');
    const label = checkbox.nextElementSibling;
    if (label) {
      label.classList.remove('text-danger', 'fw-bold');
    }
  }
}

// دالة للتمرير إلى أول حقل به خطأ في القسم اليومي
function scrollToFirstDailyError() {
  const firstError = document.querySelector('#daily .is-invalid');
  if (firstError) {
    firstError.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });

    // إضافة تأثير اهتزاز للحقل
    firstError.classList.add('shake');
    setTimeout(() => {
      firstError.classList.remove('shake');
    }, 500);

    // التركيز على الحقل
    firstError.focus();
  }
}

// دالة لعرض رسائل تنبيه في القسم اليومي
function showDailyAlert(message, type = 'info') {
  // إزالة أي تنبيهات سابقة
  const existingAlerts = document.querySelectorAll('#daily .custom-alert');
  existingAlerts.forEach(alert => alert.remove());

  const alertDiv = document.createElement('div');
  alertDiv.className = `custom-alert alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    <div class="d-flex align-items-center">
      <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : type === 'danger' ? 'fa-times-circle' : 'fa-info-circle'} me-2"></i>
      <div>${message}</div>
    </div>
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;

  // إضافة أنيميشن للتنبيه
  alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);';

  // إضافة التنبيه في أعلى الصفحة
  const dailySection = document.getElementById('daily');
  if (dailySection) {
    dailySection.appendChild(alertDiv);
  } else {
    document.body.appendChild(alertDiv);
  }

  // إزالة التنبيه تلقائياً بعد 5 ثوان
  setTimeout(() => {
    if (alertDiv.parentElement) {
      alertDiv.remove();
    }
  }, 5000);
}

// دالة إرسال البيانات اليومية
async function sendDailyData() {
  try {
    if (!validateAndSendDailyForm()) return

    const formData = {
      stationId: document.getElementById('dailyStation').value,
      observationDate: document.getElementById('dailyObservationDate').value,
      observationPeriod: document.getElementById('dailyObservationTime').value,
      minTemp: document.getElementById('minTemp').value,
      maxTemp: document.getElementById('maxTemp').value,
      precipitation: document.getElementById('precipitation').value,
      snowThickness: document.getElementById('snowThickness').value,
      thunderstorm: document.getElementById('thunderstorm').checked,
      hail: document.getElementById('hail').checked,
      snow: document.getElementById('snow').checked,
      rain: document.getElementById('rain').checked,
      frost: document.getElementById('frost').checked,
      fog: document.getElementById('fog').checked,
      drizzle: document.getElementById('drizzle').checked,
      dustStorm: document.getElementById('dustStorm').checked,
      dust: document.getElementById('dust').checked,
      haze: document.getElementById('haze').checked,
      stormyWind: document.getElementById('stormyWind').checked,
      evaporationRecord: document.getElementById('evaporationRecord').value,
      evaporationLeach: document.getElementById('evaporationLeach').value,
      actualSunshine: document.getElementById('actualSunshine').value,
      totalSunshine: document.getElementById('totalSunshine').value,
      sunshinePercentage: document.getElementById('sunshinePercentage').value,
      gustSpeed: document.getElementById('gustSpeed').value,
      gustDirection: document.getElementById('gustDirection').value,
      gustTime: document.getElementById('gustTime').value,
      maxHumidity: document.getElementById('maxHumidity').value,
      maxHumidityTime: document.getElementById('maxHumidityTime').value,
      minHumidity: document.getElementById('minHumidity').value,
      minHumidityTime: document.getElementById('minHumidityTime').value,
      dewAmount: document.getElementById('dewAmount').value,
      stationPassword: document.getElementById('dailyStationPassword').value,
      responsibilityAccepted: document.getElementById('dailyResponsibilityCheckbox').checked
    }

    // محاولة استيراد وظائف Supabase
    let insertDailyData;
    
    try {
      const supabaseModule = await import('./supabase.js');
      insertDailyData = supabaseModule.insertDailyData;
    } catch (error) {
      console.warn('Supabase module not found, using mock functions');
      // استخدام دوال وهمية إذا لم يكن supabase.js موجوداً
      insertDailyData = async (data) => {
        console.log('Mock insertDailyData:', data);
        return { success: true, message: 'Data saved successfully (mock)' };
      };
    }

    // إرسال البيانات اليومية
    const result = await insertDailyData(formData)

    if (result.success) {
      showDailyAlert('تم إرسال البيانات اليومية بنجاح!', 'success')
    } else {
      throw new Error(result.error)
    }

  } catch (error) {
    console.error('Error sending daily data:', error)
    showDailyAlert(`خطأ في الإرسال: ${error.message}`, 'danger')
  }
}

// تحميل بيانات القسم اليومي
function downloadDailyData() {
  if (!validateAndSendDailyForm()) return;

  // جمع البيانات من النموذج (نفس البيانات في sendDailyData)
  const formData = {
    stationId: document.getElementById('dailyStation').value,
    observationDate: document.getElementById('dailyObservationDate').value,
    observationPeriod: document.getElementById('dailyObservationTime').value,
    minTemp: document.getElementById('minTemp').value,
    maxTemp: document.getElementById('maxTemp').value,
    precipitation: document.getElementById('precipitation').value,
    snowThickness: document.getElementById('snowThickness').value,
    thunderstorm: document.getElementById('thunderstorm').checked,
    hail: document.getElementById('hail').checked,
    snow: document.getElementById('snow').checked,
    rain: document.getElementById('rain').checked,
    frost: document.getElementById('frost').checked,
    fog: document.getElementById('fog').checked,
    drizzle: document.getElementById('drizzle').checked,
    dustStorm: document.getElementById('dustStorm').checked,
    dust: document.getElementById('dust').checked,
    haze: document.getElementById('haze').checked,
    stormyWind: document.getElementById('stormyWind').checked,
    evaporationRecord: document.getElementById('evaporationRecord').value,
    evaporationLeach: document.getElementById('evaporationLeach').value,
    actualSunshine: document.getElementById('actualSunshine').value,
    totalSunshine: document.getElementById('totalSunshine').value,
    sunshinePercentage: document.getElementById('sunshinePercentage').value,
    gustSpeed: document.getElementById('gustSpeed').value,
    gustDirection: document.getElementById('gustDirection').value,
    gustTime: document.getElementById('gustTime').value,
    maxHumidity: document.getElementById('maxHumidity').value,
    maxHumidityTime: document.getElementById('maxHumidityTime').value,
    minHumidity: document.getElementById('minHumidity').value,
    minHumidityTime: document.getElementById('minHumidityTime').value,
    dewAmount: document.getElementById('dewAmount').value,
    stationPassword: document.getElementById('dailyStationPassword').value,
    responsibilityAccepted: document.getElementById('dailyResponsibilityCheckbox').checked
  };

  // تحويل البيانات إلى JSON
  const jsonData = JSON.stringify(formData, null, 2);

  // إنشاء رابط تحميل
  const blob = new Blob([jsonData], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `daily_weather_data_${formData.stationId}_${formData.observationDate}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showDailyAlert('تم تحميل البيانات اليومية بنجاح', 'success');
}

// إعادة تعيين النموذج اليومي
function resetDailyForm() {
  if (confirm('هل أنت متأكد من أنك تريد إعادة تعيين النموذج اليومي؟')) {
    const stationSelect = document.getElementById('dailyStation');
    if (stationSelect) stationSelect.selectedIndex = 0;
    
    const dateInput = document.getElementById('dailyObservationDate');
    if (dateInput) dateInput.valueAsDate = new Date();
    
    const timeSelect = document.getElementById('dailyObservationTime');
    if (timeSelect) timeSelect.selectedIndex = 0;
    
    const observerInput = document.getElementById('dailyObserver');
    if (observerInput) observerInput.value = '';
    
    const passwordInput = document.getElementById('dailyStationPassword');
    if (passwordInput) passwordInput.value = '';

    // إعادة تعيين الحقول الأخرى
    const fieldsToReset = [
      'minTemp',
      'maxTemp',
      'precipitation',
      'snowThickness',
      'evaporationRecord',
      'evaporationLeach',
      'actualSunshine',
      'totalSunshine',
      'sunshinePercentage',
      'gustSpeed',
      'gustDirection',
      'gustTime',
      'maxHumidity',
      'maxHumidityTime',
      'minHumidity',
      'minHumidityTime',
      'dewAmount',
    ];

    fieldsToReset.forEach(field => {
      const element = document.getElementById(field);
      if (element) element.value = '';
    });

    // إعادة تعيين checkboxes
    const checkboxes = document.querySelectorAll(
      '#daily-weather-elements input[type="checkbox"]'
    );
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });

    const responsibilityCheckbox = document.getElementById('dailyResponsibilityCheckbox');
    if (responsibilityCheckbox) responsibilityCheckbox.checked = false;

    // إعادة تعيين أخطاء التحقق
    resetAllDailyValidationErrors();

    showDailyAlert('تم إعادة تعيين النموذج اليومي بنجاح', 'info');
  }
}