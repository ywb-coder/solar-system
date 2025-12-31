// 主应用逻辑
let solarSystem = null;

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('canvas-container');
    const loading = document.getElementById('loading');

    // 显示加载提示
    loading.classList.add('show');

    // 初始化太阳系
    setTimeout(() => {
        solarSystem = new SolarSystem(container);
        loading.classList.remove('show');
        setupEventListeners();
        setupLanguageToggle();
    }, 100);
});

// 设置语言切换
function setupLanguageToggle() {
    const langToggle = document.getElementById('lang-toggle');

    // 初始化按钮文字和所有UI文字
    const texts = i18n[currentLanguage];
    langToggle.textContent = '🌐 ' + texts.langButton;

    // 初始化所有UI文字
    updateUI();

    langToggle.addEventListener('click', () => {
        // 切换语言
        currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';

        // 更新所有文本
        updateUI();
    });
}

// 更新UI文字
function updateUI() {
    const texts = i18n[currentLanguage];

    // 更新控制面板
    document.querySelector('#control-panel h2').textContent = texts.controlPanel;
    document.querySelector('#control-panel label:first-child').textContent = texts.timeSpeed;
    document.getElementById('pause-btn').textContent = solarSystem.isPaused ? texts.resume : texts.pause;
    document.getElementById('reset-btn').textContent = texts.reset;
    document.getElementById('reset-camera-btn').textContent = texts.resetCamera;

    // 更新语言切换按钮
    const langToggle = document.getElementById('lang-toggle');
    langToggle.textContent = '🌐 ' + texts.langButton;

    // 更新复选框标签（使用insertBefore保留checkbox）
    const orbitsCheckbox = document.getElementById('show-orbits');
    const orbitsLabel = orbitsCheckbox.parentElement;
    orbitsLabel.textContent = texts.showOrbits;
    orbitsLabel.appendChild(orbitsCheckbox);

    const labelsCheckbox = document.getElementById('show-labels');
    const labelsLabel = labelsCheckbox.parentElement;
    labelsLabel.textContent = texts.showLabels;
    labelsLabel.appendChild(labelsCheckbox);

    // 更新行星选择器
    document.querySelector('#planet-selector h3').textContent = texts.quickFocus;
    const planetButtons = document.querySelectorAll('.planet-btn');
    planetButtons.forEach(btn => {
        const planetName = btn.getAttribute('data-planet');
        if (texts.planets[planetName]) {
            btn.textContent = texts.planets[planetName];
        }
    });

    // 更新加载提示
    document.getElementById('loading').textContent = texts.loading;

    // 更新3D标签
    if (solarSystem) {
        solarSystem.updateLabels(currentLanguage);
    }

    // 如果有显示的行星信息，重新渲染
    if (solarSystem.focusedPlanet) {
        showPlanetInfo(solarSystem.focusedPlanet);
    } else {
        // 没有聚焦行星时，显示提示文字
        resetInfoPanel();
    }
}

// 重置信息面板
function resetInfoPanel() {
    const texts = i18n[currentLanguage];
    document.getElementById('info-title').textContent = texts.clickToView;
    document.getElementById('info-content').innerHTML = '';
}

function setupEventListeners() {
    // 时间速度控制
    const timeSpeedSlider = document.getElementById('time-speed');
    const timeSpeedValue = document.getElementById('time-speed-value');
    
    timeSpeedSlider.addEventListener('input', (e) => {
        const speed = parseFloat(e.target.value);
        timeSpeedValue.textContent = speed.toFixed(1) + 'x';
        solarSystem.setTimeSpeed(speed);
    });
    
    // 暂停按钮
    const pauseBtn = document.getElementById('pause-btn');
    pauseBtn.addEventListener('click', () => {
        solarSystem.pause();
        const texts = i18n[currentLanguage];
        pauseBtn.textContent = solarSystem.isPaused ? texts.resume : texts.pause;
    });
    
    // 重置按钮
    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', () => {
        solarSystem.reset();
    });
    
    // 复位镜头按钮
    const resetCameraBtn = document.getElementById('reset-camera-btn');
    resetCameraBtn.addEventListener('click', () => {
        solarSystem.resetCamera();
    });
    
    // 显示轨道
    const showOrbits = document.getElementById('show-orbits');
    showOrbits.addEventListener('change', (e) => {
        solarSystem.toggleOrbits(e.target.checked);
    });
    
    // 显示标签
    const showLabels = document.getElementById('show-labels');
    showLabels.addEventListener('change', (e) => {
        solarSystem.toggleLabels(e.target.checked);
    });
    
    // 行星选择器
    const planetButtons = document.querySelectorAll('.planet-btn');
    planetButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const planetName = btn.getAttribute('data-planet');
            solarSystem.focusPlanet(planetName);
            showPlanetInfo(planetName);
        });
    });
    
    // 点击行星显示信息
    setupPlanetClickDetection();
    
    // 按ESC键取消聚焦
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && solarSystem.focusedPlanet) {
            solarSystem.unfocusPlanet();
            resetInfoPanel();
        }
    });
}

function setupPlanetClickDetection() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isProcessingClick = false;

    function onMouseClick(event) {
        // 防止重复处理
        if (isProcessingClick) {
            return;
        }
        isProcessingClick = true;

        // 检查点击的是否是控制面板或信息面板
        if (event.target.closest('#control-panel') ||
            event.target.closest('#info-panel') ||
            event.target.closest('#planet-selector')) {
            isProcessingClick = false;
            return;
        }

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, solarSystem.camera);

        const intersects = raycaster.intersectObjects(
            Object.values(solarSystem.planets),
            true
        );

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            let planetName = null;

            // 查找行星名称
            if (clickedObject.userData.name) {
                planetName = clickedObject.userData.name;
            } else {
                // 如果是子对象（如月球），向上查找父对象
                let parent = clickedObject.parent;
                while (parent) {
                    if (parent.userData && parent.userData.name) {
                        planetName = parent.userData.name;
                        break;
                    }
                    parent = parent.parent;
                }
            }

            if (planetName && planetName !== 'moon') {
                showPlanetInfo(planetName);
                solarSystem.focusPlanet(planetName);
            }
        } else if (solarSystem.focusedPlanet) {
            // 点击空白区域，取消聚焦
            solarSystem.unfocusPlanet();
            resetInfoPanel();
        }

        // 重置处理标志
        setTimeout(() => {
            isProcessingClick = false;
        }, 100);
    }

    window.addEventListener('click', onMouseClick);
}

function showPlanetInfo(planetName) {
    const infoTitle = document.getElementById('info-title');
    const infoContent = document.getElementById('info-content');

    const planet = solarSystem.getPlanetByName(planetName);
    if (!planet) return;

    const data = solarSystem.planetData[planetName];
    const info = data.info;

    // 安全检查
    if (typeof i18n === 'undefined' || !i18n[currentLanguage]) {
        console.error('i18n not available');
        infoContent.innerHTML = '<p>Error: i18n not loaded</p>';
        return;
    }

    const texts = i18n[currentLanguage];

    infoTitle.textContent = texts.planets[planetName] || data.name;

    let html = '';

    // 遍历info对象的所有属性
    for (const key in info) {
        if (info.hasOwnProperty(key)) {
            const label = getInfoLabel(key);
            let value = info[key];

            // 如果是带有单位的对象
            if (typeof value === 'object' && value !== null && value.value !== undefined) {
                const unit = value.unit || '';
                const translatedUnit = (texts.units && texts.units[unit]) ? texts.units[unit] : unit;
                value = `${value.value} ${translatedUnit}`.trim();
            }

            html += `<p><strong>${label}：</strong>${value}</p>`;
        }
    }

    // 添加额外信息（仅对行星，太阳distance为0）
    if (data.distance > 0) {
        html += `<p><strong>${texts.distanceToSun}：</strong>${data.distance} ${texts.pageUnit}</p>`;
    }
    html += `<p><strong>${texts.radius}：</strong>${data.radius} ${texts.pageUnit}</p>`;

    infoContent.innerHTML = html;
}

function getInfoLabel(key) {
    if (!i18n || !i18n[currentLanguage]) {
        return key;
    }

    const texts = i18n[currentLanguage];
    const labels = {
        diameter: texts.diameter,
        mass: texts.mass,
        distance: texts.distance,
        period: texts.period,
        temperature: texts.temperature,
        type: texts.type,
        eccentricity: texts.eccentricity,
        inclination: texts.inclination
    };
    return labels[key] || key;
}

// 处理页面卸载
window.addEventListener('beforeunload', () => {
    if (solarSystem) {
        solarSystem.dispose();
    }
});

