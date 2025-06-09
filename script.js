document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    
    // تكوين المستخدمين المحليين للاختبار (يمكن استبداله بالاتصال بـ Google Apps Script لاحقًا)
    const localUsers = [
        { username: 'student1', password: '123456', userType: 'student', name: 'أحمد الطالب' },
        { username: 'معلم1', password: '123456', userType: 'معلم', name: 'محمد المعلم' },
        { username: 'admin1', password: '123456', userType: 'admin', name: 'خالد الإداري' }
    ];
    
    // عنوان Google Apps Script Web App (استخدم هذا عندما تكون جاهزًا للاتصال بـ Google Apps Script)
    // يجب تحديث هذا العنوان بعنوان السكريبت الخاص بك
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzEZE9hvGIkYZMBys-fH_kZZ6aJad4njT7DIYOA3FsnwEJeAbWEY8VoPzklpPyGbNIB/exec';
    
    // تعيين صفحات التوجيه لكل نوع مستخدم
    const redirectPages = {
        'student': 'student-dashboard.html',
        'معلم': 'https://daraja-haql.netlify.app',
        'admin': 'admin-dashboard.html'
    };
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('user-type').value;
        
        // إظهار رسالة تحميل
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'جاري التحقق...';
        errorMessage.style.color = '#2196F3';
        
        // استخدام المصادقة عبر Google Apps Script
        googleScriptAuthentication(username, password, userType);
        
        // للعودة إلى المصادقة المحلية للاختبار، استخدم هذا السطر بدلاً من السطر السابق
        // localAuthentication(username, password, userType);
    });
    
    // دالة المصادقة المحلية
    function localAuthentication(username, password, userType) {
        // البحث عن المستخدم في المصفوفة المحلية
        const user = localUsers.find(u => 
            u.username === username && 
            u.password === password && 
            u.userType === userType
        );
        
        if (user) {
            // تخزين معلومات تسجيل الدخول في localStorage
            localStorage.setItem('loggedIn', 'true');
            localStorage.setItem('userType', userType);
            localStorage.setItem('username', username);
            localStorage.setItem('name', user.name || username);
            
            // توجيه المستخدم إلى الصفحة المناسبة
            window.location.href = redirectPages[userType];
        } else {
            // إظهار رسالة الخطأ
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'خطأ في اسم المستخدم أو كلمة المرور';
            errorMessage.style.color = '#f44336';
        }
    }
    
    // دالة المصادقة باستخدام Google Apps Script
    function googleScriptAuthentication(username, password, userType) {
        // استخدام JSONP لتجنب مشاكل CORS
        const callbackName = 'jsonpCallback_' + Math.round(Math.random() * 1000000);
        window[callbackName] = function(data) {
            if (data.success) {
                // تخزين معلومات تسجيل الدخول في localStorage
                localStorage.setItem('loggedIn', 'true');
                localStorage.setItem('userType', userType);
                localStorage.setItem('username', username);
                localStorage.setItem('name', data.name || username);
                
                // توجيه المستخدم إلى الصفحة المناسبة
                window.location.href = redirectPages[userType];
            } else {
                // إظهار رسالة الخطأ
                errorMessage.style.display = 'block';
                errorMessage.textContent = data.message || 'خطأ في اسم المستخدم أو كلمة المرور';
                errorMessage.style.color = '#f44336';
            }
            
            // حذف الدالة بعد الاستخدام
            delete window[callbackName];
            // إزالة عنصر السكريبت
            document.body.removeChild(document.getElementById('jsonpScript'));
        };
        
        // إنشاء عنصر سكريبت للطلب
        const script = document.createElement('script');
        script.id = 'jsonpScript';
        script.src = `${SCRIPT_URL}?callback=${callbackName}&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&userType=${encodeURIComponent(userType)}`;
        
        // معالجة الأخطاء
        script.onerror = function() {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'حدث خطأ في الاتصال بالخادم';
            errorMessage.style.color = '#f44336';
            // حذف الدالة والعنصر
            delete window[callbackName];
            document.body.removeChild(script);
        };
        
        // إضافة السكريبت إلى الصفحة لبدء الطلب
        document.body.appendChild(script);
    }
});