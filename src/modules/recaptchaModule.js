const getRecaptcha = async (req, res) => {
    const { apiKey,
        authDomain,
        databaseURL,
        projectId,
        storageBucket,
        messagingSenderId,
        appId,
        measurementId,
        bg,
        txt
    } = req.query;
    const dynamicContent = `<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <title>Entering captcha</title>
    <link href="https://fonts.googleapis.com/css?family=Open+Sans" rel="stylesheet">
    <style>
    body {
        background-color: #${bg};
        color: #${txt};
        font-family: 'Open Sans', sans-serif;
        font-size: 1.2em;
        text-align: center;
    }
</style>
</head>

<body>
    <p style="text-align: center; font-family: Open Sans; font-size: 1.2em;">Tuition App<p />
    <p style="text-align: center; font-family: Open Sans; font-size: 1.2em;">Our system is silently validating your human presence.<p />
    <button id="continue-btn" style="display:none">Continue to app</button>
    <script src="https://www.gstatic.com/firebasejs/5.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/5.10.1/firebase-auth.js"></script>
    <script>
        // Initialize Firebase
        var config = {
            apiKey: "${apiKey}",
            authDomain: "${authDomain}",
            databaseURL: "${databaseURL}",
            projectId:"${projectId}",
            storageBucket: "${storageBucket}",
            messagingSenderId:"${messagingSenderId}",
            appId:"${appId}",
            measurementId: "${measurementId}"
        };
        firebase.initializeApp(config);
    </script>
    <script>
        function getToken(callback) {
            var container = document.createElement('div');
            container.id = 'captcha';
            document.body.appendChild(container);
            var captcha = new firebase.auth.RecaptchaVerifier('captcha', {
                'size': 'invisible',
                'callback': function (token) {
                    callback(token);
                },
                'expired-callback': function () {
                    callback('');
                }
            });
            captcha.render().then(function () {
                captcha.verify();
            });
        }
        function sendTokenToApp(token) {
            const finalUrl = location.href = 'https://tuitionappbd.com' + '/?token=' + encodeURIComponent(token);
            const continueBtn = document.querySelector('#continue-btn');
            window.open(finalUrl, '_self')
            window.open(finalUrl, '_blank')
        }
        document.addEventListener('DOMContentLoaded', function () {
            getToken(sendTokenToApp);
        });
    </script>
</body>

</html>`
    res.header('Content-Type', 'text/html');
    res.status(200).send(dynamicContent);
}
module.exports = {
    getRecaptcha: getRecaptcha
}