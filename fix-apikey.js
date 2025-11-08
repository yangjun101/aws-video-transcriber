// Video Transcriber - API Key Fix Script
// 在浏览器控制台中运行此脚本

console.log('=== Video Transcriber API Key Fix ===');

// 1. 清除所有 localStorage
console.log('Step 1: Clearing localStorage...');
localStorage.clear();
console.log('✓ localStorage cleared');

// 2. 设置正确的 API Key
const API_KEY = 'yourtranscribetestbucketvideotranscriberv100';
console.log('Step 2: Setting API Key...');
localStorage.setItem('apiKey', API_KEY);
console.log('✓ API Key set to:', API_KEY);

// 3. 验证 API Key
console.log('Step 3: Verifying API Key...');
const storedKey = localStorage.getItem('apiKey');
console.log('Stored API Key:', storedKey);
console.log('Match:', storedKey === API_KEY ? '✓ YES' : '✗ NO');

// 4. 检查页面元素
console.log('Step 4: Checking page elements...');
const navBar = document.getElementById('navBar');
console.log('navBar element:', navBar ? '✓ Found' : '✗ Not found');

// 5. 手动渲染导航栏
console.log('Step 5: Manually rendering navigation bar...');
if (navBar && window.localStorage.apiKey) {
    const nav = 
        '<li class="nav-item"><a id="homeLink" class="nav-link" href="#">Home</a></li>' +
        '<li class="nav-item"><a id="videosLink" class="nav-link" href="#videos">Videos</a></li>' +
        '<li class="nav-item"><a id="tweaksLink" class="nav-link" href="#tweaks">Tweaks</a></li>';
    navBar.innerHTML = nav;
    console.log('✓ Navigation bar rendered');
} else {
    console.log('✗ Cannot render navigation bar');
    console.log('  - navBar exists:', !!navBar);
    console.log('  - apiKey exists:', !!window.localStorage.apiKey);
}

// 6. 手动渲染登录/登出按钮
console.log('Step 6: Rendering login/logout button...');
const loginLogout = document.getElementById('loginLogout');
if (loginLogout) {
    loginLogout.innerHTML = 
        "<button type='button' class='btn btn-default' onclick='javascript:logout();'>" +
        "<i class='fa fa-key'></i> Clear API Key</button>";
    console.log('✓ Login/logout button rendered');
} else {
    console.log('✗ loginLogout element not found');
}

// 7. 测试 API 调用
console.log('Step 7: Testing API call...');
const API_BASE = 'https://917mle40yh.execute-api.us-east-1.amazonaws.com/prod';
fetch(API_BASE + '/videos', {
    headers: {
        'X-Api-Key': API_KEY
    }
})
.then(response => {
    console.log('API Response Status:', response.status);
    if (response.status === 200) {
        console.log('✓ API call successful');
        return response.json();
    } else {
        console.log('✗ API call failed with status:', response.status);
        throw new Error('API call failed');
    }
})
.then(data => {
    console.log('API Response Data:', data);
    console.log('Number of videos:', data.videos ? data.videos.length : 0);
})
.catch(error => {
    console.log('✗ API call error:', error);
});

console.log('\n=== Fix Complete ===');
console.log('If navigation bar is now visible, you can click on "Videos" to see your videos.');
console.log('If not, please refresh the page (F5) and the navigation should appear.');
console.log('\nOr manually navigate to: https://decej2nwnffvz.cloudfront.net/#videos');
