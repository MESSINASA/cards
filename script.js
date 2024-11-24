// 运势数据
const fortunes = [
    {
        level: "大吉",
        text: "今天是抽卡的绝佳日子！",
        advice: "适合抽取整盒卡包，极有可能抽到闪卡！",
        probability: 0.1
    },
    {
        level: "中吉",
        text: "今天运势不错哦！",
        advice: "可以尝试抽几包卡，说不定有惊喜。",
        probability: 0.2
    },
    {
        level: "小吉",
        text: "运势平稳，适合小规模抽卡。",
        advice: "建议抽1-2包卡片试试手气。",
        probability: 0.3
    },
    {
        level: "平",
        text: "今天运势一般般。",
        advice: "建议观望，可以考虑购买单卡。",
        probability: 0.2
    },
    {
        level: "凶",
        text: "今天可能不太适合抽卡。",
        advice: "建议把钱存起来，等待更好的时机。",
        probability: 0.2
    }
];

const luckyPonies = [
    "暮光闪闪", "云宝黛茜", "柔柔", "萍琪派", "珍奇", "苹果嘉儿",
    "露娜公主", "塞拉斯蒂娅公主", "韵律公主", "紫悦"
];

function getTodayString() {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
}

function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

// 修改音效数据，使用本地音效文件
const sounds = {
    click: new Audio('./sounds/click.mp3'),
    generating: new Audio('./sounds/generating.mp3'),
    result: new Audio('./sounds/result.mp3')
};

// 添加音效加载错误处理
function preloadSounds() {
    for (const [key, sound] of Object.entries(sounds)) {
        sound.load();
        sound.volume = 0.5;
        
        // 添加错误处理
        sound.onerror = () => {
            console.warn(`无法加载音效: ${key}`);
            // 如果音效加载失败，创建一个空的音频对象
            sounds[key] = {
                play: () => {},
                pause: () => {},
                currentTime: 0
            };
        };
    }
}

// 添加历史记录功能
const historyData = {
    saveResult(result) {
        const history = this.getHistory();
        const timestamp = new Date().toISOString();
        history.push({
            timestamp,
            date: getTodayString(),
            result,
            theme: document.documentElement.getAttribute('data-theme') || 'pink'
        });
        localStorage.setItem('fortuneHistory', JSON.stringify(history));
    },

    getHistory() {
        const history = localStorage.getItem('fortuneHistory');
        return history ? JSON.parse(history) : [];
    },

    clearHistory() {
        localStorage.removeItem('fortuneHistory');
    }
};

// 修改检查运势函数，添加错误处理
async function checkFortune() {
    const fortuneResult = document.getElementById('fortuneResult');
    const fortuneText = document.getElementById('fortuneText');
    const fortuneAdvice = document.getElementById('fortuneAdvice');
    const luckyPony = document.getElementById('luckyPony');
    const fortuneButton = document.getElementById('checkFortune');
    
    // 尝试播放点击音效
    try {
        sounds.click.play().catch(() => {});
    } catch (error) {
        console.warn('播放音效失败:', error);
    }
    
    // 禁用按钮防止重复点击
    fortuneButton.disabled = true;
    fortuneButton.textContent = '正在召唤魔法...';
    
    // 显示占卜动画并尝试播放生成音效
    fortuneResult.classList.remove('hidden');
    fortuneResult.classList.add('fortune-generating');
    try {
        sounds.generating.play().catch(() => {});
    } catch (error) {
        console.warn('播放音效失败:', error);
    }
    
    // 生成运势内容
    const dateString = getTodayString();
    const randomValue = seededRandom(dateString.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0));
    
    let accumulatedProbability = 0;
    let selectedFortune;
    for (const fortune of fortunes) {
        accumulatedProbability += fortune.probability;
        if (randomValue <= accumulatedProbability) {
            selectedFortune = fortune;
            break;
        }
    }

    const luckyPonyIndex = Math.floor(seededRandom(dateString.length) * luckyPonies.length);
    
    // 添加悬念延迟
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 停止生成音效并尝试播放结果音效
    try {
        sounds.generating.pause();
        sounds.generating.currentTime = 0;
        sounds.result.play().catch(() => {});
    } catch (error) {
        console.warn('播放音效失败:', error);
    }
    
    // 移除生成动画，显示结果
    fortuneResult.classList.remove('fortune-generating');
    fortuneResult.classList.add('show');
    
    // 重置按钮
    fortuneButton.disabled = false;
    fortuneButton.textContent = '查看今日抽卡运势';
    
    // 使用打字机效果显示结果
    const levelColor = getLevelColor(selectedFortune.level);
    typeWriter(fortuneText, `${selectedFortune.level}：${selectedFortune.text}`, 50, levelColor);
    
    setTimeout(() => {
        typeWriter(fortuneAdvice, selectedFortune.advice, 50);
    }, 1500);
    
    setTimeout(() => {
        const luckyPonyText = `今日幸运小马：${luckyPonies[luckyPonyIndex]}`;
        typeWriter(luckyPony, luckyPonyText, 50);
        addSparkleEffect(luckyPony);
    }, 3000);

    // 保存结果到历史记录
    historyData.saveResult({
        level: selectedFortune.level,
        text: selectedFortune.text,
        advice: selectedFortune.advice,
        luckyPony: luckyPonies[luckyPonyIndex]
    });
}

// 获取运势等级对应的颜色
function getLevelColor(level) {
    const colors = {
        '大吉': '#ff4081',
        '中吉': '#7c4dff',
        '小吉': '#00bcd4',
        '平': '#78909c',
        '凶': '#757575'
    };
    return colors[level] || '#333';
}

// 改进打字机效果
function typeWriter(element, text, speed, color = null) {
    let i = 0;
    element.textContent = '';
    element.style.color = color || element.style.color;
    
    return new Promise(resolve => {
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

// 添加闪烁效果
function addSparkleEffect(element) {
    element.classList.add('sparkle');
    setTimeout(() => element.classList.remove('sparkle'), 1000);
}

// 主题切换功能
function initThemeSwitcher() {
    const themeButton = document.getElementById('themeButton');
    const themeMenu = document.querySelector('.theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    // 从本地存储加载主题
    const savedTheme = localStorage.getItem('selectedTheme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // 切换主题菜单的显示/隐藏
    themeButton.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        themeMenu.classList.toggle('hidden');
        themeMenu.classList.toggle('show');
    });

    // 点击其他地方关闭主题菜单
    document.addEventListener('click', (e) => {
        if (!themeButton.contains(e.target) && !themeMenu.contains(e.target)) {
            themeMenu.classList.add('hidden');
            themeMenu.classList.remove('show');
        }
    });

    // 主题切换
    themeOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            const theme = option.getAttribute('data-theme');
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('selectedTheme', theme);
            
            // 关闭菜单
            themeMenu.classList.add('hidden');
            themeMenu.classList.remove('show');
            
            // 添加切换动画
            document.body.style.transition = 'background 0.5s ease';
            setTimeout(() => {
                document.body.style.transition = '';
            }, 500);
        });
    });
}

// 添加历史记录查看界面
function createHistoryViewer() {
    const viewer = document.createElement('div');
    viewer.className = 'history-viewer hidden';
    viewer.innerHTML = `
        <div class="history-content">
            <div class="history-header">
                <h2>历史记录</h2>
                <button class="close-history">&times;</button>
            </div>
            <div class="history-list"></div>
        </div>
    `;
    document.body.appendChild(viewer);

    // 添加关闭按钮事件
    viewer.querySelector('.close-history').addEventListener('click', () => {
        viewer.classList.add('hidden');
    });

    return viewer;
}

// 显示历史记录
function showHistory() {
    const viewer = document.querySelector('.history-viewer') || createHistoryViewer();
    const historyList = viewer.querySelector('.history-list');
    const history = historyData.getHistory();

    historyList.innerHTML = history.length ? '' : '<p class="no-history">暂无历史记录</p>';

    history.reverse().forEach(record => {
        const date = new Date(record.timestamp);
        const formattedDate = date.toLocaleString('zh-CN');
        
        const recordElement = document.createElement('div');
        recordElement.className = 'history-item';
        recordElement.innerHTML = `
            <div class="history-time">${formattedDate}</div>
            <div class="history-result">
                <div class="history-level" style="color: ${getLevelColor(record.result.level)}">
                    ${record.result.level}
                </div>
                <div class="history-text">${record.result.text}</div>
                <div class="history-advice">${record.result.advice}</div>
                <div class="history-pony">幸运小马：${record.result.luckyPony}</div>
            </div>
            <div class="history-theme">主题：${getThemeName(record.theme)}</div>
        `;
        historyList.appendChild(recordElement);
    });

    viewer.classList.remove('hidden');
}

// 获取主题名称
function getThemeName(themeKey) {
    const themeNames = {
        'pink': '粉色',
        'peach': '蜜桃',
        'sunset': '日落',
        'blue': '海洋',
        'mint': '薄荷',
        'forest': '森林',
        'purple': '紫晶',
        'starry': '星空',
        'unicorn': '独角兽',
        'rainbow': '彩虹',
        'galaxy': '银河',
        'candy': '糖果'
    };
    return themeNames[themeKey] || themeKey;
}

// 添加快捷键监听
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 's') {
        showHistory();
    }
});

// 等待 DOM 加载完成后再添加事件监听器
document.addEventListener('DOMContentLoaded', () => {
    const fortuneButton = document.getElementById('checkFortune');
    if (fortuneButton) {
        fortuneButton.addEventListener('click', checkFortune);
    }
    
    initThemeSwitcher();
    preloadSounds(); // 预加载音效
});